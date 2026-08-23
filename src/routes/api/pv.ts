import { createFileRoute } from "@tanstack/react-router";
import { useSession } from "@tanstack/react-start/server";
import { sessionConfig, type SessionData } from "@/lib/session.server";
import type { DiscordSessionUser } from "@/lib/discord-roles";

const REASONS = new Set([
  "sans", "invalide", "reduit", "refus", "contrefacon",
  "securite", "incivilite", "agression", "degradation", "fumee",
  "alcool", "animal", "bagage", "intrusion", "quai", "portes",
  "tapage", "vente", "autre",
]);
const LINES = new Set(["R1", "R2", "R3", "R4", "IC1", "IC2", "T", "Bus"]);
const AMOUNTS = new Set([500, 750, 1000, 1500]);
const PAYMENT_STATUSES = new Set([
  "À régler en gare",
  "Payé immédiat",
  "Refus de paiement",
  "Transmis recouvrement",
]);

type PvRow = {
  id: string;
  num: string;
  offender_name: string;
  identity_document: string;
  date_of_birth: string | null;
  reason: string;
  line: string;
  amount: number;
  payment_status: string;
  observations: string;
  agent_name: string;
  created_at: string;
};

function toLegacyShape(row: PvRow) {
  return {
    id: row.id,
    num: row.num,
    nom: row.offender_name,
    pid: row.identity_document,
    dob: row.date_of_birth ?? "",
    motif: row.reason,
    ligne: row.line,
    mt: row.amount,
    pay: row.payment_status,
    obs: row.observations,
    agent: row.agent_name,
    ts: row.created_at,
  };
}

async function currentUser(): Promise<DiscordSessionUser | null> {
  // TanStack Start exposes the server session through a use*-named helper,
  // but this function is executed only inside server route handlers.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const session = await useSession<SessionData>(sessionConfig);
  return session.data.user ?? null;
}

export const Route = createFileRoute("/api/pv")({
  server: {
    handlers: {
      GET: async () => {
        const user = await currentUser();
        if (!user) {
          return Response.json({ ok: false, reason: "not_logged_in" }, { status: 401 });
        }

        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data, error } = await supabaseAdmin
            .from("pv_records" as never)
            .select("*")
            .order("created_at", { ascending: false })
            .limit(500);

          if (error) throw error;
          return Response.json({
            ok: true,
            records: ((data ?? []) as unknown as PvRow[]).map(toLegacyShape),
          });
        } catch (error) {
          console.error("[pv/list]", error);
          return Response.json({ ok: false, reason: "list_failed" }, { status: 500 });
        }
      },

      POST: async ({ request }) => {
        const user = await currentUser();
        if (!user) {
          return Response.json({ ok: false, reason: "not_logged_in" }, { status: 401 });
        }

        let body: Record<string, unknown>;
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          return Response.json({ ok: false, reason: "bad_json" }, { status: 400 });
        }

        const offenderName = typeof body.nom === "string" ? body.nom.trim() : "";
        const identityDocument = typeof body.pid === "string" ? body.pid.trim() : "";
        const dateOfBirth = typeof body.dob === "string" && body.dob ? body.dob : null;
        const reason = typeof body.motif === "string" ? body.motif : "";
        const line = typeof body.ligne === "string" ? body.ligne : "";
        const amount = Number(body.mt);
        const paymentStatus = typeof body.pay === "string" ? body.pay : "";
        const observations = typeof body.obs === "string" ? body.obs.trim() : "";

        if (
          !offenderName ||
          offenderName.length > 120 ||
          !REASONS.has(reason) ||
          !LINES.has(line) ||
          !AMOUNTS.has(amount) ||
          !PAYMENT_STATUSES.has(paymentStatus) ||
          observations.length > 2000
        ) {
          return Response.json({ ok: false, reason: "invalid_fields" }, { status: 400 });
        }

        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data, error } = await supabaseAdmin
            .from("pv_records" as never)
            .insert({
              num: null,
              offender_name: offenderName,
              identity_document: identityDocument || "—",
              date_of_birth: dateOfBirth,
              reason,
              line,
              amount,
              payment_status: paymentStatus,
              observations,
              agent_discord_id: user.discordId,
              agent_name: user.displayName || user.username,
            } as never)
            .select("*")
            .single();

          if (error) throw error;
          return Response.json({ ok: true, record: toLegacyShape(data as unknown as PvRow) });
        } catch (error) {
          console.error("[pv/create]", error);
          return Response.json({ ok: false, reason: "insert_failed" }, { status: 500 });
        }
      },

      PATCH: async ({ request }) => {
        const user = await currentUser();
        if (!user) {
          return Response.json({ ok: false, reason: "not_logged_in" }, { status: 401 });
        }

        let body: Record<string, unknown>;
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          return Response.json({ ok: false, reason: "bad_json" }, { status: 400 });
        }

        const id = typeof body.id === "string" ? body.id : "";
        const paymentStatus = typeof body.pay === "string" ? body.pay : "";
        if (!id || !/^[0-9a-f-]{36}$/i.test(id) || !PAYMENT_STATUSES.has(paymentStatus)) {
          return Response.json({ ok: false, reason: "invalid_fields" }, { status: 400 });
        }

        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data, error } = await supabaseAdmin
            .from("pv_records" as never)
            .update({ payment_status: paymentStatus } as never)
            .eq("id", id)
            .select("*")
            .maybeSingle();
          if (error) throw error;
          if (!data) return Response.json({ ok: false, reason: "not_found" }, { status: 404 });
          return Response.json({ ok: true, record: toLegacyShape(data as unknown as PvRow) });
        } catch (error) {
          console.error("[pv/update]", error);
          return Response.json({ ok: false, reason: "update_failed" }, { status: 500 });
        }
      },

      DELETE: async ({ request }) => {
        const user = await currentUser();
        if (!user) {
          return Response.json({ ok: false, reason: "not_logged_in" }, { status: 401 });
        }

        const id = new URL(request.url).searchParams.get("id");
        if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
          return Response.json({ ok: false, reason: "bad_id" }, { status: 400 });
        }

        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { error } = await supabaseAdmin
            .from("pv_records" as never)
            .delete()
            .eq("id", id);
          if (error) throw error;
          return Response.json({ ok: true });
        } catch (error) {
          console.error("[pv/delete]", error);
          return Response.json({ ok: false, reason: "delete_failed" }, { status: 500 });
        }
      },
    },
  },
});
