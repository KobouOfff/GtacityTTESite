import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { sessionConfig, type SessionData } from "./session.server";
import { canManageContactRequests, contactVisibleBranches, type DiscordSessionUser } from "./discord-roles";
import type { ContactRequestRow } from "./contact.server";

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
  .inputValidator(
    (d: { id: string; status?: string; assigned_branch?: string | null; note?: string }) => d,
  )
  .handler(async ({ data }) => {
    const user = await currentUser();
    if (!user) return { ok: false as const, reason: "not_logged_in" as const };
    if (!canManageContactRequests(user)) return { ok: false as const, reason: "forbidden" as const };
    try {
      const { updateRequest, getRequestById } = await import("./contact.server");
      const branches = contactVisibleBranches(user);
      if (branches !== null) {
        const existing = await getRequestById(data.id);
        if (!existing || !existing.assigned_branch || !branches.includes(existing.assigned_branch)) {
          return { ok: false as const, reason: "forbidden" as const };
        }
        // Un gérant de branche ne peut pas réassigner à une autre branche
        if (data.assigned_branch !== undefined && data.assigned_branch !== existing.assigned_branch && !branches.includes(data.assigned_branch ?? "")) {
          return { ok: false as const, reason: "forbidden" as const };
        }
      }
      await updateRequest(data.id, user, {
        status: data.status,
        assigned_branch: data.assigned_branch,
        note: data.note,
      });
      return { ok: true as const };
    } catch (e) {
      console.error("[updateContactRequest]", e);
      return { ok: false as const, reason: "update_failed" as const };
    }
  });
