import { useState } from "react";
import "./Accueil.css";
import "./Histoire.css";
import { DiscordAuthButton } from "@/components/DiscordAuth";
import { TTELogo } from "@/components/TTELogo";

const timeline = [
  {
    year: "1921",
    line: "Ligne T",
    title: "La première ligne, à Townsend",
    text: "Le premier train urbain relie la gare centrale à l’hôpital TMC et au quartier résidentiel. Cette ligne fondatrice circule encore aujourd’hui.",
  },
  {
    year: "1948",
    line: "R1 / R2",
    title: "Les Smokies et Knoxville",
    text: "TTE ouvre ses premières lignes régionales vers Sevierville, puis vers Maryville, Alcoa et Knoxville.",
  },
  {
    year: "1973",
    line: "R3 / R4",
    title: "Le corridor est-sud du Tennessee",
    text: "Les liaisons Knoxville–Greeneville et Knoxville–Chattanooga donnent au réseau une véritable dimension régionale.",
  },
  {
    year: "1996",
    line: "IC1",
    title: "Premier InterCité vers Nashville",
    text: "Une liaison directe vers la capitale de l’État fait de TTE un opérateur interrégional.",
  },
  {
    year: "2019",
    line: "IC2",
    title: "Naissance du Smoky Express",
    text: "Townsend et Nashville sont reliées en 3 h 20, avec un arrêt rapide à Knoxville.",
  },
  {
    year: "2026",
    line: "Aujourd’hui",
    title: "Bus local et modernisation",
    text: "Le bus de Townsend complète la desserte locale pendant que le matériel, les gares et l’information voyageurs poursuivent leur modernisation.",
  },
];

const commitments = [
  {
    value: "−74 %",
    title: "Moins de CO₂",
    text: "par rapport à un trajet équivalent réalisé seul en voiture.",
  },
  {
    value: "96,3 %",
    title: "Ponctualité",
    text: "des trains à l’heure ou avec moins de cinq minutes de retard.",
  },
  {
    value: "82 %",
    title: "Électricité bas-carbone",
    text: "de la traction alimentée par une électricité à faibles émissions.",
  },
  {
    value: "0,02 %",
    title: "Sécurité",
    text: "d’incidents signalés à bord pour 100 000 trajets.",
  },
];

export default function HistoirePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <div className="util">
        <div className="util-in">
          <div className="util-grp u-left">
            <a href="/#reseau">Plan du réseau</a>
            <a href="/#lignes">Horaires</a>
            <a href="/#gares">Gares &amp; services</a>
            <a href="/contact">Aide &amp; contact</a>
          </div>
          <div className="util-grp" style={{ alignItems: "center", gap: 12 }}>
            <a className="staff" href="/espace-employes">
              Espace employés
            </a>
            <DiscordAuthButton />
            <span className="sep" />
            <span className="lang">🇺🇸 FR</span>
          </div>
        </div>
      </div>

      <header className={`hdr${menuOpen ? " open" : ""}`} id="hdr">
        <div className="hdr-in">
          <a href="/" className="brand" aria-label="Townsend Transit Express — accueil">
            <TTELogo className="logo" />
            <span className="brand-tx">
              <span className="nm">Townsend Transit Express</span>
              <span className="tg">Réseau ferroviaire du Tennessee</span>
            </span>
          </a>
          <nav className="mainnav">
            <a href="/#reseau">Réseau</a>
            <a href="/#lignes">Lignes &amp; horaires</a>
            <a href="/#gares">Gares</a>
            <a href="/#tarifs">Tarifs</a>
            <a href="/histoire" className="active">
              Histoire
            </a>
          </nav>
          <div className="hdr-sp" />
          <div className="hdr-act">
            <a href="/#finder" className="btn btn-primary">
              Rechercher un horaire
            </a>
            <button
              className="burger"
              type="button"
              aria-label="Ouvrir le menu"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <main className="history-page">
        <section className="history-hero">
          <div className="wrap">
            <div className="history-crumb">
              <a href="/">Accueil</a>
              <span>›</span>
              <span>Notre histoire</span>
            </div>
            <span className="eyebrow">Depuis 1921</span>
            <h1>D’une ligne urbaine à un réseau régional</h1>
            <p>
              Townsend Transit Express est né de la Ligne T, créée pour relier la gare,
              le quartier résidentiel et l’hôpital. Plus d’un siècle après, le réseau
              dessert l’est du Tennessee jusqu’à Nashville et Chattanooga.
            </p>
          </div>
        </section>

        <section className="history-intro">
          <div className="wrap history-intro-grid">
            <div>
              <span className="eyebrow">L’origine du réseau</span>
              <h2>Townsend, là où tout a commencé</h2>
            </div>
            <p>
              Le développement de TTE s’est toujours appuyé sur une idée simple :
              connecter les habitants aux emplois, aux soins et aux grandes villes,
              tout en conservant un service de proximité au cœur de Townsend.
            </p>
          </div>
        </section>

        <section className="history-timeline-section">
          <div className="wrap">
            <div className="history-heading">
              <span className="eyebrow">Chronologie</span>
              <h2>Les grandes étapes de TTE</h2>
            </div>
            <div className="history-timeline">
              {timeline.map((item) => (
                <article className="history-event" key={item.year}>
                  <div className="history-year">{item.year}</div>
                  <div className="history-event-body">
                    <span>{item.line}</span>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="history-commitments">
          <div className="wrap">
            <div className="history-heading light">
              <span className="eyebrow">Nos engagements</span>
              <h2>Faire circuler le Tennessee durablement</h2>
              <p>
                Ponctualité, sécurité, accessibilité et réduction des émissions guident
                chaque évolution du réseau.
              </p>
            </div>
            <div className="history-stats">
              {commitments.map((item) => (
                <article key={item.title}>
                  <strong>{item.value}</strong>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="history-future">
          <div className="wrap history-future-card">
            <div>
              <span className="eyebrow">La suite de l’histoire</span>
              <h2>Un réseau à construire ensemble</h2>
              <p>
                TTE poursuit la modernisation de ses trains, de ses gares et de
                l’information voyageurs, avec un objectif constant : rendre chaque
                déplacement plus simple et plus fiable.
              </p>
            </div>
            <a href="/contact#suggestion" className="btn btn-primary">
              Proposer une idée
            </a>
          </div>
        </section>
      </main>

      <footer className="foot">
        <div className="wrap">
          <div className="foot-top">
            <div className="foot-brand">
              <TTELogo className="logo-f" />
              <p>
                Townsend Transit Express — le réseau ferroviaire de l’est du Tennessee,
                au départ de Townsend et des Great Smoky Mountains.
              </p>
            </div>
            <div className="fcol">
              <h4>Le réseau</h4>
              <a href="/#lignes">Lignes &amp; horaires</a>
              <a href="/#gares">Gares</a>
              <a href="/#tarifs">Tarifs</a>
            </div>
            <div className="fcol">
              <h4>Entreprise</h4>
              <a href="/histoire">Notre histoire</a>
              <a href="/espace-employes">Espace employés</a>
              <a href="/contact">Nous contacter</a>
            </div>
          </div>
          <div className="foot-bot">
            <p>© 2026 Townsend Transit Express. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
