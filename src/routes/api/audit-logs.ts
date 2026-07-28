import { createFileRoute } from "@tanstack/react-router";
import { useSession } from "@tanstack/react-start/server";
import { sessionConfig, type SessionData } from "@/lib/session.server";
import {
  canViewAuditLogs,
  type DiscordSessionUser,
} from "@/lib/discord-roles";

type AuditRow = {
  id: string;
  agent_discord_id: string;
  agent_name: string;
  action_text: string;
  source: string;
  created_at: string;
};

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

function cleanActionText(value: unknown) {
  if (typeof value !== "string") return "";
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 1500);
}

function toClientShape(row: AuditRow) {
  return {
    id: row.id,
    agentId: row.agent_discord_id,
    who: row.agent_name,
    text: row.action_text,
    source: row.source,
    ts: row.created_at,
  };
}

export const Route = createFileRoute("/api/audit-logs")({
  server: {
    handlers: {
      GET: async () => {
        const user = await currentUser();
        if (!user) return noStore({ ok: false, reason: "not_logged_in" }, 401);
        if (!canViewAuditLogs(user)) {
          return noStore({ ok: false, reason: "forbidden" }, 403);
        }

        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data, error } = await supabaseAdmin
            .from("employee_audit_logs" as never)
            .select("*")
            .order("created_at", { ascending: false })
            .limit(1000);
          if (error) throw error;

          return noStore({
            ok: true,
            records: ((data ?? []) as unknown as AuditRow[]).map(toClientShape),
          });
        } catch (error) {
          console.error("[audit-logs/list]", error);
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

        const actionText = cleanActionText(body.text);
        const source =
          typeof body.source === "string" && /^[a-z0-9_-]{1,60}$/i.test(body.source)
            ? body.source
            : "centre_regulation";
        if (!actionText) {
          return noStore({ ok: false, reason: "invalid_fields" }, 400);
        }

        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data, error } = await supabaseAdmin
            .from("employee_audit_logs" as never)
            .insert({
              agent_discord_id: user.discordId,
              agent_name: user.displayName || user.username,
              action_text: actionText,
              source,
            } as never)
            .select("*")
            .single();
          if (error) throw error;

          return noStore({
            ok: true,
            record: toClientShape(data as unknown as AuditRow),
          });
        } catch (error) {
          console.error("[audit-logs/create]", error);
          return noStore({ ok: false, reason: "insert_failed" }, 500);
        }
      },

      DELETE: async () => {
        const user = await currentUser();
        if (!user) return noStore({ ok: false, reason: "not_logged_in" }, 401);
        if (!canViewAuditLogs(user)) {
          return noStore({ ok: false, reason: "forbidden" }, 403);
        }

        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { error } = await supabaseAdmin
            .from("employee_audit_logs" as never)
            .delete()
            .lt("created_at", new Date().toISOString());
          if (error) throw error;
          return noStore({ ok: true });
        } catch (error) {
          console.error("[audit-logs/clear]", error);
          return noStore({ ok: false, reason: "delete_failed" }, 500);
        }
      },
    },
  },
});
