import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { sessionConfig, type SessionData } from "./session.server";
import type { DiscordSessionUser } from "./discord-roles";
import { categorizePresenceRoles, getPrimaryPresenceRole, type OnlineCategory } from "./presence-utils";

export type OnlineUser = {
  discordId: string;
  username: string;
  displayName: string | null;
  avatar: string | null;
  roleIds: string[];
  lastSeenAt: string;
  primaryRoleName: string | null;
  primaryRoleColor: string | null;
  category: OnlineCategory;
};

export const pingPresence = createServerFn({ method: "POST" }).handler(async () => {
  const session = await useSession<SessionData>(sessionConfig);
  const user = session.data.user as DiscordSessionUser | undefined;
  if (!user) {
    return { ok: false as const, reason: "no-session" };
  }
  try {
    const { saveDiscordPresence } = await import("./presence.server");
    await saveDiscordPresence(user);
    return { ok: true as const };
  } catch (e) {
    console.error("[pingPresence] exception", e);
    return { ok: false as const, reason: String(e) };
  }
});

export const listOnlineEffectifs = createServerFn({ method: "GET" }).handler(async () => {
  const session = await useSession<SessionData>(sessionConfig);
  const user = session.data.user as DiscordSessionUser | undefined;
  if (!user) {
    return {
      users: [] as OnlineUser[],
      currentUserTracked: false as const,
      reason: "no-session" as const,
    };
  }

  const { saveDiscordPresence, fetchOnlineDiscordUsers } = await import("./presence.server");
  try {
    await saveDiscordPresence(user);
  } catch (error) {
    console.error("[listOnlineEffectifs] save error", error);
    return {
      users: [] as OnlineUser[],
      currentUserTracked: false as const,
      reason: "save-failed" as const,
    };
  }

  const cutoff = new Date(Date.now() - 3 * 60 * 1000).toISOString(); // 3 min
  let data: Awaited<ReturnType<typeof fetchOnlineDiscordUsers>>;
  try {
    data = await fetchOnlineDiscordUsers(cutoff);
  } catch (error) {
    console.error("[listOnlineEffectifs] read error", error);
    return {
      users: [] as OnlineUser[],
      currentUserTracked: true as const,
      reason: "read-failed" as const,
    };
  }
  const users: OnlineUser[] = data.map((r) => {
    const p = getPrimaryPresenceRole(r.role_ids ?? []);
    return {
      discordId: r.discord_id,
      username: r.username,
      displayName: r.display_name,
      avatar: r.avatar,
      roleIds: r.role_ids ?? [],
      lastSeenAt: r.last_seen_at,
      primaryRoleName: p?.name ?? null,
      primaryRoleColor: p?.color ?? null,
      category: categorizePresenceRoles(r.role_ids ?? []),
    };
  });
  return { users, currentUserTracked: true as const, reason: null };
});
