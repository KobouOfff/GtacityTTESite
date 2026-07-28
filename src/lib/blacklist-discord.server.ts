import { jsPDF } from "jspdf";
import type { BlacklistRow } from "./blacklist.server";

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

function createPdf(row: BlacklistRow) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const width = doc.internal.pageSize.getWidth();
  const margin = 50;
  let y = 130;

  doc.setFillColor(30, 58, 138);
  doc.rect(0, 0, width, 90, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("TOWNSEND TRANSIT EXPRESS", margin, 40);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Direction de la Sûreté & Supervision", margin, 60);
  doc.setFontSize(9);
  doc.text(`Document officiel n° ${row.pdf_document_number ?? row.ref}`, margin, 78);

  doc.setTextColor(20, 20, 20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("NOTIFICATION D'INTERDICTION D'ACCÈS", width / 2, y, { align: "center" });
  y += 10;
  doc.setDrawColor(190, 30, 45);
  doc.setLineWidth(1.5);
  doc.line(margin, y, width - margin, y);
  y += 35;

  doc.setFontSize(11);
  doc.text("PERSONNE CONCERNÉE", margin, y);
  y += 20;
  doc.setFontSize(13);
  doc.text(`${row.first_name} ${row.last_name.toUpperCase()}`, margin, y);
  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  if (row.alias) {
    doc.text(`Alias : ${row.alias}`, margin, y);
    y += 15;
  }
  if (row.discord_username || row.discord_id) {
    doc.text(
      `Discord : ${row.discord_username ?? "—"}${row.discord_id ? ` (ID ${row.discord_id})` : ""}`,
      margin,
      y,
    );
    y += 15;
  }
  if (row.steam_id) {
    doc.text(`Steam ID : ${row.steam_id}`, margin, y);
    y += 15;
  }

  y += 15;
  const boxTop = y;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("PORTÉE DE L'INTERDICTION", margin + 12, y + 20);
  y += 40;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Périmètre : ${SCOPE_LABELS[row.scope] ?? row.scope}`, margin + 12, y);
  y += 16;
  doc.text(`Prise d'effet : ${displayDate(row.start_date)}`, margin + 12, y);
  y += 16;
  doc.setFont("helvetica", "bold");
  doc.text(
    row.is_permanent
      ? "Durée : INTERDICTION PERMANENTE"
      : `Durée : jusqu'au ${displayDate(row.end_date)} inclus`,
    margin + 12,
    y,
  );
  y += 18;
  doc.setDrawColor(30, 58, 138);
  doc.rect(margin, boxTop, width - margin * 2, y - boxTop + 4);
  y += 30;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("MOTIF DE LA MESURE", margin, y);
  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const reasonLines = doc.splitTextToSize(row.reason, width - margin * 2);
  doc.text(reasonLines, margin, y);
  y += reasonLines.length * 13 + 20;

  if (row.infractions.length) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("INFRACTIONS RETENUES", margin, y);
    y += 18;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    for (const infraction of row.infractions) {
      const lines = doc.splitTextToSize(`• ${infraction}`, width - margin * 2 - 10);
      doc.text(lines, margin + 6, y);
      y += lines.length * 13;
    }
    y += 18;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.text("Pour la Direction de la Sûreté TTE :", margin, y);
  y += 20;
  doc.setFont("helvetica", "normal");
  doc.text(row.created_by_username, margin, y);
  y += 14;
  doc.text(`Émis le ${displayDate(row.created_at)}`, margin, y);

  const footer = doc.internal.pageSize.getHeight() - 30;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, footer - 10, width - margin, footer - 10);
  doc.setTextColor(110, 110, 110);
  doc.setFontSize(8);
  doc.text(
    `Townsend Transit Express — Réf. ${row.pdf_document_number ?? row.ref} — Document officiel`,
    width / 2,
    footer,
    { align: "center" },
  );

  return new Uint8Array(doc.output("arraybuffer"));
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
    const pdf = createPdf(row);
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
            {
              name: "Durée",
              value: duration,
              inline: true,
            },
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
            text: "Townsend Transit Express — Sûreté & Supervision • PDF officiel joint",
          },
          timestamp: row.created_at,
        },
      ],
    };

    const form = new FormData();
    form.append("payload_json", JSON.stringify(payload));
    const filename = `Blacklist_${safeFilenamePart(row.ref)}_${safeFilenamePart(row.last_name)}_${safeFilenamePart(row.first_name)}.pdf`;
    form.append("files[0]", new Blob([pdf], { type: "application/pdf" }), filename);

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
