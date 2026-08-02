import { jsPDF } from "jspdf";

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

export function pvPdfFilename(row: PvRecordLike) {
  const safeName = (row.nom || "Inconnu").replace(/[^a-zA-Z0-9]+/g, "_");
  return `PV_${row.num || "sans-numero"}_${safeName}.pdf`;
}

// ---------------------------------------------------------------------------
// The PV is rendered as a narrow, torn-edge "ticket" (thermal-receipt style)
// instead of a full A4 letter — logo/tagline header, dashed section rules,
// monospace label/value rows, a highlighted PV number, and a footer barcode.
// ---------------------------------------------------------------------------
const TICKET_W = 260; // width of the ticket card itself, in pt
const OUTER = 26; // backdrop padding around the card (drop shadow + torn edge)
const MARGIN = 20; // inner content margin
const TOP_INSET = 30;
const BOTTOM_INSET = 26;
const TEETH = 12;
const TOOTH_AMP = 3.2;

const INK: [number, number, number] = [20, 20, 22];
const MUTED: [number, number, number] = [120, 120, 126];
const NAVY: [number, number, number] = [30, 58, 138];
const RED: [number, number, number] = [190, 25, 25];

function edgePoints(xFrom: number, xTo: number, y: number, teeth: number, amp: number): [number, number][] {
  const pts: [number, number][] = [];
  const step = (xTo - xFrom) / teeth;
  for (let i = 0; i <= teeth; i++) {
    const x = xFrom + step * i;
    const dir = i % 2 === 0 ? -1 : 1;
    pts.push([x, y + dir * amp]);
  }
  return pts;
}

function fillPolygon(doc: jsPDF, points: [number, number][], style: "F" | "FD" | "S") {
  const rel: [number, number][] = [];
  for (let i = 1; i < points.length; i++) {
    rel.push([points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]]);
  }
  doc.lines(rel, points[0][0], points[0][1], [1, 1], style, true);
}

function tornTicketOutline(x0: number, y0: number, w: number, h: number): [number, number][] {
  const x1 = x0 + w;
  const y1 = y0 + h;
  const top = edgePoints(x0, x1, y0, TEETH, TOOTH_AMP);
  const bottom = edgePoints(x1, x0, y1, TEETH, TOOTH_AMP);
  return [...top, ...bottom];
}

function dashedLine(doc: jsPDF, x0: number, x1: number, y: number, color: [number, number, number] = [200, 200, 206]) {
  doc.setDrawColor(color[0], color[1], color[2]);
  doc.setLineWidth(0.6);
  doc.setLineDashPattern([1.4, 1.8], 0);
  doc.line(x0, y, x1, y);
  doc.setLineDashPattern([], 0);
}

function drawBarcode(doc: jsPDF, x0: number, x1: number, y: number, height: number, seedStr: string) {
  let seed = 1;
  for (let i = 0; i < seedStr.length; i++) seed = (seed * 31 + seedStr.charCodeAt(i)) % 100000;
  let x = x0;
  let i = 0;
  doc.setFillColor(20, 20, 22);
  while (x < x1 - 1) {
    const barW = 0.7 + ((seed * (i + 11)) % 7) / 4;
    const gap = 1 + ((seed * (i + 5)) % 5) / 3;
    const w = Math.min(barW, x1 - x);
    doc.rect(x, y, w, height, "F");
    x += w + gap;
    i++;
  }
}

/** One label/value row. If the pair doesn't fit on a single line, the value
 *  drops to its own right-aligned line beneath the label — same behaviour as
 *  the reference receipt, where a long infraction type wraps to the next line. */
function kvRow(
  doc: jsPDF,
  cx0: number,
  cx1: number,
  y: number,
  label: string,
  value: string,
  opts: { boxed?: boolean; boldValue?: boolean } = {},
): number {
  const labelSize = 8.3;
  const valueSize = 8.3;
  const gap = 8;

  doc.setFont("courier", "normal");
  doc.setFontSize(labelSize);
  const labelW = doc.getTextWidth(label);

  doc.setFont("courier", opts.boldValue ? "bold" : "normal");
  doc.setFontSize(valueSize);
  const valueW = doc.getTextWidth(value);

  const sameLine = labelW + valueW + gap <= cx1 - cx0;

  doc.setFont("courier", "normal");
  doc.setFontSize(labelSize);
  doc.setTextColor(70, 70, 74);
  doc.text(label, cx0, y);

  const valueY = sameLine ? y : y + 12;
  doc.setFont("courier", opts.boldValue ? "bold" : "normal");
  doc.setFontSize(valueSize);

  if (opts.boxed) {
    const padX = 5;
    const padY = 4;
    const boxH = valueSize + padY * 2;
    const bx0 = cx1 - valueW - padX * 2;
    doc.setDrawColor(RED[0], RED[1], RED[2]);
    doc.setLineWidth(1.1);
    doc.roundedRect(bx0, valueY - valueSize + 1, valueW + padX * 2, boxH, 2, 2);
    doc.setTextColor(RED[0], RED[1], RED[2]);
    doc.text(value, cx1 - padX, valueY, { align: "right" });
  } else {
    doc.setTextColor(INK[0], INK[1], INK[2]);
    doc.text(value, cx1, valueY, { align: "right" });
  }

  doc.setTextColor(INK[0], INK[1], INK[2]);
  return valueY + 15;
}

