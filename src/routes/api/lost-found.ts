import { createFileRoute } from "@tanstack/react-router";
import { useSession } from "@tanstack/react-start/server";
import { sessionConfig, type SessionData } from "@/lib/session.server";
import type { DiscordSessionUser } from "@/lib/discord-roles";

const CATEGORIES = new Set([
  "Téléphone",
  "Portefeuille",
  "Sac / bagage",
  "Vêtement",
  "Clés",
  "Document",
  "Lunettes",
  "Électronique",
  "Autre",
]);

const LOCATIONS = new Set([
  "Train R1",
  "Train R2",
  "Train R3",
  "Train R4",
  "IC1",
  "IC2",
  "Train urbain T",
  "Gare Townsend",
  "Bus",
]);

const STATUSES = new Set(["En attente", "Restitué", "Transféré"]);

type LostFoundRow = {
  id: string;
  category: string;
  found_location: string;
  found_by: string;
  locker_reference: string;
  description: string;
  status: string;
  created_at: string;
};

function toClientShape(row: LostFoundRow) {
  return {
    id: row.id,
    cat: row.category,
    lieu: row.found_location,
    qui: row.found_by,
    cas: row.locker_reference,
    desc: row.description,
    st: row.status,
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

export const Route = createFileRoute("/api/lost-found")({
  server: {
    handlers: {
      GET: async () => {
        const user = await currentUser();
        if (!user) return noStore({ ok: false, reason: "not_logged_in" }, 401);

        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data, error } = await supabaseAdmin
            .from("lost_found_items" as never)
            .select("*")
            .order("created_at", { ascending: false })
            .limit(500);

          if (error) throw error;
          return noStore({
            ok: true,
            records: ((data ?? []) as unknown as LostFoundRow[]).map(toClientShape),
          });
        } catch (error) {
          console.error("[lost-found/list]", error);
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

        const category = typeof body.cat === "string" ? body.cat : "";
        const location = typeof body.lieu === "string" ? body.lieu : "";
        const foundBy = typeof body.qui === "string" ? body.qui.trim() : "";
        const locker = typeof body.cas === "string" ? body.cas.trim() : "";
        const description = typeof body.desc === "string" ? body.desc.trim() : "";

        if (
          !CATEGORIES.has(category) ||
          !LOCATIONS.has(location) ||
          !description ||
          description.length > 500 ||
          foundBy.length > 120 ||
          locker.length > 80
        ) {
          return noStore({ ok: false, reason: "invalid_fields" }, 400);
        }

        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data, error } = await supabaseAdmin
            .from("lost_found_items" as never)
            .insert({
              category,
              found_location: location,
              found_by: foundBy || "Agent TTE",
              locker_reference: locker || "—",
              description,
              status: "En attente",
              created_by_discord_id: user.discordId,
              created_by_name: user.displayName || user.username,
            } as never)
            .select("*")
            .single();

          if (error) throw error;
          return noStore({
            ok: true,
            record: toClientShape(data as unknown as LostFoundRow),
          });
        } catch (error) {
          console.error("[lost-found/create]", error);
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
        const status = typeof body.status === "string" ? body.status : "";
        if (!/^[0-9a-f-]{36}$/i.test(id) || !STATUSES.has(status)) {
          return noStore({ ok: false, reason: "invalid_fields" }, 400);
        }

        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { error } = await supabaseAdmin
            .from("lost_found_items" as never)
            .update({
              status,
              updated_by_discord_id: user.discordId,
              updated_by_name: user.displayName || user.username,
              updated_at: new Date().toISOString(),
            } as never)
            .eq("id", id);

          if (error) throw error;
          return noStore({ ok: true });
        } catch (error) {
          console.error("[lost-found/update]", error);
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
            .from("lost_found_items" as never)
            .delete()
            .eq("id", id);

          if (error) throw error;
          return noStore({ ok: true });
        } catch (error) {
          console.error("[lost-found/delete]", error);
          return noStore({ ok: false, reason: "delete_failed" }, 500);
        }
      },
    },
  },
});
