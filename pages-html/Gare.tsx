import { useEffect, useState } from "react";
import { PUBLIC_STATIONS, SERVICE_LABELS_EN, type PublicStation } from "@/lib/public-stations";
import "./PublicTransit.css";
import { PublicTransitHeader } from "./PublicTransitHeader";
import { T } from "@/components/T";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type Departure = { id:string; line:string; serviceName:string; departure:string; scheduledDeparture:string; destination:string; platform:string; status:string; delayMinutes:number; message:string };
const colors:Record<string,string>={R1:"#2A9D5B",R2:"#2979C9",R3:"#7A51B5",R4:"#E25B37",IC1:"#163D7A",IC2:"#B02A72",T:"#E6007E"};
const labelsFr:Record<string,string>={on_time:"À l’heure",boarding:"Embarquement",delayed:"Retard",platform_changed:"Quai modifié",cancelled:"Supprimé"};
const labelsEn:Record<string,string>={on_time:"On time",boarding:"Boarding",delayed:"Delayed",platform_changed:"Platform changed",cancelled:"Cancelled"};

export default function GarePage({ station }: { station: PublicStation }) {
  const { lang, t } = useLanguage();
  const labels = lang === "en" ? labelsEn : labelsFr;
  const [records,setRecords]=useState<Departure[]>([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{let mounted=true;const load=async()=>{try{const date=new Date().toISOString().slice(0,10);const response=await fetch(`/api/departures?date=${date}&station=${station.slug}&limit=100`,{cache:"no-store"});const json=await response.json();if(mounted&&response.ok&&json.ok)setRecords(json.records||[]);}finally{if(mounted)setLoading(false);}};load();const timer=window.setInterval(load,30000);return()=>{mounted=false;window.clearInterval(timer);};},[station.slug]);
  return <div className="transit-page">
    <PublicTransitHeader active="gares" />
    <section className="transit-hero"><div className="transit-wrap">
      <div className="transit-crumb"><a href="/"><T fr="Accueil" en="Home" /></a> › <a href="/gares/townsend"><T fr="Gares" en="Stations" /></a> › {station.shortName}</div>
      <h1>{t("Gare de", "Station of")} {station.shortName}</h1><p>{t(station.description, station.descriptionEn)}</p>
    </div></section>
    <main className="transit-main transit-wrap">
      <section className="transit-section station-meta">
        <article className="transit-card"><h2><T fr="Informations de la gare" en="Station information" /></h2><p><strong><T fr="Adresse :" en="Address:" /></strong> {station.address}</p><div className="station-lines">{station.lines.map(line=><span className="line-pill" style={{background:colors[line]||"#17458a"}} key={line}>{line}</span>)}</div><div className="station-services">{station.services.map(service=><span key={service}>{lang === "en" ? (SERVICE_LABELS_EN[service] || service) : service}</span>)}</div></article>
        <article className="transit-card"><h2><T fr="Avant de partir" en="Before you travel" /></h2><p><T fr="Consultez les éventuels retards ou suppressions avant votre déplacement." en="Check for any delays or cancellations before you travel." /></p><p><a href="/trafic"><T fr="Voir l’info trafic en direct →" en="See live service status →" /></a></p></article>
      </section>
      <section className="transit-section"><h2><T fr="Départs et arrivées du jour" en="Today's departures and arrivals" /></h2><div className="public-table-wrap"><table className="public-table">
        <thead><tr><th><T fr="Départ" en="Departure" /></th><th><T fr="Ligne" en="Line" /></th><th><T fr="Train" en="Train" /></th><th><T fr="Destination" en="Destination" /></th><th><T fr="Voie" en="Platform" /></th><th><T fr="État" en="Status" /></th></tr></thead>
        <tbody>{loading?<tr><td colSpan={6} className="transit-empty"><T fr="Chargement des horaires…" en="Loading timetables…" /></td></tr>:records.length?records.map(item=><tr key={item.id}><td><strong>{item.departure}</strong>{item.delayMinutes>0&&<small style={{display:"block",textDecoration:"line-through"}}>{item.scheduledDeparture}</small>}</td><td><span className="line-pill" style={{background:colors[item.line]||"#17458a"}}>{item.line}</span></td><td>{item.serviceName}</td><td>{item.destination}{item.message&&<small style={{display:"block"}}>{item.message}</small>}</td><td>{item.platform}</td><td><span className={`status-pill ${item.status}`}>{labels[item.status]}</span></td></tr>):<tr><td colSpan={6} className="transit-empty"><T fr="Aucun départ programmé depuis cette gare aujourd’hui." en="No departures scheduled from this station today." /></td></tr>}</tbody>
      </table></div></section>
      <section className="transit-section"><h2><T fr="Autres gares TTE" en="Other TTE stations" /></h2><div className="station-links">{PUBLIC_STATIONS.filter(item=>item.slug!==station.slug).map(item=><a key={item.slug} href={`/gares/${item.slug}`}>{item.name}</a>)}</div></section>
    </main>
  </div>;
}
