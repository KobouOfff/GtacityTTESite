// Registre des avertissements / blâmes / sanctions d'un employé (table
// Supabase "hr_employee_warnings", créée par la migration
// 20260827000000_create_hr_employee_warnings.sql).
//
// Contrairement au champ texte libre "avertissements" de hr_employee_files
// (une seule note globale), chaque ligne ici est un événement daté et
// horodaté, conservé indéfiniment, avec pièce jointe optionnelle.
//
// SECURITY: n'importer ce module que depuis du code serveur (*.server.ts,
// server functions). supabaseAdmin utilise la clé de service et ne doit
// jamais atteindre le bundle client.

import type { DiscordSessionUser } from "./discord-roles";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const ATTACHMENT_BUCKET = "hr-warning-attachments";
const ATTACHMENT_SIGNED_URL_TTL_SECONDS = 60 * 60; // 1 h

export type HrWarningType = "avertissement" | "blame" | "sanction" | "note";

export type HrWarningRow = {
  id: string;
  employee_discord_id: string;
  employee_username: string | null;
  employee_display_name: string | null;

  type: HrWarningType;
  title: string;
  description: string | null;

  attachment_path: string | null;
  attachment_filename: string | null;
  attachment_mime: string | null;
  /** URL signée temporaire, calculée à la lecture — jamais stockée en base. */
  attachment_url: string | null;

  created_by_discord_id: string;
  created_by_username: string | null;

  created_at: string;
};

export type CreateHrWarningPayload = {
  employeeDiscordId: string;
  employeeUsername: string | null;
  employeeDisplayName: string | null;
  type: HrWarningType;
  title: string;
  description?: string | null;
  attachmentPath?: string | null;
  attachmentFilename?: string | null;
  attachmentMime?: string | null;
};

async function withAttachmentUrl(row: HrWarningRow): Promise<HrWarningRow> {
  if (!row.attachment_path) return { ...row, attachment_url: null };
  const { data, error } = await supabaseAdmin.storage
    .from(ATTACHMENT_BUCKET)
    .createSignedUrl(row.attachment_path, ATTACHMENT_SIGNED_URL_TTL_SECONDS);
  if (error || !data) return { ...row, attachment_url: null };
  return { ...row, attachment_url: data.signedUrl };
}

export async function listHrWarnings(employeeDiscordId: string): Promise<HrWarningRow[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabaseAdmin.from("hr_employee_warnings" as any) as any)
    .select("*")
    .eq("employee_discord_id", employeeDiscordId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  const rows = (data ?? []) as HrWarningRow[];
  return Promise.all(rows.map(withAttachmentUrl));
}

export type HrWarningSummary = {
  count: number;
  /** true si au moins une entrée est de type "blame" ou "sanction". */
  hasSevere: boolean;
};

/**
 * Résumé (nombre d'entrées + présence d'un blâme/sanction) du registre de
 * chaque employé ayant au moins une entrée. Utilisé pour afficher un badge
 * dans l'annuaire RH sans devoir charger le détail de chaque registre.
 */
export async function listHrWarningSummaries(): Promise<Record<string, HrWarningSummary>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabaseAdmin.from("hr_employee_warnings" as any) as any).select(
    "employee_discord_id, type",
  );
  if (error) throw error;
  const rows = (data ?? []) as Array<{ employee_discord_id: string; type: HrWarningType }>;
  const summaries: Record<string, HrWarningSummary> = {};
  for (const row of rows) {
    const existing = summaries[row.employee_discord_id] ?? { count: 0, hasSevere: false };
    existing.count += 1;
    if (row.type === "blame" || row.type === "sanction") existing.hasSevere = true;
    summaries[row.employee_discord_id] = existing;
  }
  return summaries;
}

export async function addHrWarning(
  actor: DiscordSessionUser,
  payload: CreateHrWarningPayload,
): Promise<HrWarningRow> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabaseAdmin.from("hr_employee_warnings" as any) as any)
    .insert({
      employee_discord_id: payload.employeeDiscordId,
      employee_username: payload.employeeUsername,
      employee_display_name: payload.employeeDisplayName,
      type: payload.type,
      title: payload.title.trim(),
      description: payload.description?.trim() || null,
      attachment_path: payload.attachmentPath || null,
      attachment_filename: payload.attachmentFilename || null,
      attachment_mime: payload.attachmentMime || null,
      created_by_discord_id: actor.discordId,
      created_by_username: actor.displayName || actor.username,
    })
    .select("*")
    .single();
  if (error) throw error;
  return withAttachmentUrl(data as HrWarningRow);
}

export async function deleteHrWarning(id: string): Promise<void> {
  // On efface aussi la pièce jointe du bucket pour ne pas laisser de fichier
  // orphelin, sans bloquer la suppression de la ligne si ça échoue.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabaseAdmin.from("hr_employee_warnings" as any) as any)
    .select("attachment_path")
    .eq("id", id)
    .maybeSingle();
  const attachmentPath = (existing as { attachment_path?: string } | null)?.attachment_path;
  if (attachmentPath) {
    await supabaseAdmin.storage.from(ATTACHMENT_BUCKET).remove([attachmentPath]).catch(() => {});
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabaseAdmin.from("hr_employee_warnings" as any) as any).delete().eq("id", id);
  if (error) throw error;
}

/**
 * Téléverse la pièce jointe d'un avertissement dans le bucket privé et
 * renvoie le chemin de l'objet (à stocker dans hr_employee_warnings.attachment_path).
 * `base64Data` ne doit pas inclure le préfixe "data:...;base64,".
 */
export async function uploadHrWarningAttachment(
  actor: DiscordSessionUser,
  base64Data: string,
  mimeType: string,
  originalFilename: string,
): Promise<string> {
  const extFromMime =
    mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : mimeType === "application/pdf" ? "pdf" : "jpg";
  const safeExt = (originalFilename.split(".").pop() || extFromMime).toLowerCase().replace(/[^a-z0-9]/g, "") || extFromMime;
  const path = `${actor.discordId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`;
  const bytes = Buffer.from(base64Data, "base64");
  const { error } = await supabaseAdmin.storage
    .from(ATTACHMENT_BUCKET)
    .upload(path, bytes, { contentType: mimeType, upsert: false });
  if (error) throw error;
  return path;
}