function sectionHeader(doc: jsPDF, cx0: number, cx1: number, y: number, title: string): number {
  doc.setFont("courier", "bold");
  doc.setFontSize(8.3);
  doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.text(title, (cx0 + cx1) / 2, y, { align: "center", charSpace: 1.6 } as never);
  doc.setTextColor(INK[0], INK[1], INK[2]);
  return y + 12;
}

/** Draws the full ticket body — logo, title, sections, footer — with its
 *  local origin at (ox, oy). Called once on an oversized scratch page just
 *  to measure the resulting height, then again on the correctly sized page. */
function paintContent(doc: jsPDF, row: PvRecordLike, ox: number, oy: number): number {
  const cx0 = ox + MARGIN;
  const cx1 = ox + TICKET_W - MARGIN;
  let y = oy + TOP_INSET;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(21);
  doc.setTextColor(INK[0], INK[1], INK[2]);
  doc.text("TTE", (cx0 + cx1) / 2, y, { align: "center" });
  y += 13;

  doc.setFont("courier", "bold");
  doc.setFontSize(7);
  doc.setTextColor(80, 80, 84);
  doc.text("TOWNSEND TRANSIT EXPRESS", (cx0 + cx1) / 2, y, { align: "center", charSpace: 1.3 } as never);
  y += 20;

  dashedLine(doc, cx0, cx1, y);
  y += 18;

  doc.setFont("courier", "bold");
  doc.setFontSize(11.5);
  doc.setTextColor(INK[0], INK[1], INK[2]);
  doc.text("PROCÈS-VERBAL", (cx0 + cx1) / 2, y, { align: "center" });
  y += 13;
  doc.text("D'INFRACTION", (cx0 + cx1) / 2, y, { align: "center" });
  y += 13;

  doc.setFont("courier", "normal");
  doc.setFontSize(7);
  doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
  doc.text("Art. 330-10 du code pénal", (cx0 + cx1) / 2, y, { align: "center" });
  y += 16;

  dashedLine(doc, cx0, cx1, y);
  y += 16;

  doc.setFont("courier", "normal");
  doc.setFontSize(7.4);
  doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
  doc.text(`Émis le ${fmtDateTime(row.ts)}`, cx1, y, { align: "right" });
  y += 16;

  // SERVICE -----------------------------------------------------------------
  y = sectionHeader(doc, cx0, cx1, y, "SERVICE");
  y = kvRow(doc, cx0, cx1, y, "Exploitant", "TTE — Townsend Transit");
  y = kvRow(doc, cx0, cx1, y, "Agent", row.agent || "—");
  y += 5;

  // CONTREVENANT --------------------------------------------------------------
  y = sectionHeader(doc, cx0, cx1, y, "CONTREVENANT");
  y = kvRow(doc, cx0, cx1, y, "Nom", row.nom || "—");
  y = kvRow(doc, cx0, cx1, y, "Pièce d'identité", row.pid || "—");
  if (row.dob) {
    y = kvRow(doc, cx0, cx1, y, "Date de naissance", fmtDate(row.dob));
  }
  if (row.priorCount && row.priorCount > 1) {
    doc.setFont("courier", "bold");
    doc.setFontSize(7.6);
    doc.setTextColor(RED[0], RED[1], RED[2]);
    doc.text(`RÉCIDIVISTE — ${row.priorCount}e PV enregistré à ce nom`, cx0, y);
    doc.setTextColor(INK[0], INK[1], INK[2]);
    y += 14;
  }
  y += 5;

  // PROCÈS-VERBAL ---------------------------------------------------------------
  y = sectionHeader(doc, cx0, cx1, y, "PROCÈS-VERBAL");
  y = kvRow(doc, cx0, cx1, y, "Numéro PV", row.num || "—", { boldValue: true });
  y = kvRow(doc, cx0, cx1, y, "Type d'infraction", PV_MOTIF_LABELS[row.motif] || row.motif || "—");
  y = kvRow(doc, cx0, cx1, y, "Ligne / Train", row.ligne || "—");
  y += 5;

  // OBSERVATIONS (optional) ----------------------------------------------------
  if (row.obs) {
    y = sectionHeader(doc, cx0, cx1, y, "OBSERVATIONS");
    doc.setFont("courier", "normal");
    doc.setFontSize(7.8);
    doc.setTextColor(50, 50, 54);
    const obsLines = doc.splitTextToSize(row.obs, cx1 - cx0) as string[];
    doc.text(obsLines, cx0, y);
    y += obsLines.length * 10.5 + 8;
    doc.setTextColor(INK[0], INK[1], INK[2]);
  }

  dashedLine(doc, cx0, cx1, y);
  y += 16;

  // MONTANT -----------------------------------------------------------------
  doc.setFont("courier", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(INK[0], INK[1], INK[2]);
  doc.text("MONTANT PV", cx0, y);
  doc.setFontSize(12.5);
  doc.text(`${row.mt} $`, cx1, y, { align: "right" });
  y += 15;

  doc.setFont("courier", "normal");
  doc.setFontSize(7.6);
  doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
  doc.text("Statut de paiement", cx0, y);
  doc.text(row.pay || "—", cx1, y, { align: "right" });
  y += 16;

  dashedLine(doc, cx0, cx1, y);
  y += 14;

  // Legal notice --------------------------------------------------------------
  doc.setFont("courier", "normal");
  doc.setFontSize(6.6);
  doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
  const consequences =
    "Montant payable en gare sous 48 h. Passé ce délai, une majoration " +
    "est appliquée et le dossier est transmis en recouvrement. Tout refus " +
    "réitéré ou toute récidive peut entraîner une interdiction d'accès " +
    "aux infrastructures TTE.";
  const consequenceLines = doc.splitTextToSize(consequences, cx1 - cx0) as string[];
  doc.text(consequenceLines, cx0, y);
  y += consequenceLines.length * 8.6 + 14;

  dashedLine(doc, cx0, cx1, y);
  y += 14;

  // Barcode + footer ------------------------------------------------------------
  drawBarcode(doc, cx0, cx1, y, 18, `${row.num}-${row.ts}`);
  y += 26;

  doc.setFont("courier", "normal");
  doc.setFontSize(7);
  doc.setTextColor(90, 90, 94);
  doc.text(row.num || "—", (cx0 + cx1) / 2, y, { align: "center", charSpace: 2 } as never);
  y += 12;

  doc.setFontSize(6.4);
  doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
  doc.text("Document officiel — à conserver", (cx0 + cx1) / 2, y, { align: "center" });
  y += 8;
  doc.text("TTE — Direction de la Sûreté & Contrôle", (cx0 + cx1) / 2, y, { align: "center" });
  y += 4;

  doc.setTextColor(INK[0], INK[1], INK[2]);
  return y;
}

function paintFrame(doc: jsPDF, ticketH: number, pageW: number, pageH: number) {
  doc.setFillColor(233, 234, 238);
  doc.rect(0, 0, pageW, pageH, "F");

  const shadow = tornTicketOutline(OUTER + 3, OUTER + 3, TICKET_W, ticketH);
  doc.setFillColor(196, 198, 206);
  fillPolygon(doc, shadow, "F");

  const card = tornTicketOutline(OUTER, OUTER, TICKET_W, ticketH);
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(220, 221, 227);
  doc.setLineWidth(0.7);
  fillPolygon(doc, card, "FD");
}

export function createPvPdf(row: PvRecordLike) {
  // Pass 1 — measure the content height on a throwaway page so the final
  // ticket can be sized exactly, without blank space or overflow.
  const scratch = new jsPDF({ unit: "pt", format: [TICKET_W, 3000] });
  const measuredBottom = paintContent(scratch, row, 0, 0);
  const ticketH = measuredBottom + BOTTOM_INSET;

  const pageW = TICKET_W + OUTER * 2;
  const pageH = ticketH + OUTER * 2;
  const doc = new jsPDF({ unit: "pt", format: [pageW, pageH] });

  paintFrame(doc, ticketH, pageW, pageH);

  // Faint diagonal "official archive" watermark, same in-universe feel as
  // the blacklist notices elsewhere in the app.
  doc.saveGraphicsState();
  doc.setGState(new (doc as unknown as { GState: new (opts: { opacity: number }) => never }).GState({ opacity: 0.035 }));
  doc.setFont("helvetica", "bold");
  doc.setFontSize(46);
  doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.text("TTE OFFICIEL", pageW / 2, pageH / 2, { align: "center", angle: 32 });
  doc.restoreGraphicsState();

  paintContent(doc, row, OUTER, OUTER);

  return doc;
}
