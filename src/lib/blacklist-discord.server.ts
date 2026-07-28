import {
  createCanvas,
  DOMMatrix,
  ImageData,
  Path2D,
} from "@napi-rs/canvas";
import type { BlacklistRow } from "./blacklist.server";
import { createBlacklistPdf } from "./blacklist-pdf";

export type BlacklistDiscordDelivery = "sent" | "skipped" | "failed";

const SCOPE_LABELS: Record<string, string> = {
  all: "Toutes les infrastructures TTE",
  stations: "Gares et quais",
  trains: "Trains et bus TTE",
  offices: "Bureaux et installations administratives",
  events: "Événements et manifestations TTE",
};

function truncate(value: string, length: number) {
  return value.length > length ? `${value.slice(0, length - 1)}…` : value;
}

function displayDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

function safeFilenamePart(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

async function renderOfficialPdfAsPng(row: BlacklistRow) {
  // PDF.js a besoin de ces API Canvas lors de son initialisation côté serveur.
  const runtime = globalThis as typeof globalThis & {
    DOMMatrix?: typeof DOMMatrix;
    ImageData?: typeof ImageData;
    Path2D?: typeof Path2D;
  };
  runtime.DOMMatrix ??= DOMMatrix;
  runtime.ImageData ??= ImageData;
  runtime.Path2D ??= Path2D;

  const pdfDocument = createBlacklistPdf(row);
  const pdfBytes = new Uint8Array(pdfDocument.output("arraybuffer"));
  // En environnement serverless PDF.js fonctionne avec son "fake worker".
  // Importer le worker en premier enregistre WorkerMessageHandler dans globalThis.
  await import("pdfjs-dist/legacy/build/pdf.worker.mjs");
  const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const loadingTask = getDocument({
    data: pdfBytes,
    disableWorker: true,
    useSystemFonts: true,
  });
  const pdf = await loadingTask.promise;

  try {
    const page = await pdf.getPage(1);
    // Environ 144 DPI : suffisamment net dans Discord sans produire un fichier énorme.
    const viewport = page.getViewport({ scale: 2 });
    const canvas = createCanvas(
      Math.ceil(viewport.width),
      Math.ceil(viewport.height),
    );
    const context = canvas.getContext("2d");

    await page.render({
      canvas: canvas as never,
      canvasContext: context as never,
      viewport,
      background: "rgb(255,255,255)",
    }).promise;

    return canvas.toBuffer("image/png");
  } finally {
    await pdf.destroy();
  }
}

export async function sendBlacklistToDiscord(
  row: BlacklistRow,
): Promise<BlacklistDiscordDelivery> {
  const token = process.env.DISCORD_BOT_TOKEN?.trim();
  const channelId = process.env.DISCORD_BLACKLIST_CHANNEL_ID?.trim();

  if (!token || !channelId) {
    console.warn(
      "[blacklist/discord] Envoi ignoré : DISCORD_BOT_TOKEN ou DISCORD_BLACKLIST_CHANNEL_ID absent.",
    );
    return "skipped";
  }

  try {
    const image = await renderOfficialPdfAsPng(row);
    const filename =
      `Blacklist_${safeFilenamePart(row.ref)}_` +
      `${safeFilenamePart(row.last_name)}_${safeFilenamePart(row.first_name)}.png`;
    const duration = row.is_permanent
      ? "Permanente"
      : `Du ${displayDate(row.start_date)} au ${displayDate(row.end_date)}`;
    const discordIdentity =
      row.discord_username || row.discord_id
        ? `${row.discord_username ?? "Compte Discord"}${row.discord_id ? `\nID : ${row.discord_id}` : ""}`
        : "Non renseigné";
    const infractionText = row.infractions.length
      ? row.infractions.map((item) => `• ${item}`).join("\n")
      : "Aucune infraction détaillée";

    const payload = {
      allowed_mentions: { parse: [] },
      embeds: [
        {
          title: `🚫 Nouvelle inscription blacklist — ${row.ref}`,
          description: truncate(row.reason, 4000),
          color: 0xc51f3a,
          fields: [
            {
              name: "Personne concernée",
              value: truncate(
                `${row.first_name} ${row.last_name.toUpperCase()}${row.alias ? `\nAlias : ${row.alias}` : ""}`,
                1024,
              ),
              inline: true,
            },
            {
              name: "Discord",
              value: truncate(discordIdentity, 1024),
              inline: true,
            },
            {
              name: "Périmètre",
              value: truncate(SCOPE_LABELS[row.scope] ?? row.scope, 1024),
              inline: false,
            },
            { name: "Durée", value: duration, inline: true },
            {
              name: "Émis par",
              value: truncate(row.created_by_username, 1024),
              inline: true,
            },
            {
              name: "Infractions retenues",
              value: truncate(infractionText, 1024),
              inline: false,
            },
          ],
          footer: {
            text: "Townsend Transit Express — Sûreté & Supervision • Image exacte du PDF officiel",
          },
          timestamp: row.created_at,
          image: { url: `attachment://${filename}` },
        },
      ],
    };

    const form = new FormData();
    form.append("payload_json", JSON.stringify(payload));
    form.append("files[0]", new Blob([image], { type: "image/png" }), filename);

    const response = await fetch(
      `https://discord.com/api/v10/channels/${encodeURIComponent(channelId)}/messages`,
      {
        method: "POST",
        headers: { Authorization: `Bot ${token}` },
        body: form,
      },
    );

    if (!response.ok) {
      const details = truncate(await response.text(), 1000);
      console.error(`[blacklist/discord] Discord ${response.status}: ${details}`);
      return "failed";
    }

    return "sent";
  } catch (error) {
    console.error("[blacklist/discord] Échec de l'envoi :", error);
    return "failed";
  }
}
