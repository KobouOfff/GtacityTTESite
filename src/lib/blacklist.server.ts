import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { DiscordSessionUser } from "./discord-roles";

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
      } as never)
      .select("*")
      .single();

    if (!error && data) return data as unknown as BlacklistRow;
    lastError = error;
    if (error && error.code !== "23505") throw error;
  }
  throw new Error(`Impossible d’insérer la blacklist : ${String(lastError)}`);
}

export async function listBlacklist(): Promise<BlacklistRow[]> {
  const { data, error } = await supabaseAdmin
    .from("blacklist_entries" as never)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) throw error;
  return (data ?? []) as unknown as BlacklistRow[];
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
