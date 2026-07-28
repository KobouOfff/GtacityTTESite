import { encode } from "fast-png";
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

type Color = [number, number, number, number];

const GLYPHS: Record<string, string[]> = {
  " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  G: ["01111", "10000", "10000", "10111", "10001", "10001", "01111"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  J: ["00111", "00010", "00010", "00010", "10010", "10010", "01100"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "11011", "10001"],
  X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  "3": ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "10000", "11110", "00001", "00001", "11110"],
  "6": ["01110", "10000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00001", "01110"],
  "-": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
  "_": ["00000", "00000", "00000", "00000", "00000", "00000", "11111"],
  ".": ["00000", "00000", "00000", "00000", "00000", "00110", "00110"],
  ",": ["00000", "00000", "00000", "00000", "00110", "00100", "01000"],
  ":": ["00000", "00110", "00110", "00000", "00110", "00110", "00000"],
  "/": ["00001", "00010", "00010", "00100", "01000", "01000", "10000"],
  "(": ["00010", "00100", "01000", "01000", "01000", "00100", "00010"],
  ")": ["01000", "00100", "00010", "00010", "00010", "00100", "01000"],
  "'": ["00100", "00100", "00000", "00000", "00000", "00000", "00000"],
  "•": ["00000", "00000", "01110", "01110", "01110", "00000", "00000"],
};

function normalizedText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’‘]/g, "'")
    .replace(/[–—]/g, "-")
    .toUpperCase();
}

function createCanvas(width: number, height: number, background: Color) {
  const data = new Uint8Array(width * height * 4);
  for (let i = 0; i < width * height; i++) data.set(background, i * 4);
  return { width, height, data };
}

function fillRect(
  canvas: ReturnType<typeof createCanvas>,
  x: number,
  y: number,
  width: number,
  height: number,
  color: Color,
) {
  const x0 = Math.max(0, Math.floor(x));
  const y0 = Math.max(0, Math.floor(y));
  const x1 = Math.min(canvas.width, Math.ceil(x + width));
  const y1 = Math.min(canvas.height, Math.ceil(y + height));
  for (let py = y0; py < y1; py++) {
    for (let px = x0; px < x1; px++) canvas.data.set(color, (py * canvas.width + px) * 4);
  }
}

function drawText(
  canvas: ReturnType<typeof createCanvas>,
  value: string,
  x: number,
  y: number,
  scale: number,
  color: Color,
) {
  let cursor = x;
  for (const character of normalizedText(value)) {
    const glyph = GLYPHS[character] ?? GLYPHS[" "];
    for (let row = 0; row < 7; row++) {
      for (let column = 0; column < 5; column++) {
        if (glyph[row][column] === "1") {
          fillRect(canvas, cursor + column * scale, y + row * scale, scale, scale, color);
        }
      }
    }
    cursor += scale * 6;
  }
}

