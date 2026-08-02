import { useEffect, useMemo, useState } from "react";
import "./PublicTransit.css";
import { PublicTransitHeader } from "./PublicTransitHeader";
import { T } from "@/components/T";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type TrafficRecord = { id: string; line: string; severity: string; title: string; message: string; until: string; author: string; createdAt: string };
type DepartureRecord = { id: string; line: string; serviceName: string; departure: string; scheduledDeparture: string; destination: string; platform: string; status: string; delayMinutes: number; message: string };
const lines = ["R1","R2","R3","R4","IC1","IC2","T"];
const colors: Record<string,string> = {R1:"#2A9D5B",R2:"#2979C9",R3:"#7A51B5",R4:"#E25B37",IC1:"#163D7A",IC2:"#B02A72",T:"#E6007E"};
const statusLabelsFr: Record<string,string> = {on_time:"À l’heure",boarding:"Embarquement",delayed:"Retard",platform_changed:"Quai modifié",cancelled:"Supprimé"};
const statusLabelsEn: Record<string,string> = {on_time:"On time",boarding:"Boarding",delayed:"Delayed",platform_changed:"Platform changed",cancelled:"Cancelled"};

export default function TraficPage() {
  const { lang, t } = useLanguage();
  const statusLabels = lang === "en" ? statusLabelsEn : statusLabelsFr;
  const [traffic, setTraffic] = useState<TrafficRecord[]>([]);
  const [departures, setDepartures] = useState<DepartureRecord[]>([]);
  const [error, setError] = useState(false);
  useEffect(() => {
    let mounted = true;
    const refresh = async () => {
      try {
        const date = new Date().toISOString().slice(0,10);
        const [trafficResponse, departureResponse] = await Promise.all([
          fetch("/api/traffic", { cache: "no-store" }),
          fetch(`/api/departures?date=${date}&limit=200`, { cache: "no-store" }),
        ]);
        const [trafficJson, departureJson] = await Promise.all([trafficResponse.json(), departureResponse.json()]);
        if (!trafficResponse.ok || !trafficJson.ok || !departureResponse.ok || !departureJson.ok) throw new Error();
        if (mounted) {
          setTraffic((trafficJson.records || []).filter((item: TrafficRecord) => !item.until || new Date(item.until).getTime() > Date.now()));
          setDepartures(departureJson.records || []);
          setError(false);
        }
      } catch { if (mounted) setError(true); }
    };
    refresh();
    const timer = window.setInterval(refresh, 15000);
    return () => { mounted = false; window.clearInterval(timer); };
  }, []);
  const affected = useMemo(() => departures.filter((record) => record.status !== "on_time"), [departures]);
  const lineState = (line: string) => {
    const publication = traffic.find((record) => record.line === line);
    const updates = affected.filter((record) => record.line === line);
    if (publication?.severity === "alert" || updates.some((record) => record.status === "cancelled")) return [t("Interrompu / perturbé", "Suspended / disrupted"),"traffic-alert"];
    if (publication || updates.length) return [t("Perturbations", "Disruptions"),"traffic-warn"];
    return [t("Trafic normal", "Normal service"),"traffic-ok"];
  };

  return <div className="transit-page">
    <PublicTransitHeader active="trafic" />
    <section className="transit-hero"><div className="transit-wrap">
      <div className="transit-crumb"><a href="/"><T fr="Accueil" en="Home" /></a> › <T fr="Info trafic" en="Service status" /></div>
      <h1><T fr="Info trafic en direct" en="Live service status" /></h1>
      <p><T fr="État des lignes, incidents publiés par le Centre de Régulation et modifications des trains programmés." en="Line status, incidents published by the Control Centre, and changes to scheduled trains." /></p>
    </div></section>
    <main className="transit-main transit-wrap">
      {error && <div className="transit-card traffic-item alert"><strong><T fr="Actualisation momentanément indisponible." en="Updates are temporarily unavailable." /></strong> <T fr="Les informations affichées peuvent être incomplètes." en="The information shown may be incomplete." /></div>}
      <section className="transit-section"><h2><T fr="État du réseau" en="Network status" /></h2><div className="traffic-summary">
        {lines.map((line) => { const [label, className] = lineState(line); return <article className="traffic-line-card" key={line}><strong><span className="line-pill" style={{background:colors[line]}}>{line}</span></strong><span className={className}>{label}</span></article>; })}
      </div></section>
      <section className="transit-section"><h2><T fr="Alertes voyageurs" en="Traveller alerts" /></h2><div className="traffic-list">
        {!traffic.length && <div className="transit-card transit-empty"><T fr="Aucune alerte active. Le trafic est normal." en="No active alerts. Service is running normally." /></div>}
        {traffic.map((item) => <article key={item.id} className={`transit-card traffic-item ${item.severity}`}>
          <h3>{item.line ? `${t("Ligne", "Line")} ${item.line} — ` : ""}{item.title}</h3><p>{item.message}</p>
          <small><T fr="Publié par le Centre de Régulation" en="Published by the Control Centre" />{item.until ? ` · ${t(`valable jusqu’au ${new Date(item.until).toLocaleString("fr-FR")}`, `valid until ${new Date(item.until).toLocaleString("en-US")}`)}` : ""}</small>
        </article>)}
      </div></section>
      <section className="transit-section"><h2><T fr="Trains modifiés aujourd’hui" en="Trains affected today" /></h2><div className="public-table-wrap"><table className="public-table">
        <thead><tr><th><T fr="Horaire" en="Time" /></th><th><T fr="Ligne" en="Line" /></th><th><T fr="Train" en="Train" /></th><th><T fr="Destination" en="Destination" /></th><th><T fr="Voie" en="Platform" /></th><th><T fr="État" en="Status" /></th></tr></thead>
        <tbody>{affected.length ? affected.map((item) => <tr key={item.id}><td><strong>{item.departure}</strong>{item.delayMinutes > 0 && <small style={{display:"block",textDecoration:"line-through"}}>{item.scheduledDeparture}</small>}</td><td><span className="line-pill" style={{background:colors[item.line]}}>{item.line}</span></td><td>{item.serviceName}</td><td>{item.destination}{item.message && <small style={{display:"block"}}>{item.message}</small>}</td><td>{item.platform}</td><td><span className={`status-pill ${item.status}`}>{statusLabels[item.status]}</span></td></tr>) :
          <tr><td colSpan={6} className="transit-empty"><T fr="Aucun train modifié aujourd’hui." en="No trains affected today." /></td></tr>}</tbody>
      </table></div></section>
    </main>
  </div>;
}
