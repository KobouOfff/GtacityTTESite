import { useEffect, useState, type CSSProperties as _CSS } from "react";
import * as React from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import "./Accueil.css";
import { script } from "./Accueil.script";
import { trafficPublicScript } from "./AccueilTrafficShared.script";
import { timetablePublicScript } from "./AccueilTimetableShared.script";
import { DiscordAuthButton, useCurrentUser } from "@/components/DiscordAuth";
import { TTELogo } from "@/components/TTELogo";
import NetworkMap from "@/components/NetworkMap";
import { T } from "@/components/T";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { SUBSCRIPTION_PLANS, type SubscriptionPlan } from "@/lib/subscription-plans";
import { SubscriptionPayModal } from "@/components/SubscriptionPayModal";
import { LoginRequiredModal } from "@/components/LoginRequiredModal";
import { getMyLoyaltyAccount, startSubscriptionPurchase } from "@/lib/loyalty.functions";

export default function AccueilPage() {
  const { lang, t, toggleLang } = useLanguage();
  const { data: user } = useCurrentUser();
  const [activePlan, setActivePlan] = useState<SubscriptionPlan | null>(null);
  const [loginPromptPlan, setLoginPromptPlan] = useState<SubscriptionPlan | null>(null);
  const planById = (id: SubscriptionPlan["id"]) => SUBSCRIPTION_PLANS.find((p) => p.id === id)!;

  const loyaltyQuery = useQuery({
    queryKey: ["my-loyalty-account"],
    queryFn: () => getMyLoyaltyAccount(),
    enabled: !!user,
    staleTime: 30_000,
  });

  const purchaseMutation = useMutation({
    mutationFn: (planId: SubscriptionPlan["id"]) => startSubscriptionPurchase({ data: { planId } }),
    onSuccess: () => { loyaltyQuery.refetch(); },
  });

  function handleBuyClick(plan: SubscriptionPlan) {
    if (!user) {
      setLoginPromptPlan(plan);
      return;
    }
    setActivePlan(plan);
    purchaseMutation.mutate(plan.id);
  }

  const myPoints = loyaltyQuery.data?.ok ? loyaltyQuery.data.account?.points ?? 0 : null;

  useEffect(() => {
    const el = document.createElement("script");
    el.textContent = script + trafficPublicScript + timetablePublicScript;
    document.body.appendChild(el);
    return () => { el.remove(); };
  }, []);

  return (
    <>

<a className="skip" href="#main"><T fr="Aller au contenu principal" en="Skip to main content" /></a>

{/* ===== UTILITY BAR ===== */}
<div className="util">
  <div className="util-in">
    <div className="util-grp u-left">
      <a href="#reseau"><T fr="Plan du réseau" en="Network map" /></a>
      <a href="#lignes"><T fr="Horaires" en="Timetables" /></a>
      <a href="#gares"><T fr="Gares & services" en="Stations & services" /></a>
      <a href="/trafic"><T fr="Info trafic" en="Service status" /></a>
      <a href="/contact"><T fr="Aide & contact" en="Help & contact" /></a>
    </div>
    <div className="util-grp" style={{ alignItems: "center", gap: 12 }}>
      <a className="staff" href="/espace-employes">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="4" y="11" width="16" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
        <T fr="Espace employés" en="Staff area" />
      </a>
      <DiscordAuthButton />
      <span className="sep"></span>
      <button
        type="button"
        className="lang"
        onClick={toggleLang}
        style={{ background: "none", border: "none", cursor: "pointer", font: "inherit", color: "inherit" }}
      >
        {lang === "en" ? "🇺🇸 EN" : "🇫🇷 FR"}
      </button>
    </div>
  </div>
</div>

{/* ===== HEADER ===== */}
<header className="hdr" id="hdr">
  <div className="hdr-in">
    <a href="/" className="brand" aria-label={t("Townsend Transit Express — accueil", "Townsend Transit Express — home")}>
      <TTELogo className="logo" />
      <span className="brand-tx">
        <span className="nm">Townsend Transit Express</span>
        <span className="tg"><T fr="Réseau ferroviaire du Tennessee" en="Tennessee rail network" /></span>
      </span>
    </a>
    <nav className="mainnav" id="mainnav">
      <a href="#reseau"><T fr="Réseau" en="Network" /></a>
      <a href="#lignes"><T fr="Lignes & horaires" en="Lines & timetables" /></a>
      <a href="#gares"><T fr="Gares" en="Stations" /></a>
      <a href="#townsend">Townsend</a>
      <a href="#tarifs"><T fr="Tarifs" en="Fares" /></a>
      <a href="/bus"><T fr="Bus" en="Bus" /></a>
      <a href="/histoire"><T fr="Histoire" en="History" /></a>
      <a href="#infos"><T fr="Infos voyageurs" en="Traveller info" /></a>
      <a href="/trafic"><T fr="Trafic" en="Service status" /></a>
    </nav>
    <div className="hdr-sp"></div>
    <div className="hdr-act">
      <a href="#finder" className="btn btn-primary"><T fr="Rechercher un horaire" en="Search a timetable" /></a>
      <button className="burger" id="burger" aria-label={t("Ouvrir le menu", "Open menu")}><span></span><span></span><span></span></button>
    </div>
  </div>
</header>

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
      <span className="hero-eyebrow"><T fr="Au départ de Townsend · Tennessee" en="Departing from Townsend · Tennessee" /></span>
      <h1><T fr={<>Le réseau ferroviaire au cœur des Great&nbsp;Smoky&nbsp;Mountains</>} en={<>The rail network at the heart of the Great&nbsp;Smoky&nbsp;Mountains</>} /></h1>
      <p className="lead">
        <T
          fr="Trains régionaux, lignes InterCité et desserte locale de Townsend : Townsend Transit Express relie l'est du Tennessee, de Chattanooga à Nashville, autour de sa gare centrale."
          en="Regional trains, Intercity lines, and local Townsend service: Townsend Transit Express connects eastern Tennessee, from Chattanooga to Nashville, around its central station."
        />
      </p>
      <div className="hero-stats">
        <div className="hstat"><b className="num">8</b><span><T fr="lignes en service" en="lines in service" /></span></div>
        <div className="hstat"><b className="num">26</b><span><T fr="gares & arrêts" en="stations & stops" /></span></div>
        <div className="hstat"><b className="num"><T fr="3 h 20" en="3h 20m" /></b><span>Townsend → Nashville</span></div>
      </div>
      <div className="hero-chips">
        <span className="chip"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M3 9l9-5 9 5v6l-9 5-9-5V9Z" /><path d="M8 12h8" /></svg> <T fr="Billets en vente en gare" en="Tickets sold at stations" /></span>
        <span className="chip"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="4.5" r="2" /><path d="M12 7v6m0 0 4 6m-4-6-4 6m-1-9h10" /></svg> <T fr="Réseau accessible PMR" en="Wheelchair-accessible network" /></span>
        <span className="chip"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0" /><circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" /></svg> <T fr="Wi-Fi gratuit à bord" en="Free Wi-Fi on board" /></span>
      </div>
    </div>

    {/* RECHERCHE D'HORAIRES */}
    <div className="finder" id="finder">
      <div className="finder-h">
        <span className="ic">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
        </span>
        <span><b><T fr="Rechercher un horaire" en="Search a timetable" /></b><small><T fr="Consultez les départs entre deux gares" en="Check departures between two stations" /></small></span>
      </div>
      <div className="finder-b">
        <div className="f-field">
          <label htmlFor="fFrom"><T fr="Gare de départ" en="Departure station" /></label>
          <div className="f-input">
            <span className="pin"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="10" r="3" /><path d="M12 2a8 8 0 0 0-8 8c0 5.4 8 12 8 12s8-6.6 8-12a8 8 0 0 0-8-8Z" /></svg></span>
            <input id="fFrom" type="text" placeholder="Townsend" value="Townsend" autoComplete="off" list="stations" />
          </div>
        </div>
        <div className="f-swap"><button id="fSwap" aria-label={t("Inverser les gares", "Swap stations")}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M7 4v16M7 4l-3 3M7 4l3 3M17 20V4M17 20l-3-3M17 20l3-3" /></svg></button></div>
        <div className="f-field">
          <label htmlFor="fTo"><T fr="Gare d'arrivée" en="Arrival station" /></label>
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
          <label><T fr="Date, heure & voyageurs" en="Date, time & travellers" /></label>
          <div className="f-row3">
            <div className="f-input"><input id="fDate" type="date" aria-label={t("Date du voyage", "Date of travel")} /></div>
            <div className="f-input"><input id="fTime" type="time" aria-label={t("Heure de départ", "Departure time")} /></div>
            <div className="f-input">
              <select id="fPax" aria-label={t("Nombre de voyageurs", "Number of travellers")}>
                <option value="1">1 {t("voy.", "traveller")}</option>
                <option value="2">2 {t("voy.", "travellers")}</option>
                <option value="3">3 {t("voy.", "travellers")}</option>
                <option value="4">4 {t("voy.", "travellers")}</option>
                <option value="5">5 {t("voy.", "travellers")}</option>
              </select>
            </div>
          </div>
        </div>
        <div className="f-field" style={{marginBottom: "6px"}}>
          <label htmlFor="fProf"><T fr="Tarif voyageur" en="Traveller fare" /></label>
          <div className="f-input">
            <select id="fProf" aria-label={t("Profil voyageur", "Traveller profile")}>
              <option value="adulte">{t("Adulte — plein tarif", "Adult — full fare")}</option>
              <option value="enfant">{t("Enfant 4–11 ans — 50 %", "Child 4–11 — 50% off")}</option>
              <option value="jeune">{t("Jeune 12–25 ans — 30 %", "Young adult 12–25 — 30% off")}</option>
              <option value="senior">{t("Senior 65+ — 30 %", "Senior 65+ — 30% off")}</option>
              <option value="pmr">{t("PMR — accompagnant gratuit", "Reduced mobility — companion free")}</option>
            </select>
          </div>
        </div>
        <button className="btn btn-primary" id="fGo"><T fr="Voir les horaires & tarifs" en="See timetables & fares" /></button>
        <div className="finder-note">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>
          <span>
            <T
              fr={<>Billets en vente <b>uniquement en gare</b>, aux bornes automatiques. Cet outil affiche les horaires et le tarif indicatif.</>}
              en={<>Tickets sold <b>only at stations</b>, from ticket machines. This tool shows timetables and an indicative fare.</>}
            />
          </span>
        </div>
      </div>
      <div className="f-results" id="fResults"></div>
    </div>
  </div>
</section>

{/* ===== DEPARTURE BOARD ===== */}
<aside className="depboard" aria-label={t("Prochains départs en gare centrale de Townsend", "Next departures at Townsend central station")}>
  <div className="depboard-in">
    <div className="dep-head">
      <div className="dt">
        <b><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg> <T fr="Prochains départs · Gare centrale de Townsend" en="Next departures · Townsend central station" /></b>
        <small><T fr="Mis à jour en direct · les horaires défilent en temps réel" en="Updated live · times scroll in real time" /></small>
      </div>
      <div className="clock" id="depClock" aria-live="off">--:--</div>
    </div>
    <div className="dep-wrap">
      <table className="dep-table" id="depTable">
        <thead><tr><th><T fr="Départ" en="Departure" /></th><th><T fr="Ligne" en="Line" /></th><th>Destination</th><th className="r"><T fr="Voie" en="Platform" /></th><th className="r"><T fr="État" en="Status" /></th></tr></thead>
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
      <h3><T fr="Lignes & horaires" en="Lines & timetables" /></h3>
      <p><T fr="Toutes les lignes du réseau et leurs départs." en="All the network's lines and their departures." /></p>
    </a>
    <a className="tile" href="#reseau">
      <span className="ic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 4 4 6v14l5-2 6 2 5-2V4l-5 2-6-2Z" /><path d="M9 4v14M15 6v14" /></svg></span>
      <h3><T fr="Plan du réseau" en="Network map" /></h3>
      <p><T fr="Visualisez l'ensemble des lignes et gares." en="View the whole network of lines and stations." /></p>
    </a>
    <a className="tile" href="#tarifs">
      <span className="ic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-5 9 5v6l-9 5-9-5V9Z" /><path d="M8 12h8" /></svg></span>
      <h3><T fr="Tarifs & titres" en="Fares & tickets" /></h3>
      <p><T fr="Billets, carnets et abonnements." en="Tickets, multi-ride books, and passes." /></p>
    </a>
    <a className="tile" href="#infos">
      <span className="ic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg></span>
      <h3><T fr="Infos voyageurs" en="Traveller info" /></h3>
      <p><T fr="Achat, services à bord et accessibilité." en="Buying tickets, on-board services, and accessibility." /></p>
    </a>
    <a className="tile" href="/bus">
      <span className="ic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="6" width="18" height="12" rx="3" /><path d="M3 13h18M7 18v1.5M17 18v1.5" /><circle cx="7.5" cy="15.5" r="1" fill="currentColor" stroke="none" /><circle cx="16.5" cy="15.5" r="1" fill="currentColor" stroke="none" /></svg></span>
      <h3><T fr="Nouvelles lignes de bus" en="New bus lines" /> <span className="hist-tag">{"★ " }<T fr="Nouveau" en="New" /></span></h3>
      <p><T fr="Ligne 1 Centre-Ville et Ligne 2 Secteur Rural, en correspondance avec le train." en="Downtown Line 1 and Rural Line 2, connecting with the train." /></p>
    </a>
  </div>
</div>

{/* ===== RÉSEAU ===== */}
<section className="section" id="reseau">
  <div className="wrap">
    <div className="shead">
      <span className="eyebrow"><T fr="Le réseau" en="The network" /></span>
      <h2 className="stitle"><T fr="Un réseau centré sur Townsend, ouvert sur tout le Tennessee" en="A network centred on Townsend, open to all of Tennessee" /></h2>
      <p className="slede">
        <T
          fr="Les lignes rayonnent depuis la gare centrale de Townsend : vers Sevierville et les vallées des Smokies, vers Knoxville et l'est de l'État, vers Chattanooga au sud et jusqu'à Nashville à l'ouest. À l'intérieur de Townsend, un train urbain et une ligne de bus assurent la desserte locale."
          en="Lines radiate out from Townsend central station: towards Sevierville and the Smoky Mountain valleys, towards Knoxville and the east of the state, towards Chattanooga to the south, and as far as Nashville to the west. Within Townsend itself, an urban train and a bus line provide local service."
        />
      </p>
    </div>

    <div className="statusboard">
      <div className="sb-head">
        <b><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M3 12h4l2 5 4-12 2 7h6" /></svg> <T fr="État du réseau" en="Network status" /></b>
        <span className="live"><span className="dot"></span> <T fr="Mis à jour à l'instant" en="Updated just now" /></span>
      </div>
      <div className="sb-grid">
        <div className="sb-item"><span className="bullet" style={{background: "var(--l-r1)"}}>R1</span><span className="nm"><T fr="Vallées des Smokies" en="Smoky Mountain valleys" /></span><span className="sb-dot ok" title={t("À l'heure", "On time")}></span></div>
        <div className="sb-item"><span className="bullet" style={{background: "var(--l-r2)"}}>R2</span><span className="nm">Knoxville</span><span className="sb-dot ok"></span></div>
        <div className="sb-item"><span className="bullet" style={{background: "var(--l-r3)"}}>R3</span><span className="nm"><T fr="Est Tennessee" en="East Tennessee" /></span><span className="sb-dot ok"></span></div>
        <div className="sb-item"><span className="bullet" style={{background: "var(--l-r4)"}}>R4</span><span className="nm">{t("Chattanooga · retard ~10 min", "Chattanooga · ~10 min delay")}</span><span className="sb-dot warn" title={t("Retard", "Delay")}></span></div>
        <div className="sb-item"><span className="bullet" style={{background: "var(--l-ic1)"}}>IC1</span><span className="nm">Nashville</span><span className="sb-dot ok"></span></div>
        <div className="sb-item"><span className="bullet" style={{background: "var(--l-ic2)"}}>IC2</span><span className="nm">Smoky Express</span><span className="sb-dot ok"></span></div>
        <div className="sb-item"><span className="bullet" style={{background: "var(--l-t)"}}>T</span><span className="nm"><T fr="Train urbain" en="Urban train" /></span><span className="sb-dot ok"></span></div>
        <div className="sb-item"><span className="bullet" style={{background: "var(--l-bus1)"}}>B1</span><span className="nm"><T fr="Centre-Ville" en="Downtown" /></span><span className="sb-dot ok"></span></div>
        <div className="sb-item"><span className="bullet" style={{background: "var(--l-bus2)"}}>B2</span><span className="nm"><T fr="Secteur Rural" en="Rural sector" /></span><span className="sb-dot ok"></span></div>
      </div>
    </div>

    <div className="net-grid">
      <div className="map-card">
        <div className="mh">
          <b><T fr="Plan schématique du réseau" en="Schematic network map" /></b>
          <span className="upd"><T fr="Mis à jour aujourd'hui" en="Updated today" /></span>
        </div>
        <NetworkMap />
      </div>

      <div className="net-side">
        <h3><T fr="Six lignes ferrées, une desserte locale" en="Six rail lines, one local service" /></h3>
        <p>
          <T
            fr="L'ossature du réseau repose sur le train : quatre lignes régionales (R1 à R4) et deux lignes InterCité (IC1 et IC2) relient les principales villes de l'est du Tennessee. Tout est né à Townsend avec la Ligne T, la première ligne historique de la société ; le réseau s'est ensuite construit autour d'elle, et une ligne de bus complète aujourd'hui la desserte locale."
            en="The backbone of the network is rail: four regional lines (R1 to R4) and two Intercity lines (IC1 and IC2) connect the main cities of eastern Tennessee. It all began in Townsend with Line T, the company's first historic line; the network was later built up around it, and a bus line now completes local service."
          />
        </p>
        <div className="net-figs">
          <div className="fig"><b className="num">6</b><span><T fr="lignes de train" en="rail lines" /></span></div>
          <div className="fig"><b className="num">2</b><span><T fr="services locaux à Townsend" en="local services in Townsend" /></span></div>
          <div className="fig"><b className="num">4</b><span><T fr="grandes villes reliées" en="major cities connected" /></span></div>
          <div className="fig"><b className="num">24/7</b><span><T fr="information trafic" en="service status info" /></span></div>
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
        <span className="eyebrow"><T fr="Lignes & horaires" en="Lines & timetables" /></span>
        <h2 className="stitle"><T fr="Toutes les lignes du réseau" en="All the network's lines" /></h2>
      </div>
      <div className="lin-head-actions">
        <button className="btn-ghost" id="printHoraires" type="button"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" rx="1" /></svg> <T fr="Imprimer les horaires" en="Print timetables" /></button>
        <a className="linkmore" href="#tarifs"><T fr="Voir les tarifs →" en="See fares →" /></a>
      </div>
    </div>

    <div className="feature">
      <div className="fx-l">
        <span className="eyebrow2"><T fr="★ Ligne vedette" en="★ Featured line" /></span>
        <h3>IC2 · Smoky Express</h3>
        <div className="rt">Townsend ↔ Nashville · <T fr="InterCité" en="Intercity" /></div>
        <p><T fr={<>La liaison la plus rapide du réseau : Townsend–Nashville en 3 h 20, avec un arrêt rapide à Knoxville. Trois allers-retours par jour dans chaque sens.</>} en={<>The network's fastest link: Townsend–Nashville in 3h 20m, with a quick stop in Knoxville. Three round trips a day in each direction.</>} /></p>
        <div className="deps"><span className="t">07:00</span><span className="t">13:00</span><span className="t">19:00</span></div>
      </div>
      <div className="fx-r">
        <div className="fx-stat"><span className="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg></span><div><b><T fr="3 h 20" en="3h 20m" /></b><span>Townsend → Nashville</span></div></div>
        <div className="fx-stat"><span className="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="3" width="16" height="14" rx="3" /><path d="M4 11h16M9 21l1.5-4M15 21l-1.5-4" /></svg></span><div><b><T fr="3 départs/jour" en="3 departures/day" /></b><span><T fr="dans chaque sens" en="each direction" /></span></div></div>
        <div className="fx-stat"><span className="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="10" r="3" /><path d="M12 2a8 8 0 0 0-8 8c0 5.4 8 12 8 12s8-6.6 8-12a8 8 0 0 0-8-8Z" /></svg></span><div><b><T fr="Arrêt rapide" en="Express stop" /></b><span>Knoxville · Cookeville · Lebanon</span></div></div>
      </div>
    </div>

    <div className="lin-tools">
      <input className="lin-search" id="linSearch" type="text" placeholder={t("Rechercher une ligne, une ville ou une gare…", "Search a line, city, or station…")} aria-label={t("Rechercher une ligne", "Search a line")} />
      <select className="lin-sel" id="linType" aria-label={t("Filtrer par type", "Filter by type")}>
        <option value="">{t("Tous les types", "All types")}</option>
        <option value="reg">{t("Train régional", "Regional train")}</option>
        <option value="ic">{t("InterCité", "Intercity")}</option>
        <option value="urb">{t("Train urbain", "Urban train")}</option>
        <option value="bus">Bus</option>
      </select>
    </div>

    <div className="tcard">
      <div className="tscroll">
        <table id="linTable">
          <thead><tr>
            <th><T fr="Ligne" en="Line" /></th><th><T fr="Type" en="Type" /></th><th><T fr="Trajet" en="Route" /></th><th><T fr="Service" en="Service" /></th><th><T fr="Durée" en="Duration" /></th><th><T fr="État" en="Status" /></th>
          </tr></thead>
          <tbody id="linBody">
            <tr data-type="reg" data-search="r1 townsend sevierville walland wears valley pigeon forge smokies regional">
              <td><span className="bullet" style={{background: "var(--l-r1)"}}>R1</span></td>
              <td><span className="t-type tt-reg">{t("Régional", "Regional")}</span></td>
              <td><div className="t-pair">Townsend → Sevierville</div><div className="t-via">via Walland · Wears Valley · Pigeon Forge</div></td>
              <td><span className="t-time">07:30</span><span className="t-time">10:00</span><span className="t-time">14:00</span><span className="t-time">17:30</span></td>
              <td><span className="t-dur">55 {t("min", "min")}</span></td>
              <td><span className="st st-ok">{t("À l'heure", "On time")}</span></td>
            </tr>
            <tr data-type="reg" data-search="r2 townsend mascot maryville alcoa knoxville strawberry plains regional">
              <td><span className="bullet" style={{background: "var(--l-r2)"}}>R2</span></td>
              <td><span className="t-type tt-reg">{t("Régional", "Regional")}</span></td>
              <td><div className="t-pair">Townsend → Mascot</div><div className="t-via">via Maryville · Alcoa · Knoxville · Strawberry Plains</div></td>
              <td><span className="t-time">06:00</span><span className="t-time">08:30</span><span className="t-time">12:00</span><span className="t-time">16:00</span><span className="t-time">19:30</span></td>
              <td><span className="t-dur"><T fr="1 h 45" en="1h 45m" /></span></td>
              <td><span className="st st-ok">{t("À l'heure", "On time")}</span></td>
            </tr>
            <tr data-type="reg" data-search="r3 knoxville greeneville jefferson city morristown est tennessee regional">
              <td><span className="bullet" style={{background: "var(--l-r3)"}}>R3</span></td>
              <td><span className="t-type tt-reg">{t("Régional", "Regional")}</span></td>
              <td><div className="t-pair">Knoxville → Greeneville</div><div className="t-via">via Jefferson City · Morristown</div></td>
              <td><span className="t-time">08:00</span><span className="t-time">13:00</span><span className="t-time">18:00</span></td>
              <td><span className="t-dur"><T fr="2 h 10" en="2h 10m" /></span></td>
              <td><span className="st st-ok">{t("À l'heure", "On time")}</span></td>
            </tr>
            <tr data-type="reg" data-search="r4 knoxville chattanooga lenoir city sweetwater athens cleveland corridor sud regional">
              <td><span className="bullet" style={{background: "var(--l-r4)"}}>R4</span></td>
              <td><span className="t-type tt-reg">{t("Régional", "Regional")}</span></td>
              <td><div className="t-pair">Knoxville → Chattanooga</div><div className="t-via">via Lenoir City · Sweetwater · Athens · Cleveland</div></td>
              <td><span className="t-time">07:00</span><span className="t-time">11:30</span><span className="t-time">15:00</span><span className="t-time">18:30</span></td>
              <td><span className="t-dur"><T fr="2 h 30" en="2h 30m" /></span></td>
              <td><span className="st st-ok">{t("À l'heure", "On time")}</span></td>
            </tr>
            <tr data-type="ic" data-search="ic1 intercite townsend nashville knoxville oak ridge crossville cookeville lebanon">
              <td><span className="bullet" style={{background: "var(--l-ic1)"}}>IC1</span></td>
              <td><span className="t-type tt-ic">{t("InterCité", "Intercity")}</span></td>
              <td><div className="t-pair">Townsend → Nashville</div><div className="t-via">via Knoxville · Oak Ridge · Crossville · Cookeville · Lebanon</div></td>
              <td><span className="t-time">06:30</span><span className="t-time">10:00</span><span className="t-time">14:30</span><span className="t-time">18:00</span></td>
              <td><span className="t-dur"><T fr="3 h 55" en="3h 55m" /></span></td>
              <td><span className="st st-ok">{t("À l'heure", "On time")}</span></td>
            </tr>
            <tr data-type="ic" data-search="ic2 smoky express intercite townsend nashville maryville knoxville cookeville lebanon">
              <td><span className="bullet" style={{background: "var(--l-ic2)"}}>IC2</span></td>
              <td><span className="t-type tt-ic">{t("InterCité", "Intercity")}</span></td>
              <td><div className="t-pair">Townsend ↔ Nashville <span style={{color: "var(--l-ic2)", fontWeight: "800"}}>· Smoky Express</span></div><div className="t-via">via Maryville · Knoxville ({t("arrêt rapide", "express stop")}) · Cookeville · Lebanon</div></td>
              <td><span className="t-time">07:00</span><span className="t-time">13:00</span><span className="t-time">19:00</span></td>
              <td><span className="t-dur"><T fr="3 h 20" en="3h 20m" /></span></td>
              <td><span className="st st-ok">{t("À l'heure", "On time")}</span></td>
            </tr>
            <tr data-type="urb" data-search="ligne t train urbain townsend gare centrale quartier residentiel hopital tmc historique origine premiere fondatrice berceau">
              <td><span className="bullet" style={{background: "var(--l-t)"}}>T</span></td>
              <td><span className="t-type tt-urb">{t("Train urbain", "Urban train")}</span></td>
              <td><div className="t-pair">{t("Gare centrale", "Central station")} → {t("Hôpital TMC", "TMC Hospital")} <span className="hist-tag">★ {t("Ligne d'origine", "Original line")}</span></div><div className="t-via">{t("via Quartier résidentiel · première ligne historique de TTE", "via the residential district · TTE's first historic line")}</div></td>
              <td><span className="t-time">{t("toutes les 15 min", "every 15 min")}</span><span className="t-time">05:00–00:00</span></td>
              <td><span className="t-dur">~12 {t("min", "min")}</span></td>
              <td><span className="st st-ok">{t("En service", "In service")}</span></td>
            </tr>
            <tr data-type="bus" data-search="bus 1 ligne 1 centre-ville depot motel prison zone industrielle hopital concession arlington gare diner mairie circuit">
              <td><span className="bullet" style={{background: "var(--l-bus1)"}}>B1</span></td>
              <td><span className="t-type tt-bus1">{t("Bus · Centre-ville", "Bus · Downtown")}</span></td>
              <td><div className="t-pair">{t("Circuit Centre-Ville", "Downtown loop")} <span className="hist-tag">{t("★ Nouvelle ligne", "★ New line")}</span></div><div className="t-via">{t("Dépôt Bus → Motel/Prison → Zone Indus. → Hôpital → Concession → Arlington → Gare/Diner → Mairie → Dépôt Bus", "Bus Depot → Motel/Prison → Industrial Zone → Hospital → Concession → Arlington → Station/Diner → City Hall → Bus Depot")}</div></td>
              <td><span className="t-time">{t("toutes les 20 min", "every 20 min")}</span><span className="t-time">06:00–22:00</span></td>
              <td><span className="t-dur">~40 {t("min", "min")} <T fr="(boucle)" en="(loop)" /></span></td>
              <td><span className="st st-ok">{t("En service", "In service")}</span></td>
            </tr>
            <tr data-type="bus" data-search="bus 2 ligne 2 secteur rural depot ferme fire dept camp voyage station service aller-retour">
              <td><span className="bullet" style={{background: "var(--l-bus2)"}}>B2</span></td>
              <td><span className="t-type tt-bus2">{t("Bus · Secteur rural", "Bus · Rural sector")}</span></td>
              <td><div className="t-pair">{t("Secteur Rural", "Rural sector")} <span className="hist-tag">{t("★ Nouvelle ligne", "★ New line")}</span></div><div className="t-via">{t("Dépôt Bus → Ferme → Fire Dept. → Camp Voyage → Station Service (aller-retour)", "Bus Depot → Farm → Fire Dept. → Camp Voyage → Gas Station (round trip)")}</div></td>
              <td><span className="t-time">{t("toutes les 40 min", "every 40 min")}</span><span className="t-time">06:00–20:00</span></td>
              <td><span className="t-dur">~25 {t("min", "min")}</span></td>
              <td><span className="st st-ok">{t("En service", "In service")}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="tfoot">
        <span id="linCount">{t("9 lignes affichées · horaires donnés à titre indicatif", "9 lines shown · timetables given for guidance only")}</span>
        <span><T fr="Billets en vente en gare, aux bornes automatiques" en="Tickets sold at stations, from ticket machines" /></span>
      </div>
    </div>
  </div>
</section>

{/* ===== GARES ===== */}
<section className="section" id="gares">
  <div className="wrap">
    <div className="shead">
      <span className="eyebrow"><T fr="Gares & services" en="Stations & services" /></span>
      <h2 className="stitle"><T fr="Les grandes gares du réseau" en="The network's main stations" /></h2>
      <p className="slede">
        <T
          fr="Chaque gare est équipée de bornes automatiques pour l'achat des titres, d'un accès pour les personnes à mobilité réduite et de l'affichage des horaires en temps réel."
          en="Every station is equipped with ticket machines, wheelchair access, and real-time timetable displays."
        />
      </p>
    </div>

    <div className="gares">
      <div className="gare">
        <div className="gh">
          <span className="gi" style={{background: "var(--navy)"}}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 9l8-5 8 5v11H4V9Z" /><path d="M9 20v-5h6v5M4 9h16" /></svg></span>
          <div>
            <h3><a href="/gares/townsend"><T fr="Townsend — Gare centrale" en="Townsend — Central station" /></a></h3>
            <div className="role"><T fr="Cœur du réseau · correspondance de toutes les lignes" en="Heart of the network · interchange for all lines" /></div>
            <div className="glines"><span className="bullet" style={{background: "var(--l-r1)"}}>R1</span><span className="bullet" style={{background: "var(--l-r2)"}}>R2</span><span className="bullet" style={{background: "var(--l-ic1)"}}>IC1</span><span className="bullet" style={{background: "var(--l-ic2)"}}>IC2</span><span className="bullet" style={{background: "var(--l-t)"}}>T</span><span className="bullet" style={{background: "var(--l-bus)"}}>BUS</span></div>
          </div>
        </div>
        <div className="gb">
          <div className="serv">
            <span className="s"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-5 9 5v6l-9 5-9-5V9Z" /></svg> <T fr="Bornes de vente" en="Ticket machines" /></span>
            <span className="s"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="4.5" r="2" /><path d="M12 7v6m0 0 4 6m-4-6-4 6m-1-9h10" /></svg> <T fr="Accessibilité PMR" en="Wheelchair access" /></span>
            <span className="s"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M9 16V8h4a3 3 0 0 1 0 6H9" /></svg> Parking</span>
            <span className="s"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="6" cy="17" r="3" /><circle cx="18" cy="17" r="3" /><path d="M9 17h6l-3-7h4" /></svg> <T fr="Vélos" en="Bicycles" /></span>
            <span className="s"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></svg> <T fr="Accueil & guichets" en="Information & ticket desks" /></span>
          </div>
        </div>
      </div>

      <div className="gare">
        <div className="gh">
          <span className="gi" style={{background: "var(--l-r2)"}}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 9l8-5 8 5v11H4V9Z" /><path d="M9 20v-5h6v5M4 9h16" /></svg></span>
          <div>
            <h3><a href="/gares/knoxville">Knoxville</a></h3>
            <div className="role"><T fr="Correspondance majeure · est du Tennessee" en="Major interchange · eastern Tennessee" /></div>
            <div className="glines"><span className="bullet" style={{background: "var(--l-r2)"}}>R2</span><span className="bullet" style={{background: "var(--l-r3)"}}>R3</span><span className="bullet" style={{background: "var(--l-r4)"}}>R4</span><span className="bullet" style={{background: "var(--l-ic1)"}}>IC1</span><span className="bullet" style={{background: "var(--l-ic2)"}}>IC2</span></div>
          </div>
        </div>
        <div className="gb">
          <div className="serv">
            <span className="s"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-5 9 5v6l-9 5-9-5V9Z" /></svg> <T fr="Bornes de vente" en="Ticket machines" /></span>
            <span className="s"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="4.5" r="2" /><path d="M12 7v6m0 0 4 6m-4-6-4 6m-1-9h10" /></svg> <T fr="Accessibilité PMR" en="Wheelchair access" /></span>
            <span className="s"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M9 16V8h4a3 3 0 0 1 0 6H9" /></svg> Parking</span>
            <span className="s"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="5" width="16" height="14" rx="2" /><path d="M8 19v-4h8v4" /></svg> <T fr="Salle d'attente" en="Waiting room" /></span>
          </div>
        </div>
      </div>

      <div className="gare">
        <div className="gh">
          <span className="gi" style={{background: "var(--l-ic1)"}}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 9l8-5 8 5v11H4V9Z" /><path d="M9 20v-5h6v5M4 9h16" /></svg></span>
          <div>
            <h3><a href="/gares/nashville">Nashville</a></h3>
            <div className="role"><T fr="Terminus ouest · liaisons InterCité" en="Western terminus · Intercity connections" /></div>
            <div className="glines"><span className="bullet" style={{background: "var(--l-ic1)"}}>IC1</span><span className="bullet" style={{background: "var(--l-ic2)"}}>IC2</span></div>
          </div>
        </div>
        <div className="gb">
          <div className="serv">
            <span className="s"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-5 9 5v6l-9 5-9-5V9Z" /></svg> <T fr="Bornes de vente" en="Ticket machines" /></span>
            <span className="s"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="4.5" r="2" /><path d="M12 7v6m0 0 4 6m-4-6-4 6m-1-9h10" /></svg> <T fr="Accessibilité PMR" en="Wheelchair access" /></span>
            <span className="s"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M5 12l4-4M5 12l4 4" /></svg> <T fr="Correspondances urbaines" en="Urban connections" /></span>
          </div>
        </div>
      </div>

      <div className="gare">
        <div className="gh">
          <span className="gi" style={{background: "var(--l-r4)"}}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 9l8-5 8 5v11H4V9Z" /><path d="M9 20v-5h6v5M4 9h16" /></svg></span>
          <div>
            <h3><a href="/gares/chattanooga">Chattanooga</a></h3>
            <div className="role"><T fr="Terminus sud · corridor R4" en="Southern terminus · R4 corridor" /></div>
            <div className="glines"><span className="bullet" style={{background: "var(--l-r4)"}}>R4</span></div>
          </div>
        </div>
        <div className="gb">
          <div className="serv">
            <span className="s"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-5 9 5v6l-9 5-9-5V9Z" /></svg> <T fr="Bornes de vente" en="Ticket machines" /></span>
            <span className="s"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="4.5" r="2" /><path d="M12 7v6m0 0 4 6m-4-6-4 6m-1-9h10" /></svg> <T fr="Accessibilité PMR" en="Wheelchair access" /></span>
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
      <span className="eyebrow"><T fr="Desservir Townsend" en="Serving Townsend" /></span>
      <h2 className="stitle"><T fr="Deux services pour les déplacements du quotidien" en="Two services for everyday travel" /></h2>
      <p className="slede">
        <T
          fr="À l'intérieur de Townsend, le train urbain (Ligne T) et la ligne de bus assurent la desserte locale, de l'hôpital aux quartiers résidentiels. Tous deux sont en correspondance avec l'ensemble du réseau à la gare centrale."
          en="Within Townsend, the urban train (Line T) and the bus line provide local service, from the hospital to residential neighbourhoods. Both connect with the whole network at the central station."
        />
      </p>
    </div>

    <div className="loc-grid">
      {/* Train urbain */}
      <div className="loc-card" style={{"--ln": "var(--l-t)"} as React.CSSProperties}>
        <div className="lh">
          <span className="bullet" style={{background: "var(--l-t)"}}>T</span>
          <div><h3><T fr="Train urbain de Townsend" en="Townsend urban train" /></h3><div className="sub"><T fr="Ligne T · ★ première ligne historique de TTE" en="Line T · ★ TTE's first historic line" /></div></div>
        </div>
        <p className="loc-desc">
          <T
            fr="C'est ici que tout a commencé : la Ligne T est la ligne fondatrice de Townsend Transit Express, le berceau du réseau. Elle relie la gare centrale, son arrêt principal, au quartier résidentiel puis à l'hôpital TMC en une douzaine de minutes, et reste l'épine dorsale des déplacements locaux."
            en="This is where it all began: Line T is the founding line of Townsend Transit Express, the cradle of the network. It links the central station, its main stop, to the residential district and then to TMC Hospital in around twelve minutes, and remains the backbone of local travel."
          />
        </p>
        <div className="stops">
          <div className="stop"><span className="mk"><i className="maj"></i></span><div><div className="nm">🚉 <T fr="Gare centrale" en="Central station" /></div><div className="ds"><T fr="Arrêt principal · correspondance avec tout le réseau" en="Main stop · connects with the whole network" /></div></div></div>
          <div className="stop"><span className="mk"><i></i></span><div><div className="nm">🏘️ <T fr="Quartier résidentiel" en="Residential district" /></div><div className="ds"><T fr="Principale zone d'habitation" en="Main residential area" /></div></div></div>
          <div className="stop"><span className="mk"><i className="maj"></i></span><div><div className="nm">🏥 <T fr="Hôpital TMC" en="TMC Hospital" /></div><div className="ds"><T fr="Terminus · accès à l'hôpital" en="Terminus · hospital access" /></div></div></div>
        </div>
        <div className="loc-meta">
          <span className="m"><T fr="Fréquence" en="Frequency" /> <b><T fr="toutes les 15 min" en="every 15 min" /></b></span>
          <span className="m"><T fr="Service" en="Operating hours" /> <b>05:00 – 00:00</b></span>
          <span className="m"><T fr="Trajet" en="Journey" /> <b>~12 {t("min", "min")}</b></span>
        </div>
      </div>

      {/* Bus */}
      <div className="loc-card" style={{"--ln": "var(--l-bus)"} as React.CSSProperties}>
        <div className="lh">
          <span className="bullet" style={{background: "var(--l-bus)"}}>BUS</span>
          <div><h3><T fr="Bus local de Townsend" en="Townsend local bus" /></h3><div className="sub"><T fr="Desserte de proximité" en="Local service" /></div></div>
        </div>
        <p className="loc-desc">
          <T
            fr="Le bus dessert l'ensemble de Townsend, au plus près des habitations, en complément du train urbain. Son arrêt principal est la gare centrale, en correspondance avec tout le réseau."
            en="The bus serves all of Townsend, reaching close to homes, complementing the urban train. Its main stop is the central station, connecting with the whole network."
          />
        </p>
        <div className="stops">
          <div className="stop"><span className="mk"><i className="maj"></i></span><div><div className="nm">🚉 <T fr="Gare centrale" en="Central station" /></div><div className="ds"><T fr="Arrêt principal · correspondance avec tout le réseau" en="Main stop · connects with the whole network" /></div></div></div>
          <div className="stop"><span className="mk"><i></i></span><div><div className="nm">🏘️ <T fr="Quartier résidentiel" en="Residential district" /></div><div className="ds"><T fr="Plusieurs arrêts de proximité" en="Several nearby stops" /></div></div></div>
          <div className="stop"><span className="mk"><i></i></span><div><div className="nm">🏙️ <T fr="Autres arrêts dans Townsend" en="Other stops in Townsend" /></div><div className="ds"><T fr="Desserte au plus près des habitations" en="Service close to homes" /></div></div></div>
          <div className="stop"><span className="mk"><i className="maj"></i></span><div><div className="nm">🏥 <T fr="Arrêt Hôpital TMC" en="TMC Hospital stop" /></div><div className="ds"><T fr="Accès à l'hôpital" en="Hospital access" /></div></div></div>
        </div>
        <div className="loc-meta">
          <span className="m"><T fr="Fréquence" en="Frequency" /> <b><T fr="toutes les 20 min" en="every 20 min" /></b></span>
          <span className="m"><T fr="Service" en="Operating hours" /> <b>06:00 – 22:00</b></span>
          <span className="m"><T fr="Trajet" en="Journey" /> <b>18 {t("min", "min")}</b></span>
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
        <span className="eyebrow"><T fr="Actualités du réseau" en="Network news" /></span>
        <h2 className="stitle"><T fr="Les dernières informations TTE" en="The latest from TTE" /></h2>
      </div>
      <a className="linkmore" href="#"><T fr="Toutes les actualités →" en="All news →" /></a>
    </div>

    <div className="news">
      <article className="na">
        <div className="ni" style={{background: "var(--l-r1)"}}></div>
        <div className="nb">
          <div className="meta"><span className="tag" style={{background: "rgba(31,158,85,.14)", color: "#146B39"}}><T fr="Tarifs" en="Fares" /></span><span className="date">{t("9 août 2026", "August 9, 2026")}</span></div>
          <h3><T fr="Baisse des tarifs sur tout le réseau TTE" en="Fares cut across the whole TTE network" /></h3>
          <p>
            <T
              fr={<>Bonne nouvelle pour tous les voyageurs : nos tarifs baissent. Le billet unité passe à <b>5 $</b>, le carnet de 5 à <b>20 $</b>, le carnet de 10 à <b>25 $</b>, le pass journée à <b>10 $</b>, le pass semaine à <b>75 $</b> et le pass mois à <b>275 $</b>.</>}
              en={<>Good news for all our riders: our fares are going down. The single ticket drops to <b>$5</b>, the book of 5 to <b>$20</b>, the book of 10 to <b>$25</b>, the day pass to <b>$10</b>, the weekly pass to <b>$75</b> and the monthly pass to <b>$275</b>.</>}
            />
          </p>
          <a className="more" href="#tarifs"><T fr="Voir tous les tarifs →" en="See all fares →" /></a>
        </div>
      </article>

      <article className="na">
        <div className="ni" style={{background: "var(--blue)"}}></div>
        <div className="nb">
          <div className="meta"><span className="tag" style={{background: "var(--blue-50)", color: "var(--blue-700)"}}><T fr="Service" en="Service" /></span><span className="date">{t("9 août 2026", "August 9, 2026")}</span></div>
          <h3><T fr="Bornes automatiques nouvelle génération dans toutes les gares" en="Next-generation ticket machines in every station" /></h3>
          <p>
            <T
              fr="Nos bornes de vente ont été modernisées : nouvel écran tactile plus rapide, paiement sans contact (carte et mobile), interface simplifiée en plusieurs langues et affichage des tarifs actualisés en temps réel."
              en="Our ticket machines have been modernised: a faster new touchscreen, contactless payment (card and mobile), a simplified multi-language interface, and real-time updated fares."
            />
          </p>
          <span className="more"><T fr="Lire la suite →" en="Read more →" /></span>
        </div>
      </article>

      <article className="na">
        <div className="ni" style={{background: "var(--l-t)"}}></div>
        <div className="nb">
          <div className="meta"><span className="tag" style={{background: "rgba(154,107,22,.14)", color: "#7A540F"}}><T fr="Histoire" en="History" /></span><span className="date">{t("18 juin 2026", "June 18, 2026")}</span></div>
          <h3><T fr="Townsend Transit Express, une histoire familiale depuis 1983" en="Townsend Transit Express, a family story since 1983" /></h3>
          <p>
            <T
              fr="Découvrez la création de TTE par Robert Turner, la reprise familiale par Turner Enterprise Management et la modernisation menée par James Wyatt."
              en="Discover how TTE was founded by Robert Turner, the family takeover by Turner Enterprise Management, and the modernisation led by James Wyatt."
            />
          </p>
          <a className="more" href="/histoire"><T fr="Lire la suite →" en="Read more →" /></a>
        </div>
      </article>

      <article className="na">
        <div className="ni" style={{background: "var(--l-bus)"}}></div>
        <div className="nb">
          <div className="meta"><span className="tag" style={{background: "rgba(198,138,28,.16)", color: "#8A5E12"}}><T fr="Service" en="Service" /></span><span className="date">{t("12 juin 2026", "June 12, 2026")}</span></div>
          <h3><T fr="Renfort de la desserte locale en bus à Townsend" en="Boosted local bus service in Townsend" /></h3>
          <p>
            <T
              fr="La ligne de bus complète désormais le train urbain et dessert l'ensemble de Townsend, avec la gare centrale pour arrêt principal."
              en="The bus line now complements the urban train and serves all of Townsend, with the central station as its main stop."
            />
          </p>
          <span className="more"><T fr="Lire la suite →" en="Read more →" /></span>
        </div>
      </article>

      <article className="na">
        <div className="ni" style={{background: "var(--l-r4)"}}></div>
        <div className="nb">
          <div className="meta"><span className="tag" style={{background: "var(--warn-bg)", color: "#8A5A12"}}><T fr="Info trafic" en="Service status" /></span><span className="date">{t("28 juin 2026", "June 28, 2026")}</span></div>
          <h3><T fr="Travaux sur la ligne R4 entre Athens et Cleveland" en="Works on line R4 between Athens and Cleveland" /></h3>
          <p>
            <T
              fr="Des travaux entraînent un retard d'environ 10 minutes sur la R4 (Knoxville – Chattanooga). Les autres lignes circulent normalement."
              en="Works are causing an approximate 10-minute delay on the R4 (Knoxville – Chattanooga). Other lines are running normally."
            />
          </p>
          <span className="more"><T fr="Lire la suite →" en="Read more →" /></span>
        </div>
      </article>
    </div>
  </div>
</section>

{/* ===== TARIFS ===== */}
<section className="section" id="tarifs">
  <div className="wrap">
    <div className="shead">
      <span className="eyebrow"><T fr="Tarifs & titres" en="Fares & tickets" /></span>
      <h2 className="stitle"><T fr="Des titres simples, valables sur tout le réseau" en="Simple tickets, valid across the whole network" /></h2>
    </div>

    <div className="notice">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>
      <p>
        <T
          fr={<><b>Tarif unique sur l'ensemble du réseau.</b> Le même prix s'applique quelle que soit la destination et la ligne empruntée, correspondances comprises. Achat en gare aux bornes automatiques (CB ou espèces), pas de vente à bord.</>}
          en={<><b>Flat fare across the whole network.</b> The same price applies regardless of destination or line, connections included. Buy at station ticket machines (card or cash), no sales on board.</>}
        />
      </p>
    </div>

    <div className="fares">
      <div className="fare">
        <div className="fare-nm"><T fr="Billet unité" en="Single ticket" /></div>
        <div className="fare-pr">$5</div>
        <div className="fare-d"><T fr="Un trajet sur n'importe quelle ligne du réseau, correspondances comprises." en="One journey on any line of the network, connections included." /></div>
        <span className="fare-where"><T fr="En vente en gare" en="Sold at stations" /></span>
      </div>
      <div className="fare">
        <div className="fare-nm"><T fr="Carnet de 5" en="Book of 5" /></div>
        <div className="fare-pr">$20</div>
        <div className="fare-d"><T fr="Cinq trajets au prix de quatre. Idéal pour les déplacements occasionnels." en="Five journeys for the price of four. Ideal for occasional travel." /></div>
        <span className="fare-where"><T fr="En vente en gare" en="Sold at stations" /></span>
      </div>
      <div className="fare">
        <div className="fare-nm"><T fr="Carnet de 10" en="Book of 10" /></div>
        <div className="fare-pr">$25</div>
        <div className="fare-d"><T fr="Dix trajets à tarif réduit, le meilleur rapport au voyage." en="Ten journeys at a reduced rate, the best value per trip." /></div>
        <span className="fare-where"><T fr="En vente en gare" en="Sold at stations" /></span>
      </div>
      <div className="fare">
        <div className="fare-nm"><T fr="Pass journée" en="Day pass" /></div>
        <div className="fare-pr">$10</div>
        <div className="fare-d"><T fr="Trajets illimités pendant une journée, sur toutes les lignes." en="Unlimited journeys for one day, on all lines." /></div>
        <span className="fare-where"><T fr="En gare ou en ligne" en="At stations or online" /></span>
        <div className="fare-actions">
          <button type="button" className="btn-outline fare-pay-btn" onClick={() => handleBuyClick(planById("24h"))}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18M7 15h4" /></svg>
            <T fr="Payer en ligne" en="Pay online" />
          </button>
        </div>
      </div>
      <div className="fare feat">
        <span className="fare-tag"><T fr="Le plus choisi" en="Most popular" /></span>
        <div className="fare-nm"><T fr="Pass semaine" en="Weekly pass" /></div>
        <div className="fare-pr">$75</div>
        <div className="fare-d"><T fr="Sept jours de trajets illimités sur l'ensemble du réseau." en="Seven days of unlimited journeys across the whole network." /></div>
        <span className="fare-where"><T fr="En gare ou en ligne" en="At stations or online" /></span>
        <div className="fare-actions">
          <button type="button" className="btn-outline fare-pay-btn" onClick={() => handleBuyClick(planById("7j"))}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18M7 15h4" /></svg>
            <T fr="Payer en ligne" en="Pay online" />
          </button>
        </div>
      </div>
      <div className="fare">
        <div className="fare-nm"><T fr="Pass mois" en="Monthly pass" /></div>
        <div className="fare-pr">$275</div>
        <div className="fare-d"><T fr="Trente jours de trajets illimités, pour les voyageurs réguliers." en="Thirty days of unlimited journeys, for regular travellers." /></div>
        <span className="fare-where"><T fr="En gare ou en ligne" en="At stations or online" /></span>
        <div className="fare-actions">
          <button type="button" className="btn-outline fare-pay-btn" onClick={() => handleBuyClick(planById("30j"))}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18M7 15h4" /></svg>
            <T fr="Payer en ligne" en="Pay online" />
          </button>
        </div>
      </div>
    </div>

    <div className="notice usbpay-info-notice">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>
      <p>
        <T
          fr={<><b>Les pass 24h, 7 jours et 30 jours peuvent être réglés en ligne</b> via USB Pay, réservé aux clients connectés avec un compte client (Discord). Le paiement en ligne ne délivre pas le titre automatiquement : après avoir payé, contactez un membre du personnel TTE sur Discord ou présentez-vous en gare avec votre reçu pour faire activer votre abonnement. Les billets et carnets restent en vente uniquement aux bornes en gare.</>}
          en={<><b>The 24h, 7-day and 30-day passes can be paid online</b> via USB Pay, reserved for clients signed in with a client account (Discord). Online payment doesn't deliver the pass automatically: after paying, contact a TTE staff member on Discord or come to a station with your receipt so your pass can be activated. Single tickets and books remain sold only at station ticket machines.</>}
        />
      </p>
    </div>

    {user && (
      <a href="/mon-compte" className="loyalty-badge" style={{ textDecoration: "none", cursor: "pointer" }}>
        <span className="loyalty-badge-icon">🎖️</span>
        <span>
          {loyaltyQuery.isLoading ? (
            <T fr="Chargement de votre compte fidélité…" en="Loading your loyalty account…" />
          ) : (
            <T
              fr={<>Compte fidélité de <b>{user.displayName || user.username}</b> : <b>{myPoints ?? 0} points</b> · voir mon compte</>}
              en={<><b>{user.displayName || user.username}</b>'s loyalty account: <b>{myPoints ?? 0} points</b> · view my account</>}
            />
          )}
        </span>
      </a>
    )}

    {loginPromptPlan && (
      <LoginRequiredModal plan={loginPromptPlan} onClose={() => setLoginPromptPlan(null)} />
    )}

    {activePlan && (
      <SubscriptionPayModal
        plan={activePlan}
        onClose={() => { setActivePlan(null); purchaseMutation.reset(); }}
        purchaseState={
          purchaseMutation.isError || (purchaseMutation.data && !purchaseMutation.data.ok)
            ? "error"
            : purchaseMutation.isSuccess && purchaseMutation.data?.ok
              ? "success"
              : "pending"
        }
        loyaltyResult={
          purchaseMutation.data?.ok
            ? { account: purchaseMutation.data.account, purchase: purchaseMutation.data.purchase }
            : null
        }
      />
    )}

    <p style={{marginTop: "14px", fontSize: "14px", color: "var(--muted)"}}>
      <T
        fr={<>Réductions applicables sur les billets unité et carnets : <b>enfant −50 %</b> (4–11 ans), <b>jeune 12–25 ans −30 %</b>, <b>senior 65+ −30 %</b>, gratuit pour les moins de 4 ans.</>}
        en={<>Discounts apply to single tickets and books: <b>child −50%</b> (ages 4–11), <b>young adult 12–25 −30%</b>, <b>senior 65+ −30%</b>, free for under 4s.</>}
      />
    </p>
  </div>
</section>

{/* ===== INFOS VOYAGEURS ===== */}
<section className="section alt" id="infos">
  <div className="wrap">
    <div className="shead">
      <span className="eyebrow"><T fr="Infos voyageurs" en="Traveller info" /></span>
      <h2 className="stitle"><T fr="Préparer et réussir votre voyage" en="Prepare for a smooth trip" /></h2>
    </div>

    <div className="amen">
      <span className="a"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0" /><circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" /></svg> <T fr="Wi-Fi gratuit à bord" en="Free Wi-Fi on board" /></span>
      <span className="a"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="7" y="9" width="10" height="11" rx="2" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /></svg> <T fr="Prises USB" en="USB outlets" /></span>
      <span className="a"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="4.5" r="2" /><path d="M12 7v6m0 0 4 6m-4-6-4 6m-1-9h10" /></svg> <T fr="Accès PMR" en="Wheelchair access" /></span>
      <span className="a"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="6" cy="17" r="3" /><circle cx="18" cy="17" r="3" /><path d="M9 17h6l-3-7h4M12 10 9 6" /></svg> <T fr="Vélos acceptés" en="Bicycles allowed" /></span>
      <span className="a"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 5a2 2 0 1 1 4 0 2 2 0 0 1-4 0ZM5 9a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm14 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM8 20c0-3 2-5 4-5s4 2 4 5" /></svg> <T fr="Animaux acceptés" en="Pets allowed" /></span>
    </div>

    <div className="steps">
      <div className="step"><div className="n num">1</div><h4><T fr="Consultez les horaires" en="Check timetables" /></h4><p><T fr="En ligne sur cette page, ou sur les écrans et affiches en gare." en="Online on this page, or on screens and posters at the station." /></p></div>
      <div className="step"><div className="n num">2</div><h4><T fr="Achetez en gare" en="Buy at the station" /></h4><p><T fr="À la borne automatique de la gare, par carte bancaire ou en espèces." en="At the station's ticket machine, by card or cash." /></p></div>
      <div className="step"><div className="n num">3</div><h4><T fr="Validez votre titre" en="Validate your ticket" /></h4><p><T fr="Compostez ou présentez votre billet avant de monter à bord." en="Stamp or present your ticket before boarding." /></p></div>
      <div className="step"><div className="n num">4</div><h4><T fr="Voyagez" en="Travel" /></h4><p><T fr="Installez-vous et profitez du Tennessee par la fenêtre." en="Sit back and enjoy Tennessee through the window." /></p></div>
    </div>

    <div className="help-row">
      <div className="help">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 4h3l2 5-2 1a11 11 0 0 0 5 5l1-2 5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" /></svg>
        <div><h4><T fr="Service Clientèle" en="Customer Service" /></h4><p><T fr="Du lundi au samedi, 7 h – 20 h." en="Monday to Saturday, 7am – 8pm." /></p><a href="/contact#info"><T fr="Ouvrir une demande" en="Open a request" /></a></div>
      </div>
      <div className="help">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="4.5" r="2" /><path d="M12 7v6m0 0 4 6m-4-6-4 6m-1-9h10" /></svg>
        <div><h4><T fr="Accessibilité" en="Accessibility" /></h4><p><T fr="Gares et matériel adaptés aux personnes à mobilité réduite." en="Stations and rolling stock adapted for reduced-mobility travellers." /></p><a href="/contact#accessibilite"><T fr="Demander une assistance" en="Request assistance" /></a></div>
      </div>
      <div className="help">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18M8 15h4" /></svg>
        <div><h4><T fr="Objets trouvés" en="Lost & found" /></h4><p><T fr={<>Un objet oublié à bord ou en gare&nbsp;?</>} en={<>Left something on board or at a station?</>} /></p><a href="/contact#objets"><T fr="Faire une déclaration" en="File a report" /></a></div>
      </div>
    </div>
  </div>
</section>

{/* ===== TÉMOIGNAGES ===== */}
<section className="section" id="temoignages">
  <div className="wrap">
    <div className="shead">
      <span className="eyebrow"><T fr="Ils voyagent avec TTE" en="They travel with TTE" /></span>
      <h2 className="stitle"><T fr="Ce que disent nos voyageurs" en="What our travellers say" /></h2>
    </div>

    <div className="testi-grid">
      <div className="testi">
        <div className="testi-stars" aria-hidden="true">★★★★★</div>
        <p className="testi-txt">
          <T
            fr="La ligne IC1 jusqu'à Nashville était à l'heure malgré la neige. Personnel très professionnel en gare de Townsend."
            en="The IC1 line to Nashville was on time despite the snow. Very professional staff at Townsend station."
          />
        </p>
        <div className="testi-who">
          <span className="testi-av">EM</span>
          <div>
            <b><T fr="Ethan M." en="Ethan M." /></b>
            <small><T fr="Trajet Townsend → Nashville" en="Townsend → Nashville journey" /></small>
          </div>
        </div>
      </div>

      <div className="testi">
        <div className="testi-stars" aria-hidden="true">★★★★☆</div>
        <p className="testi-txt">
          <T
            fr="Wi-Fi correct à bord et sièges confortables. Un peu d'attente au guichet le matin, sinon rien à dire."
            en="Decent Wi-Fi on board and comfortable seats. A bit of a wait at the ticket office in the morning, otherwise no complaints."
          />
        </p>
        <div className="testi-who">
          <span className="testi-av">SC</span>
          <div>
            <b><T fr="Sarah C." en="Sarah C." /></b>
            <small><T fr="Ligne R2, abonnée mensuelle" en="R2 line, monthly pass holder" /></small>
          </div>
        </div>
      </div>

      <div className="testi">
        <div className="testi-stars" aria-hidden="true">★★★★★</div>
        <p className="testi-txt">
          <T
            fr="Accès PMR simple à la gare de Maryville, agent au top pour l'embarquement. Je recommande."
            en="Easy wheelchair access at Maryville station, great staff support for boarding. Highly recommend."
          />
        </p>
        <div className="testi-who">
          <span className="testi-av">RD</span>
          <div>
            <b><T fr="Robert D." en="Robert D." /></b>
            <small><T fr="Gare de Maryville" en="Maryville station" /></small>
          </div>
        </div>
      </div>

      <div className="testi">
        <div className="testi-stars" aria-hidden="true">★★★★☆</div>
        <p className="testi-txt">
          <T
            fr="Le pass semaine change la vie pour les trajets domicile-travail. Toujours une place assise sur la R1."
            en="The weekly pass is a game changer for the commute. Always a seat available on the R1."
          />
        </p>
        <div className="testi-who">
          <span className="testi-av">JL</span>
          <div>
            <b><T fr="Julie L." en="Julie L." /></b>
            <small><T fr="Ligne R1, navetteuse quotidienne" en="R1 line, daily commuter" /></small>
          </div>
        </div>
      </div>

      <div className="testi">
        <div className="testi-stars" aria-hidden="true">★★★★★</div>
        <p className="testi-txt">
          <T
            fr="Objet oublié à bord retrouvé en moins de 24 h grâce au service objets trouvés. Réactivité impeccable."
            en="Left an item on board and got it back within 24 hours thanks to lost & found. Impeccable responsiveness."
          />
        </p>
        <div className="testi-who">
          <span className="testi-av">MK</span>
          <div>
            <b><T fr="Marc K." en="Marc K." /></b>
            <small><T fr="Ligne IC2" en="IC2 line" /></small>
          </div>
        </div>
      </div>

      <div className="testi">
        <div className="testi-stars" aria-hidden="true">★★★★☆</div>
        <p className="testi-txt">
          <T
            fr="Belle vue sur les Smoky Mountains depuis la ligne T. Un trajet aussi agréable qu'utile."
            en="Great views of the Smoky Mountains from the T line. A journey that's as enjoyable as it is useful."
          />
        </p>
        <div className="testi-who">
          <span className="testi-av">AP</span>
          <div>
            <b><T fr="Amelia P." en="Amelia P." /></b>
            <small><T fr="Ligne T" en="T line" /></small>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

{/* ===== ESPACE EMPLOYÉS ===== */}
<section className="section staff-sec" id="employes">
  <div className="wrap">
    <div className="staff-in">
      <div className="staff-l">
        <span className="eyebrow"><T fr="Personnel TTE" en="TTE staff" /></span>
        <h2><T fr="Espace réservé aux employés" en="Staff-only area" /></h2>
        <p>
          <T
            fr="Accédez à votre portail interne : planning de service, fiches de roulement, notes de service, bulletins de sécurité et documents ressources humaines. L'accès est strictement réservé au personnel autorisé de Townsend Transit Express."
            en="Access your internal portal: duty rosters, shift sheets, staff notices, safety bulletins, and HR documents. Access is strictly reserved to authorised Townsend Transit Express staff."
          />
        </p>
        <ul>
          <li><T fr="Planning & roulements" en="Rosters & shifts" /></li>
          <li><T fr="Fiches de service" en="Duty sheets" /></li>
          <li><T fr="Notes de service" en="Staff notices" /></li>
          <li><T fr="Sécurité & consignes" en="Safety & instructions" /></li>
          <li><T fr="Documents RH" en="HR documents" /></li>
        </ul>
      </div>
      <div className="staff-card">
        <span className="lock"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="4" y="11" width="16" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg></span>
        <h3><T fr="Connexion personnel" en="Staff login" /></h3>
        <p><T fr="Connectez-vous avec Discord pour accéder à l'intranet." en="Sign in with Discord to access the intranet." /></p>
        <a href="/espace-employes" className="btn btn-primary"><T fr="Accéder à l'espace employés" en="Go to staff area" /></a>
        <div className="hint"><T fr="Accès réservé au personnel autorisé" en="Access restricted to authorised staff" /></div>
      </div>
    </div>
  </div>
</section>
</main>

{/* ===== BACK TO TOP ===== */}
<button className="backtop" id="backTop" aria-label={t("Remonter en haut de page", "Back to top")} type="button"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M12 19V5M5 12l7-7 7 7" /></svg></button>

{/* ===== FOOTER ===== */}
<footer className="foot">
  <div className="wrap">
    <div className="foot-top">
      <div className="foot-brand">
        <TTELogo className="logo-f" />
        <p>
          <T
            fr="Townsend Transit Express — le réseau ferroviaire de l'est du Tennessee, au départ de Townsend et des Great Smoky Mountains."
            en="Townsend Transit Express — the eastern Tennessee rail network, running from Townsend and the Great Smoky Mountains."
          />
        </p>
        <div className="addr">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="10" r="3" /><path d="M12 2a8 8 0 0 0-8 8c0 5.4 8 12 8 12s8-6.6 8-12a8 8 0 0 0-8-8Z" /></svg>
          <span><T fr="Siège social — Gare centrale, Townsend, Tennessee" en="Head office — Central station, Townsend, Tennessee" /></span>
        </div>
      </div>

      <div className="fcol">
        <h4><T fr="Le réseau" en="The network" /></h4>
        <a href="#lignes"><span className="ll" style={{background: "var(--l-ic2)"}}></span> IC2 · Smoky Express</a>
        <a href="#lignes"><span className="ll" style={{background: "var(--l-r1)"}}></span> R1 · Smokies</a>
        <a href="#lignes"><span className="ll" style={{background: "var(--l-r4)"}}></span> R4 · Chattanooga</a>
        <a href="#townsend"><span className="ll" style={{background: "var(--l-t)"}}></span> <T fr="Ligne T · Townsend" en="Line T · Townsend" /></a>
        <a href="/bus"><span className="ll" style={{background: "var(--l-bus1)"}}></span> <T fr="B1 · Centre-Ville" en="B1 · Downtown" /></a>
        <a href="/bus"><span className="ll" style={{background: "var(--l-bus2)"}}></span> <T fr="B2 · Secteur Rural" en="B2 · Rural sector" /></a>
        <a href="#reseau"><T fr="Plan du réseau" en="Network map" /></a>
      </div>

      <div className="fcol">
        <h4><T fr="Voyageurs" en="Travellers" /></h4>
        <a href="#lignes"><T fr="Lignes & horaires" en="Lines & timetables" /></a>
        <a href="/bus"><T fr="Nouvelles lignes de bus" en="New bus lines" /></a>
        <a href="#tarifs"><T fr="Tarifs & titres" en="Fares & tickets" /></a>
        <a href="#infos"><T fr="Acheter un billet" en="Buy a ticket" /></a>
        <a href="/contact#accessibilite"><T fr="Accessibilité" en="Accessibility" /></a>
        <a href="#lignes"><T fr="Info trafic" en="Service status" /></a>
      </div>

      <div className="fcol">
        <h4><T fr="Entreprise" en="Company" /></h4>
        <a href="/histoire"><T fr="Notre histoire" en="Our history" /></a>
        <a href="/recrutement"><T fr="Recrutement" en="Careers" /></a>
        <a href="/contact#presse"><T fr="Presse" en="Press" /></a>
        <a href="/espace-employes"><T fr="Espace employés" en="Staff area" /></a>
        <a href="/contact"><T fr="Nous contacter" en="Contact us" /></a>
      </div>
    </div>

    <div className="foot-bot">
      <p><T fr="© 2026 Townsend Transit Express. Tous droits réservés." en="© 2026 Townsend Transit Express. All rights reserved." /></p>
      <div className="links">
        <a href="/mentions-legales"><T fr="Mentions légales" en="Legal notice" /></a>
        <a href="/conditions-generales-transport-tte-v1.pdf" target="_blank" rel="noreferrer"><T fr="Conditions de transport" en="Terms of carriage" /></a>
        <a href="/rapport-annuel-tte-2025.pdf" target="_blank" rel="noreferrer"><T fr="Rapport annuel 2025" en="2025 Annual report" /></a>
        <a href="/confidentialite"><T fr="Confidentialité" en="Privacy" /></a>
        <a href="#"><T fr="Plan du site" en="Site map" /></a>
      </div>
    </div>
  </div>
</footer>



    </>
  );
}
