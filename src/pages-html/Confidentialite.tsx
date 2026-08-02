import { useState } from "react";
import { DiscordAuthButton } from "@/components/DiscordAuth";
import { TTELogo } from "@/components/TTELogo";
import "./Accueil.css";
import "./MentionsLegales.css";
import "./Confidentialite.css";
import { T } from "@/components/T";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const dataCategories = [
  {
    title: "Voyageurs",
    titleEn: "Travellers",
    text: "Demandes de renseignement, réclamations, objets perdus, demandes d’assistance et références nécessaires au suivi du dossier.",
    textEn: "Enquiries, complaints, lost items, assistance requests, and references needed to follow up on a case.",
  },
  {
    title: "Comptes Discord",
    titleEn: "Discord accounts",
    text: "Identifiant, nom d’utilisateur, nom affiché, avatar, appartenance au serveur TTE et rôles utiles pour contrôler les accès.",
    textEn: "ID, username, display name, avatar, membership of the TTE server, and roles used to control access.",
  },
  {
    title: "Personnel TTE",
    titleEn: "TTE staff",
    text: "Présence en service, affectation, actions réalisées dans les outils internes et identité de l’agent ayant publié une information.",
    textEn: "Duty status, assignment, actions taken in internal tools, and the identity of the staff member who published an update.",
  },
  {
    title: "Contrôles à bord",
    titleEn: "On-board checks",
    text: "Identité déclarée, document présenté, date de naissance, motif du procès-verbal, ligne, montant, paiement et observations de l’agent.",
    textEn: "Declared identity, document shown, date of birth, reason for the report, line, amount, payment, and staff observations.",
  },
];

