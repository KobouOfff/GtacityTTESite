import { createFileRoute } from "@tanstack/react-router";
import { useSession } from "@tanstack/react-start/server";
import { canManageDepartures, type DiscordSessionUser } from "@/lib/discord-roles";
import { sessionConfig, type SessionData } from "@/lib/session.server";

const DEPARTURE_KEYS = new Set([
  "d-r1",
  "d-ic2",
  "d-t1",
  "d-r2",
  "d-bus",
  "d-ic1",
  "d-r4",
  "d-t2",
]);

const STATUSES = new Set([
  "À l'heure",
  "Embarquement",
  "Retard ~5 min",
  "Retard ~10 min",
  "Retard ~20 min",
  "Quai modifié",
  "Supprimé",
]);

type DepartureRow = {
  departure_key: string;
  status: string;
  updated_by_name: string;
  updated_at: string;
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

function toClient(row: DepartureRow) {
  return {
    id: row.departure_key,
    st: row.status,
    author: row.updated_by_name,
    updatedAt: row.updated_at,
  };
}

export const Route = createFileRoute("/api/departures")({
  server: {
    handlers: {
      GET: async () => {
        const user = await currentUser();
        if (!user) return noStore({ ok: false, reason: "not_logged_in" }, 401);

        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data, error } = await supabaseAdmin
            .from("departure_overrides" as never)
            .select("*")
            .order("updated_at", { ascending: false });
          if (error) throw error;
          return noStore({
            ok: true,
            records: ((data ?? []) as unknown as DepartureRow[]).map(toClient),
          });
        } catch (error) {
          console.error("[departures/list]", error);
          return noStore({ ok: false, reason: "list_failed" }, 500);
        }
      },

      PATCH: async ({ request }) => {
        const user = await currentUser();
        if (!user) return noStore({ ok: false, reason: "not_logged_in" }, 401);
        if (!canManageDepartures(user)) {
          return noStore({ ok: false, reason: "forbidden" }, 403);
        }

        let body: Record<string, unknown>;
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          return noStore({ ok: false, reason: "bad_json" }, 400);
        }

        const departureKey = typeof body.id === "string" ? body.id : "";
        const status = typeof body.status === "string" ? body.status : "";
        if (!DEPARTURE_KEYS.has(departureKey) || !STATUSES.has(status)) {
          return noStore({ ok: false, reason: "invalid_fields" }, 400);
        }

        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data, error } = await supabaseAdmin
            .from("departure_overrides" as never)
            .upsert({
              departure_key: departureKey,
              status,
              updated_by_discord_id: user.discordId,
              updated_by_name: user.displayName || user.username,
              updated_at: new Date().toISOString(),
            } as never, { onConflict: "departure_key" })
            .select("*")
            .single();
          if (error) throw error;
          const { error: logError } = await supabaseAdmin
            .from("employee_audit_logs" as never)
            .insert({
              agent_discord_id: user.discordId,
              agent_name: user.displayName || user.username,
              action_text: `A mis à jour le départ ${departureKey} : « ${status} ».`,
              source: "departures",
            } as never);
          if (logError) console.error("[departures/audit]", logError);
          return noStore({ ok: true, record: toClient(data as unknown as DepartureRow) });
        } catch (error) {
          console.error("[departures/update]", error);
          return noStore({ ok: false, reason: "update_failed" }, 500);
        }
      },
    },
  },
});
