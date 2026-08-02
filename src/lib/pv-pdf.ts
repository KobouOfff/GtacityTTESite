import { jsPDF } from "jspdf";
import liberationSansRegular from "pdfjs-dist/standard_fonts/LiberationSans-Regular.ttf?inline";
import liberationSansBold from "pdfjs-dist/standard_fonts/LiberationSans-Bold.ttf?inline";

export type PvRecordLike = {
  num: string;
  nom: string;
  pid: string;
  dob: string;
  motif: string;
  ligne: string;
  mt: number;
  pay: string;
  obs: string;
  agent: string;
  ts: string;
  priorCount?: number;
};

export const PV_MOTIF_LABELS: Record<string, string> = {
  sans: "Voyage sans titre",
  invalide: "Titre non valide",
  reduit: "Tarif réduit injustifié",
  refus: "Refus de présenter",
  contrefacon: "Titre contrefait",
  securite: "Non-respect des règles de sécurité",
  incivilite: "Incivilité envers un agent",
  agression: "Agression / voies de fait",
  degradation: "Dégradation de matériel",
  fumee: "Usage de tabac / vapotage interdit",
  alcool: "Consommation d'alcool interdite",
  animal: "Animal non autorisé / non muni",
  bagage: "Bagage abandonné / encombrant non conforme",
  intrusion: "Intrusion en zone interdite",
  quai: "Franchissement de la ligne de sécurité quai",
  portes: "Obstruction des portes / freins d'urgence abusif",
  tapage: "Tapage / nuisance sonore",
  vente: "Vente ou démarchage non autorisé",
  autre: "Autre infraction",
};

function fmtDate(iso: string | null | undefined) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
  } catch {
    return iso;
  }
}

