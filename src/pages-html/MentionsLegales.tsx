import { useState } from "react";
import { DiscordAuthButton } from "@/components/DiscordAuth";
import { TTELogo } from "@/components/TTELogo";
import "./Accueil.css";
import "./MentionsLegales.css";
import { T } from "@/components/T";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function MentionsLegalesPage() {
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
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <main className="legal-page">
        <section className="legal-hero">
          <div className="wrap">
            <div className="legal-crumb">
              <a href="/"><T fr="Accueil" en="Home" /></a>
              <span>›</span>
              <span><T fr="Mentions légales" en="Legal notice" /></span>
            </div>
            <span className="eyebrow"><T fr="Informations juridiques" en="Legal information" /></span>
            <h1><T fr="Mentions légales" en="Legal notice" /></h1>
            <p>
              <T
                fr="Informations relatives à l’éditeur, à l’hébergement et aux conditions d’utilisation du site Townsend Transit Express."
                en="Information about the publisher, hosting, and terms of use of the Townsend Transit Express website."
              />
            </p>
          </div>
        </section>

        <section className="legal-content">
          <div className="wrap legal-layout">
            <aside className="legal-summary" aria-label={t("Sommaire", "Contents")}>
              <strong><T fr="Sommaire" en="Contents" /></strong>
              <a href="#editeur"><T fr="Éditeur du site" en="Site publisher" /></a>
              <a href="#hebergement"><T fr="Hébergement" en="Hosting" /></a>
              <a href="#publication"><T fr="Directeur de la publication" en="Publication director" /></a>
              <a href="#propriete"><T fr="Propriété intellectuelle" en="Intellectual property" /></a>
              <a href="#marques"><T fr="Marques" en="Trademarks" /></a>
              <a href="#donnees"><T fr="Protection des données" en="Data protection" /></a>
              <a href="#cookies">Cookies</a>
              <a href="#responsabilite"><T fr="Responsabilité" en="Liability" /></a>
              <a href="#liens"><T fr="Liens externes" en="External links" /></a>
              <a href="#droit"><T fr="Droit applicable" en="Governing law" /></a>
            </aside>

            <article className="legal-article">
              <div className="legal-document">
                <div>
                  <span><T fr="Document officiel · Version 1.0" en="Official document · Version 1.0" /></span>
                  <h2><T fr="Conditions Générales de Transport" en="General Conditions of Carriage" /></h2>
                  <p>
                    <T
                      fr="Conditions de vente et de transport, règlement des voyageurs, bagages, sécurité et responsabilité."
                      en="Terms of sale and carriage, traveller rules, baggage, safety, and liability."
                    />
                  </p>
                </div>
                <a
                  className="btn btn-primary"
                  href="/conditions-generales-transport-tte-v1.pdf"
                  target="_blank"
                  rel="noreferrer"
                >
                  <T fr="Consulter le document PDF" en="View the PDF document" />
                </a>
              </div>

              <section id="editeur">
                <h2><T fr="Éditeur du site" en="Site publisher" /></h2>
                <p><T fr="Le présent site est édité par :" en="This website is published by:" /></p>
                <div className="legal-company">
                  <strong>Townsend Transit Express (TTE)</strong>
                  <span><T fr="Société ferroviaire privée de transport de voyageurs." en="Private passenger rail company." /></span>
                </div>
                <dl className="legal-details">
                  <div>
                    <dt><T fr="Siège social" en="Head office" /></dt>
                    <dd><T fr="Gare centrale de Townsend, Townsend, Tennessee (USA)" en="Townsend central station, Townsend, Tennessee (USA)" /></dd>
                  </div>
                  <div>
                    <dt><T fr="Président du Conseil d’administration" en="Chairman of the Board" /></dt>
                    <dd>Richard Turner</dd>
                  </div>
                  <div>
                    <dt><T fr="Directeur Général (Chief Executive Officer)" en="Chief Executive Officer" /></dt>
                    <dd>James Wyatt</dd>
                  </div>
                  <div>
                    <dt><T fr="Capital social" en="Share capital" /></dt>
                    <dd>$50,000,000</dd>
                  </div>
                  <div>
                    <dt><T fr="Numéro d’enregistrement" en="Registration number" /></dt>
                    <dd>TTE-1983-TN</dd>
                  </div>
                  <div>
                    <dt><T fr="Courriel" en="E-mail" /></dt>
                    <dd>
                      <a href="mailto:support@townsendtransitexpress.com">
                        support@townsendtransitexpress.com
                      </a>
                    </dd>
                  </div>
                </dl>
              </section>

              <section id="hebergement">
                <h2><T fr="Hébergement" en="Hosting" /></h2>
                <p><T fr="Le site est hébergé par :" en="This website is hosted by:" /></p>
                <p>
                  <strong><T fr="Townsend Transit Express – Département Informatique" en="Townsend Transit Express – IT Department" /></strong>
                </p>
              </section>

              <section id="publication">
                <h2><T fr="Directeur de la publication" en="Publication director" /></h2>
                <p>
                  <strong>James Wyatt</strong>
                  <br />
                  Chief Executive Officer
                </p>
              </section>

              <section id="propriete">
                <h2><T fr="Propriété intellectuelle" en="Intellectual property" /></h2>
                <p>
                  <T
                    fr="L’ensemble des contenus présents sur ce site (textes, photographies, illustrations, logos, marques, vidéos, documents et éléments graphiques) est la propriété exclusive de Townsend Transit Express ou fait l’objet d’une autorisation d’utilisation."
                    en="All content on this website (text, photographs, illustrations, logos, trademarks, videos, documents, and graphic elements) is the exclusive property of Townsend Transit Express or is used under authorisation."
                  />
                </p>
                <p>
                  <T
                    fr="Toute reproduction, représentation ou diffusion, totale ou partielle, sans autorisation écrite préalable est interdite."
                    en="Any reproduction, representation, or distribution, in whole or in part, without prior written authorisation is prohibited."
                  />
                </p>
              </section>

              <section id="marques">
                <h2><T fr="Marques" en="Trademarks" /></h2>
                <p>
                  <T
                    fr="Les marques Townsend Transit Express, TTE, ainsi que leurs logos sont des marques exploitées par Townsend Transit Express."
                    en="The Townsend Transit Express and TTE trademarks, and their logos, are trademarks operated by Townsend Transit Express."
                  />
                </p>
                <p><T fr="Toute utilisation non autorisée est interdite." en="Any unauthorised use is prohibited." /></p>
              </section>

              <section id="donnees">
                <h2><T fr="Protection des données" en="Data protection" /></h2>
                <p>
                  <T
                    fr="Townsend Transit Express s’engage à protéger les données personnelles de ses utilisateurs."
                    en="Townsend Transit Express is committed to protecting the personal data of its users."
                  />
                </p>
                <p><T fr="Les informations collectées via les formulaires du site sont utilisées uniquement pour :" en="Information collected through the site's forms is used solely to:" /></p>
                <ul>
                  <li><T fr="répondre aux demandes de contact ;" en="respond to contact requests;" /></li>
                  <li><T fr="assurer le suivi des réclamations ;" en="follow up on complaints;" /></li>
                  <li><T fr="améliorer nos services." en="improve our services." /></li>
                </ul>
                <p><T fr="Aucune donnée n’est vendue à des tiers." en="No data is sold to third parties." /></p>
              </section>

              <section id="cookies">
                <h2>Cookies</h2>
                <p><T fr="Le site peut utiliser des cookies destinés à :" en="This website may use cookies to:" /></p>
                <ul>
                  <li><T fr="assurer son bon fonctionnement ;" en="ensure it works properly;" /></li>
                  <li><T fr="mesurer l’audience ;" en="measure audience;" /></li>
                  <li><T fr="améliorer l’expérience utilisateur." en="improve the user experience." /></li>
                </ul>
                <p>
                  <T
                    fr="L’utilisateur peut configurer son navigateur afin de refuser ces cookies."
                    en="Users can configure their browser to refuse these cookies."
                  />
                </p>
              </section>

              <section id="responsabilite">
                <h2><T fr="Responsabilité" en="Liability" /></h2>
                <p>
                  <T
                    fr="Townsend Transit Express met tout en œuvre afin d’assurer l’exactitude des informations publiées."
                    en="Townsend Transit Express makes every effort to ensure the accuracy of the information published."
                  />
                </p>
                <p>
                  <T
                    fr="Toutefois, la société ne peut garantir l’absence d’erreurs ou d’interruptions du service."
                    en="However, the company cannot guarantee the absence of errors or service interruptions."
                  />
                </p>
                <p>
                  <T
                    fr="Les horaires, tarifs et informations d’exploitation sont susceptibles d’être modifiés sans préavis."
                    en="Timetables, fares, and operational information are subject to change without notice."
                  />
                </p>
              </section>

              <section id="liens">
                <h2><T fr="Liens externes" en="External links" /></h2>
                <p><T fr="Le site peut contenir des liens vers des sites tiers." en="This website may contain links to third-party sites." /></p>
                <p>
                  <T
                    fr="Townsend Transit Express ne saurait être tenue responsable du contenu de ces sites."
                    en="Townsend Transit Express cannot be held responsible for the content of those sites."
                  />
                </p>
              </section>

              <section id="droit">
                <h2><T fr="Droit applicable" en="Governing law" /></h2>
                <p>
                  <T
                    fr="Les présentes mentions légales sont régies par les lois de l’État du Tennessee ainsi que par les lois fédérales applicables des États-Unis d’Amérique."
                    en="This legal notice is governed by the laws of the State of Tennessee and the applicable federal laws of the United States of America."
                  />
                </p>
                <p>
                  <T
                    fr="Tout litige relatif à l’utilisation du site relève de la compétence des juridictions compétentes de l’État du Tennessee."
                    en="Any dispute relating to the use of this website falls under the jurisdiction of the competent courts of the State of Tennessee."
                  />
                </p>
              </section>
            </article>
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
              <a href="/recrutement"><T fr="Recrutement" en="Careers" /></a>
              <a href="/contact"><T fr="Nous contacter" en="Contact us" /></a>
              <a href="/mentions-legales"><T fr="Mentions légales" en="Legal notice" /></a>
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
