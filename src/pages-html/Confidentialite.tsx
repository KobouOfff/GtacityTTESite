import { useState } from "react";
import { DiscordAuthButton } from "@/components/DiscordAuth";
import { TTELogo } from "@/components/TTELogo";
import "./Accueil.css";
import "./MentionsLegales.css";
import "./Confidentialite.css";

export default function ConfidentialitePage() {
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

      <main className="legal-page privacy-page">
        <section className="legal-hero privacy-hero">
          <div className="wrap">
            <div className="legal-crumb">
              <a href="/">Accueil</a>
              <span>›</span>
              <span>Confidentialité</span>
            </div>
            <span className="eyebrow">Protection des données</span>
            <h1>Politique de confidentialité</h1>
            <p>
              Cette politique explique quelles données Townsend Transit Express
              collecte, pourquoi elles sont utilisées et comment exercer vos choix.
            </p>
            <div className="privacy-version">
              Version 1.0 · Mise à jour le 28 juillet 2026
            </div>
          </div>
        </section>

        <section className="legal-content">
          <div className="wrap legal-layout">
            <aside className="legal-summary" aria-label="Sommaire">
              <strong>Sommaire</strong>
              <a href="#responsable">Responsable</a>
              <a href="#collecte">Données collectées</a>
              <a href="#utilisation">Utilisation</a>
              <a href="#discord">Connexion Discord</a>
              <a href="#partage">Destinataires</a>
              <a href="#conservation">Conservation</a>
              <a href="#cookies">Cookies</a>
              <a href="#securite">Sécurité</a>
              <a href="#droits">Vos droits</a>
              <a href="#mineurs">Mineurs</a>
              <a href="#contact">Nous contacter</a>
            </aside>

            <article className="legal-article">
              <div className="privacy-notice">
                <strong>L’essentiel</strong>
                <p>
                  TTE ne vend pas vos données personnelles et n’utilise actuellement
                  aucun cookie publicitaire. Les données sont utilisées pour assurer la
                  connexion, répondre aux demandes et exploiter les services internes.
                </p>
              </div>

              <section id="responsable">
                <h2>1. Responsable du traitement</h2>
                <p>Les données traitées sur ce site sont placées sous la responsabilité de :</p>
                <div className="legal-company">
                  <strong>Townsend Transit Express (TTE)</strong>
                  <span>
                    Gare centrale de Townsend, Townsend, Tennessee, États-Unis
                  </span>
                  <a href="mailto:contact@townsendtransitexpress.com">
                    contact@townsendtransitexpress.com
                  </a>
                </div>
              </section>

              <section id="collecte">
                <h2>2. Données que nous collectons</h2>
                <div className="privacy-data-grid">
                  <div>
                    <h3>Compte Discord</h3>
                    <p>
                      Identifiant Discord, nom d’utilisateur, nom affiché ou surnom,
                      avatar, appartenance au serveur TTE et identifiants des rôles.
                    </p>
                  </div>
                  <div>
                    <h3>Demandes de contact</h3>
                    <p>
                      Catégorie, objet, message, informations fournies dans le formulaire,
                      statut de traitement, service destinataire et notes de suivi.
                    </p>
                  </div>
                  <div>
                    <h3>Activité professionnelle</h3>
                    <p>
                      Présence récente, opérations effectuées par les agents, publications
                      d’information trafic et identité professionnelle de leur auteur.
                    </p>
                  </div>
                  <div>
                    <h3>Contrôle des titres</h3>
                    <p>
                      Lorsque cette fonction interne est utilisée : identité du
                      contrevenant, référence du document présenté, date de naissance,
                      motif, ligne, montant, statut de paiement et observations.
                    </p>
                  </div>
                  <div>
                    <h3>Données techniques</h3>
                    <p>
                      Cookie de session nécessaire, données de navigation techniquement
                      transmises au serveur et informations de sécurité indispensables au
                      fonctionnement et à la prévention des abus.
                    </p>
                  </div>
                </div>
                <p>
                  Nous vous demandons de ne pas transmettre de données sensibles ou
                  inutiles dans les champs de texte libre.
                </p>
              </section>

              <section id="utilisation">
                <h2>3. Pourquoi ces données sont utilisées</h2>
                <ul>
                  <li>authentifier les utilisateurs avec Discord ;</li>
                  <li>vérifier l’appartenance au serveur TTE et les autorisations liées aux rôles ;</li>
                  <li>recevoir, attribuer et traiter les demandes de contact ou réclamations ;</li>
                  <li>afficher à l’utilisateur l’historique et l’état de ses demandes ;</li>
                  <li>assurer le fonctionnement des espaces réservés au personnel ;</li>
                  <li>publier et maintenir les informations relatives au trafic ;</li>
                  <li>gérer les opérations de contrôle et leur traçabilité ;</li>
                  <li>sécuriser le site, prévenir les abus et résoudre les incidents techniques ;</li>
                  <li>respecter les obligations légales et répondre aux demandes officielles valides.</li>
                </ul>
              </section>

              <section id="discord">
                <h2>4. Connexion avec Discord</h2>
                <p>
                  La connexion utilise le protocole OAuth2 de Discord avec l’autorisation
                  d’identifier votre compte. TTE reçoit les informations de profil
                  mentionnées ci-dessus, puis vérifie votre appartenance et vos rôles sur
                  le serveur Discord TTE.
                </p>
                <p>
                  TTE ne reçoit jamais votre mot de passe Discord. Discord traite
                  également des données selon sa propre politique de confidentialité.
                  Vous pouvez mettre fin à la session TTE en utilisant le bouton de
                  déconnexion ou de changement de compte.
                </p>
              </section>

              <section id="partage">
                <h2>5. Destinataires et prestataires techniques</h2>
                <p>Les données sont accessibles uniquement selon les besoins du service :</p>
                <ul>
                  <li>aux agents TTE autorisés, selon leurs fonctions et leurs rôles ;</li>
                  <li>à la direction et aux services chargés du suivi des demandes ;</li>
                  <li>à Discord pour l’authentification et la vérification du compte ;</li>
                  <li>à Supabase pour l’hébergement et le traitement de la base de données ;</li>
                  <li>à Vercel pour l’hébergement et l’exécution technique du site.</li>
                </ul>
                <p>
                  TTE ne vend ni ne loue les données personnelles et ne les communique pas
                  à des annonceurs. Une divulgation peut néanmoins intervenir lorsqu’elle
                  est exigée par la loi, une décision de justice ou une demande officielle
                  juridiquement valable.
                </p>
              </section>

              <section id="conservation">
                <h2>6. Durée de conservation</h2>
                <p>
                  Le cookie de session est configuré pour une durée maximale de 30 jours,
                  sauf déconnexion ou suppression antérieure dans le navigateur.
                </p>
                <p>
                  Les demandes, notes de suivi, enregistrements opérationnels et données
                  de contrôle sont conservés pendant la durée nécessaire à leur traitement,
                  à la continuité du service, à la sécurité, à la résolution des litiges et
                  au respect des obligations applicables. Ils sont ensuite supprimés ou
                  rendus anonymes lorsqu’ils ne sont plus nécessaires.
                </p>
                <p>
                  Certaines informations peuvent être conservées plus longtemps lorsque la
                  loi l’exige ou lorsqu’elles sont nécessaires à la constatation, à
                  l’exercice ou à la défense de droits.
                </p>
              </section>

              <section id="cookies">
                <h2>7. Cookies et stockage dans le navigateur</h2>
                <p>
                  Le site utilise un cookie strictement nécessaire nommé
                  <code>tte_session</code>. Il maintient la connexion, sécurise le parcours
                  OAuth et conserve la session de l’utilisateur. Il est protégé contre la
                  lecture par JavaScript, transmis uniquement par connexion sécurisée et
                  configuré avec une protection contre certains envois entre sites.
                </p>
                <p>
                  Le navigateur peut également conserver localement certains réglages ou
                  états nécessaires aux fonctions opérationnelles. Ces éléments restent
                  sur l’appareil jusqu’à leur remplacement ou leur suppression.
                </p>
                <p>
                  Aucun cookie publicitaire ou outil de mesure d’audience n’est actuellement
                  installé par TTE. Si cela change, cette politique sera mise à jour et les
                  choix appropriés seront proposés.
                </p>
              </section>

              <section id="securite">
                <h2>8. Sécurité</h2>
                <p>
                  TTE met en œuvre des mesures techniques et organisationnelles destinées
                  à limiter l’accès non autorisé, la modification, la divulgation ou la
                  perte de données. Les accès internes reposent notamment sur
                  l’authentification, les rôles Discord et des contrôles côté serveur.
                </p>
                <p>
                  Aucun système ne peut toutefois garantir une sécurité absolue. En cas de
                  suspicion concernant votre compte ou vos données, contactez-nous sans
                  délai.
                </p>
              </section>

              <section id="droits">
                <h2>9. Vos choix et vos droits</h2>
                <p>
                  Sous réserve des conditions et exceptions prévues par la législation
                  applicable, vous pouvez demander :
                </p>
                <ul>
                  <li>la confirmation que TTE traite ou non vos données ;</li>
                  <li>l’accès aux données personnelles vous concernant ;</li>
                  <li>la correction de données inexactes ;</li>
                  <li>la suppression de certaines données ;</li>
                  <li>une copie portable des données que vous avez fournies ;</li>
                  <li>des informations complémentaires sur l’utilisation de vos données ;</li>
                  <li>le réexamen d’un refus opposé à votre demande.</li>
                </ul>
                <p>
                  Pour protéger vos informations, TTE peut demander une vérification
                  raisonnable de votre identité. Une demande peut être refusée ou limitée
                  lorsqu’une exception légale s’applique, notamment pour la sécurité, la
                  prévention de la fraude, les archives obligatoires ou la défense de
                  droits.
                </p>
                <a className="btn btn-primary privacy-action" href="mailto:contact@townsendtransitexpress.com?subject=Demande%20relative%20à%20mes%20données">
                  Exercer mes droits
                </a>
              </section>

              <section id="mineurs">
                <h2>10. Protection des mineurs</h2>
                <p>
                  Le site n’est pas conçu pour collecter sciemment des données personnelles
                  d’enfants de moins de 13 ans. Si vous pensez qu’un enfant nous a transmis
                  des informations personnelles, contactez-nous afin que nous puissions
                  examiner la situation et prendre les mesures appropriées.
                </p>
              </section>

              <section id="modifications">
                <h2>11. Modification de la politique</h2>
                <p>
                  Cette politique peut être modifiée pour refléter une évolution du site,
                  des services ou des obligations applicables. La date et la version
                  affichées en haut de cette page permettent d’identifier la politique en
                  vigueur.
                </p>
              </section>

              <section id="contact">
                <h2>12. Nous contacter</h2>
                <p>
                  Pour toute question, réclamation ou demande relative à vos données :
                </p>
                <div className="privacy-contact">
                  <strong>Townsend Transit Express</strong>
                  <span>Gare centrale de Townsend, Townsend, Tennessee, USA</span>
                  <a href="mailto:contact@townsendtransitexpress.com">
                    contact@townsendtransitexpress.com
                  </a>
                  <a href="/contact">Formulaire de contact</a>
                </div>
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
