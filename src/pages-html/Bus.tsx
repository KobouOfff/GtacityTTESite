import { useState } from "react";
import "./Accueil.css";
import "./Bus.css";
import { DiscordAuthButton } from "@/components/DiscordAuth";
import { TTELogo } from "@/components/TTELogo";
import { T } from "@/components/T";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type Stop = {
  code: string;
  fr: string;
  en: string;
  subFr?: string;
  subEn?: string;
  depot?: boolean;
};

const LINE1_STOPS: Stop[] = [
  { code: "D", fr: "Dépôt Bus", en: "Bus Depot", depot: true },
  { code: "1", fr: "Motel / Prison", en: "Motel / Prison" },
  { code: "2", fr: "Zone Indus.", en: "Industrial Zone" },
  { code: "3", fr: "Hôpital", en: "Hospital" },
  { code: "4", fr: "Concession", en: "Dealership" },
  { code: "5", fr: "Arlington", en: "Arlington" },
  { code: "6", fr: "Gare / Diner", en: "Station / Diner" },
  { code: "7", fr: "Mairie", en: "City Hall" },
];

const LINE2_STOPS: Stop[] = [
  { code: "D", fr: "Dépôt Bus", en: "Bus Depot", depot: true },
  { code: "1", fr: "Ferme", en: "Farm" },
  { code: "2", fr: "Fire Dept.", en: "Fire Dept." },
  { code: "3", fr: "Camp Voyage", en: "Camp Voyage" },
  { code: "4", fr: "Station Service", en: "Gas Station" },
];

