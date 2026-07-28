import { useState } from "react";
import { DiscordAuthButton } from "@/components/DiscordAuth";
import { TTELogo } from "@/components/TTELogo";
import "./Accueil.css";
import "./MentionsLegales.css";
import "./Confidentialite.css";

const dataCategories = [
  {
    title: "Voyageurs",
    text: "Demandes de renseignement, réclamations, objets perdus, demandes d’assistance et références nécessaires au suivi du dossier.",
  },
  {
    title: "Comptes Discord",
    text: "Identifiant, nom d’utilisateur, nom affiché, avatar, appartenance au serveur TTE et rôles utiles pour contrôler les accès.",
  },
  {
    title: "Personnel TTE",
    text: "Présence en service, affectation, actions réalisées dans les outils internes et identité de l’agent ayant publié une information.",
  },
  {
    title: "Contrôles à bord",
    text: "Identité déclarée, document présenté, date de naissance, motif du procès-verbal, ligne, montant, paiement et observations de l’agent.",
  },
];

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
            <span className="eyebrow">Charte TTE</span>
            <h1>Confidentialité et protection des informations</h1>
            <p>
              La confiance des voyageurs et des agents fait partie de nos engagements.
              TTE limite l’accès aux informations et veille à ce qu’elles soient utilisées
              uniquement pour assurer le transport et le bon fonctionnement du réseau.
            </p>
            <div className="privacy-version">
              Direction de la Sûreté et des Systèmes d’Information · Version 1.0
            </div>
          </div>
        </section>

        <section className="legal-content">
          <div className="wrap legal-layout">
            <aside className="legal-summary" aria-label="Sommaire">
              <strong>Sommaire</strong>
              <a href="#engagement">Notre engagement</a>
              <a href="#informations">Informations concernées</a>
              <a href="#utilisation">Utilisation</a>
              <a href="#acces">Accès internes</a>
              <a href="#discord">Espace Discord</a>
              <a href="#conservation">Conservation</a>
              <a href="#securite">Sécurité</a>
              <a href="#droits">Demandes des voyageurs</a>
              <a href="#personnel">Personnel TTE</a>
              <a href="#contact">Contact</a>
            </aside>

            <article className="legal-article">
              <div className="privacy-notice">
                <strong>Principe TTE</strong>
                <p>
                  Une information confiée à TTE reste réservée au service qui en a besoin.
                  Elle n’est ni vendue, ni utilisée à des fins publicitaires, ni transmise
                  à une personne extérieure sans motif opérationnel valable.
                </p>
              </div>

              <section id="engagement">
                <h2>1. Notre engagement</h2>
                <p>
                  Townsend Transit Express protège les informations confiées par les
                  voyageurs, les agents, les partenaires et les personnes contrôlées à
                  bord de ses trains et autobus.
                </p>
                <p>
                  Chaque membre du personnel doit respecter la discrétion professionnelle.
                  La consultation d’un dossier sans rapport avec ses fonctions est
                  interdite et peut entraîner le retrait immédiat des accès internes.
                </p>
              </section>

              <section id="informations">
                <h2>2. Informations concernées</h2>
                <div className="privacy-data-grid">
                  {dataCategories.map((item) => (
                    <div key={item.title}>
                      <h3>{item.title}</h3>
                      <p>{item.text}</p>
                    </div>
                  ))}
                </div>
                <p>
                  TTE demande uniquement les informations nécessaires au service concerné.
                  Les voyageurs ne doivent pas ajouter de renseignements confidentiels
                  inutiles dans les champs de texte libre.
                </p>
              </section>

              <section id="utilisation">
                <h2>3. Utilisation des informations</h2>
                <p>Les informations peuvent être utilisées pour :</p>
                <ul>
                  <li>répondre à une demande de renseignement ou d’assistance ;</li>
                  <li>retrouver et restituer un objet perdu ;</li>
                  <li>examiner une réclamation ou une demande de remboursement ;</li>
                  <li>vérifier l’identité et les autorisations d’un agent ;</li>
                  <li>organiser le service, la régulation et l’information voyageurs ;</li>
                  <li>établir et suivre un procès-verbal de contrôle ;</li>
                  <li>assurer la sécurité des voyageurs, du personnel et des installations ;</li>
                  <li>conserver la traçabilité d’une décision prise par un service TTE.</li>
                </ul>
              </section>

              <section id="acces">
                <h2>4. Accès aux dossiers</h2>
                <p>
                  Les dossiers sont répartis entre les services compétents : Service
                  Clientèle, Objets trouvés, Accessibilité, Sûreté ferroviaire, Contrôle,
                  Recouvrement, Centre de Régulation, Ressources humaines et Direction.
                </p>
                <p>
                  Les niveaux d’accès dépendent du poste et du rôle de chaque agent. Un
                  superviseur peut consulter les dossiers nécessaires au suivi de son
                  équipe, tandis qu’un agent ne voit que les informations utiles à sa
                  mission.
                </p>
                <p>
                  Toute consultation, modification ou transmission non autorisée est
                  contraire au règlement intérieur de Townsend Transit Express.
                </p>
              </section>

              <section id="discord">
                <h2>5. Connexion à l’espace Discord TTE</h2>
                <p>
                  La connexion Discord sert à identifier les voyageurs et les employés,
                  à vérifier leur appartenance au serveur officiel TTE et à appliquer les
                  autorisations correspondant à leurs rôles.
                </p>
                <p>
                  Le mot de passe Discord n’est jamais communiqué à Townsend Transit
                  Express. Seules les informations de profil nécessaires à
                  l’identification et au contrôle des accès sont utilisées par le portail.
                </p>
              </section>

              <section id="conservation">
                <h2>6. Conservation et archivage</h2>
                <div className="privacy-retention">
                  <div>
                    <strong>Demandes voyageurs</strong>
                    <span>Durée du traitement, puis archivage administratif.</span>
                  </div>
                  <div>
                    <strong>Présence des agents</strong>
                    <span>Mise à jour régulière pour refléter le service en cours.</span>
                  </div>
                  <div>
                    <strong>Informations trafic</strong>
                    <span>Conservées pour le suivi des événements du réseau.</span>
                  </div>
                  <div>
                    <strong>Procès-verbaux</strong>
                    <span>Archivés selon les besoins du contrôle et du recouvrement.</span>
                  </div>
                </div>
                <p>
                  Lorsqu’un dossier n’a plus d’utilité opérationnelle ou administrative,
                  il est supprimé ou placé dans les archives sécurisées de TTE.
                </p>
              </section>

              <section id="securite">
                <h2>7. Sécurité des informations</h2>
                <p>
                  Les espaces internes sont protégés par une connexion individuelle et
                  des rôles d’autorisation. Les accès peuvent être suspendus lors d’un
                  changement d’affectation, d’un départ de l’entreprise ou d’un incident
                  de sécurité.
                </p>
                <p>
                  Il est interdit aux agents de partager leur accès, de copier un dossier
                  sur un espace personnel ou de publier une information confidentielle
                  dans un salon non autorisé.
                </p>
                <p>
                  Toute perte de document, connexion suspecte ou divulgation accidentelle
                  doit être signalée sans délai à la Direction de la Sûreté et des Systèmes
                  d’Information.
                </p>
              </section>

              <section id="droits">
                <h2>8. Demande d’accès, de correction ou de suppression</h2>
                <p>
                  Un voyageur peut demander à connaître les informations associées à son
                  dossier, signaler une erreur ou solliciter la suppression d’un dossier
                  qui n’a plus de raison d’être.
                </p>
                <p>
                  TTE vérifie l’identité du demandeur avant de communiquer ou de modifier
                  une information. Certaines archives peuvent être maintenues lorsqu’un
                  dossier est encore nécessaire au traitement d’une réclamation, d’un
                  procès-verbal ou d’un incident de sûreté.
                </p>
                <a
                  className="btn btn-primary privacy-action"
                  href="/contact#info"
                >
                  Faire une demande
                </a>
              </section>

              <section id="personnel">
                <h2>9. Obligations du personnel TTE</h2>
                <ul>
                  <li>consulter uniquement les informations utiles à la mission confiée ;</li>
                  <li>verrouiller sa session en quittant son poste ;</li>
                  <li>ne jamais transmettre un dossier dans un canal public ;</li>
                  <li>vérifier le destinataire avant tout transfert interne ;</li>
                  <li>signaler immédiatement une erreur ou une fuite d’information ;</li>
                  <li>respecter les instructions de la Direction et du service de Sûreté.</li>
                </ul>
                <p>
                  Le non-respect de ces règles peut entraîner la suspension des accès, une
                  enquête interne et les mesures prévues par le règlement du personnel.
                </p>
              </section>

              <section id="contact">
                <h2>10. Contact confidentialité</h2>
                <p>
                  Les questions relatives à un dossier ou à la confidentialité peuvent
                  être adressées au Service Clientèle. Les incidents internes doivent être
                  transmis directement à la hiérarchie ou à la Direction de la Sûreté.
                </p>
                <div className="privacy-contact">
                  <strong>Townsend Transit Express</strong>
                  <span>Direction de la Sûreté et des Systèmes d’Information</span>
                  <span>Gare centrale de Townsend, Tennessee</span>
                  <a href="mailto:support@townsendtransitexpress.com">
                    support@townsendtransitexpress.com
                  </a>
                  <a href="/contact">Contacter TTE</a>
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
