// Client pour l'API DeoMail (https://deomail.com/api), utilisé côté serveur
// uniquement. Port TypeScript de bot_discord/deomail_client.py — garder les
// deux fichiers alignés si l'un des deux évolue (mêmes endpoints, même auth).
//
// SECURITY: n'importer ce module que depuis du code serveur (*.server.ts,
// server functions). DEOMAIL_API_KEY ne doit jamais atteindre le client.

const DEOMAIL_API_ROOT = process.env.DEOMAIL_API_ROOT ?? "https://api.deomail.com/v1";
const DEOMAIL_API_KEY = process.env.DEOMAIL_API_KEY ?? "";

export type DeoMailErrorCode = "not_configured" | "auth_failed" | "network" | "api_error";

export class DeoMailError extends Error {
  code: DeoMailErrorCode;
  constructor(message: string, code: DeoMailErrorCode = "api_error") {
    super(message);
    this.code = code;
  }
}

function authHeaders(): HeadersInit {
  if (!DEOMAIL_API_KEY) {
    // Cause la plus fréquente d'échec en prod : la variable d'env
    // DEOMAIL_API_KEY n'est pas définie sur le déploiement du site
    // (elle peut être configurée pour le bot Discord mais pas ici).
    throw new DeoMailError(
      "DEOMAIL_API_KEY n'est pas configurée sur ce déploiement (voir .env / variables d'environnement du site).",
      "not_configured",
    );
  }
  return {
    "X-API-Key": DEOMAIL_API_KEY,
    "Content-Type": "application/json",
  };
}

async function parseErrorBody(res: Response): Promise<string> {
  try {
    return (await res.text()).slice(0, 500);
  } catch {
    return res.statusText;
  }
}

/** Convertit une réponse HTTP en erreur, en distinguant 401/403 (mauvaise clé). */
async function toApiError(res: Response): Promise<DeoMailError> {
  const body = await parseErrorBody(res);
  if (res.status === 401 || res.status === 403) {
    return new DeoMailError(
      `DeoMail a refusé la clé API (HTTP ${res.status}) : ${body}`,
      "auth_failed",
    );
  }
  return new DeoMailError(`DeoMail a renvoyé une erreur ${res.status} : ${body}`, "api_error");
}

export type DeoMailSummary = {
  id: string;
  to?: string | string[];
  from?: string;
  subject?: string;
  created_at?: string;
  is_read?: boolean;
  [key: string]: unknown;
};

export type DeoMailFull = DeoMailSummary & {
  text?: string;
  html?: string;
  attachments?: Array<{ id: string; filename: string; mime_type?: string }>;
};

export type DeoMailFolder = "inbox" | "sent" | "archive" | "spam" | "trash";

// Correspondance dossier -> direction attendue par l'API DeoMail. "sent" est
// le seul dossier où l'on ne veut que les mails envoyés (direction "out") ;
// pour les autres on laisse l'API renvoyer les deux sens et on filtre
// nous-mêmes par adresse employé ensuite (un mail archivé/supprimé peut
// avoir été reçu ou envoyé par l'employé).
const FOLDER_DIRECTION: Partial<Record<DeoMailFolder, "in" | "out">> = {
  inbox: "in",
  sent: "out",
};

/** GET /v1/emails?folder=... — mails d'un dossier (tout le domaine, tous employés confondus, filtré ensuite côté appelant). */
export async function listEmailsByFolder(folder: DeoMailFolder, limit = 100): Promise<DeoMailSummary[]> {
  const params = new URLSearchParams({
    folder,
    limit: String(limit),
    sort: "created_at",
    order: "desc",
  });
  const direction = FOLDER_DIRECTION[folder];
  if (direction) params.set("direction", direction);
  let res: Response;
  try {
    res = await fetch(`${DEOMAIL_API_ROOT}/emails?${params}`, { headers: authHeaders() });
  } catch (e) {
    throw new DeoMailError(`Impossible de contacter l'API DeoMail : ${String(e)}`, "network");
  }
  if (!res.ok) {
    throw await toApiError(res);
  }
  const data = (await res.json()) as unknown;
  if (data && typeof data === "object") {
    for (const key of ["emails", "data", "results", "items"] as const) {
      const val = (data as Record<string, unknown>)[key];
      if (Array.isArray(val)) return val as DeoMailSummary[];
    }
  }
  if (Array.isArray(data)) return data as DeoMailSummary[];
  return [];
}

/** GET /v1/emails/:id — email complet, avec le corps du message. */
export async function getEmailById(emailId: string): Promise<DeoMailFull> {
  let res: Response;
  try {
    res = await fetch(`${DEOMAIL_API_ROOT}/emails/${encodeURIComponent(emailId)}`, {
      headers: authHeaders(),
    });
  } catch (e) {
    throw new DeoMailError(`Impossible de contacter l'API DeoMail : ${String(e)}`, "network");
  }
  if (!res.ok) {
    throw await toApiError(res);
  }
  const data = (await res.json()) as unknown;
  if (data && typeof data === "object" && "email" in (data as Record<string, unknown>)) {
    return (data as Record<string, unknown>).email as DeoMailFull;
  }
  return data as DeoMailFull;
}

/** PATCH /v1/emails/:id/read */
export async function markEmailRead(emailId: string): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`${DEOMAIL_API_ROOT}/emails/${encodeURIComponent(emailId)}/read`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ is_read: true }),
    });
  } catch (e) {
    throw new DeoMailError(`Impossible de contacter l'API DeoMail : ${String(e)}`, "network");
  }
  if (!res.ok) {
    throw await toApiError(res);
  }
}

