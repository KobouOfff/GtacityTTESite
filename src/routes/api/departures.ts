import { createFileRoute } from "@tanstack/react-router";
import { useSession } from "@tanstack/react-start/server";
import { canManageDepartures, type DiscordSessionUser } from "@/lib/discord-roles";
import { stationBySlug } from "@/lib/public-stations";
import { sessionConfig, type SessionData } from "@/lib/session.server";

const STATUSES = new Set(["on_time", "boarding", "delayed", "platform_changed", "cancelled"]);
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

type Stop = { slug: string; name: string; offset: number; platform?: string };
type ServiceRow = {
  id: string;
  line: string;
  service_name: string;
  origin_slug: string;
  destination_slug: string;
  departure_time: string;
  arrival_time: string;
  days_of_week: number[];
  stops: Stop[];
};
type UpdateRow = {
  id: string;
  service_id: string;
  service_date: string;
  status: string;
  delay_minutes: number;
  platform_override: string | null;
  public_message: string | null;
  updated_by_name: string;
  updated_at: string;
  propagated?: boolean;
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

function minutesFromTime(value: string) {
  const [hours, minutes] = value.slice(0, 5).split(":").map(Number);
  return hours * 60 + minutes;
}

function timeFromMinutes(value: number) {
  const normalized = ((value % 1440) + 1440) % 1440;
  return `${String(Math.floor(normalized / 60)).padStart(2, "0")}:${String(normalized % 60).padStart(2, "0")}`;
}

function publicRecord(service: ServiceRow, update: UpdateRow | undefined, date: string, from?: Stop, to?: Stop) {
  const stops = Array.isArray(service.stops) ? service.stops : [];
  const origin = from ?? stops[0];
  const destination = to ?? stops[stops.length - 1];
  const base = minutesFromTime(service.departure_time);
  const delay = update?.delay_minutes ?? 0;
  const originIndex = stops.findIndex((stop) => stop.slug === origin?.slug);
  const destinationIndex = stops.findIndex((stop) => stop.slug === destination?.slug);
  const between = originIndex >= 0 && destinationIndex >= 0
    ? stops.slice(originIndex + 1, destinationIndex).map((stop) => stop.name)
    : [];

  return {
    id: service.id,
    line: service.line,
    serviceName: service.service_name,
    serviceDate: date,
    origin: origin?.name ?? stationBySlug(service.origin_slug)?.shortName ?? service.origin_slug,
    originSlug: origin?.slug ?? service.origin_slug,
    destination: destination?.name ?? stationBySlug(service.destination_slug)?.shortName ?? service.destination_slug,
    destinationSlug: destination?.slug ?? service.destination_slug,
    scheduledDeparture: timeFromMinutes(base + (origin?.offset ?? 0)),
    departure: timeFromMinutes(base + (origin?.offset ?? 0) + delay),
    scheduledArrival: timeFromMinutes(base + (destination?.offset ?? 0)),
    arrival: timeFromMinutes(base + (destination?.offset ?? 0) + delay),
    durationMinutes: Math.max(0, (destination?.offset ?? 0) - (origin?.offset ?? 0)),
    platform: origin?.slug === "townsend" ? "1" : update?.platform_override || origin?.platform || "—",
    status: update?.status ?? "on_time",
    delayMinutes: delay,
    message: update?.public_message ?? "",
    via: between,
    updatedBy: update?.updated_by_name ?? "",
    updatedAt: update?.updated_at ?? "",
    propagated: update?.propagated === true,
  };
}

function applyTownsendSinglePlatform(
  services: ServiceRow[],
  sourceUpdates: Map<string, UpdateRow>,
) {
  const effective = new Map(sourceUpdates);
  const townsendMovements = services
    .map((service) => {
      const stops = Array.isArray(service.stops) ? service.stops : [];
      const townsendStop = stops.find((stop) => stop.slug === "townsend");
      return townsendStop
        ? { service, scheduled: minutesFromTime(service.departure_time) + townsendStop.offset }
        : null;
    })
    .filter((movement): movement is { service: ServiceRow; scheduled: number } => movement !== null)
    .sort((a, b) => a.scheduled - b.scheduled);

  let previousDeparture: number | null = null;
  let cascadeActive = false;
  for (const movement of townsendMovements) {
    const { service, scheduled } = movement;
    const update = sourceUpdates.get(service.id);
    if (update?.status === "cancelled") continue;
    const manualDelay = update?.status === "delayed" ? update.delay_minutes : 0;
    let requiredDelay = manualDelay;

    if (manualDelay > 0) {
      cascadeActive = true;
    } else if (cascadeActive && previousDeparture !== null) {
      requiredDelay = Math.max(0, previousDeparture + 5 - scheduled);
      if (requiredDelay === 0) cascadeActive = false;
    }

    if (requiredDelay > manualDelay) {
      effective.set(service.id, {
        id: update?.id || `propagated-${service.id}`,
        service_id: service.id,
        service_date: update?.service_date || "",
        status: "delayed",
        delay_minutes: requiredDelay,
        platform_override: "1",
        public_message: update?.public_message ||
          "Retard de régulation dû à l’occupation de l’unique quai de Townsend.",
        updated_by_name: update?.updated_by_name || "Régulation automatique",
        updated_at: update?.updated_at || new Date().toISOString(),
        propagated: true,
      });
    }
    previousDeparture = scheduled + requiredDelay;
  }
  return effective;
}

async function listDepartures(request: Request) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date") || new Date().toISOString().slice(0, 10);
  if (!DATE_PATTERN.test(date)) return noStore({ ok: false, reason: "bad_date" }, 400);

  const originSlug = url.searchParams.get("origin") || "";
  const destinationSlug = url.searchParams.get("destination") || "";
  const stationSlug = url.searchParams.get("station") || "";
  const line = url.searchParams.get("line") || "";
  const limit = Math.min(200, Math.max(1, Number(url.searchParams.get("limit")) || 100));
  const dayOfWeek = new Date(`${date}T12:00:00Z`).getUTCDay();

  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let serviceQuery = supabaseAdmin
      .from("timetable_services" as never)
      .select("*")
      .eq("active", true)
      .contains("days_of_week", [dayOfWeek])
      .order("departure_time", { ascending: true });
    const { data: serviceData, error: serviceError } = await serviceQuery;
    if (serviceError) throw serviceError;

    const services = (serviceData ?? []) as unknown as ServiceRow[];
    const ids = services.map((service) => service.id);
    let updates: UpdateRow[] = [];
    if (ids.length) {
      const { data, error } = await supabaseAdmin
        .from("timetable_service_updates" as never)
        .select("*")
        .eq("service_date", date)
        .in("service_id", ids);
      if (error) throw error;
      updates = (data ?? []) as unknown as UpdateRow[];
    }
    const sourceUpdates = new Map(updates.map((update) => [update.service_id, update]));
    const byService = applyTownsendSinglePlatform(services, sourceUpdates);

    const records = services.filter((service) => !line || service.line === line).flatMap((service) => {
      const stops = Array.isArray(service.stops) ? service.stops : [];
      let from: Stop | undefined;
      let to: Stop | undefined;
      if (originSlug && destinationSlug) {
        const fromIndex = stops.findIndex((stop) => stop.slug === originSlug);
        const toIndex = stops.findIndex((stop) => stop.slug === destinationSlug);
        if (fromIndex < 0 || toIndex <= fromIndex) return [];
        from = stops[fromIndex];
        to = stops[toIndex];
      } else if (stationSlug) {
        const index = stops.findIndex((stop) => stop.slug === stationSlug);
        if (index < 0) return [];
        if (index === stops.length - 1) {
          const arrivalRecord = publicRecord(service, byService.get(service.id), date, stops[0], stops[index]);
          return [{
            ...arrivalRecord,
            departure: arrivalRecord.arrival,
            scheduledDeparture: arrivalRecord.scheduledArrival,
            destination: `Arrivée de ${arrivalRecord.origin}`,
            destinationSlug: arrivalRecord.originSlug,
            platform: byService.get(service.id)?.platform_override || stops[index]?.platform || "—",
            movement: "arrival",
          }];
        }
        from = stops[index];
        to = stops[stops.length - 1];
      }
      return [{ ...publicRecord(service, byService.get(service.id), date, from, to), movement: "departure" }];
    }).sort((a, b) => a.departure.localeCompare(b.departure)).slice(0, limit);

    return noStore({ ok: true, date, records });
  } catch (error) {
    console.error("[departures/list]", error);
    return noStore({ ok: false, reason: "list_failed" }, 500);
  }
}

