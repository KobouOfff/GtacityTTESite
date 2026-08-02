import { useState } from "react";
import "./Accueil.css";
import "./Histoire.css";
import { DiscordAuthButton } from "@/components/DiscordAuth";
import { TTELogo } from "@/components/TTELogo";
import { T } from "@/components/T";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const modernization = [
  { fr: "Modernisation des infrastructures", en: "Modernisation of infrastructure" },
  { fr: "Rénovation complète de la gare centrale", en: "Full renovation of the central station" },
  { fr: "Création d’un véritable service de maintenance", en: "Creation of a proper maintenance department" },
  { fr: "Développement d’un service de sûreté ferroviaire", en: "Development of a railway security department" },
  { fr: "Professionnalisation de l’exploitation quotidienne", en: "Professionalisation of day-to-day operations" },
];

const investments = [
  { fr: "La rénovation complète de la gare centrale", en: "The full renovation of the central station" },
  { fr: "L’amélioration des quais", en: "Platform improvements" },
  { fr: "La modernisation de la signalisation", en: "Signalling modernisation" },
  { fr: "La création d’ateliers de maintenance", en: "The creation of maintenance workshops" },
  { fr: "Le renouvellement des équipements de sécurité", en: "The renewal of safety equipment" },
  { fr: "La formation du personnel", en: "Staff training" },
];

const mission = [
  { fr: "Sûr", en: "Safe" },
  { fr: "Fiable", en: "Reliable" },
  { fr: "Accessible", en: "Accessible" },
  { fr: "Moderne", en: "Modern" },
];

const values = [
  { title: "Sécurité", titleEn: "Safety", text: "La protection des voyageurs et du personnel est notre priorité absolue.", textEn: "The protection of travellers and staff is our absolute priority." },
  { title: "Fiabilité", titleEn: "Reliability", text: "Nous mettons tout en œuvre pour assurer un service ponctuel et performant.", textEn: "We do everything we can to keep the service punctual and high-performing." },
  { title: "Innovation", titleEn: "Innovation", text: "Nous investissons continuellement dans la modernisation de nos infrastructures et de notre matériel.", textEn: "We continually invest in modernising our infrastructure and rolling stock." },
  { title: "Responsabilité", titleEn: "Responsibility", text: "Nous agissons dans l’intérêt de nos voyageurs, de nos collaborateurs et des collectivités que nous desservons.", textEn: "We act in the interest of our travellers, our staff, and the communities we serve." },
  { title: "Engagement local", titleEn: "Local commitment", text: "Profondément ancrée à Townsend, TTE participe activement au développement économique et social du Tennessee.", textEn: "Deeply rooted in Townsend, TTE actively contributes to the economic and social development of Tennessee." },
];