/**
 * PATCH /v1/emails/:id/folder — déplace un email vers un autre dossier
 * (archive / spam / trash / inbox). Même schéma d'authentification et de
 * gestion d'erreur que markEmailRead ci-dessus.
 *
 * NOTE: le endpoint exact ("/folder" + champ "folder") suit la convention
 * observée sur les autres routes DeoMail de ce client (ex. "/read" +
 * "is_read"). S'il diverge de la documentation officielle DeoMail, adapter
 * ici uniquement — le reste de l'app (mail.functions.ts, MailPanel.tsx)
 * n'a pas besoin de changer.
 */
export async function moveEmailToFolder(emailId: string, folder: DeoMailFolder): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`${DEOMAIL_API_ROOT}/emails/${encodeURIComponent(emailId)}/folder`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ folder }),
    });
  } catch (e) {
    throw new DeoMailError(`Impossible de contacter l'API DeoMail : ${String(e)}`, "network");
  }
  if (!res.ok) {
    throw await toApiError(res);
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Habillage HTML des mails envoyés depuis le site : logo en en-tête, corps
// du message, puis signature de l'entreprise (site web, adresse, contact)
// en pied de page. Port de bot_discord/email_branding.py — garder les deux
// fichiers alignés (même rendu que les mails envoyés via Discord).
const COMPANY_NAME = "Townsend Transit Express";
const COMPANY_LOGO_URL = "https://townsendtransitexpress.com/tte-logo-officiel.png";
const COMPANY_WEBSITE = "https://townsendtransitexpress.com";
const COMPANY_ADDRESS = "Gare centrale de Townsend, Tennessee";
const COMPANY_CONTACT_EMAIL = "contact@townsendtransitexpress.com";
const PRIMARY_COLOR = "#002F6C"; // même bleu que le bot de billets / bot mail

/** Habille un texte brut avec le logo et la signature de l'entreprise, comme email_branding.py côté bot. */
function buildHtmlEmail(bodyText: string): string {
  const escapedBody = escapeHtml(bodyText).replace(/\n/g, "<br/>");
  return `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;
            background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px;
            overflow: hidden;">

  <div style="background: ${PRIMARY_COLOR}; padding: 20px; text-align: center;">
    <img src="${COMPANY_LOGO_URL}" alt="${COMPANY_NAME}"
         style="max-height: 60px; max-width: 260px;">
  </div>

  <div style="padding: 24px; color: #111827; font-size: 15px; line-height: 1.6;">
    ${escapedBody}
  </div>

  <div style="background: #f9fafb; padding: 18px 24px; border-top: 1px solid #e5e7eb;
              font-size: 12px; color: #6b7280; text-align: center;">
    <strong style="color: ${PRIMARY_COLOR};">${COMPANY_NAME}</strong><br>
    ${COMPANY_ADDRESS}<br>
    <a href="${COMPANY_WEBSITE}" style="color: ${PRIMARY_COLOR}; text-decoration: none;">
      ${COMPANY_WEBSITE.replace("https://", "")}
    </a>
    &nbsp;·&nbsp;
    <a href="mailto:${COMPANY_CONTACT_EMAIL}" style="color: ${PRIMARY_COLOR}; text-decoration: none;">
      ${COMPANY_CONTACT_EMAIL}
    </a>
  </div>

</div>`;
}

export type DeoMailAttachment = {
  filename: string;
  /** Contenu encodé en base64 (sans préfixe data:...). */
  content: string;
  contentType: string;
};

/** POST /v1/send */
export async function sendEmail(params: {
  from: string;
  to: string;
  /** Destinataires mis en copie (ex. le supérieur hiérarchique pour un blâme). Max géré côté appelant. */
  cc?: string[];
  subject: string;
  bodyText: string;
  /** Pièces jointes optionnelles (max 5 fichiers / 10 Mo au total, limite DeoMail). */
  attachments?: DeoMailAttachment[];
}): Promise<Record<string, unknown>> {
  const cc = (params.cc ?? []).filter((addr) => addr && addr !== params.to);
  const payload: Record<string, unknown> = {
    from: params.from,
    // Tous les destinataires (principal + copie) reçoivent réellement le
    // mail via "to" — DeoMail ne distingue pas forcément to/cc côté
    // livraison — tandis que "cc" (si l'API le supporte) permet un en-tête
    // "Cc:" propre pour que chacun voie qui est en copie.
    to: cc.length > 0 ? [params.to, ...cc] : [params.to],
    subject: params.subject,
    html: buildHtmlEmail(params.bodyText),
    fingerprint: false,
  };
  if (cc.length > 0) {
    payload.cc = cc;
  }
  if (params.attachments && params.attachments.length > 0) {
    payload.attachments = params.attachments;
  }
  let res: Response;
  try {
    res = await fetch(`${DEOMAIL_API_ROOT}/send`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
  } catch (e) {
    throw new DeoMailError(`Impossible de contacter l'API DeoMail : ${String(e)}`, "network");
  }
  if (!res.ok) {
    throw await toApiError(res);
  }
  try {
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export function extractAddress(field: string | string[] | undefined): string {
  if (!field) return "";
  const v = Array.isArray(field) ? field[0] : field;
  return String(v ?? "").trim().toLowerCase();
}
