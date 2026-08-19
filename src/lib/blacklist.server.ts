import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { DiscordSessionUser } from "./discord-roles";

const PHOTO_BUCKET = "blacklist-photos";
const PHOTO_SIGNED_URL_TTL_SECONDS = 60 * 60; // 1 h

export type BlacklistNote = {
  author: string;
  author_id: string;
  message: string;
  at: string;
};

export type BlacklistRow = {
  id: string;
  ref: string;
  first_name: string;
  last_name: string;
  alias: string | null;
  date_of_birth: string | null;
  discord_id: string | null;
  discord_username: string | null;
  steam_id: string | null;
  physical_description: string | null;
  reason: string;
  infractions: string[];
  scope: string;
  start_date: string;
  end_date: string | null;
  is_permanent: boolean;
  status: string;
  created_by_discord_id: string;
  created_by_username: string;
  revoked_by_discord_id: string | null;
  revoked_by_username: string | null;
  revoked_at: string | null;
  revoke_reason: string | null;
  internal_notes: BlacklistNote[];
  pdf_document_number: string | null;
  photo_path: string | null;
  /** URL signée temporaire, calculée à la lecture — jamais stockée en base. */
  photo_url: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateBlacklistPayload = {
  first_name: string;
  last_name: string;
  alias?: string | null;
  date_of_birth?: string | null;
  discord_id?: string | null;
  discord_username?: string | null;
  steam_id?: string | null;
  physical_description?: string | null;
  reason: string;
  infractions: string[];
  scope: string;
  start_date: string;
  end_date: string | null;
  is_permanent: boolean;
  photo_path?: string | null;
};

function makeRef() {
  const year = new Date().getFullYear();
  const number = Math.floor(100000 + Math.random() * 900000);
  return `TTE-BLK-${year}-${number}`;
}

export async function createBlacklist(
  actor: DiscordSessionUser,
  payload: CreateBlacklistPayload,
): Promise<BlacklistRow> {
  let lastError: unknown = null;
  for (let attempt = 0; attempt < 4; attempt++) {
    const ref = makeRef();
    const { data, error } = await supabaseAdmin
      .from("blacklist_entries" as never)
      .insert({
        ref,
        first_name: payload.first_name.trim(),
        last_name: payload.last_name.trim(),
        alias: payload.alias?.trim() || null,
        date_of_birth: payload.date_of_birth || null,
        discord_id: payload.discord_id?.trim() || null,
        discord_username: payload.discord_username?.trim() || null,
        steam_id: payload.steam_id?.trim() || null,
        physical_description: payload.physical_description?.trim() || null,
        reason: payload.reason.trim(),
        infractions: payload.infractions,
        scope: payload.scope,
        start_date: payload.start_date,
        end_date: payload.is_permanent ? null : payload.end_date,
        is_permanent: payload.is_permanent,
        status: "active",
        created_by_discord_id: actor.discordId,
        created_by_username: actor.displayName || actor.username,
        pdf_document_number: ref,
        photo_path: payload.photo_path?.trim() || null,
      } as never)
      .select("*")
      .single();

    if (!error && data) return withPhotoUrl(data as unknown as BlacklistRow);
    lastError = error;
    if (error && error.code !== "23505") throw error;
  }
  throw new Error(`Impossible d’insérer la blacklist : ${String(lastError)}`);
}

async function withPhotoUrl(row: BlacklistRow): Promise<BlacklistRow> {
  if (!row.photo_path) return { ...row, photo_url: null };
  const { data, error } = await supabaseAdmin.storage
    .from(PHOTO_BUCKET)
    .createSignedUrl(row.photo_path, PHOTO_SIGNED_URL_TTL_SECONDS);
  if (error || !data) return { ...row, photo_url: null };
  return { ...row, photo_url: data.signedUrl };
}

export async function listBlacklist(): Promise<BlacklistRow[]> {
  const { data, error } = await supabaseAdmin
    .from("blacklist_entries" as never)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) throw error;
  const rows = (data ?? []) as unknown as BlacklistRow[];
  return Promise.all(rows.map(withPhotoUrl));
}

/**
 * Téléverse la photo d'un individu blacklisté dans le bucket privé et
 * renvoie le chemin de l'objet (à stocker dans blacklist_entries.photo_path).
 * `base64Data` ne doit pas inclure le préfixe "data:image/...;base64,".
 */
export async function uploadBlacklistPhoto(
  actor: DiscordSessionUser,
  base64Data: string,
  mimeType: string,
): Promise<string> {
  const ext = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
  const path = `${actor.discordId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const bytes = Buffer.from(base64Data, "base64");
  const { error } = await supabaseAdmin.storage
    .from(PHOTO_BUCKET)
    .upload(path, bytes, { contentType: mimeType, upsert: false });
  if (error) throw error;
  return path;
}

export async function revokeBlacklist(
  id: string,
  actor: DiscordSessionUser,
  reason: string,
): Promise<void> {
  const now = new Date().toISOString();
  const { error } = await supabaseAdmin
    .from("blacklist_entries" as never)
    .update({
      status: "revoked",
      revoked_by_discord_id: actor.discordId,
      revoked_by_username: actor.displayName || actor.username,
      revoked_at: now,
      revoke_reason: reason.trim() || null,
      updated_at: now,
    } as never)
    .eq("id", id);

  if (error) throw error;
}

export async function addBlacklistNote(
  id: string,
  actor: DiscordSessionUser,
  message: string,
): Promise<void> {
  const { data: current, error: readError } = await supabaseAdmin
    .from("blacklist_entries" as never)
    .select("internal_notes")
    .eq("id", id)
    .single();

  if (readError) throw readError;
  const notes = (((current as { internal_notes?: BlacklistNote[] } | null)?.internal_notes) ?? []).slice();
  notes.push({
    author: actor.displayName || actor.username,
    author_id: actor.discordId,
    message: message.trim(),
    at: new Date().toISOString(),
  });

  const { error } = await supabaseAdmin
    .from("blacklist_entries" as never)
    .update({
      internal_notes: notes,
      updated_at: new Date().toISOString(),
    } as never)
    .eq("id", id);

  if (error) throw error;
}
