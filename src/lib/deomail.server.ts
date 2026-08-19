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

/** GET /v1/emails — mails du dossier inbox (tout le domaine, tous employés confondus). */
export async function listInboxEmails(limit = 100): Promise<DeoMailSummary[]> {
  const params = new URLSearchParams({
    folder: "inbox",
    direction: "in",
    limit: String(limit),
    sort: "created_at",
    order: "desc",
  });
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

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Habille un texte brut en HTML simple (paragraphes), comme email_branding.py côté bot. */
function textToHtml(text: string): string {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br/>")}</p>`)
    .join("\n");
  return `<div style="font-family:Arial,sans-serif;font-size:14px;color:#111;line-height:1.5;">${paragraphs}</div>`;
}

/** POST /v1/send */
export async function sendEmail(params: {
  from: string;
  to: string;
  subject: string;
  bodyText: string;
}): Promise<Record<string, unknown>> {
  const payload = {
    from: params.from,
    to: [params.to],
    subject: params.subject,
    html: textToHtml(params.bodyText),
    fingerprint: false,
  };
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
