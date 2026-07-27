import { useEffect } from "react";
import "./CentreRegulation.css";
import { script } from "./CentreRegulation.script";
import { trafficSharedScript } from "./CentreRegulationTrafficShared.script";
import WeatherPanel from "@/components/WeatherPanel";
import FleetPanel from "@/components/FleetPanel";
import EffectifsPanel from "@/components/EffectifsPanel";
import { useCurrentUser } from "@/components/DiscordAuth";
import {
  getPrimaryRole,
  canWriteNotes,
  canManageDepartures,
  canManageTSR,
  canWriteNetworkAssets,
  canManageTrainings,
} from "@/lib/discord-roles";

export default function CentreRegulationPage() {
  const { data: user } = useCurrentUser();
  const u = user ?? null;
  const permNotes = canWriteNotes(u);
  const permDep = canManageDepartures(u);
  const permTsr = canManageTSR(u);
  const permNet = canWriteNetworkAssets(u);
  const permTrainings = canManageTrainings(u);

  useEffect(() => {
    // Injecte l'identité Discord courante avant le script legacy
    if (user) {
      const name = user.displayName || user.username;
      const primary = getPrimaryRole(user.roleIds);
      try {
        localStorage.setItem("tte_agent_name", name);
        localStorage.setItem("tte_agent_role", primary?.name || "Employé TTE");
      } catch {}
    }
    try { localStorage.setItem("tte_perm_trainings", permTrainings ? "1" : "0"); } catch {}
    try { localStorage.setItem("tte_perm_xing", permNet ? "1" : "0"); } catch {}
    const el = document.createElement("script");
    el.textContent = script + trafficSharedScript;
    document.body.appendChild(el);
    return () => { el.remove(); };
  }, [user, permTrainings, permNet]);



  const appClasses = [
    "app",
    permDep ? "" : "no-write-dep",
    permTsr ? "" : "no-write-tsr",
  ].filter(Boolean).join(" ");

  return (
    <>
      <style>{`
        .no-write-dep #v-dep select,
        .no-write-dep #v-dep button:not(.ghost),
        .no-write-tsr #v-tsr table select,
        .no-write-tsr #v-tsr table button:not(.ghost) {
          pointer-events: none;
          opacity: .55;
          cursor: not-allowed;
        }
        .perm-banner {
          margin: 0 0 12px 0;
          padding: 10px 14px;
          border-radius: 8px;
          background: rgba(180, 130, 20, 0.12);
          border: 1px solid rgba(180, 130, 20, 0.35);
          color: #b58218;
          font-size: 13px;
        }
        .xing-modal { position: fixed; inset: 0; z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .xing-modal-backdrop { position: absolute; inset: 0; background: rgba(8, 12, 24, .62); backdrop-filter: blur(3px); }
        .xing-modal-card { position: relative; width: min(640px, 100%); background: var(--surface, #fff); color: var(--fg, #1a1a1a); border-radius: 12px; box-shadow: 0 30px 60px rgba(0,0,0,.35); padding: 22px 24px; max-height: 90vh; overflow: auto; }
        .xing-modal-head { display:flex; align-items:center; justify-content:space-between; margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1px solid var(--line, #e5e7eb); }
        .xing-modal-head h3 { margin: 0; font-size: 17px; font-weight: 700; }
      `}</style>


<div className={appClasses}>


  {/* ===== SIDEBAR ===== */}
  <aside className="side">
    <div className="side-brand">
      <svg className="logo" viewBox="0 0 156 44" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="TTE">
        <g fill="#4B92DD"><rect x="2" y="25" width="150" height="6" rx="3" opacity=".5" /><rect x="0" y="25" width="30" height="6" rx="3" /><rect x="126" y="25" width="30" height="6" rx="3" opacity=".6" /></g>
        <text x="4" y="34" fontFamily="'Libre Franklin',sans-serif" fontSize="35" fontWeight="800" fontStyle="italic" letterSpacing="-1.5" fill="#6FA8E8">TTE</text>
      </svg>
      <span className="ctx">Centre<br />de Régulation</span>
    </div>
    <nav>
      <div className="grp">Exploitation</div>
      <a data-view="dash" className="active"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="8" height="9" rx="1.5" /><rect x="13" y="3" width="8" height="5" rx="1.5" /><rect x="13" y="10" width="8" height="11" rx="1.5" /><rect x="3" y="14" width="8" height="7" rx="1.5" /></svg> Tableau de bord</a>
      <a data-view="pub"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 11v2a8 8 0 0 0 16 0V8" /><path d="M19 8a3 3 0 1 0-6 0v6a3 3 0 0 0 6 0V8Z" /><path d="M11 21h4" /></svg> Info trafic & alertes</a>
      <a data-view="dep"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M3 17l-1 3h20l-1-3M8 8h8M8 12h5" /></svg> Régulation des départs</a>
      <a data-view="notes"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h13l3 3v13H4Z" /><path d="M8 9h8M8 13h8M8 17h5" /></svg> Notes de service</a>
      <div className="grp">Sûreté & voyageurs</div>
      <a data-view="incid"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l10 18H2L12 3Z" /><path d="M12 10v5M12 18h.01" /></svg> Main courante</a>
      <a data-view="e911"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2Z" /></svg> 911 Emergency dispatch</a>
      <a data-view="fraude"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M3 10h18M7 15h4" /></svg> Fraudeurs / PV</a>
      <a data-view="lost"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 7h12l-1 13H7L6 7Z" /><path d="M9 7V5a3 3 0 0 1 6 0v2" /></svg> Objets trouvés</a>
      <div className="grp">Réseau & matériel</div>
      <a data-view="tsr"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 8v4l3 2" /><path d="M4 4l16 16" /></svg> Slow orders (TSR)</a>
      <a data-view="fleet"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="6" width="18" height="10" rx="2" /><circle cx="8" cy="18" r="2" /><circle cx="16" cy="18" r="2" /><path d="M3 12h18" /></svg> Flotte / matériel roulant</a>
      <a data-view="xing"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 20 20 4M4 4l16 16" /><circle cx="12" cy="12" r="9" /></svg> Grade crossings</a>
      <a data-view="pa"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 10v4l6 5V5L3 10Z" /><path d="M14 8a4 4 0 0 1 0 8M17 5a7 7 0 0 1 0 14" /></svg> Annonces PA</a>
      <a data-view="wx"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 18a4 4 0 0 0 0-8 6 6 0 0 0-11.7 1.5A4.5 4.5 0 0 0 6 20h11Z" /></svg> Météo & conditions</a>
      <div className="grp">Personnel</div>
      <a data-view="form"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8l9-5 9 5-9 5-9-5Z" /><path d="M7 11v5c0 1.5 2.5 3 5 3s5-1.5 5-3v-5" /></svg> Formations</a>
      <a data-view="eff"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="9" r="3.5" /><path d="M3 19a6 6 0 0 1 12 0" /><circle cx="17" cy="8" r="2.8" /><path d="M15 19a5 5 0 0 1 7-4.6" /></svg> Effectifs en service</a>
      <div className="grp">Suivi</div>
      <a data-view="log"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg> Journal des actions</a>
      <a data-view="radio"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 11a8 8 0 0 1 16 0" /><path d="M7 14a5 5 0 0 1 10 0" /><circle cx="12" cy="17" r="1.5" /></svg> Radio codes (10-codes)</a>
      <a data-view="help"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 1 1 3.7 2.2c-.7.4-1.2 1-1.2 1.8v.5M12 17h.01" /></svg> Aide & procédures</a>
    </nav>
    <div className="side-foot">
      <div className="agent">
        <div className="av" id="agAv">RG</div>
        <div className="meta">
          <div className="nm" id="agNm">Régulateur</div>
          <div className="role" id="agRl">Poste de commandement</div>
        </div>
        <a className="out" href="/espace-employes" title="D\u00e9connexion">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M15 3h4a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-4M10 17l-5-5 5-5M5 12h12" /></svg>
        </a>
      </div>
    </div>
  </aside>

  {/* ===== MAIN ===== */}
  <main className="main">
    <div className="topbar">
      <div className="crumb">Centre de Régulation · <b id="bcrumb">Tableau de bord</b></div>
      <div className="right">
        <span className="status-pill"><span className="dot"></span> PCC en service</span>
        <span className="clock" id="clk">--:--:--</span>
      </div>
    </div>

    <div className="content">

      {/* ===== TABLEAU DE BORD ===== */}
      <section className="view show" id="v-dash">
        <h1 className="vt">Tableau de bord opérationnel</h1>
        <p className="vt-sub">Vue d'ensemble du réseau et des publications en cours. Toutes les actions sont tracées.</p>

        <div className="quai-info">
          <div className="ic"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 18h18M5 18v-2a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2M7 14V8a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v6M9 11h6" /></svg></div>
          <div>
            <h3>Gare centrale de Townsend — quai unique</h3>
            <p>Toute la régulation des départs s'effectue sur le <b>quai 1</b> (seul quai voyageurs de la gare). Les bus sont gérés à l'arrêt du parvis. Pensez à ordonnancer les passages pour éviter tout conflit d'occupation du quai.</p>
          </div>
          <div className="big">1<span>quai actif</span></div>
        </div>

        <div className="kpis">
          <div className="kpi"><div className="lab">Publications actives</div><div className="v" id="kpiPubs">0</div><div className="d">diffusées sur le site public</div><span className="badge" id="kpiPubsBadge">À jour</span></div>
          <div className="kpi warn"><div className="lab">Lignes perturbées</div><div className="v" id="kpiLines">0</div><div className="d">au moins une alerte en cours</div><span className="badge" id="kpiLinesBadge">RAS</span></div>
          <div className="kpi"><div className="lab">Départs / jour</div><div className="v">68</div><div className="d">Townsend Central</div><span className="badge">Nominal</span></div>
          <div className="kpi alert"><div className="lab">Dernière diffusion</div><div className="v" style={{fontSize: "1.25rem"}} id="kpiLast">—</div><div className="d">par le Centre de Régulation</div><span className="badge" id="kpiLastBadge">—</span></div>
        </div>

        <div className="card">
          <h2><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v18M3 12h18" /></svg> Publication rapide d'une info trafic</h2>
          <p style={{color: "var(--muted)", fontSize: "13.5px", marginBottom: "1rem"}}>Diffusion immédiate sur la page d'accueil du site public et sur les panneaux voyageurs.</p>
          <form id="quickForm" className="form-grid">
            <div className="fg col-3"><label>Ligne</label>
              <select name="line" required>
                <option value="">— Réseau entier —</option>
                <option>R1</option><option>R2</option><option>R3</option><option selected>R4</option>
                <option>IC1</option><option>IC2</option><option>T</option><option>BUS</option>
              </select>
            </div>
            <div className="fg col-3"><label>Gravité</label>
              <select name="severity">
                <option value="info">Information</option>
                <option value="warn" selected>Perturbation</option>
                <option value="alert">Incident grave</option>
              </select>
            </div>
            <div className="fg col-6"><label>Titre court</label>
              <input name="title" placeholder="Ex. Travaux entre Athens et Cleveland" required />
            </div>
            <div className="fg col-12"><label>Message voyageurs</label>
              <textarea name="message" placeholder="Soyez clair et factuel : cause, secteur concern\u00e9, impact horaire, recommandation." required></textarea>
            </div>
            <div className="fg col-4"><label>Valide jusqu'au</label>
              <input type="datetime-local" name="until" />
              <div className="hint">Laisser vide pour une diffusion indéterminée.</div>
            </div>
            <div className="fg col-8"><label>Diffusion</label>
              <div className="chk-row">
                <label className="chk"><input type="checkbox" name="ch-web" checked /> Site public</label>
                <label className="chk"><input type="checkbox" name="ch-screen" checked /> Panneaux gare</label>
                <label className="chk"><input type="checkbox" name="ch-app" /> Application mobile</label>
                <label className="chk"><input type="checkbox" name="ch-audio" /> Annonce sonore</label>
              </div>
            </div>
          </form>

          <div className="preview-wrap">
            <div className="lbl"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg> Aperçu côté voyageurs</div>
            <div className="preview-bar warn" id="prev">
              <span className="tg">⚠ Info trafic</span>
              <span><b>Ligne R4 — Travaux entre Athens et Cleveland.</b> Saisissez votre message…</span>
            </div>
          </div>

          <div className="btn-row">
            <button className="btn" id="quickPublish"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M3 11v2a8 8 0 0 0 16 0V8" /><path d="M19 8a3 3 0 1 0-6 0v6a3 3 0 0 0 6 0V8Z" /></svg> Diffuser maintenant</button>
            <button type="button" className="btn ghost" id="quickReset">Réinitialiser</button>
          </div>
        </div>

        <div className="card">
          <h2><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18" /></svg> Publications actuellement diffusées</h2>
          <div id="dashPubs" className="pub-list"></div>
        </div>
      </section>

      {/* ===== INFO TRAFIC ===== */}
      <section className="view" id="v-pub">
        <h1 className="vt">Info trafic & alertes</h1>
        <p className="vt-sub">Toutes les publications diffusées et expirées. Vous pouvez modifier la gravité, prolonger ou retirer une publication.</p>
        <div className="card">
          <h2><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v18M3 12h18" /></svg> Toutes les publications</h2>
          <div id="allPubs" className="pub-list"></div>
        </div>
      </section>

      {/* ===== RÉGULATION DÉPARTS ===== */}
      <section className="view" id="v-dep">
        <h1 className="vt">Régulation des départs — quai 1</h1>
        <p className="vt-sub">Townsend Central dispose d'un seul quai voyageurs. Coordonnez les passages et signalez tout retard ou suppression.</p>
        {!permDep && (
          <div className="perm-banner">Consultation seule — la gestion des départs est réservée aux régulateurs, à la maintenance, aux gérants de branche et à la supervision.</div>
        )}
        <div className="card">
          <h2><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg> Prochains départs (12 h)</h2>
          <table className="tbl">
            <thead><tr><th style={{width: "90px"}}>Départ</th><th>Ligne</th><th>Destination</th><th style={{width: "80px"}}>Quai</th><th style={{width: "180px"}}>État</th></tr></thead>
            <tbody id="depBody"></tbody>
          </table>
          <p style={{fontSize: "12px", color: "var(--muted)", marginTop: ".9rem"}}><b>Astuce&nbsp;:</b> en mettant un départ en « Quai modifié » ou « Supprimé », pensez à publier une info trafic associée pour informer les voyageurs.</p>
        </div>
      </section>

      {/* ===== NOTES DE SERVICE ===== */}
      <section className="view" id="v-notes">
        <h1 className="vt">Notes de service internes</h1>
        <p className="vt-sub">Communications réservées au personnel. Non diffusées sur le site public.</p>
        {permNotes ? (
          <div className="card">
            <h2><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h13l3 3v13H4Z" /></svg> Rédiger une note</h2>
            <form id="noteForm" className="form-grid">
              <div className="fg col-4"><label>Destinataires</label>
                <select name="aud">
                  <option>Tous les agents</option>
                  <option>Conducteurs</option>
                  <option>Agents de gare</option>
                  <option>Maintenance</option>
                  <option>Régulateurs</option>
                </select>
              </div>
              <div className="fg col-8"><label>Objet</label><input name="subj" placeholder="Ex. Modification du roulement de nuit" required /></div>
              <div className="fg col-12"><label>Contenu</label><textarea name="body" placeholder="D\u00e9taillez la note de service\u2026" required></textarea></div>
            </form>
            <div className="btn-row">
              <button className="btn ok" id="noteSend"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" /></svg> Envoyer la note</button>
            </div>
          </div>
        ) : (
          <div className="perm-banner">Lecture seule — seuls les gérants, la supervision, les formateurs, les régulateurs et la maintenance peuvent rédiger des notes de service.</div>
        )}
        <div className="card">
          <h2><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16v16H4z" /><path d="M8 9h8M8 13h8M8 17h5" /></svg> Notes récentes</h2>
          <div id="notesList" className="pub-list"></div>
        </div>
      </section>

      {/* ===== MAIN COURANTE / INCIDENTS ===== */}
      <section className="view" id="v-incid">
        <h1 className="vt">Main courante</h1>
        <p className="vt-sub">Consignation des évènements d'exploitation : accidents, incivilités, malaises, agressions, dégradations, intrusions… Toute saisie est horodatée et signée.</p>
        <div className="card">
          <h2><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l10 18H2L12 3Z" /><path d="M12 10v5M12 18h.01" /></svg> Nouvel évènement</h2>
          <form id="incForm" className="form-grid">
            <div className="fg col-3"><label>Type</label>
              <select name="type">
                <option value="incivilite">Incivilité</option>
                <option value="agression">Agression / violence</option>
                <option value="accident">Accident voyageur</option>
                <option value="malaise">Malaise médical</option>
                <option value="degradation">Dégradation / vandalisme</option>
                <option value="intrusion">Intrusion / voies</option>
                <option value="bagage">Bagage / colis suspect</option>
                <option value="fraude">Tentative de fraude</option>
                <option value="materiel">Avarie matériel</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div className="fg col-3"><label>Gravité</label>
              <select name="grav"><option value="info">Mineur</option><option value="warn" selected>Modéré</option><option value="alert">Grave</option></select>
            </div>
            <div className="fg col-3"><label>Lieu</label>
              <select name="lieu">
                <option>Gare de Townsend — Quai 1</option><option>Gare de Townsend — Hall</option><option>Gare de Townsend — Parvis</option>
                <option>Train R1</option><option>Train R2</option><option>Train R3</option><option>Train R4</option>
                <option>Train IC1</option><option>Train IC2</option><option>Train T (urbain)</option><option>Bus navette</option>
                <option>Gare de Knoxville</option><option>Gare de Maryville</option><option>Gare de Nashville</option><option>Autre</option>
              </select>
            </div>
            <div className="fg col-3"><label>Voyageurs concernés</label>
              <input name="pax" type="number" min="0" value="1" />
            </div>
            <div className="fg col-12"><label>Description des faits</label>
              <textarea name="desc" placeholder="Ex. \u00c0 14h12, un passager a refus\u00e9 de descendre au terminus et insult\u00e9 l'agent de quai. DCSO notifi\u00e9 \u00e0 14h18, unit\u00e9 214 sur place \u00e0 14h24."></textarea>
            </div>
            <div className="fg col-6"><label>Mesures prises</label>
              <input name="mes" placeholder="Ex. \u00c9vacuation, appel 911, DCSO sur place, EMS pour soins, d\u00e9p\u00f4t de plainte\u2026" />
            </div>
            <div className="fg col-3"><label>Services d'urgence (911)</label>
              <select name="sec">
                <option>Aucun</option>
                <option>DCSO (Sheriff)</option>
                <option>EMS (Ambulance)</option>
                <option>SCFD (Fire Dept.)</option>
                <option>DCSO + EMS</option>
                <option>DCSO + EMS + SCFD</option>
                <option>TN State Troopers</option>
                <option>FBI / Federal (bagage suspect)</option>
              </select>
            </div>
            <div className="fg col-3"><label>Suite à donner</label>
              <select name="suit"><option>Aucune</option><option>Incident report interne</option><option>Plainte déposée (DCSO)</option><option>Saisine RH</option><option>Saisine maintenance</option><option>FRA reportable event</option></select>
            </div>
          </form>
          <div className="btn-row">
            <button className="btn" id="incSave">Enregistrer dans la main courante</button>
            <button className="btn ghost" id="incReset">Réinitialiser</button>
          </div>
        </div>
        <div className="card">
          <h2>Évènements récents</h2>
          <div className="pub-list" id="incList"></div>
        </div>
      </section>

      {/* ===== FRAUDEURS / PV ===== */}
      <section className="view" id="v-fraude">
        <h1 className="vt">Fraudeurs &amp; procès-verbaux</h1>
        <p className="vt-sub">Registre des contrôles de titre de transport ayant donné lieu à un PV. Indemnité forfaitaire minimale de 500 $ payable en gare sous 48 h, sinon majoration et recouvrement.</p>
        <div className="card">
          <h2><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M3 10h18" /></svg> Nouveau PV</h2>
          <form id="frForm" className="form-grid">
            <div className="fg col-4"><label>Nom du contrevenant</label><input name="nom" placeholder="Nom Pr\u00e9nom" /></div>
            <div className="fg col-4"><label>Pièce d'identité</label><input name="pid" placeholder="N\u00b0 pi\u00e8ce ou \u00ab refus\u00e9e \u00bb" /></div>
            <div className="fg col-4"><label>Date de naissance</label><input name="dob" type="date" /></div>
            <div className="fg col-3"><label>Motif</label>
              <select name="motif">
                <option value="sans">Voyage sans titre</option>
                <option value="invalide">Titre non valide</option>
                <option value="reduit">Tarif réduit injustifié</option>
                <option value="refus">Refus de présenter</option>
                <option value="contrefacon">Titre contrefait</option>
              </select>
            </div>
            <div className="fg col-3"><label>Ligne / Train</label>
              <select name="ligne"><option>R1</option><option>R2</option><option>R3</option><option>R4</option><option>IC1</option><option>IC2</option><option>T</option><option>Bus</option></select>
            </div>
            <div className="fg col-3"><label>Montant ($)</label>
              <select name="mt"><option>500</option><option>750</option><option>1000</option><option>1500</option></select>
            </div>
            <div className="fg col-3"><label>Paiement</label>
              <select name="pay"><option>À régler en gare</option><option>Payé immédiat</option><option>Refus de paiement</option><option>Transmis recouvrement</option></select>
            </div>
            <div className="fg col-12"><label>Observations</label><textarea name="obs" placeholder="Comportement, t\u00e9moins, circonstances\u2026"></textarea></div>
          </form>
          <div className="btn-row">
            <button className="btn" id="frSave">Émettre le PV</button>
            <button className="btn ghost" id="frReset">Réinitialiser</button>
          </div>
        </div>
        <div className="card">
          <h2>PV enregistrés</h2>
          <div style={{overflowX: "auto"}}><table className="tbl" id="frTbl"><thead><tr><th>Date</th><th>N°</th><th>Contrevenant</th><th>Motif</th><th>Ligne</th><th>Montant</th><th>Statut</th><th></th></tr></thead><tbody id="frBody"></tbody></table></div>
          <div className="btn-row"><span id="frStats" style={{fontSize: "13px", color: "var(--muted)"}}></span></div>
        </div>
      </section>

      {/* ===== OBJETS TROUVÉS ===== */}
      <section className="view" id="v-lost">
        <h1 className="vt">Objets trouvés</h1>
        <p className="vt-sub">Conservés 30 jours au bureau de la gare de Townsend (guichet 3), puis transférés aux services municipaux.</p>
        <div className="card">
          <h2>Déclarer un objet</h2>
          <form id="lstForm" className="form-grid">
            <div className="fg col-3"><label>Catégorie</label><select name="cat"><option>Téléphone</option><option>Portefeuille</option><option>Sac / bagage</option><option>Vêtement</option><option>Clés</option><option>Document</option><option>Lunettes</option><option>Électronique</option><option>Autre</option></select></div>
            <div className="fg col-3"><label>Trouvé dans</label><select name="lieu"><option>Train R1</option><option>Train R2</option><option>Train R3</option><option>Train R4</option><option>IC1</option><option>IC2</option><option>Train urbain T</option><option>Gare Townsend</option><option>Bus</option></select></div>
            <div className="fg col-3"><label>Trouvé par</label><input name="qui" placeholder="Voyageur / agent" value="Agent de quai" /></div>
            <div className="fg col-3"><label>Casier</label><input name="cas" placeholder="N\u00b0 casier" /></div>
            <div className="fg col-12"><label>Description</label><input name="desc" placeholder="Couleur, marque, contenu apparent\u2026" /></div>
          </form>
          <div className="btn-row"><button className="btn" id="lstSave">Enregistrer</button></div>
        </div>
        <div className="card">
          <h2>Inventaire</h2>
          <div style={{overflowX: "auto"}}><table className="tbl"><thead><tr><th>Date</th><th>Catégorie</th><th>Description</th><th>Trouvé dans</th><th>Casier</th><th>Statut</th><th></th></tr></thead><tbody id="lstBody"></tbody></table></div>
        </div>
      </section>

      {/* ===== FORMATIONS ===== */}
      <section className="view" id="v-form">
        <h1 className="vt">Formations</h1>
        <p className="vt-sub">Catalogue des formations obligatoires et continues du personnel TTE. Recyclage selon périodicité réglementaire.</p>
        <div className="kpis" style={{gridTemplateColumns: "repeat(3,1fr)"}}>
          <div className="kpi"><span className="lab">Sessions ouvertes</span><div className="v" id="kForm1">—</div><div className="d">prochaines 8 semaines</div></div>
          <div className="kpi warn"><span className="lab">Inscriptions</span><div className="v" id="kForm2">0</div><div className="d">agents enregistrés</div></div>
          <div className="kpi"><span className="lab">Recyclage dû</span><div className="v" id="kForm3">—</div><div className="d">agents à programmer</div></div>
        </div>
        {permTrainings ? (
          <div className="card">
            <h2>Ajouter une formation</h2>
            <form id="trAddForm" className="form-grid">
              <div className="fg col-3"><label>Code</label><input name="code" placeholder="Ex. GCOR-01" required /></div>
              <div className="fg col-9"><label>Intitulé</label><input name="nom" placeholder="Intitulé de la formation" required /></div>
              <div className="fg col-4"><label>Public concerné</label><input name="pub" placeholder="Ex. Conducteurs train" /></div>
              <div className="fg col-2"><label>Durée</label><input name="duree" placeholder="1 jour" /></div>
              <div className="fg col-2"><label>Périodicité</label><input name="per" placeholder="2 ans" /></div>
              <div className="fg col-4"><label>Prochaine session</label><input name="next" placeholder="15 juil. 2026" /></div>
            </form>
            <div className="btn-row"><button className="btn" id="trAddSave">+ Ajouter au catalogue</button></div>
          </div>
        ) : (
          <div className="perm-banner">Lecture seule — l'ajout de formations est réservé à la direction, à la supervision et aux gérants de branche.</div>
        )}
        <div className="card">
          <h2>Catalogue &amp; sessions</h2>
          <div style={{overflowX: "auto"}}><table className="tbl"><thead><tr><th>Code</th><th>Intitulé</th><th>Public</th><th>Durée</th><th>Périodicité</th><th>Prochaine session</th><th></th></tr></thead><tbody id="trBody"></tbody></table></div>
        </div>
        <div className="card">
          <h2>Mes inscriptions</h2>
          <div className="pub-list" id="trList"></div>
        </div>
      </section>

      {/* ===== EFFECTIFS EN SERVICE ===== */}
      <EffectifsPanel />


      {/* ===== 911 EMERGENCY DISPATCH ===== */}
      <section className="view" id="v-e911">
        <h1 className="vt">911 Emergency dispatch</h1>
        <p className="vt-sub">Journal des appels d'urgence passés depuis le PCC : DCSO (Sheriff), NFD (Nashville Fire Department) et HCT (EMS). Chaque appel est horodaté et signé.</p>
        <div className="kpis" style={{gridTemplateColumns: "repeat(4,1fr)"}}>
          <div className="kpi alert"><span className="lab">Appels 24 h</span><div className="v" id="e911Tot">0</div><div className="d">tous services</div><span className="badge">Live</span></div>
          <div className="kpi"><span className="lab">DCSO</span><div className="v" id="e911D">0</div><div className="d">Sheriff · unit ETA moy. 6 min</div></div>
          <div className="kpi"><span className="lab">NFD</span><div className="v" id="e911F">0</div><div className="d">Nashville Fire · ETA moy. 7 min</div></div>
          <div className="kpi"><span className="lab">HCT</span><div className="v" id="e911E">0</div><div className="d">EMS / ambulance · ETA moy. 8 min</div></div>
        </div>
        <div className="card">
          <h2>Nouvel appel d'urgence</h2>
          <form id="e911Form" className="form-grid">
            <div className="fg col-3"><label>Service appelé</label>
              <select name="svc">
                <option>DCSO — Sheriff</option>
                <option>NFD — Nashville Fire Department</option>
                <option>HCT — EMS</option>
              </select>
            </div>
            <div className="fg col-3"><label>Nature</label>
              <select name="nat"><option>Assistance médicale</option><option>Agression / violence</option><option>Bagage suspect</option><option>Intrusion voies</option><option>Incendie</option><option>Vandalisme</option><option>Personne recherchée</option><option>Décès</option><option>Autre</option></select>
            </div>
            <div className="fg col-3"><label>Lieu (adresse / MP)</label>
              <input name="loc" value="Townsend Central Station, 200 Depot St, Townsend TN 37882" />
            </div>
            <div className="fg col-3"><label>N° d'incident CAD</label>
              <input name="cad" placeholder="Auto (ex. 2026-08742)" />
            </div>
            <div className="fg col-12"><label>Détails communiqués au dispatcher 911</label>
              <textarea name="det" placeholder="\u00ab Central 911, ici PCC Townsend Transit. Homme adulte, ~40 ans, malaise sur le quai 1. Conscient, respire. Besoin d'une ambulance. \u00bb"></textarea>
            </div>
            <div className="fg col-4"><label>Unité assignée</label><input name="unit" placeholder="Ex. DCSO-214, EMS Medic-3" /></div>
            <div className="fg col-4"><label>ETA (min)</label><input name="eta" type="number" min="0" value="6" /></div>
            <div className="fg col-4"><label>Rappel demandé</label><select name="cb"><option>Non</option><option>Oui — dispatcher rappellera le PCC</option></select></div>
          </form>
          <div className="btn-row">
            <button className="btn danger" id="e911Save">📞 Enregistrer l'appel 911</button>
            <button className="btn ghost">Réinitialiser</button>
          </div>
        </div>
        <div className="card">
          <h2>Historique des appels 911</h2>
          <div style={{overflowX: "auto"}}><table className="tbl"><thead><tr><th>Horodatage</th><th>Service</th><th>Nature</th><th>Lieu</th><th>Unité / ETA</th><th>CAD #</th><th>Statut</th><th></th></tr></thead><tbody id="e911Body"></tbody></table></div>
        </div>
      </section>

      {/* ===== SLOW ORDERS / TSR ===== */}
      <section className="view" id="v-tsr">
        <h1 className="vt">Slow orders — restrictions temporaires de vitesse</h1>
        <p className="vt-sub">Toutes les TSR (Temporary Speed Restrictions) actives sur le réseau TTE. Émises par le Roadmaster ou le PCC, communiquées à tous les conducteurs par radio et bulletin.</p>
        {permTsr ? (
          <div className="card">
            <h2>Émettre une TSR</h2>
            <form id="tsrForm" className="form-grid">
              <div className="fg col-3"><label>Subdivision</label>
                <select name="sub"><option>Smoky Subdivision (R1/R4)</option><option>Cumberland Subdivision (IC1/IC2)</option><option>Foothills Sub (R2/R3)</option><option>Townsend Urban (T)</option></select>
              </div>
              <div className="fg col-3"><label>Milepost début</label><input name="mp1" placeholder="MP 42.5" /></div>
              <div className="fg col-3"><label>Milepost fin</label><input name="mp2" placeholder="MP 43.8" /></div>
              <div className="fg col-3"><label>Vitesse max (mph)</label><input name="mph" type="number" value="25" /></div>
              <div className="fg col-6"><label>Motif</label>
                <select name="mot"><option>Défaut de voie</option><option>Travaux (form B)</option><option>Défaillance signal</option><option>Passage à niveau HS</option><option>Météo (crue, chaleur)</option><option>Rail sun-kink risk</option><option>Autre</option></select>
              </div>
              <div className="fg col-6"><label>Valide jusqu'au</label><input name="until" type="datetime-local" /></div>
              <div className="fg col-12"><label>Instructions complémentaires</label><textarea name="ins" placeholder="Ex. R\u00e9duction 25 mph MP 42.5\u201343.8 sur Smoky Sub. D\u00e9faut d'\u00e9cartement. Roadmaster J. Hollis notifi\u00e9."></textarea></div>
            </form>
            <div className="btn-row"><button className="btn" id="tsrSave">Émettre la TSR</button></div>
          </div>
        ) : (
          <div className="perm-banner">Lecture seule — l'émission d'une TSR est réservée aux régulateurs, à la maintenance, aux gérants de branche et à la supervision.</div>
        )}
        <div className="card">
          <h2>TSR en vigueur</h2>
          <div style={{overflowX: "auto"}}><table className="tbl"><thead><tr><th>N°</th><th>Sub</th><th>MP</th><th>Vitesse</th><th>Motif</th><th>Valide jusqu'à</th><th>Émise par</th><th></th></tr></thead><tbody id="tsrBody"></tbody></table></div>
        </div>
      </section>

      {/* ===== FLOTTE / ROLLING STOCK ===== */}
      <FleetPanel />


      {/* ===== GRADE CROSSINGS ===== */}
      <section className="view" id="v-xing">
        <h1 className="vt">Grade crossings — passages à niveau</h1>
        <p className="vt-sub">Suivi des passages à niveau du réseau. Numéros DOT (US DOT AAR crossing inventory), état des barrières / feux / cloches.</p>
        <div className="card">
          <h2>Passages à niveau surveillés</h2>
          <div style={{overflowX: "auto"}}><table className="tbl"><thead><tr><th>DOT #</th><th>Route</th><th>Sub / MP</th><th>Type protection</th><th>Dernier test</th><th>État</th><th></th></tr></thead><tbody id="xingBody"></tbody></table></div>
          <p style={{fontSize: "12px", color: "var(--muted)", marginTop: ".9rem"}}>Tout défaut de signalisation à un passage à niveau doit être signalé sous 24 h au FRA (Federal Railroad Administration) via formulaire FRA F 6180.83.</p>
        </div>
        {permNet ? (
          <div className="card">
            <h2>Ajouter un passage à niveau</h2>
            <form id="xingAddForm" className="form-grid">
              <div className="fg col-3"><label>DOT #</label><input name="dot" placeholder="720999X" /></div>
              <div className="fg col-4"><label>Route</label><input name="rte" placeholder="Ex. Old River Rd" /></div>
              <div className="fg col-5"><label>Sub / MP</label><input name="sub" placeholder="Ex. Smoky Sub · MP 4.2" /></div>
              <div className="fg col-6"><label>Type de protection</label><input name="prot" placeholder="Feux + barrières + cloche" /></div>
              <div className="fg col-3"><label>Dernier test</label><input name="test" placeholder="01 juil. 2026" /></div>
              <div className="fg col-3"><label>État initial</label>
                <select name="st"><option>OK</option><option>Cloche défectueuse</option><option>Barrière HS</option><option>Feux HS</option><option>À moderniser (FRA)</option><option>Hors service</option></select>
              </div>
            </form>
            <div className="btn-row"><button className="btn ok" id="xingAdd">＋ Ajouter le passage à niveau</button></div>
          </div>
        ) : (
          <div className="perm-banner">Lecture seule — la mise à jour de l'état et la modification des passages à niveau sont réservées à la direction, à la supervision, aux gérants de branche, aux régulateurs et à la maintenance.</div>
        )}

        {/* Modal d'édition passage à niveau */}
        <div id="xingModal" className="xing-modal" style={{display:"none"}}>
          <div className="xing-modal-backdrop" data-close="1"></div>
          <div className="xing-modal-card">
            <div className="xing-modal-head">
              <h3>Modifier le passage à niveau</h3>
              <button type="button" className="btn ghost sm" data-close="1" aria-label="Fermer">✕</button>
            </div>
            <form id="xingEditForm" className="form-grid">
              <input type="hidden" name="idx" />
              <div className="fg col-4"><label>DOT #</label><input name="dot" required /></div>
              <div className="fg col-8"><label>Route</label><input name="rte" required /></div>
              <div className="fg col-6"><label>Sub / MP</label><input name="sub" /></div>
              <div className="fg col-6"><label>Type de protection</label><input name="prot" /></div>
              <div className="fg col-6"><label>Dernier test</label><input name="test" placeholder="01 juil. 2026" /></div>
              <div className="fg col-6"><label>État</label>
                <select name="st"><option>OK</option><option>Cloche défectueuse</option><option>Barrière HS</option><option>Feux HS</option><option>À moderniser (FRA)</option><option>Hors service</option></select>
              </div>
            </form>
            <div className="btn-row" style={{justifyContent:"flex-end"}}>
              <button type="button" className="btn ghost" data-close="1">Annuler</button>
              <button type="button" className="btn ok" id="xingEditSave">💾 Enregistrer</button>
            </div>
          </div>
        </div>
      </section>



      {/* ===== ANNONCES PA ===== */}
      <section className="view" id="v-pa">
        <h1 className="vt">Annonces PA — Public Address</h1>
        <p className="vt-sub">Diffusion sonore en gare et à bord. Templates bilingues (EN / FR) prêts à l'emploi.</p>
        {permNet ? (
          <div className="card">
            <h2>Diffuser une annonce</h2>
            <form id="paForm" className="form-grid">
              <div className="fg col-3"><label>Zone</label>
                <select name="zone"><option>Townsend Central — All</option><option>Townsend — Quai 1</option><option>Townsend — Hall / Hôtel</option><option>À bord — tous trains</option><option>À bord — ligne spécifique</option></select>
              </div>
              <div className="fg col-3"><label>Langue</label><select name="lg"><option>English + Français</option><option>English only</option><option>Français uniquement</option><option>Español</option></select></div>
              <div className="fg col-6"><label>Template rapide</label>
                <select name="tpl" id="paTpl">
                  <option value="">— Personnalisé —</option>
                  <option value="board">Boarding call</option>
                  <option value="late">Delay announcement</option>
                  <option value="track">Track change (rare — 1 quai)</option>
                  <option value="lost">Lost child</option>
                  <option value="evac">Emergency evacuation</option>
                  <option value="sec">Security — See Something Say Something</option>
                  <option value="wx">Severe weather advisory</option>
                </select>
              </div>
              <div className="fg col-12"><label>Texte diffusé</label><textarea name="txt" id="paTxt" style={{minHeight: "120px"}} placeholder="Ladies and gentlemen\u2026"></textarea></div>
            </form>
            <div className="btn-row">
              <button className="btn" id="paSend">📢 Diffuser (PA)</button>
              <button className="btn ghost" id="paTts">▶ Écouter (test voix)</button>
            </div>
          </div>
        ) : (
          <div className="perm-banner">Lecture seule — la diffusion PA est réservée aux gérants, à la supervision, aux gérants de branche, à la maintenance et aux régulateurs.</div>
        )}
        <div className="card"><h2>Annonces diffusées</h2><div id="paList" className="pub-list"></div></div>
      </section>

      {/* ===== MÉTÉO ===== */}
      <WeatherPanel />


      {/* ===== RADIO / 10-CODES ===== */}
      <section className="view" id="v-radio">
        <h1 className="vt">Radio &amp; codes 10 (railroad)</h1>
        <p className="vt-sub">Fréquences AAR (Association of American Railroads) utilisées par TTE et aide-mémoire des 10-codes conformes au <i>GCOR Rule 2</i>.</p>
        <div className="card">
          <h2>Canaux radio TTE</h2>
          <table className="tbl">
            <thead><tr><th>Canal</th><th>AAR #</th><th>Fréquence</th><th>Usage</th></tr></thead>
            <tbody>
              <tr><td><b>Road 1</b></td><td>AAR 07</td><td>29.59 MHz</td><td>Trains R1 / R4 — Smoky Sub</td></tr>
              <tr><td><b>Road 2</b></td><td>AAR 46</td><td>29.59 MHz</td><td>Trains IC1 / IC2 — Cumberland Sub</td></tr>
              <tr><td><b>Yard</b></td><td>AAR 88</td><td>29.59 MHz</td><td>Manœuvres atelier Townsend</td></tr>
              <tr><td><b>MoW</b></td><td>AAR 22</td><td>29.59 MHz</td><td>Équipes voies (Maintenance of Way)</td></tr>
              <tr><td><b>Emergency</b></td><td>AAR 96</td><td>29.59 MHz</td><td>Urgence — priorité absolue</td></tr>
              <tr><td><b>PCC ↔ DCSO</b></td><td>Interop</td><td>28.59 MHz</td><td>Liaison Sheriff (DCSO)</td></tr>
              <tr><td><b>PCC ↔ HCT</b></td><td>Interop</td><td>28.59 MHz</td><td>Liaison médecins / EMS (HCT)</td></tr>
            </tbody>
          </table>
        </div>
        <div className="card">
          <h2>10-codes TTE — sécurité ferroviaire</h2>
          <p className="vt-sub" style={{marginTop:"-4px"}}>Codes internes utilisés par les agents de sécurité ferroviaire de TTE. Ils servent à standardiser les échanges avec le PCC et les autres agents sur le réseau.</p>
          <table className="tbl">
            <thead><tr><th style={{width: "80px"}}>Code</th><th>Signification</th><th>Contexte ferroviaire</th></tr></thead>
            <tbody>
              <tr><td><b>10-0</b></td><td>Faites preuve de prudence</td><td>Zone sensible / présence suspecte le long de la voie</td></tr>
              <tr><td><b>10-4</b></td><td>Message reçu</td><td>Acquittement d'un ordre PCC / agent</td></tr>
              <tr><td><b>10-6</b></td><td>Occupé sauf urgence</td><td>Agent en intervention, pas disponible</td></tr>
              <tr><td><b>10-7</b></td><td>Service terminé</td><td>Fin de shift</td></tr>
              <tr><td><b>10-8</b></td><td>Prise de service</td><td>Disponible sur le réseau</td></tr>
              <tr><td><b>10-12</b></td><td>En stand-by</td><td>Attente d'instructions du PCC</td></tr>
              <tr><td><b>10-17</b></td><td>Demande de renfort</td><td>Besoin d'un agent supplémentaire en gare ou à bord</td></tr>
              <tr><td><b>10-20</b></td><td>Communiquez votre position</td><td>Localisation du train, de l'agent ou du PN concerné</td></tr>
              <tr><td><b>10-22</b></td><td>Contrôle voyageur / billet</td><td>Fraude / contrôle d'accès en cours</td></tr>
              <tr><td><b>10-23</b></td><td>Arrivée sur les lieux</td><td>Agent sur le site de l'incident</td></tr>
              <tr><td><b>10-24</b></td><td>Intervention terminée</td><td>Reprise possible du trafic</td></tr>
              <tr><td><b>10-25</b></td><td>Faites un rapport</td><td>Compte-rendu au PCC</td></tr>
              <tr><td><b>10-29</b></td><td>Fraudeur confirmé</td><td>Individu sans billet ou évitement tarifaire</td></tr>
              <tr><td><b>10-33</b></td><td>URGENCE</td><td>Canal libre — priorité absolue au PCC</td></tr>
              <tr><td><b>10-50</b></td><td>Accident passage à niveau</td><td>Collision rail-route ou véhicule sur emprise</td></tr>
              <tr><td><b>10-55</b></td><td>Accident voyageur</td><td>Chute, malaise ou blessé sur quai / train</td></tr>
              <tr><td><b>10-70</b></td><td>Incendie / fumée</td><td>Feu ou dégagement de fumée — alerter NFD / HCT</td></tr>
              <tr><td><b>10-80</b></td><td>Bagage / colis suspect</td><td>Objet abandonné — isoler la zone</td></tr>
              <tr><td><b>10-99</b></td><td>Agent en danger</td><td>Assistance immédiate requise</td></tr>
            </tbody>
          </table>
        </div>
        <div className="card">
          <h2>Procedure words</h2>
          <table className="tbl">
            <thead><tr><th style={{width: "140px"}}>Mot</th><th>Signification</th></tr></thead>
            <tbody>
              <tr><td><b>ATTENDEZ</b></td><td>Pause dans la communication pour réflexion</td></tr>
              <tr><td><b>AVORTEZ</b></td><td>Annuler une transmission en cours</td></tr>
              <tr><td><b>CORRECTION</b></td><td>Rectification de la dernière transmission</td></tr>
              <tr><td><b>PARLEZ / OVER</b></td><td>Fin de transmission, en attente d'une réponse</td></tr>
              <tr><td><b>RÉITÉREZ</b></td><td>Répétez l'entièreté de la dernière transmission</td></tr>
              <tr><td><b>SILENCE</b></td><td>Interdiction d'émettre sauf urgence</td></tr>
              <tr><td><b>TERMINÉ / OUT</b></td><td>Fin de transmission, pas de réponse attendue</td></tr>
              <tr><td><b>URGENT / BREAK</b></td><td>Interrompre la com en cours pour message urgent</td></tr>
            </tbody>
          </table>
        </div>

      </section>




      <section className="view" id="v-log">
        <h1 className="vt">Journal des actions</h1>
        <p className="vt-sub">Traçabilité des opérations effectuées depuis ce poste.</p>
        <div className="card">
          <h2><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg> Historique</h2>
          <ul className="log" id="logList"></ul>
          <div className="btn-row">
            <button className="btn ghost sm" id="logClear">Vider le journal</button>
          </div>
        </div>
      </section>

      {/* ===== AIDE ===== */}
      <section className="view" id="v-help">
        <h1 className="vt">Aide & procédures</h1>
        <p className="vt-sub">Rappels rapides pour bien régler le trafic.</p>
        <div className="card">
          <h2>Codes de gravité</h2>
          <div className="pub sev-info"><span className="ln" style={{background: "var(--blue)"}}>INFO</span><div className="body"><div className="tt">Information voyageurs</div><div className="ms">Évènement sans impact sur le trafic (travaux à venir, modification d'horaire saisonnière, événement local).</div></div></div>
          <div className="pub sev-warn" style={{marginTop: "8px"}}><span className="ln" style={{background: "var(--warn)"}}>PERT.</span><div className="body"><div className="tt">Perturbation</div><div className="ms">Retard supérieur à 5 min, ralentissement, modification ponctuelle de desserte. Diffusion site + panneaux.</div></div></div>
          <div className="pub sev-alert" style={{marginTop: "8px"}}><span className="ln" style={{background: "var(--alert)"}}>ALERTE</span><div className="body"><div className="tt">Incident grave</div><div className="ms">Suppression, interruption totale, incident sécurité. Diffusion sur tous les canaux + annonce sonore obligatoire.</div></div></div>
        </div>
        <div className="card">
          <h2>Bonnes pratiques de rédaction</h2>
          <ul style={{paddingLeft: "1.2rem", color: "var(--ink-2)", fontSize: "14px", lineHeight: "1.7"}}>
            <li>Toujours indiquer la <b>ligne</b>, le <b>secteur</b> (entre quelles gares), la <b>cause</b> et l'<b>impact horaire estimé</b>.</li>
            <li>Préférer un ton factuel, sans jargon technique interne.</li>
            <li>Mettre à jour la publication dès évolution de la situation, ne pas la dupliquer.</li>
            <li>Retirer la publication dès retour à la normale.</li>
          </ul>
        </div>
      </section>

    </div>
  </main>
</div>

<div className="toast" id="toast"></div>



    </>
  );
}
