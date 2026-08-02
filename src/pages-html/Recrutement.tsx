import { useState } from "react";
import "./Accueil.css";
import "./Recrutement.css";
import { DiscordAuthButton } from "@/components/DiscordAuth";
import { TTELogo } from "@/components/TTELogo";
import { T } from "@/components/T";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const jobs = [
  {
    icon: "wrench",
    fr: "Agent de maintenance",
    en: "Maintenance Technician",
    dept: { fr: "Ateliers Townsend", en: "Townsend Rail Yard" },
    desc: {
      fr: "Entretien préventif et réparation du matériel roulant et des infrastructures.",
      en: "Preventive maintenance and repair of rolling stock and infrastructure.",
    },
  },
  {
    icon: "shield",
    fr: "Agent de sûreté ferroviaire",
    en: "Transit Safety & Security Officer",
    dept: { fr: "Réseau TTE", en: "TTE Network" },
    desc: {
      fr: "Surveillance du réseau, prévention et sécurité des voyageurs en gare et à bord.",
      en: "Network patrols, prevention and passenger safety at stations and on board.",
    },
  },
  {
    icon: "ticket",
    fr: "Contrôleur",
    en: "Conductor",
    dept: { fr: "À bord & en gare", en: "Onboard & Stations" },
    desc: {
      fr: "Contrôle des titres de transport, information et assistance aux voyageurs.",
      en: "Fare inspection, passenger information and assistance.",
    },
  },
  {
    icon: "train",
    fr: "Conducteur de train",
    en: "Train Operator",
    dept: { fr: "Lignes R & IC", en: "R & IC Lines" },
    desc: {
      fr: "Conduite des rames en toute sécurité sur le réseau régional TTE.",
      en: "Safely operating trains across the TTE regional network.",
    },
  },
  {
    icon: "bus",
    fr: "Conducteur de bus",
    en: "Bus Operator",
    dept: { fr: "Réseau bus TTE", en: "TTE Bus Network" },
    desc: {
      fr: "Conduite des lignes de bus TTE et accueil des voyageurs à bord.",
      en: "Operating TTE bus routes and welcoming passengers on board.",
    },
  },
  {
    icon: "radar",
    fr: "Régulateur",
    en: "Central Control Dispatcher",
    dept: { fr: "Centre de régulation", en: "Control Center" },
    desc: {
      fr: "Suivi du trafic en temps réel et coordination des équipes sur le réseau.",
      en: "Real-time traffic monitoring and coordination of network teams.",
    },
  },
  {
    icon: "desk",
    fr: "Secrétaire",
    en: "Administrative Assistant",
    dept: { fr: "Siège administratif", en: "Head Office" },
    desc: {
      fr: "Gestion administrative, accueil et suivi des dossiers du personnel.",
      en: "Administrative support, front-desk duties and staff records.",
    },
  },
];

const icons: Record<string, JSX.Element> = {
  wrench: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.8 2.8-2-2 2.8-2.8Z" />
    </svg>
  ),
  shield: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z" />
    </svg>
  ),
  ticket: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8Z" />
      <path d="M10 6v12" strokeDasharray="2 2" />
    </svg>
  ),
  train: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="5" y="3" width="14" height="13" rx="3" />
      <path d="M5 12h14M8 16l-2 4M16 16l2 4M9 8h6" />
      <circle cx="8.5" cy="12" r="0" />
    </svg>
  ),
  bus: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="5" width="18" height="12" rx="2.5" />
      <path d="M3 11h18M7 17v2M17 17v2" />
      <circle cx="7.5" cy="9" r="0" />
    </svg>
  ),
  radar: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 12 17 8M12 12v-6" />
    </svg>
  ),
  desk: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 19V9l9-4 9 4v10M3 19h18M9 19v-6h6v6" />
    </svg>
  ),
};