function RouteStops({ stops, colorVar, loop }: { stops: Stop[]; colorVar: string; loop?: boolean }) {
  const { lang } = useLanguage();
  const items = loop ? [...stops, stops[0]] : stops;
  return (
    <div className="bus-route" style={{ ["--line-color" as any]: `var(${colorVar})` }}>
      {items.map((s, i) => (
        <div className="bus-route-item" key={i}>
          {i > 0 && <span className="bus-route-arrow" aria-hidden="true">→</span>}
          <div className={`bus-stop${s.depot ? " depot" : ""}${loop && i === items.length - 1 ? " repeat" : ""}`}>
            <span className="dot">{s.code}</span>
            <span className="lbl">{lang === "en" ? s.en : s.fr}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function BusPage() {
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
            <a href="/bus" className="active">Bus</a>
            <a href="/histoire"><T fr="Histoire" en="History" /></a>
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

      <main className="bus-page">
        <section className="bus-hero">
          <div className="wrap">
            <div className="bus-crumb">
              <a href="/"><T fr="Accueil" en="Home" /></a>
              <span>›</span>
              <span>Bus</span>
            </div>
            <span className="eyebrow"><T fr="Nouveauté" en="What's new" /></span>
            <h1><T fr="Townsend Transit Express" en="Townsend Transit Express" /> <span className="accent">EXPRESS</span></h1>
            <p className="bus-hero-sub"><T fr="Réseau de bus — Ville de Townsend" en="Bus network — City of Townsend" /></p>
            <p className="bus-hero-lede">
              <T
                fr="Deux nouvelles lignes de bus viennent compléter le réseau ferroviaire et desservir les quartiers non couverts par le train, en correspondance avec les gares existantes."
                en="Two new bus lines complete the rail network and serve neighbourhoods not covered by the train, connecting with existing stations."
              />
            </p>
            <div className="bus-launch-banner">
              <T fr="EN CIRCULATION DÈS LE MOIS PROCHAIN !" en="ROLLING OUT NEXT MONTH!" />
            </div>
          </div>
        </section>

        <section className="bus-legend-section">
          <div className="wrap bus-legend-row">
            <div className="bus-legend-item">
              <span className="bus-legend-swatch" style={{ background: "var(--l-bus1)" }} />
              <span><T fr="Ligne 1 · Centre-Ville — circuit fermé" en="Line 1 · Downtown — closed loop" /></span>
            </div>
            <div className="bus-legend-item">
              <span className="bus-legend-swatch" style={{ background: "var(--l-bus2)" }} />
              <span><T fr="Ligne 2 · Secteur Rural — aller-retour" en="Line 2 · Rural sector — round trip" /></span>
            </div>
            <div className="bus-legend-item">
              <span className="bus-legend-swatch train" />
              <span><T fr="Correspondance avec la ligne de train existante" en="Connects with the existing train line" /></span>
            </div>
          </div>
        </section>

        <section className="bus-line-section" id="ligne-1">
          <div className="wrap">
            <div className="bus-line-card" style={{ ["--card-color" as any]: "var(--l-bus1)" }}>
              <div className="bus-line-head">
                <span className="bullet bus-line-badge">B1</span>
                <div>
                  <span className="eyebrow2"><T fr="Ligne 1 · Circuit fermé" en="Line 1 · Closed loop" /></span>
                  <h2><T fr="Centre-Ville" en="Downtown" /></h2>
                </div>
              </div>
              <p className="bus-line-desc">
                <T
                  fr="Une boucle qui dessert le cœur de Townsend, du dépôt de bus à la mairie, en passant par l'hôpital et la gare. Le bus revient à son point de départ après le dernier arrêt."
                  en="A loop serving the heart of Townsend, from the bus depot to city hall, passing the hospital and the station. The bus returns to its starting point after the last stop."
                />
              </p>
              <RouteStops stops={LINE1_STOPS} colorVar="--l-bus1" loop />
              <div className="bus-line-facts">
                <div className="bus-fact"><b>8</b><span><T fr="arrêts" en="stops" /></span></div>
                <div className="bus-fact"><b>~40 <T fr="min" en="min" /></b><span><T fr="tour complet" en="full loop" /></span></div>
                <div className="bus-fact"><b>{t("toutes les 20 min", "every 20 min")}</b><span>06:00–22:00</span></div>
              </div>
            </div>
          </div>
        </section>

        <section className="bus-line-section alt" id="ligne-2">
          <div className="wrap">
            <div className="bus-line-card" style={{ ["--card-color" as any]: "var(--l-bus2)" }}>
              <div className="bus-line-head">
                <span className="bullet bus-line-badge">B2</span>
                <div>
                  <span className="eyebrow2"><T fr="Ligne 2 · Aller-retour" en="Line 2 · Round trip" /></span>
                  <h2><T fr="Secteur Rural" en="Rural sector" /></h2>
                </div>
              </div>
              <p className="bus-line-desc">
                <T
                  fr="Une navette linéaire vers les communes rurales autour de Townsend : ferme, caserne de pompiers, camp de vacances et station-service. Le bus fait l'aller-retour entre le dépôt et le terminus."
                  en="A linear shuttle to the rural communities around Townsend: farm, fire department, holiday camp, and gas station. The bus runs back and forth between the depot and the terminus."
                />
              </p>
              <RouteStops stops={LINE2_STOPS} colorVar="--l-bus2" />
              <div className="bus-line-facts">
                <div className="bus-fact"><b>5</b><span><T fr="arrêts" en="stops" /></span></div>
                <div className="bus-fact"><b>~25 <T fr="min" en="min" /></b><span><T fr="par trajet" en="per trip" /></span></div>
                <div className="bus-fact"><b>{t("toutes les 40 min", "every 40 min")}</b><span>06:00–20:00</span></div>
              </div>
            </div>
          </div>
        </section>

        <section className="bus-info-section">
          <div className="wrap bus-info-grid">
            <div className="bus-info-card">
              <h3><T fr="Correspondance train" en="Train connection" /></h3>
              <p>
                <T
                  fr="Les deux lignes partent du Dépôt Bus, à deux pas de la gare centrale, pour un changement rapide entre le train et le bus."
                  en="Both lines start at the Bus Depot, right next to the central station, for a quick change between train and bus."
                />
              </p>
            </div>
            <div className="bus-info-card">
              <h3><T fr="Tarifs" en="Fares" /></h3>
              <p>
                <T
                  fr="Même tarif unique que le réseau ferroviaire. Billets en vente en gare, aux bornes automatiques."
                  en="Same flat fare as the rail network. Tickets sold at stations, from ticket machines."
                />
              </p>
            </div>
            <div className="bus-info-card">
              <h3><T fr="Mise en service" en="Launch" /></h3>
              <p>
                <T
                  fr="Les deux lignes entrent en circulation dès le mois prochain. Les horaires détaillés seront publiés sur cette page et affichés en gare."
                  en="Both lines start running next month. Detailed timetables will be published on this page and posted at the station."
                />
              </p>
            </div>
          </div>
          <div className="wrap bus-cta-row">
            <a href="/#lignes" className="btn btn-primary"><T fr="Voir toutes les lignes & horaires" en="See all lines & timetables" /></a>
            <a href="/contact" className="btn btn-outline"><T fr="Une question ? Contactez-nous" en="A question? Contact us" /></a>
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
              <a href="/bus"><T fr="Lignes de bus" en="Bus lines" /></a>
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
              <a
                href="/conditions-generales-transport-tte-v1.pdf"
                target="_blank"
                rel="noreferrer"
              >
                <T fr="Conditions de transport" en="Terms of carriage" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
