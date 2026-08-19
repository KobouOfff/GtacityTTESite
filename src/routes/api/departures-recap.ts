import { createFileRoute } from "@tanstack/react-router";

const MONTH_PATTERN = /^\d{4}-\d{2}$/;

type EventRow = {
  service_id: string;
  line: string;
  service_date: string;
  status: string;
  delay_minutes: number;
  public_message: string | null;
};

function noStore(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}

function monthRange(month: string) {
  const [year, mon] = month.split("-").map(Number);
  const from = `${month}-01`;
  const lastDay = new Date(Date.UTC(year, mon, 0)).getUTCDate();
  const to = `${month}-${String(lastDay).padStart(2, "0")}`;
  return { from, to };
}

async function buildRecap(request: Request) {
  const url = new URL(request.url);
  const month = url.searchParams.get("month") || new Date().toISOString().slice(0, 7);
  if (!MONTH_PATTERN.test(month)) return noStore({ ok: false, reason: "bad_month" }, 400);
  const { from, to } = monthRange(month);

  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // On lit le journal d'historique append-only (timetable_regulation_events)
    // et non l'état courant (timetable_service_updates), pour qu'un
    // "Réinitialiser" ultérieur n'efface pas les incidents déjà survenus.
    const { data: updateData, error: updateError } = await supabaseAdmin
      .from("timetable_regulation_events" as never)
      .select("service_id, line, service_date, status, delay_minutes, public_message")
      .gte("service_date", from)
      .lte("service_date", to)
      .order("service_date", { ascending: true });
    if (updateError) throw updateError;
    const updates = (updateData ?? []) as unknown as EventRow[];

    type LineStat = {
      line: string;
      delayed: number;
      cancelled: number;
      platformChanged: number;
      totalDelayMinutes: number;
      worstDelayMinutes: number;
    };
    const byLine = new Map<string, LineStat>();
    const motifCounts = new Map<string, number>();
    let totalDelayed = 0;
    let totalCancelled = 0;
    let totalPlatformChanged = 0;
    let totalDelayMinutes = 0;
    const days = new Set<string>();

    for (const update of updates) {
      const line = update.line || "?";
      if (!["delayed", "cancelled", "platform_changed"].includes(update.status)) continue;
      days.add(update.service_date);
      if (!byLine.has(line)) {
        byLine.set(line, { line, delayed: 0, cancelled: 0, platformChanged: 0, totalDelayMinutes: 0, worstDelayMinutes: 0 });
      }
      const stat = byLine.get(line)!;
      if (update.status === "delayed") {
        stat.delayed++;
        totalDelayed++;
        stat.totalDelayMinutes += update.delay_minutes || 0;
        stat.worstDelayMinutes = Math.max(stat.worstDelayMinutes, update.delay_minutes || 0);
        totalDelayMinutes += update.delay_minutes || 0;
      } else if (update.status === "cancelled") {
        stat.cancelled++;
        totalCancelled++;
      } else if (update.status === "platform_changed") {
        stat.platformChanged++;
        totalPlatformChanged++;
      }
      const motif = (update.public_message || "").trim();
      if (motif) motifCounts.set(motif, (motifCounts.get(motif) || 0) + 1);
    }

    const lines = Array.from(byLine.values()).sort((a, b) => (b.delayed + b.cancelled) - (a.delayed + a.cancelled));
    const topMotifs = Array.from(motifCounts.entries())
      .map(([motif, count]) => ({ motif, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    return noStore({
      ok: true,
      month,
      totals: {
        delayed: totalDelayed,
        cancelled: totalCancelled,
        platformChanged: totalPlatformChanged,
        averageDelayMinutes: totalDelayed ? Math.round((totalDelayMinutes / totalDelayed) * 10) / 10 : 0,
        affectedDays: days.size,
      },
      lines,
      topMotifs,
    });
  } catch (error) {
    console.error("[departures/recap]", error);
    return noStore({ ok: false, reason: "recap_failed" }, 500);
  }
}

export const Route = createFileRoute("/api/departures-recap")({
  server: {
    handlers: {
      GET: async ({ request }) => buildRecap(request),
    },
  },
});