function fmtDateTime(iso: string | null | undefined) {
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

function fontBase64(dataUrl: string) {
  const comma = dataUrl.indexOf(",");
  return comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
}

export function pvPdfFilename(row: PvRecordLike) {
  const safeName = (row.nom || "Inconnu").replace(/[^a-zA-Z0-9]+/g, "_");
  return `PV_${row.num || "sans-numero"}_${safeName}.pdf`;
}

export function createPvPdf(row: PvRecordLike) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  doc.addFileToVFS("LiberationSans-Regular.ttf", fontBase64(liberationSansRegular));
  doc.addFont("LiberationSans-Regular.ttf", "LiberationSans", "normal");
  doc.addFileToVFS("LiberationSans-Bold.ttf", fontBase64(liberationSansBold));
  doc.addFont("LiberationSans-Bold.ttf", "LiberationSans", "bold");
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  const margin = 50;
  let y = margin;

  // Faint diagonal watermark, same in-universe official-archive feel as the
  // blacklist notices.
  doc.saveGraphicsState();
  doc.setGState(new (doc as unknown as { GState: new (opts: { opacity: number }) => never }).GState({ opacity: 0.06 }));
  doc.setTextColor(30, 58, 138);
  doc.setFont("LiberationSans", "bold");
  doc.setFontSize(72);
  doc.text("TTE — OFFICIEL", width / 2, height / 2, { align: "center", angle: 35 });
  doc.restoreGraphicsState();

  doc.setFillColor(30, 58, 138);
  doc.rect(0, 0, width, 90, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("LiberationSans", "bold");
  doc.setFontSize(20);
  doc.text("TOWNSEND TRANSIT EXPRESS", margin, 40);
  doc.setFontSize(11);
  doc.setFont("LiberationSans", "normal");
  doc.text("Direction de la Sûreté & Contrôle des titres de transport", margin, 60);
  doc.setFontSize(9);
  doc.text(`Procès-verbal n° ${row.num || "—"}`, margin, 78);

  // Amount-due stamp box, top-right of the header band.
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.7);
  doc.rect(width - margin - 130, 14, 130, 62);
  doc.setFont("LiberationSans", "bold");
  doc.setFontSize(8);
  doc.text("MONTANT DÛ", width - margin - 65, 28, { align: "center" });
  doc.setFont("LiberationSans", "normal");
  doc.setFontSize(14);
  doc.text(`${row.mt} $`, width - margin - 65, 46, { align: "center" });
  doc.setFontSize(7.5);
  doc.text(row.pay || "—", width - margin - 65, 62, { align: "center" });

  y = 130;
  doc.setTextColor(20, 20, 20);
  doc.setFont("LiberationSans", "bold");
  doc.setFontSize(16);
  doc.text("PROCÈS-VERBAL D'INFRACTION", width / 2, y, { align: "center" });
  y += 8;
  doc.setDrawColor(200, 30, 30);
  doc.setLineWidth(1.5);
  doc.line(margin, y, width - margin, y);
  y += 30;

  doc.setFont("LiberationSans", "normal");
  doc.setFontSize(10);
  doc.text(`Émis le ${fmtDateTime(row.ts)}`, width - margin, y, { align: "right" });
  y += 30;

  doc.setFont("LiberationSans", "bold");
  doc.setFontSize(11);
  doc.text("CONTREVENANT", margin, y);
  y += 6;
  doc.setDrawColor(120, 120, 120);
  doc.setLineWidth(0.5);
  doc.line(margin, y, margin + 200, y);
  y += 18;
  doc.setFontSize(11);
  doc.text(row.nom || "—", margin, y);
  if (row.priorCount && row.priorCount > 1) {
    doc.setTextColor(180, 30, 30);
    doc.setFontSize(9);
    doc.text(`Récidiviste — ${row.priorCount}e PV enregistré à ce nom`, margin + 200, y);
    doc.setTextColor(20, 20, 20);
  }
  doc.setFont("LiberationSans", "normal");
  y += 16;
  doc.setFontSize(10.5);
  doc.text(`Pièce d'identité : ${row.pid || "—"}`, margin, y);
  y += 14;
  if (row.dob) {
    doc.text(`Date de naissance : ${fmtDate(row.dob)}`, margin, y);
    y += 14;
  }

  y += 10;
  const boxTop = y;
  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(1);
  doc.setFont("LiberationSans", "bold");
  doc.setFontSize(11);
  doc.text("DÉTAILS DE L'INFRACTION", margin + 12, y + 20);
  y += 30;
  doc.setFont("LiberationSans", "normal");
  doc.setFontSize(10.5);
  doc.text(`Motif : ${PV_MOTIF_LABELS[row.motif] || row.motif}`, margin + 12, y);
  y += 14;
  doc.text(`Ligne / Train : ${row.ligne || "—"}`, margin + 12, y);
  y += 14;
  doc.setFont("LiberationSans", "bold");
  doc.text(`Montant forfaitaire : ${row.mt} $`, margin + 12, y);
  doc.setFont("LiberationSans", "normal");
  y += 14;
  doc.text(`Statut de paiement : ${row.pay || "—"}`, margin + 12, y);
  y += 20;
  doc.rect(margin, boxTop, width - margin * 2, y - boxTop);
  y += 18;

  if (row.obs) {
    doc.setFont("LiberationSans", "bold");
    doc.setFontSize(11);
    doc.text("OBSERVATIONS", margin, y);
    y += 6;
    doc.setDrawColor(120, 120, 120);
    doc.line(margin, y, margin + 200, y);
    y += 16;
    doc.setFont("LiberationSans", "normal");
    doc.setFontSize(10.5);
    const obsLines = doc.splitTextToSize(row.obs, width - margin * 2);
    doc.text(obsLines, margin, y);
    y += obsLines.length * 13 + 12;
  }

  y += 4;
  doc.setFont("LiberationSans", "bold");
  doc.setFontSize(11);
  doc.text("MODALITÉS DE RÈGLEMENT", margin, y);
  y += 6;
  doc.line(margin, y, margin + 200, y);
  y += 14;
  doc.setFont("LiberationSans", "normal");
  doc.setFontSize(10);
  const consequences =
    "Le montant forfaitaire est payable en gare sous 48 heures. À défaut de règlement dans ce délai, une " +
    "majoration sera appliquée et le dossier sera transmis en recouvrement. Tout refus réitéré de présenter " +
    "un titre de transport valide ou toute récidive peut entraîner une interdiction d'accès aux infrastructures TTE.";
  const consequenceLines = doc.splitTextToSize(consequences, width - margin * 2);
  doc.text(consequenceLines, margin, y);
  y += consequenceLines.length * 12 + 24;

  doc.setFont("LiberationSans", "bold");
  doc.setFontSize(10.5);
  doc.text("Agent verbalisateur :", margin, y);
  y += 20;
  doc.setFont("LiberationSans", "normal");
  doc.setFontSize(10);
  doc.text(row.agent || "—", margin, y);

  const footerY = doc.internal.pageSize.getHeight() - 30;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, footerY - 10, width - margin, footerY - 10);
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(
    `Townsend Transit Express — Sûreté & Contrôle  ·  PV ${row.num || "—"}  ·  Document officiel — conserver`,
    width / 2,
    footerY,
    { align: "center" },
  );

  return doc;
}
