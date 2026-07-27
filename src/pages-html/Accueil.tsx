import { useEffect, type CSSProperties as _CSS } from "react";
import * as React from "react";
import "./Accueil.css";
import { script } from "./Accueil.script";
import { trafficPublicScript } from "./AccueilTrafficShared.script";
import { DiscordAuthButton } from "@/components/DiscordAuth";

export default function AccueilPage() {
  useEffect(() => {
    const el = document.createElement("script");
    el.textContent = script + trafficPublicScript;
    document.body.appendChild(el);
    return () => { el.remove(); };
  }, []);

  return (
    <>

<a className="skip" href="#main">Aller au contenu principal</a>

{/* ===== UTILITY BAR ===== */}
<div className="util">
  <div className="util-in">
    <div className="util-grp u-left">
      <a href="#reseau">Plan du réseau</a>
      <a href="#lignes">Horaires</a>
      <a href="#gares">Gares &amp; services</a>
      <a href="/contact">Aide &amp; contact</a>
    </div>
    <div className="util-grp" style={{ alignItems: "center", gap: 12 }}>
      <a className="staff" href="/espace-employes">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="4" y="11" width="16" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
        Espace employés
      </a>
      <DiscordAuthButton />
      <span className="sep"></span>
      <span className="lang">🇺🇸 FR</span>
    </div>
  </div>
</div>

{/* ===== HEADER ===== */}
<header className="hdr" id="hdr">
  <div className="hdr-in">
    <a href="/" className="brand" aria-label="Townsend Transit Express \u2014 accueil">
      <svg className="logo" viewBox="0 0 156 44" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="TTE">
        <g fill="#4B92DD">
          <rect x="2" y="25" width="150" height="6" rx="3" opacity=".45" />
          <rect x="0" y="25" width="30" height="6" rx="3" />
          <rect x="126" y="25" width="30" height="6" rx="3" opacity=".55" />
        </g>
        <text x="4" y="34" fontFamily="'Libre Franklin',sans-serif" fontSize="35" fontWeight="800" fontStyle="italic" letterSpacing="-1.5" fill="#1A50B0">TTE</text>
      </svg>
      <span className="brand-tx">
        <span className="nm">Townsend Transit Express</span>
        <span className="tg">Réseau ferroviaire du Tennessee</span>
      </span>
    </a>
    <nav className="mainnav" id="mainnav">
      <a href="#reseau">Réseau</a>
      <a href="#lignes">Lignes &amp; horaires</a>
      <a href="#gares">Gares</a>
      <a href="#townsend">Townsend</a>
      <a href="#tarifs">Tarifs</a>
      <a href="#engagement">Histoire</a>
      <a href="#infos">Infos voyageurs</a>
    </nav>
    <div className="hdr-sp"></div>
    <div className="hdr-act">
      <a href="#finder" className="btn btn-primary">Rechercher un horaire</a>
      <button className="burger" id="burger" aria-label="Ouvrir le menu"><span></span><span></span><span></span></button>
    </div>
  </div>
</header>

{/* ===== ALERTE TRAFIC ===== */}
<div className="alert-bar" id="alertBar" style={{ display: "none" }}>
  <div className="alert-in">
    <span className="tag">⚠ Info trafic</span>
    <p><b>Ligne R4 (Knoxville – Chattanooga)</b> : retard d'environ 10 minutes en raison de travaux entre Athens et Cleveland. Les autres lignes circulent normalement.</p>
    <a href="#lignes">Voir tout le trafic</a>
    <button className="alert-x" id="alertX" aria-label="Fermer">×</button>
  </div>
</div>

{/* ===== HERO ===== */}
<main id="main">
<section className="hero">
  <svg className="hero-art" viewBox="0 0 1440 460" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
    <g opacity=".55">
      <path d="M0,300 L210,200 L360,260 L540,170 L720,250 L900,160 L1080,240 L1260,180 L1440,250 L1440,460 L0,460 Z" fill="#103372" />
      <path d="M0,360 L260,280 L460,340 L720,250 L980,330 L1200,250 L1440,320 L1440,460 L0,460 Z" fill="#0C2A60" />
      <path d="M0,460 L0,390 L300,340 L560,400 L820,330 L1080,390 L1320,340 L1440,370 L1440,460 Z" fill="#0A2148" />
    </g>
    <g fill="#4B92DD" opacity=".22">
      <path d="M540,170 l20,24 -40,0 Z" />
      <path d="M900,160 l20,24 -40,0 Z" />
    </g>
    <g stroke="#4B92DD" strokeWidth="2" opacity=".2" fill="none">
      <path d="M-20,250 C300,250 360,200 720,200 C1080,200 1140,160 1460,160" />
      <path d="M-20,290 C320,290 380,250 760,250 C1100,250 1180,220 1460,220" opacity=".6" />
    </g>
  </svg>
  <div className="hero-in">
    <div className="hero-left">
      <span className="hero-eyebrow">Au départ de Townsend · Tennessee</span>
      <h1>Le réseau ferroviaire au cœur des Great&nbsp;Smoky&nbsp;Mountains</h1>
      <p className="lead">Trains régionaux, lignes InterCité et desserte locale de Townsend : Townsend Transit Express relie l'est du Tennessee, de Chattanooga à Nashville, autour de sa gare centrale.</p>
      <div className="hero-stats">
        <div className="hstat"><b className="num">8</b><span>lignes en service</span></div>
        <div className="hstat"><b className="num">26</b><span>gares &amp; arrêts</span></div>
        <div className="hstat"><b className="num">3 h 20</b><span>Townsend → Nashville</span></div>
      </div>
      <div className="hero-chips">
        <span className="chip"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M3 9l9-5 9 5v6l-9 5-9-5V9Z" /><path d="M8 12h8" /></svg> Billets en vente en gare</span>
        <span className="chip"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="4.5" r="2" /><path d="M12 7v6m0 0 4 6m-4-6-4 6m-1-9h10" /></svg> Réseau accessible PMR</span>
        <span className="chip"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0" /><circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" /></svg> Wi-Fi gratuit à bord</span>
      </div>
    </div>

    {/* RECHERCHE D'HORAIRES */}
    <div className="finder" id="finder">
      <div className="finder-h">
        <span className="ic">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
        </span>
        <span><b>Rechercher un horaire</b><small>Consultez les départs entre deux gares</small></span>
      </div>
      <div className="finder-b">
        <div className="f-field">
          <label htmlFor="fFrom">Gare de départ</label>
          <div className="f-input">
            <span className="pin"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="10" r="3" /><path d="M12 2a8 8 0 0 0-8 8c0 5.4 8 12 8 12s8-6.6 8-12a8 8 0 0 0-8-8Z" /></svg></span>
            <input id="fFrom" type="text" placeholder="Townsend" value="Townsend" autoComplete="off" list="stations" />
          </div>
        </div>
        <div className="f-swap"><button id="fSwap" aria-label="Inverser les gares"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M7 4v16M7 4l-3 3M7 4l3 3M17 20V4M17 20l-3-3M17 20l3-3" /></svg></button></div>
        <div className="f-field">
          <label htmlFor="fTo">Gare d'arrivée</label>
          <div className="f-input">
            <span className="pin"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 3v18M5 4h11l-2 4 2 4H5" /></svg></span>
            <input id="fTo" type="text" placeholder="Nashville" value="Nashville" autoComplete="off" list="stations" />
          </div>
        </div>
        <datalist id="stations">
          <option value="Townsend"></option>
          <option value="Maryville"></option>
          <option value="Alcoa"></option>
          <option value="Knoxville"></option>
          <option value="Sevierville"></option>
          <option value="Pigeon Forge"></option>
          <option value="Oak Ridge"></option>
          <option value="Crossville"></option>
          <option value="Cookeville"></option>
          <option value="Lebanon"></option>
          <option value="Nashville"></option>
          <option value="Lenoir City"></option>
          <option value="Sweetwater"></option>
          <option value="Athens"></option>
          <option value="Cleveland"></option>
          <option value="Chattanooga"></option>
          <option value="Jefferson City"></option>
          <option value="Morristown"></option>
          <option value="Greeneville"></option>
          <option value="Mascot"></option>
          <option value="H\u00f4pital TMC (Townsend)"></option>
          <option value="Quartier r\u00e9sidentiel (Townsend)"></option>
        </datalist>
        <div className="f-field">
          <label>Date, heure &amp; voyageurs</label>
          <div className="f-row3">
            <div className="f-input"><input id="fDate" type="date" aria-label="Date du voyage" /></div>
            <div className="f-input"><input id="fTime" type="time" aria-label="Heure de d\u00e9part" /></div>
            <div className="f-input">
              <select id="fPax" aria-label="Nombre de voyageurs">
                <option value="1">1 voy.</option>
                <option value="2">2 voy.</option>
                <option value="3">3 voy.</option>
                <option value="4">4 voy.</option>
                <option value="5">5 voy.</option>
              </select>
            </div>
          </div>
        </div>
        <div className="f-field" style={{marginBottom: "6px"}}>
          <label htmlFor="fProf">Tarif voyageur</label>
          <div className="f-input">
            <select id="fProf" aria-label="Profil voyageur">
              <option value="adulte">Adulte — plein tarif</option>
              <option value="enfant">Enfant 4–11 ans — 50 %</option>
              <option value="jeune">Jeune 12–25 ans — 30 %</option>
              <option value="senior">Senior 65+ — 30 %</option>
              <option value="pmr">PMR — accompagnant gratuit</option>
            </select>
          </div>
        </div>
        <button className="btn btn-primary" id="fGo">Voir les horaires &amp; tarifs</button>
        <div className="finder-note">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>
          <span>Billets en vente <b>uniquement en gare</b>, aux bornes automatiques. Cet outil affiche les horaires et le tarif indicatif.</span>
        </div>
      </div>
      <div className="f-results" id="fResults"></div>
    </div>
  </div>
</section>

{/* ===== DEPARTURE BOARD ===== */}
<aside className="depboard" aria-label="Prochains d\u00e9parts en gare centrale de Townsend">
  <div className="depboard-in">
    <div className="dep-head">
      <div className="dt">
        <b><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg> Prochains départs · Gare centrale de Townsend</b>
        <small>Mis à jour en direct · les horaires défilent en temps réel</small>
      </div>
      <div className="clock" id="depClock" aria-live="off">--:--</div>
    </div>
    <div className="dep-wrap">
      <table className="dep-table" id="depTable">
        <thead><tr><th>Départ</th><th>Ligne</th><th>Destination</th><th className="r">Voie</th><th className="r">État</th></tr></thead>
        <tbody id="depBody"></tbody>
      </table>
    </div>
  </div>
</aside>

{/* ===== TILES ===== */}
<div className="wrap">
  <div className="tiles">
    <a className="tile" href="#lignes">
      <span className="ic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="3" width="16" height="14" rx="3" /><path d="M4 11h16M9 21l1.5-4M15 21l-1.5-4" /><circle cx="8.5" cy="14" r="1" fill="currentColor" stroke="none" /><circle cx="15.5" cy="14" r="1" fill="currentColor" stroke="none" /></svg></span>
      <h3>Lignes &amp; horaires</h3>
      <p>Toutes les lignes du réseau et leurs départs.</p>
    </a>
    <a className="tile" href="#reseau">
      <span className="ic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 4 4 6v14l5-2 6 2 5-2V4l-5 2-6-2Z" /><path d="M9 4v14M15 6v14" /></svg></span>
      <h3>Plan du réseau</h3>
      <p>Visualisez l'ensemble des lignes et gares.</p>
    </a>
    <a className="tile" href="#tarifs">
      <span className="ic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-5 9 5v6l-9 5-9-5V9Z" /><path d="M8 12h8" /></svg></span>
      <h3>Tarifs &amp; titres</h3>
      <p>Billets, carnets et abonnements.</p>
    </a>
    <a className="tile" href="#infos">
      <span className="ic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg></span>
      <h3>Infos voyageurs</h3>
      <p>Achat, services à bord et accessibilité.</p>
    </a>
  </div>
</div>

{/* ===== RÉSEAU ===== */}
<section className="section" id="reseau">
  <div className="wrap">
    <div className="shead">
      <span className="eyebrow">Le réseau</span>
      <h2 className="stitle">Un réseau centré sur Townsend, ouvert sur tout le Tennessee</h2>
      <p className="slede">Les lignes rayonnent depuis la gare centrale de Townsend : vers Sevierville et les vallées des Smokies, vers Knoxville et l'est de l'État, vers Chattanooga au sud et jusqu'à Nashville à l'ouest. À l'intérieur de Townsend, un train urbain et une ligne de bus assurent la desserte locale.</p>
    </div>

    <div className="statusboard">
      <div className="sb-head">
        <b><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M3 12h4l2 5 4-12 2 7h6" /></svg> État du réseau</b>
        <span className="live"><span className="dot"></span> Mis à jour à l'instant</span>
      </div>
      <div className="sb-grid">
        <div className="sb-item"><span className="bullet" style={{background: "var(--l-r1)"}}>R1</span><span className="nm">Vallées des Smokies</span><span className="sb-dot ok" title="\u00c0 l'heure"></span></div>
        <div className="sb-item"><span className="bullet" style={{background: "var(--l-r2)"}}>R2</span><span className="nm">Knoxville</span><span className="sb-dot ok"></span></div>
        <div className="sb-item"><span className="bullet" style={{background: "var(--l-r3)"}}>R3</span><span className="nm">Est Tennessee</span><span className="sb-dot ok"></span></div>
        <div className="sb-item"><span className="bullet" style={{background: "var(--l-r4)"}}>R4</span><span className="nm">Chattanooga · retard ~10 min</span><span className="sb-dot warn" title="Retard"></span></div>
        <div className="sb-item"><span className="bullet" style={{background: "var(--l-ic1)"}}>IC1</span><span className="nm">Nashville</span><span className="sb-dot ok"></span></div>
        <div className="sb-item"><span className="bullet" style={{background: "var(--l-ic2)"}}>IC2</span><span className="nm">Smoky Express</span><span className="sb-dot ok"></span></div>
        <div className="sb-item"><span className="bullet" style={{background: "var(--l-t)"}}>T</span><span className="nm">Train urbain</span><span className="sb-dot ok"></span></div>
        <div className="sb-item"><span className="bullet" style={{background: "var(--l-bus)"}}>BUS</span><span className="nm">Townsend</span><span className="sb-dot ok"></span></div>
      </div>
    </div>

    <div className="net-grid">
      <div className="map-card">
        <div className="mh">
          <b>Plan schématique du réseau</b>
          <span className="upd">Mis à jour aujourd'hui</span>
        </div>
        <div className="mapview"><svg className="netmap" viewBox="0 0 1000 520" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Plan sch\u00e9matique du r\u00e9seau TTE">
          <rect width="1000" height="520" fill="#F7FAFD" />
          <g opacity=".5" stroke="#E2EAF3" strokeWidth="1">
            <line x1="0" y1="130" x2="1000" y2="130" /><line x1="0" y1="260" x2="1000" y2="260" /><line x1="0" y1="390" x2="1000" y2="390" />
            <line x1="250" y1="0" x2="250" y2="520" /><line x1="500" y1="0" x2="500" y2="520" /><line x1="750" y1="0" x2="750" y2="520" />
          </g>
          {/* Townsend = 150,280 */}
          {/* IC1 (cyan) */}
          <polyline points="150,280 250,268 360,250 470,228 590,204 700,184 810,164 905,146" fill="none" stroke="var(--l-ic1)" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="10 5" />
          {/* IC2 (rouge) */}
          <polyline points="150,280 270,262 400,228 540,198 680,176 800,158 905,146" fill="none" stroke="var(--l-ic2)" strokeWidth="4.4" strokeLinecap="round" strokeLinejoin="round" />
          {/* R2 (bleu) */}
          <polyline points="150,280 240,288 330,292 420,288 480,282" fill="none" stroke="var(--l-r2)" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
          {/* R3 (violet) */}
          <polyline points="330,292 420,270 510,252 600,234 670,222" fill="none" stroke="var(--l-r3)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {/* R4 (orange) */}
          <polyline points="330,292 365,345 415,390 490,424 580,438 680,436 760,442" fill="none" stroke="var(--l-r4)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {/* R1 (vert) */}
          <polyline points="150,280 195,248 250,224 305,210" fill="none" stroke="var(--l-r1)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
          {/* Ligne T - train urbain Townsend (teal) */}
          <polyline points="150,280 138,322 132,360 128,398" fill="none" stroke="var(--l-t)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {/* Bus local (ambre tireté) */}
          <polyline points="150,280 188,316 200,352 206,392" fill="none" stroke="var(--l-bus)" strokeWidth="2.6" strokeLinecap="round" strokeDasharray="3 6" />

          {/* stations */}
          <g fill="#F7FAFD" strokeWidth="2.6">
            <circle cx="305" cy="210" r="5" stroke="var(--l-r1)" />
            <circle cx="480" cy="282" r="5" stroke="var(--l-r2)" />
            <circle cx="670" cy="222" r="5" stroke="var(--l-r3)" />
            <circle cx="128" cy="398" r="5" stroke="var(--l-t)" />
            <circle cx="206" cy="392" r="5" stroke="var(--l-bus)" />
          </g>
          {/* hubs */}
          <circle cx="150" cy="280" r="13" fill="#fff" stroke="var(--navy)" strokeWidth="3" />
          <circle cx="150" cy="280" r="5" fill="var(--navy)" />
          <circle cx="330" cy="292" r="9" fill="#fff" stroke="var(--navy)" strokeWidth="3" />
          <circle cx="330" cy="292" r="3.5" fill="var(--navy)" />
          <circle cx="760" cy="442" r="8" fill="#fff" stroke="var(--l-r4)" strokeWidth="3" />
          <circle cx="905" cy="146" r="11" fill="#fff" stroke="var(--navy)" strokeWidth="3" />
          <circle cx="905" cy="146" r="4" fill="var(--navy)" />

          {/* labels */}
          <g fontFamily="'Libre Franklin',sans-serif" fontWeight="700" fontSize="14" fill="#16202E">
            <text x="150" y="312" textAnchor="middle">Townsend</text>
            <text x="330" y="318" textAnchor="middle">Knoxville</text>
            <text x="760" y="470" textAnchor="middle" fill="#A8480E">Chattanooga</text>
            <text x="905" y="130" textAnchor="middle">Nashville</text>
          </g>
          <g fontFamily="'Source Sans 3',sans-serif" fontSize="12" fill="#5C6B7D">
            <text x="305" y="198" textAnchor="middle">Sevierville</text>
            <text x="670" y="210" textAnchor="middle">Greeneville</text>
            <text x="118" y="416" textAnchor="end">Hôpital TMC</text>
          </g>
          <g fontFamily="'Libre Franklin',sans-serif" fontWeight="800" fontSize="9" letterSpacing=".5">
            <rect x="118" y="318" width="64" height="15" rx="4" fill="var(--navy)" />
            <text x="150" y="328.5" textAnchor="middle" fill="#fff">GARE CENTRALE</text>
            <rect x="872" y="102" width="66" height="15" rx="4" fill="var(--l-ic1)" />
            <text x="905" y="112.5" textAnchor="middle" fill="#fff">TERMINUS</text>
          </g>
          <text x="22" y="504" fontFamily="'Source Sans 3',sans-serif" fontSize="11" fill="#9FB0C2">Schéma non contractuel · 8 lignes · Townsend Transit Express</text>
        </svg></div>
        <div className="maplegend">
          <span className="leg"><span className="ll" style={{background: "var(--l-r1)"}}></span> R1 · Vallées des Smokies</span>
          <span className="leg"><span className="ll" style={{background: "var(--l-r2)"}}></span> R2 · Knoxville</span>
          <span className="leg"><span className="ll" style={{background: "var(--l-r3)"}}></span> R3 · Est Tennessee</span>
          <span className="leg"><span className="ll" style={{background: "var(--l-r4)"}}></span> R4 · Corridor Sud</span>
          <span className="leg"><span className="ll" style={{background: "var(--l-ic1)"}}></span> IC1 · InterCité Est-Ouest</span>
          <span className="leg"><span className="ll" style={{background: "var(--l-ic2)"}}></span> IC2 · Smoky Express</span>
          <span className="leg"><span className="ll" style={{background: "var(--l-t)"}}></span> Ligne T · Train urbain</span>
          <span className="leg"><span className="ll" style={{background: "var(--l-bus)"}}></span> Bus · Townsend</span>
        </div>
      </div>

      <div className="net-side">
        <h3>Six lignes ferrées, une desserte locale</h3>
        <p>L'ossature du réseau repose sur le train : quatre lignes régionales (R1 à R4) et deux lignes InterCité (IC1 et IC2) relient les principales villes de l'est du Tennessee. Tout est né à Townsend avec la Ligne T, la première ligne historique de la société ; le réseau s'est ensuite construit autour d'elle, et une ligne de bus complète aujourd'hui la desserte locale.</p>
        <div className="net-figs">
          <div className="fig"><b className="num">6</b><span>lignes de train</span></div>
          <div className="fig"><b className="num">2</b><span>services locaux à Townsend</span></div>
          <div className="fig"><b className="num">4</b><span>grandes villes reliées</span></div>
          <div className="fig"><b className="num">24/7</b><span>information trafic</span></div>
        </div>
      </div>
    </div>
  </div>
</section>

{/* ===== LIGNES & HORAIRES ===== */}
<section className="section alt" id="lignes">
  <div className="wrap">
    <div className="shead row">
      <div>
        <span className="eyebrow">Lignes &amp; horaires</span>
        <h2 className="stitle">Toutes les lignes du réseau</h2>
      </div>
      <div className="lin-head-actions">
        <button className="btn-ghost" id="printHoraires" type="button"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" rx="1" /></svg> Imprimer les horaires</button>
        <a className="linkmore" href="#tarifs">Voir les tarifs →</a>
      </div>
    </div>

    <div className="feature">
      <div className="fx-l">
        <span className="eyebrow2">★ Ligne vedette</span>
        <h3>IC2 · Smoky Express</h3>
        <div className="rt">Townsend ↔ Nashville · InterCité</div>
        <p>La liaison la plus rapide du réseau : Townsend–Nashville en 3 h 20, avec un arrêt rapide à Knoxville. Trois allers-retours par jour dans chaque sens.</p>
        <div className="deps"><span className="t">07:00</span><span className="t">13:00</span><span className="t">19:00</span></div>
      </div>
      <div className="fx-r">
        <div className="fx-stat"><span className="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg></span><div><b>3 h 20</b><span>Townsend → Nashville</span></div></div>
        <div className="fx-stat"><span className="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="3" width="16" height="14" rx="3" /><path d="M4 11h16M9 21l1.5-4M15 21l-1.5-4" /></svg></span><div><b>3 départs/jour</b><span>dans chaque sens</span></div></div>
        <div className="fx-stat"><span className="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="10" r="3" /><path d="M12 2a8 8 0 0 0-8 8c0 5.4 8 12 8 12s8-6.6 8-12a8 8 0 0 0-8-8Z" /></svg></span><div><b>Arrêt rapide</b><span>Knoxville · Cookeville · Lebanon</span></div></div>
      </div>
    </div>

    <div className="lin-tools">
      <input className="lin-search" id="linSearch" type="text" placeholder="Rechercher une ligne, une ville ou une gare\u2026" aria-label="Rechercher une ligne" />
      <select className="lin-sel" id="linType" aria-label="Filtrer par type">
        <option value="">Tous les types</option>
        <option value="reg">Train régional</option>
        <option value="ic">InterCité</option>
        <option value="urb">Train urbain</option>
        <option value="bus">Bus</option>
      </select>
    </div>

    <div className="tcard">
      <div className="tscroll">
        <table id="linTable">
          <thead><tr>
            <th>Ligne</th><th>Type</th><th>Trajet</th><th>Service</th><th>Durée</th><th>État</th>
          </tr></thead>
          <tbody id="linBody">
            <tr data-type="reg" data-search="r1 townsend sevierville walland wears valley pigeon forge smokies regional">
              <td><span className="bullet" style={{background: "var(--l-r1)"}}>R1</span></td>
              <td><span className="t-type tt-reg">Régional</span></td>
              <td><div className="t-pair">Townsend → Sevierville</div><div className="t-via">via Walland · Wears Valley · Pigeon Forge</div></td>
              <td><span className="t-time">07:30</span><span className="t-time">10:00</span><span className="t-time">14:00</span><span className="t-time">17:30</span></td>
              <td><span className="t-dur">55 min</span></td>
              <td><span className="st st-ok">À l'heure</span></td>
            </tr>
            <tr data-type="reg" data-search="r2 townsend mascot maryville alcoa knoxville strawberry plains regional">
              <td><span className="bullet" style={{background: "var(--l-r2)"}}>R2</span></td>
              <td><span className="t-type tt-reg">Régional</span></td>
              <td><div className="t-pair">Townsend → Mascot</div><div className="t-via">via Maryville · Alcoa · Knoxville · Strawberry Plains</div></td>
              <td><span className="t-time">06:00</span><span className="t-time">08:30</span><span className="t-time">12:00</span><span className="t-time">16:00</span><span className="t-time">19:30</span></td>
              <td><span className="t-dur">1 h 45</span></td>
              <td><span className="st st-ok">À l'heure</span></td>
            </tr>
            <tr data-type="reg" data-search="r3 knoxville greeneville jefferson city morristown est tennessee regional">
              <td><span className="bullet" style={{background: "var(--l-r3)"}}>R3</span></td>
              <td><span className="t-type tt-reg">Régional</span></td>
              <td><div className="t-pair">Knoxville → Greeneville</div><div className="t-via">via Jefferson City · Morristown</div></td>
              <td><span className="t-time">08:00</span><span className="t-time">13:00</span><span className="t-time">18:00</span></td>
              <td><span className="t-dur">2 h 10</span></td>
              <td><span className="st st-ok">À l'heure</span></td>
            </tr>
            <tr data-type="reg" data-search="r4 knoxville chattanooga lenoir city sweetwater athens cleveland corridor sud regional">
              <td><span className="bullet" style={{background: "var(--l-r4)"}}>R4</span></td>
              <td><span className="t-type tt-reg">Régional</span></td>
              <td><div className="t-pair">Knoxville → Chattanooga</div><div className="t-via">via Lenoir City · Sweetwater · Athens · Cleveland</div></td>
              <td><span className="t-time">07:00</span><span className="t-time">11:30</span><span className="t-time">15:00</span><span className="t-time">18:30</span></td>
              <td><span className="t-dur">2 h 30</span></td>
              <td><span className="st st-ok">À l'heure</span></td>
            </tr>
            <tr data-type="ic" data-search="ic1 intercite townsend nashville knoxville oak ridge crossville cookeville lebanon">
              <td><span className="bullet" style={{background: "var(--l-ic1)"}}>IC1</span></td>
              <td><span className="t-type tt-ic">InterCité</span></td>
              <td><div className="t-pair">Townsend → Nashville</div><div className="t-via">via Knoxville · Oak Ridge · Crossville · Cookeville · Lebanon</div></td>
              <td><span className="t-time">06:30</span><span className="t-time">10:00</span><span className="t-time">14:30</span><span className="t-time">18:00</span></td>
              <td><span className="t-dur">3 h 55</span></td>
              <td><span className="st st-ok">À l'heure</span></td>
            </tr>
            <tr data-type="ic" data-search="ic2 smoky express intercite townsend nashville maryville knoxville cookeville lebanon">
              <td><span className="bullet" style={{background: "var(--l-ic2)"}}>IC2</span></td>
              <td><span className="t-type tt-ic">InterCité</span></td>
              <td><div className="t-pair">Townsend ↔ Nashville <span style={{color: "var(--l-ic2)", fontWeight: "800"}}>· Smoky Express</span></div><div className="t-via">via Maryville · Knoxville (arrêt rapide) · Cookeville · Lebanon</div></td>
              <td><span className="t-time">07:00</span><span className="t-time">13:00</span><span className="t-time">19:00</span></td>
              <td><span className="t-dur">3 h 20</span></td>
              <td><span className="st st-ok">À l'heure</span></td>
            </tr>
            <tr data-type="urb" data-search="ligne t train urbain townsend gare centrale quartier residentiel hopital tmc historique origine premiere fondatrice berceau">
              <td><span className="bullet" style={{background: "var(--l-t)"}}>T</span></td>
              <td><span className="t-type tt-urb">Train urbain</span></td>
              <td><div className="t-pair">Gare centrale → Hôpital TMC <span className="hist-tag">★ Ligne d'origine</span></div><div className="t-via">via Quartier résidentiel · première ligne historique de TTE</div></td>
              <td><span className="t-time">toutes les 15 min</span><span className="t-time">05:00–00:00</span></td>
              <td><span className="t-dur">~12 min</span></td>
              <td><span className="st st-ok">En service</span></td>
            </tr>
            <tr data-type="bus" data-search="bus townsend gare centrale hopital tmc quartier residentiel local partout">
              <td><span className="bullet" style={{background: "var(--l-bus)"}}>BUS</span></td>
              <td><span className="t-type tt-bus">Bus local</span></td>
              <td><div className="t-pair">Gare centrale → Hôpital TMC</div><div className="t-via">dessert tout Townsend · arrêt principal gare centrale</div></td>
              <td><span className="t-time">toutes les 20 min</span><span className="t-time">06:00–22:00</span></td>
              <td><span className="t-dur">18 min</span></td>
              <td><span className="st st-ok">En service</span></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="tfoot">
        <span id="linCount">8 lignes affichées · horaires donnés à titre indicatif</span>
        <span>Billets en vente en gare, aux bornes automatiques</span>
      </div>
    </div>
  </div>
</section>

{/* ===== GARES ===== */}
<section className="section" id="gares">
  <div className="wrap">
    <div className="shead">
      <span className="eyebrow">Gares &amp; services</span>
      <h2 className="stitle">Les grandes gares du réseau</h2>
      <p className="slede">Chaque gare est équipée de bornes automatiques pour l'achat des titres, d'un accès pour les personnes à mobilité réduite et de l'affichage des horaires en temps réel.</p>
    </div>

    <div className="gares">
      <div className="gare">
        <div className="gh">
          <span className="gi" style={{background: "var(--navy)"}}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 9l8-5 8 5v11H4V9Z" /><path d="M9 20v-5h6v5M4 9h16" /></svg></span>
          <div>
            <h3>Townsend — Gare centrale</h3>
            <div className="role">Cœur du réseau · correspondance de toutes les lignes</div>
            <div className="glines"><span className="bullet" style={{background: "var(--l-r1)"}}>R1</span><span className="bullet" style={{background: "var(--l-r2)"}}>R2</span><span className="bullet" style={{background: "var(--l-ic1)"}}>IC1</span><span className="bullet" style={{background: "var(--l-ic2)"}}>IC2</span><span className="bullet" style={{background: "var(--l-t)"}}>T</span><span className="bullet" style={{background: "var(--l-bus)"}}>BUS</span></div>
          </div>
        </div>
        <div className="gb">
          <div className="serv">
            <span className="s"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-5 9 5v6l-9 5-9-5V9Z" /></svg> Bornes de vente</span>
            <span className="s"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="4.5" r="2" /><path d="M12 7v6m0 0 4 6m-4-6-4 6m-1-9h10" /></svg> Accessibilité PMR</span>
            <span className="s"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M9 16V8h4a3 3 0 0 1 0 6H9" /></svg> Parking</span>
            <span className="s"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="6" cy="17" r="3" /><circle cx="18" cy="17" r="3" /><path d="M9 17h6l-3-7h4" /></svg> Vélos</span>
            <span className="s"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></svg> Accueil &amp; guichets</span>
          </div>
        </div>
      </div>

      <div className="gare">
        <div className="gh">
          <span className="gi" style={{background: "var(--l-r2)"}}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 9l8-5 8 5v11H4V9Z" /><path d="M9 20v-5h6v5M4 9h16" /></svg></span>
          <div>
            <h3>Knoxville</h3>
            <div className="role">Correspondance majeure · est du Tennessee</div>
            <div className="glines"><span className="bullet" style={{background: "var(--l-r2)"}}>R2</span><span className="bullet" style={{background: "var(--l-r3)"}}>R3</span><span className="bullet" style={{background: "var(--l-r4)"}}>R4</span><span className="bullet" style={{background: "var(--l-ic1)"}}>IC1</span><span className="bullet" style={{background: "var(--l-ic2)"}}>IC2</span></div>
          </div>
        </div>
        <div className="gb">
          <div className="serv">
            <span className="s"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-5 9 5v6l-9 5-9-5V9Z" /></svg> Bornes de vente</span>
            <span className="s"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="4.5" r="2" /><path d="M12 7v6m0 0 4 6m-4-6-4 6m-1-9h10" /></svg> Accessibilité PMR</span>
            <span className="s"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M9 16V8h4a3 3 0 0 1 0 6H9" /></svg> Parking</span>
            <span className="s"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="5" width="16" height="14" rx="2" /><path d="M8 19v-4h8v4" /></svg> Salle d'attente</span>
          </div>
        </div>
      </div>

      <div className="gare">
        <div className="gh">
          <span className="gi" style={{background: "var(--l-ic1)"}}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 9l8-5 8 5v11H4V9Z" /><path d="M9 20v-5h6v5M4 9h16" /></svg></span>
          <div>
            <h3>Nashville</h3>
            <div className="role">Terminus ouest · liaisons InterCité</div>
            <div className="glines"><span className="bullet" style={{background: "var(--l-ic1)"}}>IC1</span><span className="bullet" style={{background: "var(--l-ic2)"}}>IC2</span></div>
          </div>
        </div>
        <div className="gb">
          <div className="serv">
            <span className="s"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-5 9 5v6l-9 5-9-5V9Z" /></svg> Bornes de vente</span>
            <span className="s"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="4.5" r="2" /><path d="M12 7v6m0 0 4 6m-4-6-4 6m-1-9h10" /></svg> Accessibilité PMR</span>
            <span className="s"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M5 12l4-4M5 12l4 4" /></svg> Correspondances urbaines</span>
          </div>
        </div>
      </div>

      <div className="gare">
        <div className="gh">
          <span className="gi" style={{background: "var(--l-r4)"}}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 9l8-5 8 5v11H4V9Z" /><path d="M9 20v-5h6v5M4 9h16" /></svg></span>
          <div>
            <h3>Chattanooga</h3>
            <div className="role">Terminus sud · corridor R4</div>
            <div className="glines"><span className="bullet" style={{background: "var(--l-r4)"}}>R4</span></div>
          </div>
        </div>
        <div className="gb">
          <div className="serv">
            <span className="s"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-5 9 5v6l-9 5-9-5V9Z" /></svg> Bornes de vente</span>
            <span className="s"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="4.5" r="2" /><path d="M12 7v6m0 0 4 6m-4-6-4 6m-1-9h10" /></svg> Accessibilité PMR</span>
            <span className="s"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M9 16V8h4a3 3 0 0 1 0 6H9" /></svg> Parking</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

{/* ===== DESSERVIR TOWNSEND ===== */}
<section className="section navy" id="townsend">
  <div className="wrap">
    <div className="shead">
      <span className="eyebrow">Desservir Townsend</span>
      <h2 className="stitle">Deux services pour les déplacements du quotidien</h2>
      <p className="slede">À l'intérieur de Townsend, le train urbain (Ligne T) et la ligne de bus assurent la desserte locale, de l'hôpital aux quartiers résidentiels. Tous deux sont en correspondance avec l'ensemble du réseau à la gare centrale.</p>
    </div>

    <div className="loc-grid">
      {/* Train urbain */}
      <div className="loc-card" style={{"--ln": "var(--l-t)"} as React.CSSProperties}>
        <div className="lh">
          <span className="bullet" style={{background: "var(--l-t)"}}>T</span>
          <div><h3>Train urbain de Townsend</h3><div className="sub">Ligne T · ★ première ligne historique de TTE</div></div>
        </div>
        <p className="loc-desc">C'est ici que tout a commencé : la Ligne T est la ligne fondatrice de Townsend Transit Express, le berceau du réseau. Elle relie la gare centrale, son arrêt principal, au quartier résidentiel puis à l'hôpital TMC en une douzaine de minutes, et reste l'épine dorsale des déplacements locaux.</p>
        <div className="stops">
          <div className="stop"><span className="mk"><i className="maj"></i></span><div><div className="nm">🚉 Gare centrale</div><div className="ds">Arrêt principal · correspondance avec tout le réseau</div></div></div>
          <div className="stop"><span className="mk"><i></i></span><div><div className="nm">🏘️ Quartier résidentiel</div><div className="ds">Principale zone d'habitation</div></div></div>
          <div className="stop"><span className="mk"><i className="maj"></i></span><div><div className="nm">🏥 Hôpital TMC</div><div className="ds">Terminus · accès à l'hôpital</div></div></div>
        </div>
        <div className="loc-meta">
          <span className="m">Fréquence <b>toutes les 15 min</b></span>
          <span className="m">Service <b>05:00 – 00:00</b></span>
          <span className="m">Trajet <b>~12 min</b></span>
        </div>
      </div>

      {/* Bus */}
      <div className="loc-card" style={{"--ln": "var(--l-bus)"} as React.CSSProperties}>
        <div className="lh">
          <span className="bullet" style={{background: "var(--l-bus)"}}>BUS</span>
          <div><h3>Bus local de Townsend</h3><div className="sub">Desserte de proximité</div></div>
        </div>
        <p className="loc-desc">Le bus dessert l'ensemble de Townsend, au plus près des habitations, en complément du train urbain. Son arrêt principal est la gare centrale, en correspondance avec tout le réseau.</p>
        <div className="stops">
          <div className="stop"><span className="mk"><i className="maj"></i></span><div><div className="nm">🚉 Gare centrale</div><div className="ds">Arrêt principal · correspondance avec tout le réseau</div></div></div>
          <div className="stop"><span className="mk"><i></i></span><div><div className="nm">🏘️ Quartier résidentiel</div><div className="ds">Plusieurs arrêts de proximité</div></div></div>
          <div className="stop"><span className="mk"><i></i></span><div><div className="nm">🏙️ Autres arrêts dans Townsend</div><div className="ds">Desserte au plus près des habitations</div></div></div>
          <div className="stop"><span className="mk"><i className="maj"></i></span><div><div className="nm">🏥 Arrêt Hôpital TMC</div><div className="ds">Accès à l'hôpital</div></div></div>
        </div>
        <div className="loc-meta">
          <span className="m">Fréquence <b>toutes les 20 min</b></span>
          <span className="m">Service <b>06:00 – 22:00</b></span>
          <span className="m">Trajet <b>18 min</b></span>
        </div>
      </div>
    </div>
  </div>
</section>

{/* ===== ACTUALITÉS ===== */}
<section className="section alt" id="actus">
  <div className="wrap">
    <div className="shead row">
      <div>
        <span className="eyebrow">Actualités du réseau</span>
        <h2 className="stitle">Les dernières informations TTE</h2>
      </div>
      <a className="linkmore" href="#">Toutes les actualités →</a>
    </div>

    <div className="news">
      <article className="na">
        <div className="ni" style={{background: "var(--l-t)"}}></div>
        <div className="nb">
          <div className="meta"><span className="tag" style={{background: "rgba(154,107,22,.14)", color: "#7A540F"}}>Histoire</span><span className="date">18 juin 2026</span></div>
          <h3>La Ligne T, là où tout a commencé pour TTE</h3>
          <p>Retour sur la première ligne historique de la société : le train urbain de Townsend, d'où est né l'ensemble du réseau régional et InterCité d'aujourd'hui.</p>
          <span className="more">Lire la suite →</span>
        </div>
      </article>

      <article className="na">
        <div className="ni" style={{background: "var(--l-bus)"}}></div>
        <div className="nb">
          <div className="meta"><span className="tag" style={{background: "rgba(198,138,28,.16)", color: "#8A5E12"}}>Service</span><span className="date">12 juin 2026</span></div>
          <h3>Renfort de la desserte locale en bus à Townsend</h3>
          <p>La ligne de bus complète désormais le train urbain et dessert l'ensemble de Townsend, avec la gare centrale pour arrêt principal.</p>
          <span className="more">Lire la suite →</span>
        </div>
      </article>

      <article className="na">
        <div className="ni" style={{background: "var(--l-r4)"}}></div>
        <div className="nb">
          <div className="meta"><span className="tag" style={{background: "var(--warn-bg)", color: "#8A5A12"}}>Info trafic</span><span className="date">28 juin 2026</span></div>
          <h3>Travaux sur la ligne R4 entre Athens et Cleveland</h3>
          <p>Des travaux entraînent un retard d'environ 10 minutes sur la R4 (Knoxville – Chattanooga). Les autres lignes circulent normalement.</p>
          <span className="more">Lire la suite →</span>
        </div>
      </article>
    </div>
  </div>
</section>

{/* ===== TARIFS ===== */}
<section className="section" id="tarifs">
  <div className="wrap">
    <div className="shead">
      <span className="eyebrow">Tarifs &amp; titres</span>
      <h2 className="stitle">Des titres simples, valables sur tout le réseau</h2>
    </div>

    <div className="notice">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>
      <p><b>Tarif unique sur l'ensemble du réseau.</b> Le même prix s'applique quelle que soit la destination et la ligne empruntée, correspondances comprises. Achat en gare aux bornes automatiques (CB ou espèces), pas de vente à bord.</p>
    </div>

    <div className="fares">
      <div className="fare">
        <div className="fare-nm">Billet unité</div>
        <div className="fare-pr">$50</div>
        <div className="fare-d">Un trajet sur n'importe quelle ligne du réseau, correspondances comprises.</div>
        <span className="fare-where">En vente en gare</span>
      </div>
      <div className="fare">
        <div className="fare-nm">Carnet de 5</div>
        <div className="fare-pr">$200</div>
        <div className="fare-d">Cinq trajets au prix de quatre. Idéal pour les déplacements occasionnels.</div>
        <span className="fare-where">En vente en gare</span>
      </div>
      <div className="fare">
        <div className="fare-nm">Carnet de 10</div>
        <div className="fare-pr">$350</div>
        <div className="fare-d">Dix trajets à tarif réduit, le meilleur rapport au voyage.</div>
        <span className="fare-where">En vente en gare</span>
      </div>
      <div className="fare">
        <div className="fare-nm">Pass journée</div>
        <div className="fare-pr">$150</div>
        <div className="fare-d">Trajets illimités pendant une journée, sur toutes les lignes.</div>
        <span className="fare-where">En vente en gare</span>
      </div>
      <div className="fare feat">
        <span className="fare-tag">Le plus choisi</span>
        <div className="fare-nm">Pass semaine</div>
        <div className="fare-pr">$800</div>
        <div className="fare-d">Sept jours de trajets illimités sur l'ensemble du réseau.</div>
        <span className="fare-where">En vente en gare</span>
      </div>
      <div className="fare">
        <div className="fare-nm">Pass mois</div>
        <div className="fare-pr">$2 500</div>
        <div className="fare-d">Trente jours de trajets illimités, pour les voyageurs réguliers.</div>
        <span className="fare-where">En vente en gare</span>
      </div>
    </div>

    <p style={{marginTop: "14px", fontSize: "14px", color: "var(--muted)"}}>Réductions applicables sur les billets unité et carnets : <b>enfant −50 %</b> (4–11 ans), <b>jeune 12–25 ans −30 %</b>, <b>senior 65+ −30 %</b>, gratuit pour les moins de 4 ans.</p>
  </div>
</section>

{/* ===== INFOS VOYAGEURS ===== */}
<section className="section alt" id="infos">
  <div className="wrap">
    <div className="shead">
      <span className="eyebrow">Infos voyageurs</span>
      <h2 className="stitle">Préparer et réussir votre voyage</h2>
    </div>

    <div className="amen">
      <span className="a"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0" /><circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" /></svg> Wi-Fi gratuit à bord</span>
      <span className="a"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="7" y="9" width="10" height="11" rx="2" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /></svg> Prises USB</span>
      <span className="a"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="4.5" r="2" /><path d="M12 7v6m0 0 4 6m-4-6-4 6m-1-9h10" /></svg> Accès PMR</span>
      <span className="a"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="6" cy="17" r="3" /><circle cx="18" cy="17" r="3" /><path d="M9 17h6l-3-7h4M12 10 9 6" /></svg> Vélos acceptés</span>
      <span className="a"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 5a2 2 0 1 1 4 0 2 2 0 0 1-4 0ZM5 9a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm14 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM8 20c0-3 2-5 4-5s4 2 4 5" /></svg> Animaux acceptés</span>
    </div>

    <div className="steps">
      <div className="step"><div className="n num">1</div><h4>Consultez les horaires</h4><p>En ligne sur cette page, ou sur les écrans et affiches en gare.</p></div>
      <div className="step"><div className="n num">2</div><h4>Achetez en gare</h4><p>À la borne automatique de la gare, par carte bancaire ou en espèces.</p></div>
      <div className="step"><div className="n num">3</div><h4>Validez votre titre</h4><p>Compostez ou présentez votre billet avant de monter à bord.</p></div>
      <div className="step"><div className="n num">4</div><h4>Voyagez</h4><p>Installez-vous et profitez du Tennessee par la fenêtre.</p></div>
    </div>

    <div className="help-row">
      <div className="help">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 4h3l2 5-2 1a11 11 0 0 0 5 5l1-2 5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" /></svg>
        <div><h4>Service Clientèle</h4><p>Du lundi au samedi, 7 h – 20 h.</p><a href="/contact">Ouvrir une demande</a></div>
      </div>
      <div className="help">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="4.5" r="2" /><path d="M12 7v6m0 0 4 6m-4-6-4 6m-1-9h10" /></svg>
        <div><h4>Accessibilité</h4><p>Gares et matériel adaptés aux personnes à mobilité réduite.</p><a href="tte-contact.html#accessibilite">Demander une assistance</a></div>
      </div>
      <div className="help">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18M8 15h4" /></svg>
        <div><h4>Objets trouvés</h4><p>Un objet oublié à bord ou en gare&nbsp;?</p><a href="tte-contact.html#objets">Faire une déclaration</a></div>
      </div>
    </div>
  </div>
</section>

{/* ===== HISTOIRE & ENGAGEMENT ===== */}
<section className="section" id="engagement">
  <div className="wrap">
    <div className="shead">
      <span className="eyebrow">Notre histoire &amp; nos engagements</span>
      <h2 className="stitle">D'une ligne urbaine à un réseau régional</h2>
      <p className="slede">Townsend Transit Express est né d'une seule ligne de train urbain, la Ligne T, ouverte pour relier la gare au quartier résidentiel et à l'hôpital. Plus d'un siècle plus tard, c'est tout l'est du Tennessee qui voyage sur nos rails — sans renier ce qui a tout commencé.</p>
    </div>

    <div className="eng-grid">
      <div className="eng-block">
        <h3><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 8v5l3 2" /><circle cx="12" cy="12" r="9" /></svg> Notre histoire</h3>
        <div className="timeline">
          <div className="tl-item origin">
            <div className="tl-year">1921 · LIGNE T</div>
            <div className="tl-title">La première ligne, à Townsend</div>
            <div className="tl-desc">Ouverture du train urbain entre la gare et l'hôpital TMC. C'est la ligne fondatrice de TTE, encore en service aujourd'hui, toutes les 15 minutes.</div>
          </div>
          <div className="tl-item">
            <div className="tl-year">1948 · R1 / R2</div>
            <div className="tl-title">Extension vers les Smokies et Knoxville</div>
            <div className="tl-desc">Premières lignes régionales : vers Sevierville par les vallées des Smokies, et vers Knoxville par Maryville.</div>
          </div>
          <div className="tl-item">
            <div className="tl-year">1973 · R3 / R4</div>
            <div className="tl-title">Le corridor est-sud du Tennessee</div>
            <div className="tl-desc">Mise en service des liaisons Knoxville–Greeneville (R3) et Knoxville–Chattanooga (R4).</div>
          </div>
          <div className="tl-item">
            <div className="tl-year">1996 · IC1</div>
            <div className="tl-title">Premier InterCité vers Nashville</div>
            <div className="tl-desc">TTE devient un opérateur inter-régional avec une liaison directe vers la capitale de l'État.</div>
          </div>
          <div className="tl-item">
            <div className="tl-year">2019 · IC2</div>
            <div className="tl-title">Smoky Express, la liaison rapide</div>
            <div className="tl-desc">Lancement du Smoky Express : Townsend–Nashville en 3 h 20 avec arrêt rapide à Knoxville.</div>
          </div>
          <div className="tl-item">
            <div className="tl-year">2026 · AUJOURD'HUI</div>
            <div className="tl-title">Bus local &amp; modernisation</div>
            <div className="tl-desc">Le bus de Townsend complète la desserte locale ; modernisation du matériel et nouveaux écrans temps réel en gare.</div>
          </div>
        </div>
      </div>

      <div className="eng-block">
        <h3><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 2L4 7v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V7l-8-5Z" /><path d="M9 12l2 2 4-4" /></svg> Notre impact &amp; nos engagements</h3>
        <div className="impact">
          <div className="imp green">
            <div className="ic"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 20c5-3 9-9 11-17-8 2-14 6-17 11 2 2 4 4 6 6Z" /><path d="M3 21c4-3 7-6 10-9" /></svg></div>
            <b>−74 %</b>
            <span>de CO₂ émis vs trajet équivalent en voiture individuelle</span>
            <small>Base : voyageur seul, moyenne réseau 2025.</small>
          </div>
          <div className="imp">
            <div className="ic"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h4l2 5 4-12 2 7h6" /></svg></div>
            <b>96,3 %</b>
            <span>des trains à l'heure ou avec moins de 5 min de retard</span>
            <small>Moyenne 12 mois glissants, toutes lignes.</small>
          </div>
          <div className="imp green">
            <div className="ic"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8Z" /></svg></div>
            <b>82 %</b>
            <span>de la traction assurée par de l'électricité bas-carbone</span>
            <small>Mix énergétique fourni par TVA, exercice 2025.</small>
          </div>
          <div className="imp warn">
            <div className="ic"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 22h20L12 2Z" /><path d="M12 10v5M12 18h.01" /></svg></div>
            <b>0,02 %</b>
            <span>d'incidents de sécurité signalés à bord pour 100 000 trajets</span>
            <small>Présence de personnel formé sur toutes les lignes IC.</small>
          </div>
        </div>
      </div>
    </div>

    {/* ===== REJOINDRE TTE ===== */}
    <div className="hire" id="rejoindre">
      <div className="hire-l">
        <span className="eyebrow">Rejoignez-nous</span>
        <h3>Faire rouler le Tennessee, ça vous parle ?</h3>
        <p>Conducteurs, agents de gare, équipes de maintenance, contrôleurs, ingénieurs voie : TTE recrute toute l'année pour faire grandir le réseau. Formations rémunérées, mutations possibles entre dépôts, intéressement collectif.</p>
        <a className="hire-cta" href="#">Voir toutes nos offres <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12h14M13 5l7 7-7 7" /></svg></a>
      </div>
      <div className="jobs">
        <div className="job"><div><b>Conducteur·rice de train</b><span>Dépôt de Knoxville · CDI</span></div><span className="pill">12 postes</span></div>
        <div className="job"><div><b>Agent·e d'accueil en gare</b><span>Townsend, Nashville · CDI</span></div><span className="pill">5 postes</span></div>
        <div className="job"><div><b>Technicien·ne maintenance</b><span>Atelier de Maryville · CDI</span></div><span className="pill">8 postes</span></div>
        <div className="job"><div><b>Apprenti·e contrôleur·euse</b><span>Réseau régional · Alternance</span></div><span className="pill">6 postes</span></div>
      </div>
    </div>
  </div>
</section>

{/* ===== ESPACE EMPLOYÉS ===== */}
<section className="section staff-sec" id="employes">
  <div className="wrap">
    <div className="staff-in">
      <div className="staff-l">
        <span className="eyebrow">Personnel TTE</span>
        <h2>Espace réservé aux employés</h2>
        <p>Accédez à votre portail interne : planning de service, fiches de roulement, notes de service, bulletins de sécurité et documents ressources humaines. L'accès est strictement réservé au personnel autorisé de Townsend Transit Express.</p>
        <ul>
          <li>Planning &amp; roulements</li>
          <li>Fiches de service</li>
          <li>Notes de service</li>
          <li>Sécurité &amp; consignes</li>
          <li>Documents RH</li>
        </ul>
      </div>
      <div className="staff-card">
        <span className="lock"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="4" y="11" width="16" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg></span>
        <h3>Connexion personnel</h3>
        <p>Connectez-vous avec Discord pour accéder à l'intranet.</p>
        <a href="/espace-employes" className="btn btn-primary">Accéder à l'espace employés</a>
        <div className="hint">Accès réservé au personnel autorisé</div>
      </div>
    </div>
  </div>
</section>
</main>

{/* ===== BACK TO TOP ===== */}
<button className="backtop" id="backTop" aria-label="Remonter en haut de page" type="button"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M12 19V5M5 12l7-7 7 7" /></svg></button>

{/* ===== FOOTER ===== */}
<footer className="foot">
  <div className="wrap">
    <div className="foot-top">
      <div className="foot-brand">
        <svg className="logo-f" viewBox="0 0 156 44" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="TTE">
          <g fill="#4B92DD"><rect x="2" y="25" width="150" height="6" rx="3" opacity=".5" /><rect x="0" y="25" width="30" height="6" rx="3" /><rect x="126" y="25" width="30" height="6" rx="3" opacity=".6" /></g>
          <text x="4" y="34" fontFamily="'Libre Franklin',sans-serif" fontSize="35" fontWeight="800" fontStyle="italic" letterSpacing="-1.5" fill="#6FA8E8">TTE</text>
        </svg>
        <p>Townsend Transit Express — le réseau ferroviaire de l'est du Tennessee, au départ de Townsend et des Great Smoky Mountains.</p>
        <div className="addr">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="10" r="3" /><path d="M12 2a8 8 0 0 0-8 8c0 5.4 8 12 8 12s8-6.6 8-12a8 8 0 0 0-8-8Z" /></svg>
          <span>Siège social — Gare centrale, Townsend, Tennessee</span>
        </div>
      </div>

      <div className="fcol">
        <h4>Le réseau</h4>
        <a href="#lignes"><span className="ll" style={{background: "var(--l-ic2)"}}></span> IC2 · Smoky Express</a>
        <a href="#lignes"><span className="ll" style={{background: "var(--l-r1)"}}></span> R1 · Smokies</a>
        <a href="#lignes"><span className="ll" style={{background: "var(--l-r4)"}}></span> R4 · Chattanooga</a>
        <a href="#townsend"><span className="ll" style={{background: "var(--l-t)"}}></span> Ligne T · Townsend</a>
        <a href="#reseau">Plan du réseau</a>
      </div>

      <div className="fcol">
        <h4>Voyageurs</h4>
        <a href="#lignes">Lignes &amp; horaires</a>
        <a href="#tarifs">Tarifs &amp; titres</a>
        <a href="#infos">Acheter un billet</a>
        <a href="tte-contact.html#accessibilite">Accessibilité</a>
        <a href="#lignes">Info trafic</a>
      </div>

      <div className="fcol">
        <h4>Entreprise</h4>
        <a href="#engagement">Notre histoire</a>
        <a href="#rejoindre">Recrutement</a>
        <a href="tte-contact.html#presse">Presse</a>
        <a href="/espace-employes">Espace employés</a>
        <a href="/contact">Nous contacter</a>
      </div>
    </div>

    <div className="foot-bot">
      <p>© 2026 Townsend Transit Express. Tous droits réservés.</p>
      <div className="links">
        <a href="#">Mentions légales</a>
        <a href="#">Conditions de transport</a>
        <a href="#">Confidentialité</a>
        <a href="#">Plan du site</a>
      </div>
    </div>
  </div>
</footer>



    </>
  );
}
