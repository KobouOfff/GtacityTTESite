import { useEffect, useState } from "react";
import { PUBLIC_STATIONS, type PublicStation } from "@/lib/public-stations";
import "./PublicTransit.css";
import { PublicTransitHeader } from "./PublicTransitHeader";

type Departure = { id:string; line:string; serviceName:string; departure:string; scheduledDeparture:string; destination:string; platform:string; status:string; delayMinutes:number; message:string };
const colors:Record<string,string>={R1:"#2A9D5B",R2:"#2979C9",R3:"#7A51B5",R4:"#E25B37",IC1:"#163D7A",IC2:"#B02A72",T:"#E6007E"};
const labels:Record<string,string>={on_time:"À l’heure",boarding:"Embarquement",delayed:"Retard",platform_changed:"Quai modifié",cancelled:"Supprimé"};

export default function GarePage({ station }: { station: PublicStation }) {
  const [records,setRecords]=useState<Departure[]>([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{let mounted=true;const load=async()=>{try{const date=new Date().toISOString().slice(0,10);const response=await fetch(`/api/departures?date=${date}&station=${station.slug}&limit=100`,{cache:"no-store"});const json=await response.json();if(mounted&&response.ok&&json.ok)setRecords(json.records||[]);}finally{if(mounted)setLoading(false);}};load();const timer=window.setInterval(load,30000);return()=>{mounted=false;window.clearInterval(timer);};},[station.slug]);
  return <div className="transit-page">
    <PublicTransitHeader active="gares" />
    <section className="transit-hero"><div className="transit-wrap">
      <div className="transit-crumb"><a href="/">Accueil</a> › <a href="/gares/townsend">Gares</a> › {station.shortName}</div>
      <h1>Gare de {station.shortName}</h1><p>{station.description}</p>
    </div></section>
    <main className="transit-main transit-wrap">
      <section className="transit-section station-meta">
        <article className="transit-card"><h2>Informations de la gare</h2><p><strong>Adresse :</strong> {station.address}</p><div className="station-lines">{station.lines.map(line=><span className="line-pill" style={{background:colors[line]||"#17458a"}} key={line}>{line}</span>)}</div><div className="station-services">{station.services.map(service=><span key={service}>{service}</span>)}</div></article>
        <article className="transit-card"><h2>Avant de partir</h2><p>Consultez les éventuels retards ou suppressions avant votre déplacement.</p><p><a href="/trafic">Voir l’info trafic en direct →</a></p></article>
      </section>
      <section className="transit-section"><h2>Départs et arrivées du jour</h2><div className="public-table-wrap"><table className="public-table">
        <thead><tr><th>Départ</th><th>Ligne</th><th>Train</th><th>Destination</th><th>Voie</th><th>État</th></tr></thead>
        <tbody>{loading?<tr><td colSpan={6} className="transit-empty">Chargement des horaires…</td></tr>:records.length?records.map(item=><tr key={item.id}><td><strong>{item.departure}</strong>{item.delayMinutes>0&&<small style={{display:"block",textDecoration:"line-through"}}>{item.scheduledDeparture}</small>}</td><td><span className="line-pill" style={{background:colors[item.line]||"#17458a"}}>{item.line}</span></td><td>{item.serviceName}</td><td>{item.destination}{item.message&&<small style={{display:"block"}}>{item.message}</small>}</td><td>{item.platform}</td><td><span className={`status-pill ${item.status}`}>{labels[item.status]}</span></td></tr>):<tr><td colSpan={6} className="transit-empty">Aucun départ programmé depuis cette gare aujourd’hui.</td></tr>}</tbody>
      </table></div></section>
      <section className="transit-section"><h2>Autres gares TTE</h2><div className="station-links">{PUBLIC_STATIONS.filter(item=>item.slug!==station.slug).map(item=><a key={item.slug} href={`/gares/${item.slug}`}>{item.name}</a>)}</div></section>
    </main>
  </div>;
}
