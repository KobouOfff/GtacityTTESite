import { jsPDF } from "jspdf";
import type { BlacklistRow } from "./blacklist.server";
import liberationSansRegular from "pdfjs-dist/standard_fonts/LiberationSans-Regular.ttf?inline";
import liberationSansBold from "pdfjs-dist/standard_fonts/LiberationSans-Bold.ttf?inline";

const SCOPE_LABELS: Record<string, string> = {
  all: "Toutes les infrastructures TTE",
  stations: "Gares et quais",
  trains: "Trains et bus TTE",
  offices: "Bureaux et installations administratives",
  events: "Événements & manifestations TTE",
};

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function fmtDateTime(iso: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function blacklistPdfFilename(row: BlacklistRow) {
  return `Blacklist_${row.ref}_${row.last_name}_${row.first_name}.pdf`;
}

function fontBase64(dataUrl: string) {
  const comma = dataUrl.indexOf(",");
  return comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
}

export function createBlacklistPdf(row: BlacklistRow) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  doc.addFileToVFS("LiberationSans-Regular.ttf", fontBase64(liberationSansRegular));
  doc.addFont("LiberationSans-Regular.ttf", "LiberationSans", "normal");
  doc.addFileToVFS("LiberationSans-Bold.ttf", fontBase64(liberationSansBold));
  doc.addFont("LiberationSans-Bold.ttf", "LiberationSans", "bold");
  const width = doc.internal.pageSize.getWidth();
  const margin = 50;
  let y = margin;

  doc.setFillColor(30, 58, 138);
  doc.rect(0, 0, width, 90, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("LiberationSans", "bold");
  doc.setFontSize(20);
  doc.text("TOWNSEND TRANSIT EXPRESS", margin, 40);
  doc.setFontSize(11);
  doc.setFont("LiberationSans", "normal");
  doc.text("Direction de la Sûreté & Supervision — Département juridique", margin, 60);
  doc.setFontSize(9);
  doc.text(`Document officiel n° ${row.pdf_document_number ?? row.ref}`, margin, 78);

  y = 130;
  doc.setTextColor(20, 20, 20);
  doc.setFont("LiberationSans", "bold");
  doc.setFontSize(16);
  doc.text("NOTIFICATION D'INTERDICTION D'ACCÈS", width / 2, y, { align: "center" });
  y += 8;
  doc.setDrawColor(200, 30, 30);
  doc.setLineWidth(1.5);
  doc.line(margin, y, width - margin, y);
  y += 30;

  doc.setFont("LiberationSans", "normal");
  doc.setFontSize(10);
  doc.text(`Émis à Townsend, le ${fmtDate(row.created_at)}`, width - margin, y, { align: "right" });
  y += 30;

  doc.setFont("LiberationSans", "bold");
  doc.setFontSize(11);
  doc.text("PERSONNE CONCERNÉE", margin, y);
  y += 6;
  doc.setDrawColor(120, 120, 120);
  doc.setLineWidth(0.5);
  doc.line(margin, y, margin + 200, y);
  y += 18;
  doc.setFontSize(11);
  doc.text(`${row.first_name} ${row.last_name.toUpperCase()}`, margin, y);
  doc.setFont("LiberationSans", "normal");
  y += 16;
  if (row.alias) {
    doc.text(`Alias / surnom : ${row.alias}`, margin, y);
    y += 14;
  }
  if (row.date_of_birth) {
    doc.text(`Date de naissance : ${fmtDate(row.date_of_birth)}`, margin, y);
    y += 14;
  }
  if (row.discord_username || row.discord_id) {
    doc.text(
      `Discord : ${row.discord_username ?? ""}${row.discord_id ? ` (ID ${row.discord_id})` : ""}`,
      margin,
      y,
    );
    y += 14;
  }
  if (row.steam_id) {
    doc.text(`Steam ID : ${row.steam_id}`, margin, y);
    y += 14;
  }
  if (row.physical_description) {
    doc.text("Signalement :", margin, y);
    y += 14;
    const lines = doc.splitTextToSize(row.physical_description, width - margin * 2);
    doc.text(lines, margin, y);
    y += lines.length * 12 + 4;
  }

  y += 10;
  doc.setFont("LiberationSans", "normal");
  doc.setFontSize(10.5);
  const intro =
    "Par la présente, la Direction de la Sûreté de Townsend Transit Express, en application de son règlement " +
    "d'exploitation et des articles relatifs à la police des transports en vigueur dans l'État du Tennessee, notifie " +
    "la personne susmentionnée de son inscription au registre des interdictions d'accès aux infrastructures " +
    "gérées par TTE.";
  const introLines = doc.splitTextToSize(intro, width - margin * 2);
  doc.text(introLines, margin, y);
  y += introLines.length * 13 + 14;

  const boxTop = y;
  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(1);
  doc.setFont("LiberationSans", "bold");
  doc.setFontSize(11);
  doc.text("PORTÉE DE L'INTERDICTION", margin + 12, y + 20);
  y += 30;
  doc.setFont("LiberationSans", "normal");
  doc.setFontSize(10.5);
  doc.text(`Périmètre : ${SCOPE_LABELS[row.scope] ?? row.scope}`, margin + 12, y);
  y += 14;
  doc.text(`Prise d'effet : ${fmtDate(row.start_date)}`, margin + 12, y);
  y += 14;
  doc.setFont("LiberationSans", "bold");
  doc.text(
    row.is_permanent
      ? "Durée : INTERDICTION PERMANENTE (à durée indéterminée)"
      : `Durée : jusqu'au ${fmtDate(row.end_date)} inclus`,
    margin + 12,
    y,
  );
  doc.setFont("LiberationSans", "normal");
  y += 20;
  doc.rect(margin, boxTop, width - margin * 2, y - boxTop);
  y += 18;

  doc.setFont("LiberationSans", "bold");
  doc.setFontSize(11);
  doc.text("MOTIF DE LA MESURE", margin, y);
  y += 6;
  doc.setDrawColor(120, 120, 120);
  doc.line(margin, y, margin + 200, y);
  y += 16;
  doc.setFont("LiberationSans", "normal");
  doc.setFontSize(10.5);
  const reasonLines = doc.splitTextToSize(row.reason, width - margin * 2);
  doc.text(reasonLines, margin, y);
  y += reasonLines.length * 13 + 12;

  if (row.infractions?.length) {
    doc.setFont("LiberationSans", "bold");
    doc.setFontSize(11);
    doc.text("INFRACTIONS RETENUES", margin, y);
    y += 14;
    doc.setFont("LiberationSans", "normal");
    doc.setFontSize(10.5);
    for (const infraction of row.infractions) {
      const lines = doc.splitTextToSize(`•  ${infraction}`, width - margin * 2 - 10);
      doc.text(lines, margin + 6, y);
      y += lines.length * 13;
    }
    y += 8;
  }

  y += 4;
  doc.setFont("LiberationSans", "bold");
  doc.setFontSize(11);
  doc.text("CONSÉQUENCES", margin, y);
  y += 6;
  doc.line(margin, y, margin + 200, y);
  y += 14;
  doc.setFont("LiberationSans", "normal");
  doc.setFontSize(10);
  const consequences =
    "Tout manquement à la présente interdiction expose la personne concernée à une reconduite immédiate hors " +
    "des emprises TTE par les agents de sûreté, à un signalement au Davidson County Sheriff's Office (DCSO), " +
    "ainsi qu'à d'éventuelles poursuites pour intrusion Art 420-3 au sens du Tennessee Code Penal. " +
    "Un recours écrit motivé peut être adressé à la Direction sous 30 jours à compter de la notification.";
  const consequenceLines = doc.splitTextToSize(consequences, width - margin * 2);
  doc.text(consequenceLines, margin, y);
  y += consequenceLines.length * 12 + 24;

  doc.setFont("LiberationSans", "bold");
  doc.setFontSize(10.5);
  doc.text("Pour la Direction de la Sûreté TTE :", margin, y);
  y += 40;
  doc.setDrawColor(80, 80, 80);
  doc.line(margin, y, margin + 220, y);
  y += 12;
  doc.setFont("LiberationSans", "normal");
  doc.setFontSize(10);
  doc.text(row.created_by_username, margin, y);
  y += 12;
  doc.text(`Émis le ${fmtDateTime(row.created_at)}`, margin, y);

  const footerY = doc.internal.pageSize.getHeight() - 30;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, footerY - 10, width - margin, footerY - 10);
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(
    `Townsend Transit Express — Sûreté & Supervision  ·  Réf. ${row.pdf_document_number ?? row.ref}  ·  Document légal — conserver`,
    width / 2,
    footerY,
    { align: "center" },
  );

  return doc;
}
