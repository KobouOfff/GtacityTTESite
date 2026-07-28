import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { sessionConfig, type SessionData } from "./session.server";
import { canManageBlacklist, type DiscordSessionUser } from "./discord-roles";
import type { BlacklistRow, CreateBlacklistPayload } from "./blacklist.server";

const SCOPES = new Set(["all", "stations", "trains", "offices", "events"]);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

async function currentUser(): Promise<DiscordSessionUser | null> {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const session = await useSession<SessionData>(sessionConfig);
  return session.data.user ?? null;
}

function validPayload(data: CreateBlacklistPayload) {
  return (
    typeof data.first_name === "string" &&
    data.first_name.trim().length > 0 &&
    data.first_name.trim().length <= 80 &&
    typeof data.last_name === "string" &&
    data.last_name.trim().length > 0 &&
    data.last_name.trim().length <= 80 &&
    typeof data.reason === "string" &&
    data.reason.trim().length > 0 &&
    data.reason.trim().length <= 5000 &&
    Array.isArray(data.infractions) &&
    data.infractions.length <= 50 &&
    data.infractions.every((item) => typeof item === "string" && item.length <= 500) &&
    SCOPES.has(data.scope) &&
    ISO_DATE.test(data.start_date) &&
    (data.is_permanent === true ||
      (typeof data.end_date === "string" && ISO_DATE.test(data.end_date))) &&
    (!data.discord_id || /^\d{17,20}$/.test(data.discord_id)) &&
    (!data.alias || data.alias.length <= 100) &&
    (!data.discord_username || data.discord_username.length <= 100) &&
    (!data.steam_id || data.steam_id.length <= 80) &&
    (!data.physical_description || data.physical_description.length <= 1000)
  );
}

export const listBlacklistEntries = createServerFn({ method: "GET" }).handler(async () => {
  const user = await currentUser();
  if (!user) return { ok: false as const, reason: "not_logged_in" as const };
  if (!canManageBlacklist(user)) return { ok: false as const, reason: "forbidden" as const };

  try {
    const { listBlacklist } = await import("./blacklist.server");
    const rows = (await listBlacklist()) as BlacklistRow[];
    return { ok: true as const, rows };
  } catch (error) {
    console.error("[listBlacklistEntries]", error);
    return { ok: false as const, reason: "read_failed" as const };
  }
});

export const createBlacklistEntry = createServerFn({ method: "POST" })
  .validator((data: CreateBlacklistPayload) => data)
  .handler(async ({ data }) => {
    const user = await currentUser();
    if (!user) return { ok: false as const, reason: "not_logged_in" as const };
    if (!canManageBlacklist(user)) return { ok: false as const, reason: "forbidden" as const };
    if (!validPayload(data)) return { ok: false as const, reason: "invalid" as const };

    try {
      const { createBlacklist } = await import("./blacklist.server");
      const row = await createBlacklist(user, data);
      const { sendBlacklistToDiscord } = await import("./blacklist-discord.server");
      const discordDelivery = await sendBlacklistToDiscord(row);
      return { ok: true as const, row, discordDelivery };
    } catch (error) {
      console.error("[createBlacklistEntry]", error);
      return { ok: false as const, reason: "insert_failed" as const };
    }
  });

export const revokeBlacklistEntry = createServerFn({ method: "POST" })
  .validator((data: { id: string; reason: string }) => data)
  .handler(async ({ data }) => {
    const user = await currentUser();
    if (!user) return { ok: false as const, reason: "not_logged_in" as const };
    if (!canManageBlacklist(user)) return { ok: false as const, reason: "forbidden" as const };
    if (!UUID.test(data.id) || data.reason.length > 2000) {
      return { ok: false as const, reason: "invalid" as const };
    }

    try {
      const { revokeBlacklist } = await import("./blacklist.server");
      await revokeBlacklist(data.id, user, data.reason);
      return { ok: true as const };
    } catch (error) {
      console.error("[revokeBlacklistEntry]", error);
      return { ok: false as const, reason: "update_failed" as const };
    }
  });

export const addBlacklistNoteFn = createServerFn({ method: "POST" })
  .validator((data: { id: string; message: string }) => data)
  .handler(async ({ data }) => {
    const user = await currentUser();
    if (!user) return { ok: false as const, reason: "not_logged_in" as const };
    if (!canManageBlacklist(user)) return { ok: false as const, reason: "forbidden" as const };
    if (!UUID.test(data.id) || !data.message.trim() || data.message.length > 2000) {
      return { ok: false as const, reason: "invalid" as const };
    }

    try {
      const { addBlacklistNote } = await import("./blacklist.server");
      await addBlacklistNote(data.id, user, data.message);
      return { ok: true as const };
    } catch (error) {
      console.error("[addBlacklistNoteFn]", error);
      return { ok: false as const, reason: "update_failed" as const };
    }
  });
