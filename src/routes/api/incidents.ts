import { createFileRoute } from "@tanstack/react-router";
import { useSession } from "@tanstack/react-start/server";
import { sessionConfig, type SessionData } from "@/lib/session.server";
import type { DiscordSessionUser } from "@/lib/discord-roles";

const TYPES = new Set([
  "incivilite", "agression", "accident", "malaise", "degradation",
  "intrusion", "bagage", "fraude", "materiel", "autre",
]);
const SEVERITIES = new Set(["info", "warn", "alert"]);

type IncidentRow = {
  id: string;
  incident_type: string;
  severity: string;
  location: string;
  passenger_count: number;
  description: string;
  measures_taken: string;
  emergency_services: string;
  follow_up: string;
  created_by_name: string;
  created_at: string;
};

function toClientShape(row: IncidentRow) {
  return {
    id: row.id,
    type: row.incident_type,
    grav: row.severity,
    lieu: row.location,
    pax: row.passenger_count,
    desc: row.description,
    mes: row.measures_taken,
    sec: row.emergency_services,
    suit: row.follow_up,
    agent: row.created_by_name,
    ts: row.created_at,
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

export const Route = createFileRoute("/api/incidents")({
  server: {
    handlers: {
      GET: async () => {
        const user = await currentUser();
        if (!user) return noStore({ ok: false, reason: "not_logged_in" }, 401);

        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data, error } = await supabaseAdmin
            .from("incident_records" as never)
            .select("*")
            .order("created_at", { ascending: false })
            .limit(500);

          if (error) throw error;
          return noStore({
            ok: true,
            records: ((data ?? []) as unknown as IncidentRow[]).map(toClientShape),
          });
        } catch (error) {
          console.error("[incidents/list]", error);
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

        const type = typeof body.type === "string" ? body.type : "";
        const severity = typeof body.grav === "string" ? body.grav : "";
        const location = typeof body.lieu === "string" ? body.lieu.trim() : "";
        const passengerCount = Number(body.pax ?? 0);
        const description = typeof body.desc === "string" ? body.desc.trim() : "";
        const measures = typeof body.mes === "string" ? body.mes.trim() : "";
        const emergencyServices = typeof body.sec === "string" ? body.sec.trim() : "";
        const followUp = typeof body.suit === "string" ? body.suit.trim() : "";

        if (
          !TYPES.has(type) ||
          !SEVERITIES.has(severity) ||
          !location ||
          location.length > 160 ||
          !Number.isInteger(passengerCount) ||
          passengerCount < 0 ||
          passengerCount > 9999 ||
          !description ||
          description.length > 4000 ||
          measures.length > 1000 ||
          emergencyServices.length > 160 ||
          followUp.length > 160
        ) {
          return noStore({ ok: false, reason: "invalid_fields" }, 400);
        }

        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const agentName = user.displayName || user.username;
          const { data, error } = await supabaseAdmin
            .from("incident_records" as never)
            .insert({
              incident_type: type,
              severity,
              location,
              passenger_count: passengerCount,
              description,
              measures_taken: measures || "—",
              emergency_services: emergencyServices || "Aucun",
              follow_up: followUp || "Aucune",
              created_by_discord_id: user.discordId,
              created_by_name: agentName,
            } as never)
            .select("*")
            .single();

          if (error) throw error;

          const { error: logError } = await supabaseAdmin
            .from("employee_audit_logs" as never)
            .insert({
              agent_discord_id: user.discordId,
              agent_name: agentName,
              action_text: `A consigné un évènement ${type} (${location}).`,
              source: "main_courante",
            } as never);
          if (logError) console.error("[incidents/audit]", logError);

          return noStore({
            ok: true,
            record: toClientShape(data as unknown as IncidentRow),
          });
        } catch (error) {
          console.error("[incidents/create]", error);
          return noStore({ ok: false, reason: "insert_failed" }, 500);
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
          const { data: record, error: readError } = await supabaseAdmin
            .from("incident_records" as never)
            .select("incident_type, location")
            .eq("id", id)
            .maybeSingle();
          if (readError) throw readError;

          const { error } = await supabaseAdmin
            .from("incident_records" as never)
            .delete()
            .eq("id", id);
          if (error) throw error;

          const details = record as unknown as { incident_type?: string; location?: string } | null;
          const { error: logError } = await supabaseAdmin
            .from("employee_audit_logs" as never)
            .insert({
              agent_discord_id: user.discordId,
              agent_name: user.displayName || user.username,
              action_text: `A retiré un évènement de la main courante${
                details?.location ? ` (${details.location})` : ""
              }.`,
              source: "main_courante",
            } as never);
          if (logError) console.error("[incidents/audit-delete]", logError);

          return noStore({ ok: true });
        } catch (error) {
          console.error("[incidents/delete]", error);
          return noStore({ ok: false, reason: "delete_failed" }, 500);
        }
      },
    },
  },
});
