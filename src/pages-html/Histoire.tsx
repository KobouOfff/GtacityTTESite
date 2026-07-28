import { useState } from "react";
import "./Accueil.css";
import "./Histoire.css";
import { DiscordAuthButton } from "@/components/DiscordAuth";
import { TTELogo } from "@/components/TTELogo";

const modernization = [
  "Modernisation des infrastructures",
  "Rénovation complète de la gare centrale",
  "Création d’un véritable service de maintenance",
  "Développement d’un service de sûreté ferroviaire",
  "Professionnalisation de l’exploitation quotidienne",
];

const investments = [
  "La rénovation complète de la gare centrale",
  "L’amélioration des quais",
  "La modernisation de la signalisation",
  "La création d’ateliers de maintenance",
  "Le renouvellement des équipements de sécurité",
  "La formation du personnel",
];

const mission = ["Sûr", "Fiable", "Accessible", "Moderne"];

const values = [
  { title: "Sécurité", text: "La protection des voyageurs et du personnel est notre priorité absolue." },
  { title: "Fiabilité", text: "Nous mettons tout en œuvre pour assurer un service ponctuel et performant." },
  { title: "Innovation", text: "Nous investissons continuellement dans la modernisation de nos infrastructures et de notre matériel." },
  { title: "Responsabilité", text: "Nous agissons dans l’intérêt de nos voyageurs, de nos collaborateurs et des collectivités que nous desservons." },
  { title: "Engagement local", text: "Profondément ancrée à Townsend, TTE participe activement au développement économique et social du Tennessee." },
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
            <span className="eyebrow">Depuis 1983</span>
            <h1>Une entreprise ferroviaire familiale tournée vers l’avenir</h1>
            <p>
              Fondée à Townsend par Robert Turner, Townsend Transit Express s’est
              développée autour d’une même ambition : proposer un transport régional
              sûr, fiable, accessible et moderne.
            </p>
          </div>
        </section>

        <section className="history-intro">
          <div className="wrap history-intro-grid">
            <div>
              <span className="eyebrow">Les origines · 1983</span>
              <h2>Une société née des besoins de Townsend</h2>
            </div>
            <div className="history-prose">
              <p>
                Townsend Transit Express (TTE) trouve son origine en 1983, lorsque
                Robert Turner, entrepreneur originaire de Townsend (Tennessee), fonde
                une petite société ferroviaire privée destinée à répondre aux besoins
                croissants de mobilité entre Townsend et les communes voisines.
              </p>
              <p>
                À cette époque, le réseau est limité à quelques kilomètres de voies et
                un unique dépôt. L’entreprise assure essentiellement des liaisons
                locales et le transport de travailleurs, devenant rapidement un acteur
                essentiel du développement économique de la région.
              </p>
              <p>
                Grâce à une gestion rigoureuse et à des investissements réguliers dans
                ses infrastructures, TTE acquiert une solide réputation de fiabilité.
              </p>
            </div>
          </div>
        </section>

        <section className="history-content-section">
          <div className="wrap history-story-grid">
            <article className="history-story">
              <span className="eyebrow">Gouvernance</span>
              <h2>Une entreprise familiale</h2>
              <p>
                Pendant plusieurs décennies, la société reste une entreprise familiale
                dirigée par la famille Turner.
              </p>
              <p>
                Après le décès de son fondateur, son fils Richard Turner, diplômé en
                Business Management de l’Université Vanderbilt, poursuit sa carrière
                dans le secteur des investissements et fonde Turner Enterprise
                Management (TEM).
              </p>
              <p>
                Au fil des années, TEM acquiert progressivement une participation
                majoritaire dans Townsend Transit Express afin de préserver l’héritage
                familial et d’assurer la pérennité de l’entreprise.
              </p>
              <p className="history-highlight">
                Aujourd’hui, Turner Enterprise Management détient <strong>85 % du
                capital</strong> de Townsend Transit Express, les 15 % restants étant
                répartis entre plusieurs investisseurs privés.
              </p>
            </article>

            <article className="history-story">
              <span className="eyebrow">Direction</span>
              <h2>Une nouvelle impulsion</h2>
              <p>
                Afin d’accompagner la modernisation de l’entreprise, Richard Turner
                décide de confier la direction opérationnelle à James Wyatt, nommé
                Chief Executive Officer (CEO).
              </p>
              <p>Sous son impulsion, TTE connaît une profonde transformation :</p>
              <ul className="history-list">
                {modernization.map((item) => <li key={item}>{item}</li>)}
              </ul>
              <p>
                Richard Turner demeure Président du Conseil d’administration et
                supervise les orientations stratégiques ainsi que les investissements
                majeurs de l’entreprise.
              </p>
            </article>
          </div>
        </section>

        <section className="history-investments">
          <div className="wrap history-investment-card">
            <div>
              <span className="eyebrow">Développement du réseau</span>
              <h2>Les investissements</h2>
              <p>
                Depuis sa reprise, Townsend Transit Express a investi plusieurs
                centaines de milliers de dollars dans le développement de son réseau.
              </p>
            </div>
            <div>
              <p>Parmi les principaux investissements figurent :</p>
              <ul className="history-list two-columns">
                {investments.map((item) => <li key={item}>{item}</li>)}
              </ul>
              <p>
                Ces investissements ont permis d’améliorer la qualité du service tout
                en garantissant un haut niveau de sécurité.
              </p>
            </div>
          </div>
        </section>

        <section className="history-commitments">
          <div className="wrap">
            <div className="history-heading light">
              <span className="eyebrow">Notre mission</span>
              <h2>Plus de quarante ans au service des voyageurs</h2>
              <p>
                Depuis plus de quarante ans, Townsend Transit Express s’engage à offrir
                un transport ferroviaire sûr, fiable, accessible et moderne.
              </p>
            </div>
            <div className="history-stats">
              {mission.map((item, index) => (
                <article key={item}>
                  <strong>{String(index + 1).padStart(2, "0")}</strong>
                  <h3>{item}</h3>
                </article>
              ))}
            </div>
            <p className="history-mission-copy">
              Notre priorité demeure la sécurité de nos voyageurs, de nos
              collaborateurs et de nos infrastructures. Chaque jour, nos équipes
              assurent l’exploitation du réseau, la maintenance du matériel roulant et
              l’accueil des voyageurs afin de garantir un service répondant aux plus
              hauts standards de qualité.
            </p>
          </div>
        </section>

        <section className="history-values">
          <div className="wrap">
            <div className="history-heading">
              <span className="eyebrow">Notre culture</span>
              <h2>Les valeurs qui nous guident</h2>
            </div>
            <div className="history-values-grid">
              {values.map((item) => (
                <article key={item.title}>
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
              <span className="eyebrow">Aujourd’hui</span>
              <h2>Une référence régionale en construction</h2>
              <p>
                Townsend Transit Express poursuit son développement avec l’ambition de
                devenir une référence du transport ferroviaire régional américain.
                Forte de son héritage familial, de l’expérience de ses collaborateurs
                et d’une gouvernance tournée vers l’avenir, l’entreprise continue
                d’investir dans des solutions de mobilité sûres, performantes et
                durables au service des habitants du Tennessee.
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
            <div className="links">
              <a href="/mentions-legales">Mentions légales</a>
              <a href="/confidentialite">Confidentialité</a>
              <a
                href="/conditions-generales-transport-tte-v1.pdf"
                target="_blank"
                rel="noreferrer"
              >
                Conditions de transport
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