export default function HistoirePage() {
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
            <a href="/histoire" className="active">
              <T fr="Histoire" en="History" />
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

      <main className="history-page">
        <section className="history-hero">
          <div className="wrap">
            <div className="history-crumb">
              <a href="/"><T fr="Accueil" en="Home" /></a>
              <span>›</span>
              <span><T fr="Notre histoire" en="Our history" /></span>
            </div>
            <span className="eyebrow"><T fr="Depuis 1983" en="Since 1983" /></span>
            <h1><T fr="Une entreprise ferroviaire familiale tournée vers l’avenir" en="A family-owned railway company looking to the future" /></h1>
            <p>
              <T
                fr="Fondée à Townsend par Robert Turner, Townsend Transit Express s’est développée autour d’une même ambition : proposer un transport régional sûr, fiable, accessible et moderne."
                en="Founded in Townsend by Robert Turner, Townsend Transit Express grew around a single ambition: to offer safe, reliable, accessible and modern regional transport."
              />
            </p>
          </div>
        </section>

        <section className="history-intro">
          <div className="wrap history-intro-grid">
            <div>
              <span className="eyebrow"><T fr="Les origines · 1983" en="The origins · 1983" /></span>
              <h2><T fr="Une société née des besoins de Townsend" en="A company born from Townsend's needs" /></h2>
            </div>
            <div className="history-prose">
              <p>
                <T
                  fr="Townsend Transit Express (TTE) trouve son origine en 1983, lorsque Robert Turner, entrepreneur originaire de Townsend (Tennessee), fonde une petite société ferroviaire privée destinée à répondre aux besoins croissants de mobilité entre Townsend et les communes voisines."
                  en="Townsend Transit Express (TTE) traces its origins to 1983, when Robert Turner, an entrepreneur from Townsend, Tennessee, founded a small private railway company to meet the growing need for mobility between Townsend and neighbouring towns."
                />
              </p>
              <p>
                <T
                  fr="À cette époque, le réseau est limité à quelques kilomètres de voies et un unique dépôt. L’entreprise assure essentiellement des liaisons locales et le transport de travailleurs, devenant rapidement un acteur essentiel du développement économique de la région."
                  en="At the time, the network was limited to a few miles of track and a single depot. The company mainly ran local connections and worker transport, quickly becoming a key player in the region's economic development."
                />
              </p>
              <p>
                <T
                  fr="Grâce à une gestion rigoureuse et à des investissements réguliers dans ses infrastructures, TTE acquiert une solide réputation de fiabilité."
                  en="Through rigorous management and regular investment in its infrastructure, TTE built a solid reputation for reliability."
                />
              </p>
            </div>
          </div>
        </section>

        <section className="history-content-section">
          <div className="wrap history-story-grid">
            <article className="history-story">
              <span className="eyebrow"><T fr="Gouvernance" en="Governance" /></span>
              <h2><T fr="Une entreprise familiale" en="A family-owned company" /></h2>
              <p>
                <T fr="Pendant plusieurs décennies, la société reste une entreprise familiale dirigée par la famille Turner." en="For several decades, the company remained a family business run by the Turner family." />
              </p>
              <p>
                <T
                  fr="Après le décès de son fondateur, son fils Richard Turner, diplômé en Business Management de l’Université Vanderbilt, poursuit sa carrière dans le secteur des investissements et fonde Turner Enterprise Management (TEM)."
                  en="After the founder's death, his son Richard Turner, a Business Management graduate of Vanderbilt University, went on to a career in investment and founded Turner Enterprise Management (TEM)."
                />
              </p>
              <p>
                <T
                  fr="Au fil des années, TEM acquiert progressivement une participation majoritaire dans Townsend Transit Express afin de préserver l’héritage familial et d’assurer la pérennité de l’entreprise."
                  en="Over the years, TEM gradually acquired a majority stake in Townsend Transit Express to preserve the family legacy and secure the company's future."
                />
              </p>
              <p className="history-highlight">
                <T
                  fr={<>Aujourd’hui, Turner Enterprise Management détient <strong>85 % du capital</strong> de Townsend Transit Express, les 15 % restants étant répartis entre plusieurs investisseurs privés.</>}
                  en={<>Today, Turner Enterprise Management holds <strong>85% of the capital</strong> of Townsend Transit Express, with the remaining 15% held by several private investors.</>}
                />
              </p>
            </article>

            <article className="history-story">
              <span className="eyebrow"><T fr="Direction" en="Leadership" /></span>
              <h2><T fr="Une nouvelle impulsion" en="A fresh drive" /></h2>
              <p>
                <T
                  fr="Afin d’accompagner la modernisation de l’entreprise, Richard Turner décide de confier la direction opérationnelle à James Wyatt, nommé Chief Executive Officer (CEO)."
                  en="To support the company's modernisation, Richard Turner entrusted operational leadership to James Wyatt, appointed Chief Executive Officer (CEO)."
                />
              </p>
              <p><T fr="Sous son impulsion, TTE connaît une profonde transformation :" en="Under his leadership, TTE underwent a deep transformation:" /></p>
              <ul className="history-list">
                {modernization.map((item) => <li key={item.fr}><T fr={item.fr} en={item.en} /></li>)}
              </ul>
              <p>
                <T
                  fr="Richard Turner demeure Président du Conseil d’administration et supervise les orientations stratégiques ainsi que les investissements majeurs de l’entreprise."
                  en="Richard Turner remains Chairman of the Board and oversees the company's strategic direction and major investments."
                />
              </p>
            </article>
          </div>
        </section>

        <section className="history-investments">
          <div className="wrap history-investment-card">
            <div>
              <span className="eyebrow"><T fr="Développement du réseau" en="Network development" /></span>
              <h2><T fr="Les investissements" en="Investments" /></h2>
              <p>
                <T
                  fr="Depuis sa reprise, Townsend Transit Express a investi plusieurs centaines de milliers de dollars dans le développement de son réseau."
                  en="Since the takeover, Townsend Transit Express has invested several hundred thousand dollars in developing its network."
                />
              </p>
            </div>
            <div>
              <p><T fr="Parmi les principaux investissements figurent :" en="Key investments include:" /></p>
              <ul className="history-list two-columns">
                {investments.map((item) => <li key={item.fr}><T fr={item.fr} en={item.en} /></li>)}
              </ul>
              <p>
                <T
                  fr="Ces investissements ont permis d’améliorer la qualité du service tout en garantissant un haut niveau de sécurité."
                  en="These investments have improved service quality while maintaining a high level of safety."
                />
              </p>
            </div>
          </div>
        </section>

        <section className="history-commitments">
          <div className="wrap">
            <div className="history-heading light">
              <span className="eyebrow"><T fr="Notre mission" en="Our mission" /></span>
              <h2><T fr="Plus de quarante ans au service des voyageurs" en="Over forty years serving travellers" /></h2>
              <p>
                <T
                  fr="Depuis plus de quarante ans, Townsend Transit Express s’engage à offrir un transport ferroviaire sûr, fiable, accessible et moderne."
                  en="For over forty years, Townsend Transit Express has been committed to providing safe, reliable, accessible and modern rail transport."
                />
              </p>
            </div>
            <div className="history-stats">
              {mission.map((item, index) => (
                <article key={item.fr}>
                  <strong>{String(index + 1).padStart(2, "0")}</strong>
                  <h3><T fr={item.fr} en={item.en} /></h3>
                </article>
              ))}
            </div>
            <p className="history-mission-copy">
              <T
                fr="Notre priorité demeure la sécurité de nos voyageurs, de nos collaborateurs et de nos infrastructures. Chaque jour, nos équipes assurent l’exploitation du réseau, la maintenance du matériel roulant et l’accueil des voyageurs afin de garantir un service répondant aux plus hauts standards de qualité."
                en="Our priority remains the safety of our travellers, our staff and our infrastructure. Every day, our teams run the network, maintain rolling stock and welcome travellers to guarantee a service that meets the highest quality standards."
              />
            </p>
          </div>
        </section>

        <section className="history-values">
          <div className="wrap">
            <div className="history-heading">
              <span className="eyebrow"><T fr="Notre culture" en="Our culture" /></span>
              <h2><T fr="Les valeurs qui nous guident" en="The values that guide us" /></h2>
            </div>
            <div className="history-values-grid">
              {values.map((item) => (
                <article key={item.title}>
                  <h3><T fr={item.title} en={item.titleEn} /></h3>
                  <p><T fr={item.text} en={item.textEn} /></p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="history-future">
          <div className="wrap history-future-card">
            <div>
              <span className="eyebrow"><T fr="Aujourd’hui" en="Today" /></span>
              <h2><T fr="Une référence régionale en construction" en="Building a regional benchmark" /></h2>
              <p>
                <T
                  fr="Townsend Transit Express poursuit son développement avec l’ambition de devenir une référence du transport ferroviaire régional américain. Forte de son héritage familial, de l’expérience de ses collaborateurs et d’une gouvernance tournée vers l’avenir, l’entreprise continue d’investir dans des solutions de mobilité sûres, performantes et durables au service des habitants du Tennessee."
                  en="Townsend Transit Express continues to grow with the ambition of becoming a benchmark for regional rail transport in the United States. Backed by its family heritage, the experience of its staff and forward-looking governance, the company keeps investing in safe, high-performing and sustainable mobility solutions for the people of Tennessee."
                />
              </p>
            </div>
            <a href="/contact#suggestion" className="btn btn-primary">
              <T fr="Proposer une idée" en="Suggest an idea" />
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
                <T
                  fr="Townsend Transit Express — le réseau ferroviaire de l’est du Tennessee, au départ de Townsend et des Great Smoky Mountains."
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