export default function ConfidentialitePage() {
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

      <main className="legal-page privacy-page">
        <section className="legal-hero privacy-hero">
          <div className="wrap">
            <div className="legal-crumb">
              <a href="/"><T fr="Accueil" en="Home" /></a>
              <span>›</span>
              <span><T fr="Confidentialité" en="Privacy" /></span>
            </div>
            <span className="eyebrow"><T fr="Charte TTE" en="TTE charter" /></span>
            <h1><T fr="Confidentialité et protection des informations" en="Privacy and information protection" /></h1>
            <p>
              <T
                fr="La confiance des voyageurs et des agents fait partie de nos engagements. TTE limite l’accès aux informations et veille à ce qu’elles soient utilisées uniquement pour assurer le transport et le bon fonctionnement du réseau."
                en="The trust of travellers and staff is part of our commitments. TTE limits access to information and ensures it is used solely to run transport services and keep the network operating smoothly."
              />
            </p>
            <div className="privacy-version">
              <T fr="Direction de la Sûreté et des Systèmes d’Information · Version 1.0" en="Safety & Information Systems Department · Version 1.0" />
            </div>
          </div>
        </section>

        <section className="legal-content">
          <div className="wrap legal-layout">
            <aside className="legal-summary" aria-label={t("Sommaire", "Contents")}>
              <strong><T fr="Sommaire" en="Contents" /></strong>
              <a href="#engagement"><T fr="Notre engagement" en="Our commitment" /></a>
              <a href="#informations"><T fr="Informations concernées" en="Information covered" /></a>
              <a href="#utilisation"><T fr="Utilisation" en="Use" /></a>
              <a href="#acces"><T fr="Accès internes" en="Internal access" /></a>
              <a href="#discord"><T fr="Espace Discord" en="Discord area" /></a>
              <a href="#conservation"><T fr="Conservation" en="Retention" /></a>
              <a href="#securite"><T fr="Sécurité" en="Security" /></a>
              <a href="#droits"><T fr="Demandes des voyageurs" en="Traveller requests" /></a>
              <a href="#personnel"><T fr="Personnel TTE" en="TTE staff" /></a>
              <a href="#contact"><T fr="Contact" en="Contact" /></a>
            </aside>

            <article className="legal-article">
              <div className="privacy-notice">
                <strong><T fr="Principe TTE" en="TTE principle" /></strong>
                <p>
                  <T
                    fr="Une information confiée à TTE reste réservée au service qui en a besoin. Elle n’est ni vendue, ni utilisée à des fins publicitaires, ni transmise à une personne extérieure sans motif opérationnel valable."
                    en="Information entrusted to TTE stays reserved to the department that needs it. It is never sold, never used for advertising, and never passed to an outside party without a valid operational reason."
                  />
                </p>
              </div>

              <section id="engagement">
                <h2><T fr="1. Notre engagement" en="1. Our commitment" /></h2>
                <p>
                  <T
                    fr="Townsend Transit Express protège les informations confiées par les voyageurs, les agents, les partenaires et les personnes contrôlées à bord de ses trains et autobus."
                    en="Townsend Transit Express protects information entrusted by travellers, staff, partners, and people checked on board its trains and buses."
                  />
                </p>
                <p>
                  <T
                    fr="Chaque membre du personnel doit respecter la discrétion professionnelle. La consultation d’un dossier sans rapport avec ses fonctions est interdite et peut entraîner le retrait immédiat des accès internes."
                    en="Every staff member must observe professional discretion. Looking up a case unrelated to their duties is forbidden and may lead to immediate removal of internal access."
                  />
                </p>
              </section>

              <section id="informations">
                <h2><T fr="2. Informations concernées" en="2. Information covered" /></h2>
                <div className="privacy-data-grid">
                  {dataCategories.map((item) => (
                    <div key={item.title}>
                      <h3><T fr={item.title} en={item.titleEn} /></h3>
                      <p><T fr={item.text} en={item.textEn} /></p>
                    </div>
                  ))}
                </div>
                <p>
                  <T
                    fr="TTE demande uniquement les informations nécessaires au service concerné. Les voyageurs ne doivent pas ajouter de renseignements confidentiels inutiles dans les champs de texte libre."
                    en="TTE only asks for the information the relevant department needs. Travellers should not add unnecessary confidential details in free-text fields."
                  />
                </p>
              </section>

              <section id="utilisation">
                <h2><T fr="3. Utilisation des informations" en="3. Use of information" /></h2>
                <p><T fr="Les informations peuvent être utilisées pour :" en="Information may be used to:" /></p>
                <ul>
                  <li><T fr="répondre à une demande de renseignement ou d’assistance ;" en="respond to an enquiry or assistance request;" /></li>
                  <li><T fr="retrouver et restituer un objet perdu ;" en="find and return a lost item;" /></li>
                  <li><T fr="examiner une réclamation ou une demande de remboursement ;" en="review a complaint or refund request;" /></li>
                  <li><T fr="vérifier l’identité et les autorisations d’un agent ;" en="verify a staff member's identity and authorisations;" /></li>
                  <li><T fr="organiser le service, la régulation et l’information voyageurs ;" en="organise the service, regulation, and traveller information;" /></li>
                  <li><T fr="établir et suivre un procès-verbal de contrôle ;" en="draw up and follow up on an inspection report;" /></li>
                  <li><T fr="assurer la sécurité des voyageurs, du personnel et des installations ;" en="ensure the safety of travellers, staff, and facilities;" /></li>
                  <li><T fr="conserver la traçabilité d’une décision prise par un service TTE." en="keep a record of a decision made by a TTE department." /></li>
                </ul>
              </section>

              <section id="acces">
                <h2><T fr="4. Accès aux dossiers" en="4. Access to records" /></h2>
                <p>
                  <T
                    fr="Les dossiers sont répartis entre les services compétents : Service Clientèle, Objets trouvés, Accessibilité, Sûreté ferroviaire, Contrôle, Recouvrement, Centre de Régulation, Ressources humaines et Direction."
                    en="Records are shared between the relevant departments: Customer Service, Lost & Found, Accessibility, Railway Security, Ticket Inspection, Collections, the Control Centre, Human Resources, and Management."
                  />
                </p>
                <p>
                  <T
                    fr="Les niveaux d’accès dépendent du poste et du rôle de chaque agent. Un superviseur peut consulter les dossiers nécessaires au suivi de son équipe, tandis qu’un agent ne voit que les informations utiles à sa mission."
                    en="Access levels depend on each staff member's position and role. A supervisor can view the records needed to oversee their team, while a staff member only sees information relevant to their own duties."
                  />
                </p>
                <p>
                  <T
                    fr="Toute consultation, modification ou transmission non autorisée est contraire au règlement intérieur de Townsend Transit Express."
                    en="Any unauthorised viewing, modification, or sharing goes against Townsend Transit Express's internal rules."
                  />
                </p>
              </section>

              <section id="discord">
                <h2><T fr="5. Connexion à l’espace Discord TTE" en="5. Signing in to the TTE Discord area" /></h2>
                <p>
                  <T
                    fr="La connexion Discord sert à identifier les voyageurs et les employés, à vérifier leur appartenance au serveur officiel TTE et à appliquer les autorisations correspondant à leurs rôles."
                    en="Discord sign-in is used to identify travellers and employees, verify their membership of the official TTE server, and apply the permissions matching their roles."
                  />
                </p>
                <p>
                  <T
                    fr="Le mot de passe Discord n’est jamais communiqué à Townsend Transit Express. Seules les informations de profil nécessaires à l’identification et au contrôle des accès sont utilisées par le portail."
                    en="Your Discord password is never shared with Townsend Transit Express. The portal only uses the profile information needed for identification and access control."
                  />
                </p>
              </section>

              <section id="conservation">
                <h2><T fr="6. Conservation et archivage" en="6. Retention and archiving" /></h2>
                <div className="privacy-retention">
                  <div>
                    <strong><T fr="Demandes voyageurs" en="Traveller requests" /></strong>
                    <span><T fr="Durée du traitement, puis archivage administratif." en="Kept while being processed, then archived administratively." /></span>
                  </div>
                  <div>
                    <strong><T fr="Présence des agents" en="Staff attendance" /></strong>
                    <span><T fr="Mise à jour régulière pour refléter le service en cours." en="Updated regularly to reflect the current shift." /></span>
                  </div>
                  <div>
                    <strong><T fr="Informations trafic" en="Traffic information" /></strong>
                    <span><T fr="Conservées pour le suivi des événements du réseau." en="Kept to track network events." /></span>
                  </div>
                  <div>
                    <strong><T fr="Procès-verbaux" en="Inspection reports" /></strong>
                    <span><T fr="Archivés selon les besoins du contrôle et du recouvrement." en="Archived as needed for inspection and collections purposes." /></span>
                  </div>
                </div>
                <p>
                  <T
                    fr="Lorsqu’un dossier n’a plus d’utilité opérationnelle ou administrative, il est supprimé ou placé dans les archives sécurisées de TTE."
                    en="Once a record no longer serves an operational or administrative purpose, it is deleted or moved into TTE's secure archives."
                  />
                </p>
              </section>

              <section id="securite">
                <h2><T fr="7. Sécurité des informations" en="7. Information security" /></h2>
                <p>
                  <T
                    fr="Les espaces internes sont protégés par une connexion individuelle et des rôles d’autorisation. Les accès peuvent être suspendus lors d’un changement d’affectation, d’un départ de l’entreprise ou d’un incident de sécurité."
                    en="Internal areas are protected by individual logins and permission roles. Access can be suspended when someone changes assignment, leaves the company, or in the event of a security incident."
                  />
                </p>
                <p>
                  <T
                    fr="Il est interdit aux agents de partager leur accès, de copier un dossier sur un espace personnel ou de publier une information confidentielle dans un salon non autorisé."
                    en="Staff may not share their access, copy a record to a personal space, or post confidential information in an unauthorised channel."
                  />
                </p>
                <p>
                  <T
                    fr="Toute perte de document, connexion suspecte ou divulgation accidentelle doit être signalée sans délai à la Direction de la Sûreté et des Systèmes d’Information."
                    en="Any lost document, suspicious login, or accidental disclosure must be reported immediately to the Safety & Information Systems Department."
                  />
                </p>
              </section>

              <section id="droits">
                <h2><T fr="8. Demande d’accès, de correction ou de suppression" en="8. Requesting access, correction, or deletion" /></h2>
                <p>
                  <T
                    fr="Un voyageur peut demander à connaître les informations associées à son dossier, signaler une erreur ou solliciter la suppression d’un dossier qui n’a plus de raison d’être."
                    en="A traveller may ask to know what information is held in their record, report an error, or request the deletion of a record that is no longer needed."
                  />
                </p>
                <p>
                  <T
                    fr="TTE vérifie l’identité du demandeur avant de communiquer ou de modifier une information. Certaines archives peuvent être maintenues lorsqu’un dossier est encore nécessaire au traitement d’une réclamation, d’un procès-verbal ou d’un incident de sûreté."
                    en="TTE verifies the requester's identity before sharing or changing any information. Some records may be kept when still needed to handle a complaint, an inspection report, or a security incident."
                  />
                </p>
                <a
                  className="btn btn-primary privacy-action"
                  href="/contact#info"
                >
                  <T fr="Faire une demande" en="Make a request" />
                </a>
              </section>

              <section id="personnel">
                <h2><T fr="9. Obligations du personnel TTE" en="9. Obligations of TTE staff" /></h2>
                <ul>
                  <li><T fr="consulter uniquement les informations utiles à la mission confiée ;" en="only look up information relevant to their assigned task;" /></li>
                  <li><T fr="verrouiller sa session en quittant son poste ;" en="lock their session when leaving their workstation;" /></li>
                  <li><T fr="ne jamais transmettre un dossier dans un canal public ;" en="never share a record in a public channel;" /></li>
                  <li><T fr="vérifier le destinataire avant tout transfert interne ;" en="check the recipient before any internal transfer;" /></li>
                  <li><T fr="signaler immédiatement une erreur ou une fuite d’information ;" en="immediately report any error or information leak;" /></li>
                  <li><T fr="respecter les instructions de la Direction et du service de Sûreté." en="follow instructions from Management and the Security department." /></li>
                </ul>
                <p>
                  <T
                    fr="Le non-respect de ces règles peut entraîner la suspension des accès, une enquête interne et les mesures prévues par le règlement du personnel."
                    en="Failure to follow these rules may lead to suspension of access, an internal investigation, and the measures set out in staff regulations."
                  />
                </p>
              </section>

              <section id="contact">
                <h2><T fr="10. Contact confidentialité" en="10. Privacy contact" /></h2>
                <p>
                  <T
                    fr="Les questions relatives à un dossier ou à la confidentialité peuvent être adressées au Service Clientèle. Les incidents internes doivent être transmis directement à la hiérarchie ou à la Direction de la Sûreté."
                    en="Questions about a record or about privacy can be sent to Customer Service. Internal incidents should be reported directly to management or the Security department."
                  />
                </p>
                <div className="privacy-contact">
                  <strong>Townsend Transit Express</strong>
                  <span><T fr="Direction de la Sûreté et des Systèmes d’Information" en="Safety & Information Systems Department" /></span>
                  <span><T fr="Gare centrale de Townsend, Tennessee" en="Townsend central station, Tennessee" /></span>
                  <a href="mailto:support@townsendtransitexpress.com">
                    support@townsendtransitexpress.com
                  </a>
                  <a href="/contact"><T fr="Contacter TTE" en="Contact TTE" /></a>
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
