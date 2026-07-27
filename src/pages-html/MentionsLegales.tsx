import { useState } from "react";
import { DiscordAuthButton } from "@/components/DiscordAuth";
import { TTELogo } from "@/components/TTELogo";
import "./Accueil.css";
import "./MentionsLegales.css";

export default function MentionsLegalesPage() {
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
            <a href="/histoire">Histoire</a>
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
              <a href="/">Accueil</a>
              <span>›</span>
              <span>Mentions légales</span>
            </div>
            <span className="eyebrow">Informations juridiques</span>
            <h1>Mentions légales</h1>
            <p>
              Informations relatives à l’éditeur, à l’hébergement et aux conditions
              d’utilisation du site Townsend Transit Express.
            </p>
          </div>
        </section>

        <section className="legal-content">
          <div className="wrap legal-layout">
            <aside className="legal-summary" aria-label="Sommaire">
              <strong>Sommaire</strong>
              <a href="#editeur">Éditeur du site</a>
              <a href="#hebergement">Hébergement</a>
              <a href="#publication">Directeur de la publication</a>
              <a href="#propriete">Propriété intellectuelle</a>
              <a href="#marques">Marques</a>
              <a href="#donnees">Protection des données</a>
              <a href="#cookies">Cookies</a>
              <a href="#responsabilite">Responsabilité</a>
              <a href="#liens">Liens externes</a>
              <a href="#droit">Droit applicable</a>
            </aside>

            <article className="legal-article">
              <div className="legal-document">
                <div>
                  <span>Document officiel · Version 1.0</span>
                  <h2>Conditions Générales de Transport</h2>
                  <p>
                    Conditions de vente et de transport, règlement des voyageurs,
                    bagages, sécurité et responsabilité.
                  </p>
                </div>
                <a
                  className="btn btn-primary"
                  href="/conditions-generales-transport-tte-v1.pdf"
                  target="_blank"
                  rel="noreferrer"
                >
                  Consulter le document PDF
                </a>
              </div>

              <section id="editeur">
                <h2>Éditeur du site</h2>
                <p>Le présent site est édité par :</p>
                <div className="legal-company">
                  <strong>Townsend Transit Express (TTE)</strong>
                  <span>Société ferroviaire privée de transport de voyageurs.</span>
                </div>
                <dl className="legal-details">
                  <div>
                    <dt>Siège social</dt>
                    <dd>Gare centrale de Townsend, Townsend, Tennessee (USA)</dd>
                  </div>
                  <div>
                    <dt>Président du Conseil d’administration</dt>
                    <dd>Richard Turner</dd>
                  </div>
                  <div>
                    <dt>Directeur Général (Chief Executive Officer)</dt>
                    <dd>James Wyatt</dd>
                  </div>
                  <div>
                    <dt>Capital social</dt>
                    <dd>50 000 000 $</dd>
                  </div>
                  <div>
                    <dt>Numéro d’enregistrement</dt>
                    <dd>TTE-1983-TN</dd>
                  </div>
                  <div>
                    <dt>Courriel</dt>
                    <dd>
                      <a href="mailto:contact@townsendtransitexpress.com">
                        contact@townsendtransitexpress.com
                      </a>
                    </dd>
                  </div>
                </dl>
              </section>

              <section id="hebergement">
                <h2>Hébergement</h2>
                <p>Le site est hébergé par :</p>
                <p>
                  <strong>Townsend Transit Express – Département Informatique</strong>
                </p>
              </section>

              <section id="publication">
                <h2>Directeur de la publication</h2>
                <p>
                  <strong>James Wyatt</strong>
                  <br />
                  Chief Executive Officer
                </p>
              </section>

              <section id="propriete">
                <h2>Propriété intellectuelle</h2>
                <p>
                  L’ensemble des contenus présents sur ce site (textes, photographies,
                  illustrations, logos, marques, vidéos, documents et éléments
                  graphiques) est la propriété exclusive de Townsend Transit Express ou
                  fait l’objet d’une autorisation d’utilisation.
                </p>
                <p>
                  Toute reproduction, représentation ou diffusion, totale ou partielle,
                  sans autorisation écrite préalable est interdite.
                </p>
              </section>

              <section id="marques">
                <h2>Marques</h2>
                <p>
                  Les marques Townsend Transit Express, TTE, ainsi que leurs logos sont
                  des marques exploitées par Townsend Transit Express.
                </p>
                <p>Toute utilisation non autorisée est interdite.</p>
              </section>

              <section id="donnees">
                <h2>Protection des données</h2>
                <p>
                  Townsend Transit Express s’engage à protéger les données personnelles
                  de ses utilisateurs.
                </p>
                <p>Les informations collectées via les formulaires du site sont utilisées uniquement pour :</p>
                <ul>
                  <li>répondre aux demandes de contact ;</li>
                  <li>assurer le suivi des réclamations ;</li>
                  <li>améliorer nos services.</li>
                </ul>
                <p>Aucune donnée n’est vendue à des tiers.</p>
              </section>

              <section id="cookies">
                <h2>Cookies</h2>
                <p>Le site peut utiliser des cookies destinés à :</p>
                <ul>
                  <li>assurer son bon fonctionnement ;</li>
                  <li>mesurer l’audience ;</li>
                  <li>améliorer l’expérience utilisateur.</li>
                </ul>
                <p>
                  L’utilisateur peut configurer son navigateur afin de refuser ces
                  cookies.
                </p>
              </section>

              <section id="responsabilite">
                <h2>Responsabilité</h2>
                <p>
                  Townsend Transit Express met tout en œuvre afin d’assurer l’exactitude
                  des informations publiées.
                </p>
                <p>
                  Toutefois, la société ne peut garantir l’absence d’erreurs ou
                  d’interruptions du service.
                </p>
                <p>
                  Les horaires, tarifs et informations d’exploitation sont susceptibles
                  d’être modifiés sans préavis.
                </p>
              </section>

              <section id="liens">
                <h2>Liens externes</h2>
                <p>Le site peut contenir des liens vers des sites tiers.</p>
                <p>
                  Townsend Transit Express ne saurait être tenue responsable du contenu
                  de ces sites.
                </p>
              </section>

              <section id="droit">
                <h2>Droit applicable</h2>
                <p>
                  Les présentes mentions légales sont régies par les lois de l’État du
                  Tennessee ainsi que par les lois fédérales applicables des États-Unis
                  d’Amérique.
                </p>
                <p>
                  Tout litige relatif à l’utilisation du site relève de la compétence des
                  juridictions compétentes de l’État du Tennessee.
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
              <a href="/contact">Nous contacter</a>
              <a href="/mentions-legales">Mentions légales</a>
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
