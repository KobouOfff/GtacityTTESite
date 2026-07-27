import { createFileRoute } from "@tanstack/react-router";
import { useSession } from "@tanstack/react-start/server";
import { sessionConfig, type SessionData } from "@/lib/session.server";
import type { DiscordSessionUser } from "@/lib/discord-roles";

const LINES = new Set(["", "R1", "R2", "R3", "R4", "IC1", "IC2", "T", "BUS"]);
const SEVERITIES = new Set(["info", "warn", "alert"]);

type TrafficRow = {
  id: string;
  line: string | null;
  severity: string;
  title: string;
  message: string;
  valid_until: string | null;
  channel_web: boolean;
  channel_screen: boolean;
  channel_app: boolean;
  channel_audio: boolean;
  author_name: string;
  created_at: string;
};

function toClientShape(row: TrafficRow) {
  return {
    id: row.id,
    line: row.line ?? "",
    severity: row.severity,
    title: row.title,
    message: row.message,
    until: row.valid_until ?? "",
    channels: {
      web: row.channel_web,
      screen: row.channel_screen,
      app: row.channel_app,
      audio: row.channel_audio,
    },
    author: row.author_name,
    createdAt: row.created_at,
  };
}

async function currentUser(): Promise<DiscordSessionUser | null> {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const session = await useSession<SessionData>(sessionConfig);
  return session.data.user ?? null;
}

function noStore(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}

export const Route = createFileRoute("/api/traffic")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data, error } = await supabaseAdmin
            .from("traffic_publications" as never)
            .select("*")
            .order("created_at", { ascending: false })
            .limit(500);

          if (error) throw error;
          return noStore({
            ok: true,
            records: ((data ?? []) as unknown as TrafficRow[]).map(toClientShape),
          });
        } catch (error) {
          console.error("[traffic/list]", error);
          return noStore({ ok: false, reason: "list_failed" }, 500);
        }
      },

      POST: async ({ request }) => {
        const user = await currentUser();
        if (!user) return noStore({ ok: false, reason: "not_logged_in" }, 401);

        let body: Record<string, unknown>;
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          return noStore({ ok: false, reason: "bad_json" }, 400);
        }

        const line = typeof body.line === "string" ? body.line : "";
        const severity = typeof body.severity === "string" ? body.severity : "";
        const title = typeof body.title === "string" ? body.title.trim() : "";
        const message = typeof body.message === "string" ? body.message.trim() : "";
        const untilText = typeof body.until === "string" ? body.until : "";
        const untilDate = untilText ? new Date(untilText) : null;
        const channels =
          body.channels && typeof body.channels === "object"
            ? (body.channels as Record<string, unknown>)
            : {};

        if (
          !LINES.has(line) ||
          !SEVERITIES.has(severity) ||
          !title ||
          title.length > 180 ||
          !message ||
          message.length > 3000 ||
          (untilDate && Number.isNaN(untilDate.getTime()))
        ) {
          return noStore({ ok: false, reason: "invalid_fields" }, 400);
        }

        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data, error } = await supabaseAdmin
            .from("traffic_publications" as never)
            .insert({
              line: line || null,
              severity,
              title,
              message,
              valid_until: untilDate ? untilDate.toISOString() : null,
              channel_web: channels.web === true,
              channel_screen: channels.screen === true,
              channel_app: channels.app === true,
              channel_audio: channels.audio === true,
              author_discord_id: user.discordId,
              author_name: user.displayName || user.username,
            } as never)
            .select("*")
            .single();

          if (error) throw error;
          return noStore({
            ok: true,
            record: toClientShape(data as unknown as TrafficRow),
          });
        } catch (error) {
          console.error("[traffic/create]", error);
          return noStore({ ok: false, reason: "insert_failed" }, 500);
        }
      },

      PATCH: async ({ request }) => {
        const user = await currentUser();
        if (!user) return noStore({ ok: false, reason: "not_logged_in" }, 401);

        let body: Record<string, unknown>;
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          return noStore({ ok: false, reason: "bad_json" }, 400);
        }

        const id = typeof body.id === "string" ? body.id : "";
        const untilText = typeof body.until === "string" ? body.until : "";
        const untilDate = new Date(untilText);
        if (!/^[0-9a-f-]{36}$/i.test(id) || Number.isNaN(untilDate.getTime())) {
          return noStore({ ok: false, reason: "invalid_fields" }, 400);
        }

        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { error } = await supabaseAdmin
            .from("traffic_publications" as never)
            .update({
              valid_until: untilDate.toISOString(),
              updated_at: new Date().toISOString(),
            } as never)
            .eq("id", id);

          if (error) throw error;
          return noStore({ ok: true });
        } catch (error) {
          console.error("[traffic/update]", error);
          return noStore({ ok: false, reason: "update_failed" }, 500);
        }
      },

      DELETE: async ({ request }) => {
        const user = await currentUser();
        if (!user) return noStore({ ok: false, reason: "not_logged_in" }, 401);

        const id = new URL(request.url).searchParams.get("id");
        if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
          return noStore({ ok: false, reason: "bad_id" }, 400);
        }

        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { error } = await supabaseAdmin
            .from("traffic_publications" as never)
            .delete()
            .eq("id", id);

          if (error) throw error;
          return noStore({ ok: true });
        } catch (error) {
          console.error("[traffic/delete]", error);
          return noStore({ ok: false, reason: "delete_failed" }, 500);
        }
      },
    },
  },
});
