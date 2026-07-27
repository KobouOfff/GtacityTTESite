import { createHash } from "crypto";
import { createClient } from "@supabase/supabase-js";
import type { DiscordSessionUser } from "./discord-roles";

const PRESENCE_PROOF_SALT = "20a54c73055d610b3e3f336779ccb9d1";

function getProof() {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET manquant");
  return createHash("sha256").update(s + PRESENCE_PROOF_SALT).digest("hex");
}

function client() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Configuration backend incomplète");
  const proof = getProof();
  return createClient(url, key, {
    global: {
      fetch: (input, init) => {
        const headers = new Headers(
          typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
        );
        if (init?.headers) new Headers(init.headers).forEach((v, k) => headers.set(k, v));
        if (key.startsWith("sb_publishable_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        headers.set("x-tte-presence-proof", proof);
        return fetch(input, { ...init, headers });
      },
    },
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

export type ContactNote = {
  author: string;
  author_id: string;
  message: string;
  at: string;
};

export type ContactRequestRow = {
  id: string;
  ref: string;
  requester_discord_id: string;
  requester_username: string;
  requester_display_name: string | null;
  requester_avatar: string | null;
  category: string;
  subject: string;
  message: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extra: Record<string, any>;

  status: string;
  assigned_branch: string | null;
  assigned_by_discord_id: string | null;
  assigned_by_username: string | null;
  assigned_at: string | null;
  notes: ContactNote[];
  created_at: string;
  updated_at: string;
};

function makeRef() {
  const y = new Date().getFullYear();
  const n = Math.floor(100000 + Math.random() * 900000);
  return `TTE-${y}-${n}`;
}

export async function createContactRequest(
  user: DiscordSessionUser,
  payload: { category: string; subject: string; message: string; extra: Record<string, unknown> },
): Promise<{ id: string; ref: string }> {
  const supabase = client();
  let lastErr: unknown = null;
  for (let i = 0; i < 4; i++) {
    const ref = makeRef();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from("contact_requests" as any) as any)
      .insert({
        ref,
        requester_discord_id: user.discordId,
        requester_username: user.username,
        requester_display_name: user.displayName,
        requester_avatar: user.avatar,
        category: payload.category,
        subject: payload.subject,
        message: payload.message,
        extra: payload.extra,
      })
      .select("id, ref")
      .single();
    if (!error && data) return data as { id: string; ref: string };
    lastErr = error;
    // 23505 = unique_violation → retry with new ref
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (error && (error as any).code !== "23505") throw error;
  }
  throw new Error(`Impossible d'insérer la demande: ${String(lastErr)}`);
}

export async function listRequestsByDiscordId(discordId: string): Promise<ContactRequestRow[]> {
  const supabase = client();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("contact_requests" as any) as any)
    .select("*")
    .eq("requester_discord_id", discordId)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data ?? []) as ContactRequestRow[];
}

export async function listAllRequests(filter?: {
  status?: string;
  branch?: string;
}): Promise<ContactRequestRow[]> {
  const supabase = client();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q: any = (supabase.from("contact_requests" as any) as any)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(300);
  if (filter?.status) q = q.eq("status", filter.status);
  if (filter?.branch) q = q.eq("assigned_branch", filter.branch);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as ContactRequestRow[];
}

export async function getRequestById(id: string): Promise<ContactRequestRow | null> {
  const supabase = client();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("contact_requests" as any) as any)
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as ContactRequestRow | null;
}


export async function updateRequest(
  id: string,
  actor: DiscordSessionUser,
  patch: { status?: string; assigned_branch?: string | null; note?: string },
): Promise<void> {
  const supabase = client();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: current, error: readErr } = await (supabase.from("contact_requests" as any) as any)
    .select("notes")
    .eq("id", id)
    .single();
  if (readErr) throw readErr;
  const notes: ContactNote[] = ((current?.notes as ContactNote[] | undefined) ?? []).slice();

  const patchObj: Record<string, unknown> = {};
  if (patch.status) patchObj.status = patch.status;
  if (patch.assigned_branch !== undefined) {
    patchObj.assigned_branch = patch.assigned_branch;
    patchObj.assigned_by_discord_id = actor.discordId;
    patchObj.assigned_by_username = actor.displayName || actor.username;
    patchObj.assigned_at = new Date().toISOString();
    if (!patch.status) {
      patchObj.status = patch.assigned_branch ? "transfere" : "nouveau";
    }
  }
  if (patch.note && patch.note.trim()) {
    notes.push({
      author: actor.displayName || actor.username,
      author_id: actor.discordId,
      message: patch.note.trim(),
      at: new Date().toISOString(),
    });
    patchObj.notes = notes;
  }
  if (Object.keys(patchObj).length === 0) return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("contact_requests" as any) as any)
    .update(patchObj)
    .eq("id", id);
  if (error) throw error;
}
