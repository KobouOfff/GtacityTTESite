import { useState } from "react";
import "./Accueil.css";
import "./Bus.css";
import { DiscordAuthButton } from "@/components/DiscordAuth";
import { TTELogo } from "@/components/TTELogo";
import { T } from "@/components/T";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type Stop = { code: string; fr: string; en: string; depot?: boolean };

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

function StopsTimeline({ stops, colorVar, loop }: { stops: Stop[]; colorVar: string; loop?: boolean }) {
  const { lang } = useLanguage();
  const items = loop ? [...stops, { ...stops[0], code: "D" }] : stops;
  return (
    <div className="bus-timeline" style={{ ["--line-color" as any]: `var(${colorVar})` }}>
      {items.map((s, i) => (
        <div className="bus-tl-row" key={i}>
          <div className="bus-tl-num">{s.code}</div>
          <div className="bus-tl-card">
            <span>{s.depot ? (lang === "en" ? "Departure" : "Départ") : `${lang === "en" ? "Stop" : "Arrêt"} ${s.code}`}</span>
            <h3>{lang === "en" ? s.en : s.fr}{loop && i === items.length - 1 ? ` — ${lang === "en" ? "back to depot" : "retour au dépôt"}` : ""}</h3>
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
        <section className="history-hero">
          <div className="wrap">
            <div className="history-crumb">
              <a href="/"><T fr="Accueil" en="Home" /></a>
              <span>›</span>
              <span>Bus</span>
            </div>
            <span className="eyebrow"><T fr="Nouveau" en="New" /></span>
            <h1><T fr="Nouvelles lignes de bus" en="New bus lines" /></h1>
            <p>
              <T
                fr="Deux nouvelles lignes de bus complètent le réseau ferroviaire et desservent les quartiers non couverts par le train, en correspondance avec la gare centrale."
                en="Two new bus lines complete the rail network and serve neighbourhoods not covered by the train, connecting with the central station."
              />
            </p>
          </div>
        </section>

        <section className="section alt">
          <div className="wrap">
            <div className="shead">
              <span className="eyebrow"><T fr="Ligne 1 · Circuit fermé" en="Line 1 · Closed loop" /></span>
              <h2 className="stitle"><T fr="Centre-Ville" en="Downtown" /></h2>
            </div>

            <div className="feature bus-feature bus1">
              <div className="fx-l">
                <span className="eyebrow2">B1 · <T fr="En service" en="In service" /></span>
                <h3><T fr="Boucle Centre-Ville" en="Downtown loop" /></h3>
                <div className="rt"><T fr="Dépôt Bus ⟲ 8 arrêts" en="Bus Depot ⟲ 8 stops" /></div>
                <p>
                  <T
                    fr="Une boucle qui dessert le cœur de Townsend, du dépôt de bus à la mairie, en passant par l'hôpital et la gare. Le bus revient à son point de départ après le dernier arrêt."
                    en="A loop serving the heart of Townsend, from the bus depot to city hall, passing the hospital and the station. The bus returns to its starting point after the last stop."
                  />
                </p>
                <div className="deps"><span className="t">06:00</span><span className="t">06:20</span><span className="t">06:40</span><span className="t">…</span></div>
              </div>
              <div className="fx-r">
                <div className="fx-stat"><span className="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg></span><div><b>~40 <T fr="min" en="min" /></b><span><T fr="tour complet" en="full loop" /></span></div></div>
                <div className="fx-stat"><span className="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="3" width="16" height="14" rx="3" /><path d="M4 11h16M9 21l1.5-4M15 21l-1.5-4" /></svg></span><div><b>{t("toutes les 20 min", "every 20 min")}</b><span>06:00–22:00</span></div></div>
                <div className="fx-stat"><span className="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="10" r="3" /><path d="M12 2a8 8 0 0 0-8 8c0 5.4 8 12 8 12s8-6.6 8-12a8 8 0 0 0-8-8Z" /></svg></span><div><b>8 <T fr="arrêts" en="stops" /></b><span><T fr="Motel/Prison · Zone Indus. · Hôpital…" en="Motel/Prison · Industrial Zone · Hospital…" /></span></div></div>
              </div>
            </div>

            <StopsTimeline stops={LINE1_STOPS} colorVar="--l-bus1" loop />
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <div className="shead">
              <span className="eyebrow"><T fr="Ligne 2 · Aller-retour" en="Line 2 · Round trip" /></span>
              <h2 className="stitle"><T fr="Secteur Rural" en="Rural sector" /></h2>
            </div>

            <div className="feature bus-feature bus2">
              <div className="fx-l">
                <span className="eyebrow2">B2 · <T fr="En service" en="In service" /></span>
                <h3><T fr="Navette Secteur Rural" en="Rural sector shuttle" /></h3>
                <div className="rt"><T fr="Dépôt Bus ↔ Station Service · 5 arrêts" en="Bus Depot ↔ Gas Station · 5 stops" /></div>
                <p>
                  <T
                    fr="Une navette linéaire vers les communes rurales autour de Townsend : ferme, caserne de pompiers, camp de vacances et station-service. Le bus fait l'aller-retour entre le dépôt et le terminus."
                    en="A linear shuttle to the rural communities around Townsend: farm, fire department, holiday camp, and gas station. The bus runs back and forth between the depot and the terminus."
                  />
                </p>
                <div className="deps"><span className="t">06:00</span><span className="t">06:40</span><span className="t">07:20</span><span className="t">…</span></div>
              </div>
              <div className="fx-r">
                <div className="fx-stat"><span className="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg></span><div><b>~25 <T fr="min" en="min" /></b><span><T fr="par trajet" en="per trip" /></span></div></div>
                <div className="fx-stat"><span className="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="3" width="16" height="14" rx="3" /><path d="M4 11h16M9 21l1.5-4M15 21l-1.5-4" /></svg></span><div><b>{t("toutes les 40 min", "every 40 min")}</b><span>06:00–20:00</span></div></div>
                <div className="fx-stat"><span className="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="10" r="3" /><path d="M12 2a8 8 0 0 0-8 8c0 5.4 8 12 8 12s8-6.6 8-12a8 8 0 0 0-8-8Z" /></svg></span><div><b>5 <T fr="arrêts" en="stops" /></b><span><T fr="Ferme · Fire Dept. · Camp Voyage…" en="Farm · Fire Dept. · Camp Voyage…" /></span></div></div>
              </div>
            </div>

            <StopsTimeline stops={LINE2_STOPS} colorVar="--l-bus2" />
          </div>
        </section>

        <section className="section alt">
          <div className="wrap">
            <div className="shead">
              <span className="eyebrow"><T fr="Infos pratiques" en="Practical info" /></span>
              <h2 className="stitle"><T fr="Ce qu'il faut savoir" en="What to know" /></h2>
            </div>
            <div className="steps">
              <div className="step">
                <div className="n num">1</div>
                <h4><T fr="Correspondance train" en="Train connection" /></h4>
                <p><T fr="Les deux lignes partent du Dépôt Bus, à deux pas de la gare centrale, pour un changement rapide entre le train et le bus." en="Both lines start at the Bus Depot, right next to the central station, for a quick change between train and bus." /></p>
              </div>
              <div className="step">
                <div className="n num">2</div>
                <h4><T fr="Tarifs" en="Fares" /></h4>
                <p><T fr="Même tarif unique que le réseau ferroviaire. Billets en vente en gare, aux bornes automatiques." en="Same flat fare as the rail network. Tickets sold at stations, from ticket machines." /></p>
              </div>
              <div className="step">
                <div className="n num">3</div>
                <h4><T fr="Accessibilité" en="Accessibility" /></h4>
                <p><T fr="Bus à plancher bas et rampe d'accès, comme sur le reste du réseau TTE." en="Low-floor buses with access ramp, as on the rest of the TTE network." /></p>
              </div>
              <div className="step">
                <div className="n num">4</div>
                <h4><T fr="Horaires détaillés" en="Detailed timetables" /></h4>
                <p><T fr="Consultez le tableau des lignes & horaires pour les prochains départs de chaque ligne." en="Check the lines & timetables table for the next departures on each line." /></p>
              </div>
            </div>
            <div className="bus-cta-row">
              <a href="/#lignes" className="btn btn-primary"><T fr="Voir toutes les lignes & horaires" en="See all lines & timetables" /></a>
              <a href="/contact" className="btn btn-outline"><T fr="Une question ? Contactez-nous" en="A question? Contact us" /></a>
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
