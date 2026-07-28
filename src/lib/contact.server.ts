import type { DiscordSessionUser } from "./discord-roles";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type ContactNote = {
  author: string;
  author_id: string;
  message: string;
  at: string;
};

export type ContactMessage = {
  id: string;
  contact_request_id: string;
  visibility: "public" | "internal";
  author_type: "client" | "staff";
  author_discord_id: string;
  author_name: string;
  message: string;
  created_at: string;
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
  messages: ContactMessage[];
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
  const supabase = supabaseAdmin;
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
  const supabase = supabaseAdmin;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("contact_requests" as any) as any)
    .select("*")
    .eq("requester_discord_id", discordId)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return attachMessages((data ?? []) as ContactRequestRow[], "public");
}

export async function listAllRequests(filter?: {
  status?: string;
  branch?: string;
}): Promise<ContactRequestRow[]> {
  const supabase = supabaseAdmin;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q: any = (supabase.from("contact_requests" as any) as any)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(300);
  if (filter?.status) q = q.eq("status", filter.status);
  if (filter?.branch) q = q.eq("assigned_branch", filter.branch);
  const { data, error } = await q;
  if (error) throw error;
  return attachMessages((data ?? []) as ContactRequestRow[]);
}

export async function getRequestById(id: string): Promise<ContactRequestRow | null> {
  const supabase = supabaseAdmin;
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
  patch: {
    status?: string;
    assigned_branch?: string | null;
    internal_message?: string;
    client_message?: string;
  },
): Promise<void> {
  const supabase = supabaseAdmin;

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
  if (patch.internal_message?.trim() || patch.client_message?.trim()) {
    patchObj.updated_at = new Date().toISOString();
  }
  if (Object.keys(patchObj).length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("contact_requests" as any) as any)
      .update(patchObj)
      .eq("id", id);
    if (error) throw error;
  }

  if (patch.internal_message?.trim()) {
    await insertMessage(id, actor, patch.internal_message, "internal", "staff");
  }
  if (patch.client_message?.trim()) {
    await insertMessage(id, actor, patch.client_message, "public", "staff");
  }
}

async function attachMessages(
  rows: ContactRequestRow[],
  visibility?: "public" | "internal",
): Promise<ContactRequestRow[]> {
  if (!rows.length) return rows;
  const supabase = supabaseAdmin;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query: any = (supabase.from("contact_request_messages" as any) as any)
    .select("*")
    .in("contact_request_id", rows.map((row) => row.id))
    .order("created_at", { ascending: true });
  if (visibility) query = query.eq("visibility", visibility);
  const { data, error } = await query;
  if (error) throw error;

  const byRequest = new Map<string, ContactMessage[]>();
  for (const message of (data ?? []) as ContactMessage[]) {
    const list = byRequest.get(message.contact_request_id) ?? [];
    list.push(message);
    byRequest.set(message.contact_request_id, list);
  }
  return rows.map((row) => ({
    ...row,
    messages: byRequest.get(row.id) ?? [],
  }));
}

async function insertMessage(
  requestId: string,
  actor: DiscordSessionUser,
  message: string,
  visibility: "public" | "internal",
  authorType: "client" | "staff",
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabaseAdmin.from("contact_request_messages" as any) as any)
    .insert({
      contact_request_id: requestId,
      visibility,
      author_type: authorType,
      author_discord_id: actor.discordId,
      author_name: actor.displayName || actor.username,
      message: message.trim(),
    })
    .select("id, contact_request_id, visibility, author_type, author_discord_id, author_name, message, created_at")
    .single();
  if (error) {
    console.error("[insertContactRequestMessage]", {
      code: error.code,
      message: error.message,
      details: error.details,
    });
    throw error;
  }
  if (!data?.id) {
    throw new Error("message_not_persisted");
  }
  return data as ContactMessage;
}

export async function addClientReply(
  requestId: string,
  actor: DiscordSessionUser,
  message: string,
): Promise<void> {
  const request = await getRequestById(requestId);
  if (!request || request.requester_discord_id !== actor.discordId) {
    throw new Error("forbidden");
  }
  if (request.status === "ferme") throw new Error("closed");

  await insertMessage(requestId, actor, message, "public", "client");

  const supabase = supabaseAdmin;
  // Une réponse du client rouvre une demande résolue et la replace en traitement.
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (request.status === "resolu") patch.status = "en_cours";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("contact_requests" as any) as any)
    .update(patch)
    .eq("id", requestId);
  if (error) throw error;
}
