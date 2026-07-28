import { useEffect, useMemo, useState } from "react";

type TrafficRecord = {
  id: string;
  line: string;
  severity: "info" | "warn" | "alert";
  title: string;
  message: string;
  until?: string;
  channels?: { web?: boolean };
  createdAt: string;
};

const excludedPrefixes = [
  "/api/",
  "/centre-regulation",
  "/espace-employes",
  "/mes-demandes",
  "/suivi-demandes",
  "/discord-auth",
];

export function PublicTrafficBanner({ pathname }: { pathname: string }) {
  const [records, setRecords] = useState<TrafficRecord[]>([]);
  const [departureAlerts, setDepartureAlerts] = useState<TrafficRecord[]>([]);
  const [closedId, setClosedId] = useState("");
  const isPublic = !excludedPrefixes.some((prefix) => pathname.startsWith(prefix));

  useEffect(() => {
    if (!isPublic) return;
    let active = true;
    const refresh = async () => {
      try {
        const date = new Date().toISOString().slice(0, 10);
        const [response, departureResponse] = await Promise.all([
          fetch("/api/traffic", { cache: "no-store" }),
          fetch(`/api/departures?date=${date}&limit=200`, { cache: "no-store" }),
        ]);
        const [json, departureJson] = await Promise.all([response.json(), departureResponse.json()]);
        if (active && response.ok && json.ok) setRecords(Array.isArray(json.records) ? json.records : []);
        if (active && departureResponse.ok && departureJson.ok) {
          setDepartureAlerts((departureJson.records || [])
            .filter((record: { status: string }) => record.status !== "on_time" && record.status !== "boarding")
            .map((record: { id:string; line:string; status:string; serviceName:string; delayMinutes:number; message:string; updatedAt:string }) => ({
              id: `departure-${record.id}`,
              line: record.line,
              severity: record.status === "cancelled" ? "alert" : "warn",
              title: record.status === "cancelled"
                ? `${record.serviceName} supprimé`
                : record.status === "delayed"
                  ? `${record.serviceName} retardé de ${record.delayMinutes} min`
                  : `${record.serviceName} : changement de voie`,
              message: record.message || "Consultez les horaires actualisés avant votre départ.",
              createdAt: record.updatedAt || new Date().toISOString(),
            })));
        }
      } catch {}
    };
    refresh();
    const timer = window.setInterval(refresh, 15000);
    return () => { active = false; window.clearInterval(timer); };
  }, [isPublic]);

  const top = useMemo(() => {
    const priority = { alert: 0, warn: 1, info: 2 };
    return [...records, ...departureAlerts]
      .filter((record) =>
        (!record.until || new Date(record.until).getTime() > Date.now()) &&
        (!record.channels || record.channels.web !== false))
      .sort((a, b) => priority[a.severity] - priority[b.severity] ||
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  }, [records, departureAlerts]);

  if (!isPublic || closedId === (top?.id || "normal")) return null;

  return (
    <aside className={`public-traffic-banner ${top ? `severity-${top.severity}` : "severity-normal"}`} aria-live="polite">
      <div className="public-traffic-inner">
        <span className="public-traffic-label">{top ? (top.severity === "alert" ? "Alerte" : "Info trafic") : "Trafic"}</span>
        <p>
          {top ? <><strong>{top.line ? `Ligne ${top.line} — ` : ""}{top.title}</strong> {top.message}</> :
            <strong>Trafic normal sur l’ensemble du réseau TTE.</strong>}
        </p>
        <a href="/trafic">Voir l’info trafic</a>
        <button type="button" aria-label="Fermer le bandeau" onClick={() => setClosedId(top?.id || "normal")}>×</button>
      </div>
    </aside>
  );
}
