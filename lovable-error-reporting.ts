import { createHash } from "crypto";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { DiscordSessionUser } from "./discord-roles";

const PRESENCE_PROOF_SALT = "20a54c73055d610b3e3f336779ccb9d1";

function getPresenceProof() {
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) throw new Error("SESSION_SECRET manquant");
  return createHash("sha256").update(sessionSecret + PRESENCE_PROOF_SALT).digest("hex");
}

function createPresenceClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Configuration backend incomplète");

  const proof = getPresenceProof();
  return createClient<Database>(url, key, {
    global: {
      fetch: (input, init) => {
        const headers = new Headers(
          typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
        );
        if (init?.headers) {
          new Headers(init.headers).forEach((value, name) => headers.set(name, value));
        }
        if (key.startsWith("sb_publishable_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        headers.set("x-tte-presence-proof", proof);
        return fetch(input, { ...init, headers });
      },
    },
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function saveDiscordPresence(user: DiscordSessionUser) {
  const supabase = createPresenceClient();
  const now = new Date().toISOString();
  const { error } = await supabase.from("discord_users").upsert(
    {
      discord_id: user.discordId,
      username: user.username,
      display_name: user.displayName,
      avatar: user.avatar,
      role_ids: user.roleIds,
      last_seen_at: now,
      updated_at: now,
    },
    { onConflict: "discord_id" },
  );
  if (error) throw error;
}

export async function fetchOnlineDiscordUsers(cutoff: string) {
  const supabase = createPresenceClient();
  const { data, error } = await supabase
    .from("discord_users")
    .select("discord_id, username, display_name, avatar, role_ids, last_seen_at")
    .gte("last_seen_at", cutoff)
    .order("last_seen_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return data ?? [];
}