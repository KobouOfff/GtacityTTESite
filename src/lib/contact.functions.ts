import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { sessionConfig, type SessionData } from "./session.server";
import { canManageContactRequests, contactVisibleBranches, type DiscordSessionUser } from "./discord-roles";
import type { ContactRequestRow } from "./contact.server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const STATUSES = new Set(["nouveau", "en_cours", "transfere", "resolu", "ferme"]);

async function currentUser(): Promise<DiscordSessionUser | null> {
  const s = await useSession<SessionData>(sessionConfig);
  return (s.data.user ?? null) as DiscordSessionUser | null;
}

export const listMyContactRequests = createServerFn({ method: "GET" }).handler(async () => {
  const user = await currentUser();
  if (!user) return { ok: false as const, reason: "not_logged_in" as const };
  try {
    const { listRequestsByDiscordId } = await import("./contact.server");
    const rows = await listRequestsByDiscordId(user.discordId);
    return { ok: true as const, rows: rows as ContactRequestRow[] };
  } catch (e) {
    console.error("[listMyContactRequests]", e);
    return { ok: false as const, reason: "read_failed" as const };
  }
});

export const listAllContactRequests = createServerFn({ method: "GET" }).handler(async () => {
  const user = await currentUser();
  if (!user) return { ok: false as const, reason: "not_logged_in" as const };
  if (!canManageContactRequests(user)) return { ok: false as const, reason: "forbidden" as const };
  try {
    const { listAllRequests } = await import("./contact.server");
    const rows = (await listAllRequests()) as ContactRequestRow[];
    const branches = contactVisibleBranches(user);
    const filtered = branches === null
      ? rows
      : rows.filter((r) => r.assigned_branch && branches.includes(r.assigned_branch));
    return { ok: true as const, rows: filtered };
  } catch (e) {
    console.error("[listAllContactRequests]", e);
    return { ok: false as const, reason: "read_failed" as const };
  }
});

export const updateContactRequest = createServerFn({ method: "POST" })
  .validator(
    (d: {
      id: string;
      status?: string;
      assigned_branch?: string | null;
      internal_message?: string;
      client_message?: string;
    }) => d,
  )
  .handler(async ({ data }) => {
    const user = await currentUser();
    if (!user) return { ok: false as const, reason: "not_logged_in" as const };
    if (!canManageContactRequests(user)) return { ok: false as const, reason: "forbidden" as const };
    if (
      !UUID.test(data.id) ||
      (data.status !== undefined && !STATUSES.has(data.status)) ||
      (data.internal_message?.trim().length ?? 0) > 5000 ||
      (data.client_message?.trim().length ?? 0) > 5000
    ) {
      return { ok: false as const, reason: "invalid" as const };
    }
    try {
      const { updateRequest, getRequestById } = await import("./contact.server");
      const existing = await getRequestById(data.id);
      if (!existing) return { ok: false as const, reason: "not_found" as const };
      const branches = contactVisibleBranches(user);
      if (branches !== null) {
        if (!existing.assigned_branch || !branches.includes(existing.assigned_branch)) {
          return { ok: false as const, reason: "forbidden" as const };
        }
        if (data.assigned_branch !== undefined && data.assigned_branch !== existing.assigned_branch && !branches.includes(data.assigned_branch ?? "")) {
          return { ok: false as const, reason: "forbidden" as const };
        }
      }
      const isTransfer =
        data.assigned_branch !== undefined &&
        data.assigned_branch !== existing.assigned_branch &&
        data.assigned_branch !== null;
      if (isTransfer && !data.internal_message?.trim()) {
        return { ok: false as const, reason: "internal_message_required" as const };
      }
      await updateRequest(data.id, user, {
        status: data.status,
        assigned_branch: data.assigned_branch,
        internal_message: data.internal_message,
        client_message: data.client_message,
      });
      return { ok: true as const };
    } catch (e) {
      console.error("[updateContactRequest]", e);
      return { ok: false as const, reason: "update_failed" as const };
    }
  });

export const replyToMyContactRequest = createServerFn({ method: "POST" })
  .validator((data: { id: string; message: string }) => data)
  .handler(async ({ data }) => {
    const user = await currentUser();
    if (!user) return { ok: false as const, reason: "not_logged_in" as const };
    const message = data.message?.trim();
    if (!UUID.test(data.id) || !message || message.length > 5000) {
      return { ok: false as const, reason: "invalid" as const };
    }
    try {
      const { addClientReply } = await import("./contact.server");
      await addClientReply(data.id, user, message);
      return { ok: true as const };
    } catch (error) {
      console.error("[replyToMyContactRequest]", error);
      const reason =
        error instanceof Error && error.message === "closed"
          ? ("closed" as const)
          : error instanceof Error && error.message === "forbidden"
            ? ("forbidden" as const)
            : ("insert_failed" as const);
      return { ok: false as const, reason };
    }
  });
