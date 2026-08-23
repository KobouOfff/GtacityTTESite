import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { sessionConfig, type SessionData } from "./session.server";
import { canManageHrFiles, type DiscordSessionUser } from "./discord-roles";
import type { CreateHrWarningPayload, HrWarningRow, HrWarningType } from "./hr-warnings.server";

const DISCORD_ID = /^[0-9]{5,25}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const WARNING_TYPES = new Set<HrWarningType>(["avertissement", "blame", "sanction", "note"]);
const ALLOWED_ATTACHMENT_MIME = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
const MAX_ATTACHMENT_BASE64_LENGTH = 15 * 1024 * 1024 * 1.4; // ~15 Mo une fois décodé

async function currentUser(): Promise<DiscordSessionUser | null> {
  const s = await useSession<SessionData>(sessionConfig);
  return (s.data.user ?? null) as DiscordSessionUser | null;
}

/**
 * Registre des avertissements d'un employé. Consultable par la RH pour
 * n'importe qui, ou par l'employé lui-même pour son propre dossier
 * (lecture seule, cf. /mon-compte, /documents-rh vue employé).
 */
export const listHrWarningsFn = createServerFn({ method: "GET" })
  .validator((discordId: string) => discordId)
  .handler(async ({ data: discordId }) => {
    const user = await currentUser();
    if (!user) return { ok: false as const, reason: "not_logged_in" as const };
    if (!DISCORD_ID.test(discordId)) return { ok: false as const, reason: "invalid" as const };
    const isOwnFile = user.discordId === discordId;
    if (!isOwnFile && !canManageHrFiles(user)) return { ok: false as const, reason: "forbidden" as const };

    try {
      const { listHrWarnings } = await import("./hr-warnings.server");
      const rows = (await listHrWarnings(discordId)) as HrWarningRow[];
      return { ok: true as const, rows };
    } catch (e) {
      console.error("[listHrWarningsFn]", e);
      return { ok: false as const, reason: "read_failed" as const };
    }
  });

/**
 * Résumé (nombre d'entrées + présence d'un blâme/sanction) du registre de
 * chaque employé, pour l'annuaire RH. Réservé à la RH / Direction.
 */
export const listHrWarningSummariesFn = createServerFn({ method: "GET" }).handler(async () => {
  const user = await currentUser();
  if (!user) return { ok: false as const, reason: "not_logged_in" as const };
  if (!canManageHrFiles(user)) return { ok: false as const, reason: "forbidden" as const };

  try {
    const { listHrWarningSummaries } = await import("./hr-warnings.server");
    const summaries = await listHrWarningSummaries();
    return { ok: true as const, summaries };
  } catch (e) {
    console.error("[listHrWarningSummariesFn]", e);
    return { ok: false as const, reason: "read_failed" as const };
  }
});

export const uploadHrWarningAttachmentFn = createServerFn({ method: "POST" })
  .validator((data: { base64: string; mimeType: string; filename: string }) => data)
  .handler(async ({ data }) => {
    const user = await currentUser();
    if (!user) return { ok: false as const, reason: "not_logged_in" as const };
    if (!canManageHrFiles(user)) return { ok: false as const, reason: "forbidden" as const };
    if (!ALLOWED_ATTACHMENT_MIME.has(data.mimeType)) {
      return { ok: false as const, reason: "invalid_type" as const };
    }
    if (typeof data.base64 !== "string" || data.base64.length === 0 || data.base64.length > MAX_ATTACHMENT_BASE64_LENGTH) {
      return { ok: false as const, reason: "invalid_size" as const };
    }
    if (typeof data.filename !== "string" || data.filename.length > 200) {
      return { ok: false as const, reason: "invalid" as const };
    }

    try {
      const { uploadHrWarningAttachment } = await import("./hr-warnings.server");
      const path = await uploadHrWarningAttachment(user, data.base64, data.mimeType, data.filename);
      return { ok: true as const, path };
    } catch (e) {
      console.error("[uploadHrWarningAttachmentFn]", e);
      return { ok: false as const, reason: "upload_failed" as const };
    }
  });

export const addHrWarningFn = createServerFn({ method: "POST" })
  .validator((data: CreateHrWarningPayload) => data)
  .handler(async ({ data }) => {
    const user = await currentUser();
    if (!user) return { ok: false as const, reason: "not_logged_in" as const };
    if (!canManageHrFiles(user)) return { ok: false as const, reason: "forbidden" as const };
    if (!DISCORD_ID.test(data.employeeDiscordId)) return { ok: false as const, reason: "invalid" as const };
    if (!WARNING_TYPES.has(data.type)) return { ok: false as const, reason: "invalid" as const };
    if (typeof data.title !== "string" || data.title.trim().length === 0 || data.title.trim().length > 200) {
      return { ok: false as const, reason: "invalid" as const };
    }
    if (data.description && data.description.length > 5000) {
      return { ok: false as const, reason: "invalid" as const };
    }
    if (data.attachmentPath && data.attachmentPath.length > 300) {
      return { ok: false as const, reason: "invalid" as const };
    }

    try {
      const { addHrWarning } = await import("./hr-warnings.server");
      const row = await addHrWarning(user, data);
      return { ok: true as const, row };
    } catch (e) {
      console.error("[addHrWarningFn]", e);
      return { ok: false as const, reason: "save_failed" as const };
    }
  });

export const deleteHrWarningFn = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    const user = await currentUser();
    if (!user) return { ok: false as const, reason: "not_logged_in" as const };
    if (!canManageHrFiles(user)) return { ok: false as const, reason: "forbidden" as const };
    if (!UUID.test(id)) return { ok: false as const, reason: "invalid" as const };

    try {
      const { deleteHrWarning } = await import("./hr-warnings.server");
      await deleteHrWarning(id);
      return { ok: true as const };
    } catch (e) {
      console.error("[deleteHrWarningFn]", e);
      return { ok: false as const, reason: "delete_failed" as const };
    }
  });