export default function RecrutementPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { lang, t, toggleLang } = useLanguage();

  return (
    <>
      <div className="util">
        <div className="util-in">
          <div className="util-grp u-left">
            <a href="/#reseau"><T fr="Plan du réseau" en="Network map" /></a>
            <a href="/#lignes"><T fr="Horaires" en="Timetables" /></a>
            <a href="/#gares"><T fr="Gares & services" en="Stations & services" /></a>
            <a href="/contact"><T fr="Aide & contact" en="Help & contact" /></a>
          </div>
          <div className="util-grp" style={{ alignItems: "center", gap: 12 }}>
            <a className="staff" href="/espace-employes">
              <T fr="Espace employés" en="Staff area" />
            </a>
            <DiscordAuthButton />
            <span className="sep" />
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

      <header className={`hdr${menuOpen ? " open" : ""}`} id="hdr">
        <div className="hdr-in">
          <a href="/" className="brand" aria-label={t("Townsend Transit Express — accueil", "Townsend Transit Express — home")}>
            <TTELogo className="logo" />
            <span className="brand-tx">
              <span className="nm">Townsend Transit Express</span>
              <span className="tg"><T fr="Réseau ferroviaire du Tennessee" en="Tennessee rail network" /></span>
            </span>
          </a>
          <nav className="mainnav">
            <a href="/#reseau"><T fr="Réseau" en="Network" /></a>
            <a href="/#lignes"><T fr="Lignes & horaires" en="Lines & timetables" /></a>
            <a href="/#gares"><T fr="Gares" en="Stations" /></a>
            <a href="/#tarifs"><T fr="Tarifs" en="Fares" /></a>
            <a href="/histoire"><T fr="Histoire" en="History" /></a>
            <a href="/recrutement" className="active">
              <T fr="Recrutement" en="Careers" />
            </a>
          </nav>
          <div className="hdr-sp" />
          <div className="hdr-act">
            <a href="/#finder" className="btn btn-primary">
              <T fr="Rechercher un horaire" en="Search a timetable" />
            </a>
            <button
              className="burger"
              type="button"
              aria-label={t("Ouvrir le menu", "Open menu")}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <main className="jobs-page">
        <section className="jobs-hero">
          <div className="wrap">
            <div className="history-crumb">
              <a href="/"><T fr="Accueil" en="Home" /></a>
              <span>›</span>
              <span><T fr="Recrutement" en="Careers" /></span>
            </div>
            <span className="eyebrow"><T fr="Rejoignez-nous" en="Join us" /></span>
            <h1><T fr="Faites tourner le réseau du Tennessee" en="Help run the Tennessee network" /></h1>
            <p>
              <T
                fr="Townsend Transit Express recrute en permanence pour renforcer ses équipes en gare, à bord, en atelier et au centre de régulation. Salaire compétitif, assurance santé, plan de retraite et formation payée dès l'embauche, quel que soit votre niveau d'expérience."
                en="Townsend Transit Express is always hiring to strengthen its station, on-board, workshop and control centre teams. Competitive pay, health benefits, retirement plan, and paid training from day one — no matter your experience level."
              />
            </p>
          </div>
        </section>

        <section className="jobs-apply">
          <div className="wrap">
            <div className="jobs-apply-card">
              <span className="jobs-apply-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11Z" />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>
              </span>
              <div>
                <h3><T fr="Candidature à déposer à la Mairie de Townsend" en="Apply in person at Townsend City Hall" /></h3>
                <p>
                  <T
                    fr="Les candidatures se déposent uniquement sur place,au guichet de la Mairie. Aucune candidature n'est traitée via ce site ni par e-mail."
                    en="Applications are accepted in person only, in-game, at the City Hall front desk. Applications cannot be submitted through this website or by e-mail."
                  />
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="jobs-list-section">
          <div className="wrap">
            <div className="history-heading">
              <span className="eyebrow"><T fr="Postes ouverts" en="Open positions" /></span>
              <h2><T fr="Nos offres actuelles" en="Current openings" /></h2>
            </div>
            <div className="jobs-grid">
              {jobs.map((job) => (
                <article className="job-card" key={job.en}>
                  <span className="job-card-icon">{icons[job.icon]}</span>
                  <div className="job-card-head">
                    <h3><T fr={job.fr} en={job.en} /></h3>
                    <span className="pill"><T fr="Temps plein" en="Full-Time" /></span>
                  </div>
                  <span className="job-card-dept"><T fr={job.dept.fr} en={job.dept.en} /></span>
                  <p><T fr={job.desc.fr} en={job.desc.en} /></p>
                </article>
              ))}
            </div>
            <div className="hint" style={{ marginTop: "1.6rem" }}>
              <T fr="TTE est un employeur garantissant l'égalité des chances (EOE)." en="TTE is an Equal Opportunity Employer (EOE)." />
            </div>
          </div>
        </section>
      </main>

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
            </div>
            <div className="fcol">
              <h4><T fr="Le réseau" en="The network" /></h4>
              <a href="/#lignes"><T fr="Lignes & horaires" en="Lines & timetables" /></a>
              <a href="/#gares"><T fr="Gares" en="Stations" /></a>
              <a href="/#tarifs"><T fr="Tarifs" en="Fares" /></a>
            </div>
            <div className="fcol">
              <h4><T fr="Entreprise" en="Company" /></h4>
              <a href="/histoire"><T fr="Notre histoire" en="Our history" /></a>
              <a href="/recrutement"><T fr="Recrutement" en="Careers" /></a>
              <a href="/espace-employes"><T fr="Espace employés" en="Staff area" /></a>
              <a href="/contact"><T fr="Nous contacter" en="Contact us" /></a>
            </div>
          </div>
          <div className="foot-bot">
            <p><T fr="© 2026 Townsend Transit Express. Tous droits réservés." en="© 2026 Townsend Transit Express. All rights reserved." /></p>
            <div className="links">
              <a href="/mentions-legales"><T fr="Mentions légales" en="Legal notice" /></a>
              <a href="/confidentialite"><T fr="Confidentialité" en="Privacy" /></a>
              <a href="/conditions-generales-transport-tte-v1.pdf" target="_blank" rel="noreferrer">
                <T fr="Conditions de transport" en="Terms of carriage" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