export const Route = createFileRoute("/api/departures")({
  server: {
    handlers: {
      GET: async ({ request }) => listDepartures(request),

      PATCH: async ({ request }) => {
        const user = await currentUser();
        if (!user) return noStore({ ok: false, reason: "not_logged_in" }, 401);
        if (!canManageDepartures(user)) return noStore({ ok: false, reason: "forbidden" }, 403);

        let body: Record<string, unknown>;
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          return noStore({ ok: false, reason: "bad_json" }, 400);
        }

        const serviceId = typeof body.serviceId === "string" ? body.serviceId : "";
        const date = typeof body.date === "string" ? body.date : "";
        const status = typeof body.status === "string" ? body.status : "";
        const delayMinutes = Number(body.delayMinutes ?? 0);
        const platform = typeof body.platform === "string" ? body.platform.trim().slice(0, 20) : "";
        const message = typeof body.message === "string" ? body.message.trim().slice(0, 500) : "";
        if (!serviceId || !DATE_PATTERN.test(date) || !STATUSES.has(status) ||
          !Number.isInteger(delayMinutes) || delayMinutes < 0 || delayMinutes > 360) {
          return noStore({ ok: false, reason: "invalid_fields" }, 400);
        }

        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data: service, error: serviceError } = await supabaseAdmin
            .from("timetable_services" as never)
            .select("id, line, service_name")
            .eq("id", serviceId)
            .eq("active", true)
            .maybeSingle();
          if (serviceError) throw serviceError;
          if (!service) return noStore({ ok: false, reason: "unknown_service" }, 404);

          const { data, error } = await supabaseAdmin
            .from("timetable_service_updates" as never)
            .upsert({
              service_id: serviceId,
              service_date: date,
              status,
              delay_minutes: status === "delayed" ? delayMinutes : 0,
              platform_override: platform || null,
              public_message: message || null,
              updated_by_discord_id: user.discordId,
              updated_by_name: user.displayName || user.username,
              updated_at: new Date().toISOString(),
            } as never, { onConflict: "service_id,service_date" })
            .select("*")
            .single();
          if (error) throw error;

          const serviceInfo = service as unknown as { line: string; service_name: string };
          const statusText = status === "cancelled" ? "supprimé"
            : status === "delayed" ? `retardé de ${delayMinutes} min`
            : status === "boarding" ? "mis à l’embarquement"
            : status === "platform_changed" ? `changement de voie (${platform || "non précisée"})`
            : "remis à l’heure";
          const { error: logError } = await supabaseAdmin
            .from("employee_audit_logs" as never)
            .insert({
              agent_discord_id: user.discordId,
              agent_name: user.displayName || user.username,
              action_text: `A mis à jour ${serviceInfo.service_name} (${serviceInfo.line}) le ${date} : ${statusText}.`,
              source: "departures",
            } as never);
          if (logError) console.error("[departures/audit]", logError);
          return noStore({ ok: true, update: data });
        } catch (error) {
          console.error("[departures/update]", error);
          return noStore({ ok: false, reason: "update_failed" }, 500);
        }
      },

      DELETE: async ({ request }) => {
        const user = await currentUser();
        if (!user) return noStore({ ok: false, reason: "not_logged_in" }, 401);
        if (!canManageDepartures(user)) return noStore({ ok: false, reason: "forbidden" }, 403);
        const url = new URL(request.url);
        const serviceId = url.searchParams.get("serviceId") || "";
        const date = url.searchParams.get("date") || "";
        if (!serviceId || !DATE_PATTERN.test(date)) return noStore({ ok: false, reason: "invalid_fields" }, 400);
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { error } = await supabaseAdmin
            .from("timetable_service_updates" as never)
            .delete()
            .eq("service_id", serviceId)
            .eq("service_date", date);
          if (error) throw error;
          return noStore({ ok: true });
        } catch (error) {
          console.error("[departures/reset]", error);
          return noStore({ ok: false, reason: "reset_failed" }, 500);
        }
      },
    },
  },
});