function wrapText(value: string, maxCharacters: number) {
  const words = normalizedText(value).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    if (!line) {
      line = word;
    } else if (`${line} ${word}`.length <= maxCharacters) {
      line += ` ${word}`;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawWrapped(
  canvas: ReturnType<typeof createCanvas>,
  value: string,
  x: number,
  y: number,
  scale: number,
  maxCharacters: number,
  color: Color,
) {
  const lines = wrapText(value, maxCharacters);
  lines.forEach((line, index) => drawText(canvas, line, x, y + index * scale * 10, scale, color));
  return y + lines.length * scale * 10;
}

function createBlacklistImage(row: BlacklistRow) {
  const canvas = createCanvas(900, 1273, [246, 248, 252, 255]);
  const navy: Color = [25, 49, 117, 255];
  const ink: Color = [20, 28, 43, 255];
  const muted: Color = [82, 96, 120, 255];
  const red: Color = [190, 30, 50, 255];
  const white: Color = [255, 255, 255, 255];
  const border: Color = [186, 198, 218, 255];

  fillRect(canvas, 0, 0, 900, 145, navy);
  drawText(canvas, "TOWNSEND TRANSIT EXPRESS", 55, 35, 4, white);
  drawText(canvas, "DIRECTION DE LA SURETE & SUPERVISION", 55, 78, 2, white);
  drawText(canvas, `DOCUMENT OFFICIEL ${row.pdf_document_number ?? row.ref}`, 55, 110, 2, white);

  drawText(canvas, "NOTIFICATION D'INTERDICTION D'ACCES", 90, 188, 3, ink);
  fillRect(canvas, 55, 228, 790, 4, red);

  let y = 270;
  drawText(canvas, "PERSONNE CONCERNEE", 55, y, 3, navy);
  y += 42;
  drawText(canvas, `${row.first_name} ${row.last_name}`, 55, y, 3, ink);
  y += 38;
  if (row.alias) {
    drawText(canvas, `ALIAS : ${row.alias}`, 55, y, 2, muted);
    y += 30;
  }
  if (row.discord_username || row.discord_id) {
    drawText(
      canvas,
      `DISCORD : ${row.discord_username ?? "-"} ${row.discord_id ? `ID ${row.discord_id}` : ""}`,
      55,
      y,
      2,
      muted,
    );
    y += 30;
  }

  fillRect(canvas, 55, y + 5, 790, 180, [255, 255, 255, 255]);
  fillRect(canvas, 55, y + 5, 790, 3, navy);
  fillRect(canvas, 55, y + 182, 790, 3, navy);
  drawText(canvas, "PORTEE DE L'INTERDICTION", 75, y + 30, 3, navy);
  drawText(canvas, `PERIMETRE : ${SCOPE_LABELS[row.scope] ?? row.scope}`, 75, y + 78, 2, ink);
  drawText(canvas, `PRISE D'EFFET : ${displayDate(row.start_date)}`, 75, y + 110, 2, ink);
  drawText(
    canvas,
    row.is_permanent ? "DUREE : INTERDICTION PERMANENTE" : `FIN : ${displayDate(row.end_date)}`,
    75,
    y + 142,
    2,
    red,
  );
  y += 225;

  drawText(canvas, "MOTIF DE LA MESURE", 55, y, 3, navy);
  y += 44;
  y = drawWrapped(canvas, row.reason, 55, y, 2, 62, ink) + 25;

  drawText(canvas, "INFRACTIONS RETENUES", 55, y, 3, navy);
  y += 42;
  const infractions = row.infractions.length ? row.infractions : ["AUCUNE INFRACTION DETAILLEE"];
  for (const item of infractions.slice(0, 8)) {
    y = drawWrapped(canvas, `• ${item}`, 65, y, 2, 60, ink) + 12;
  }

  const signatureY = Math.min(Math.max(y + 35, 1015), 1110);
  fillRect(canvas, 55, signatureY, 350, 2, border);
  drawText(canvas, "POUR LA DIRECTION DE LA SURETE TTE", 55, signatureY + 22, 2, muted);
  drawText(canvas, row.created_by_username, 55, signatureY + 55, 2, ink);
  drawText(canvas, `EMIS LE ${displayDate(row.created_at)}`, 55, signatureY + 87, 2, muted);

  fillRect(canvas, 0, 1218, 900, 55, navy);
  drawText(canvas, `TTE - REF ${row.ref} - DOCUMENT OFFICIEL`, 120, 1237, 2, white);

  return encode({
    width: canvas.width,
    height: canvas.height,
    data: canvas.data,
    channels: 4,
    depth: 8,
  });
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
    const image = createBlacklistImage(row);
    const filename = `Blacklist_${safeFilenamePart(row.ref)}_${safeFilenamePart(row.last_name)}_${safeFilenamePart(row.first_name)}.png`;
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
            text: "Townsend Transit Express — Sûreté & Supervision • Fiche officielle en image",
          },
          timestamp: row.created_at,
          image: {
            url: `attachment://${filename}`,
          },
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
