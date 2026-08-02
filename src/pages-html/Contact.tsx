import { useEffect } from "react";
import "./Contact.css";
import { TTELogo } from "@/components/TTELogo";
import { script } from "./Contact.script";
import { useCurrentUser } from "@/components/DiscordAuth";
import { canManageContactRequests, type DiscordSessionUser } from "@/lib/discord-roles";
import { T } from "@/components/T";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function ContactPage() {
  const { data: user } = useCurrentUser();
  const isAdmin = canManageContactRequests((user ?? null) as DiscordSessionUser | null);
  const { lang, t, toggleLang } = useLanguage();


  useEffect(() => {
    const el = document.createElement("script");
    el.textContent = script;
    document.body.appendChild(el);
    return () => { el.remove(); };
  }, []);

  // Expose the Discord user to the vanilla-JS form script for validation & summary
  useEffect(() => {
    const w = window as unknown as { __tteContactUser?: unknown };
    w.__tteContactUser = user
      ? {
          id: user.discordId,
          name: user.displayName || user.username,
          username: user.username,
          avatar: user.avatar,
        }
      : null;
    window.dispatchEvent(new CustomEvent("tte:contact-user-change"));
  }, [user]);


  return (
    <>


{/* ===== UTILITY BAR ===== */}
<div className="util">
  <div className="util-in">
    <div className="util-grp u-left">
      <a href="/#reseau"><T fr="Plan du réseau" en="Network map" /></a>
      <a href="/#lignes"><T fr="Horaires" en="Timetables" /></a>
      <a href="/#infos"><T fr="Gares & services" en="Stations & services" /></a>
      <a href="/contact" className="cur"><T fr="Aide & contact" en="Help & contact" /></a>
    </div>
    <div className="util-grp">
      <a className="staff" href="/espace-employes">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="4" y="11" width="16" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
        <T fr="Espace employés" en="Staff area" />
      </a>
      <span className="sep"></span>
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

{/* ===== HEADER ===== */}
<header className="hdr" id="hdr">
  <div className="hdr-in">
    <a href="/" className="brand" aria-label={t("Townsend Transit Express — accueil", "Townsend Transit Express — home")}>
      <TTELogo className="logo" />
      <span className="brand-tx">
        <span className="nm">Townsend Transit Express</span>
        <span className="tg"><T fr="Réseau ferroviaire du Tennessee" en="Tennessee rail network" /></span>
      </span>
    </a>
    <nav className="mainnav">
      <a href="/#reseau"><T fr="Le réseau" en="The network" /></a>
      <a href="/#lignes"><T fr="Lignes & horaires" en="Lines & timetables" /></a>
      <a href="/#townsend">Townsend</a>
      <a href="/#tarifs"><T fr="Tarifs & titres" en="Fares & tickets" /></a>
      <a href="/#infos"><T fr="Infos voyageurs" en="Traveller info" /></a>
    </nav>
    <div className="hdr-sp"></div>
    <div className="hdr-act">
      <a href="/#finder" className="btn btn-primary"><T fr="Rechercher un horaire" en="Search a timetable" /></a>
      <button className="burger" id="burger" aria-label={t("Ouvrir le menu", "Open menu")}><span></span><span></span><span></span></button>
    </div>
  </div>
</header>

{/* ===== PAGE HERO ===== */}
<section className="phero">
  <div className="wrap">
    <nav className="crumb"><a href="/"><T fr="Accueil" en="Home" /></a> <span>›</span> <T fr="Aide & contact" en="Help & contact" /></nav>
    <h1><T fr="Aide & contact" en="Help & contact" /></h1>
    <p>
      <T
        fr={<>Une question, une demande de remboursement, une réclamation ou une sollicitation presse&nbsp;? Connectez-vous avec Discord et ouvrez une demande&nbsp;: pas besoin d'e-mail, nos équipes vous répondent dans les meilleurs délais.</>}
        en={<>A question, a refund request, a complaint, or a press enquiry? Sign in with Discord and open a request&nbsp;— no e-mail needed, our teams get back to you as soon as possible.</>}
      />
    </p>
  </div>

</section>

{/* ===== MAIN ===== */}
<div className="main">
  <div className="wrap">
    <div className="grid">

      {/* Colonne formulaire */}
      <div>
        <h2 className="sec-h"><span className="step">1</span> <T fr="Choisissez le motif de votre demande" en="Choose the reason for your request" /></h2>
        <div className="cat-grid" id="catGrid">
          <button type="button" className="cat" data-cat="remboursement">
            <span className="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2.5" y="6" width="19" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /><path d="M6 9.5v.01M18 14.5v.01" /></svg></span>
            <b><T fr="Remboursement" en="Refund" /></b><span><T fr="Billet, retard, annulation" en="Ticket, delay, cancellation" /></span>
          </button>
          <button type="button" className="cat" data-cat="info">
            <span className="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg></span>
            <b><T fr="Information voyageur" en="Traveller information" /></b><span><T fr="Horaires, lignes, tarifs" en="Timetables, lines, fares" /></span>
          </button>
          <button type="button" className="cat" data-cat="presse">
            <span className="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8l11-4v16L3 16V8Z" /><path d="M14 7l5-1v12l-5-1M7 16v4" /></svg></span>
            <b><T fr="Presse & médias" en="Press & media" /></b><span><T fr="Demande d'interview, infos" en="Interview requests, info" /></span>
          </button>
          <button type="button" className="cat" data-cat="objets">
            <span className="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="8" width="16" height="12" rx="2" /><path d="M9 8V6a3 3 0 0 1 6 0v2M4 13h16" /></svg></span>
            <b><T fr="Objets trouvés" en="Lost & found" /></b><span><T fr="Oubli à bord ou en gare" en="Left something on board or at the station" /></span>
          </button>
          <button type="button" className="cat" data-cat="accessibilite">
            <span className="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="4.5" r="2" /><path d="M12 7v6m0 0 4 6m-4-6-4 6m-1-9h10" /></svg></span>
            <b><T fr="Accessibilité / PMR" en="Accessibility" /></b><span><T fr="Assistance, aménagements" en="Assistance, arrangements" /></span>
          </button>
          <button type="button" className="cat" data-cat="reclamation">
            <span className="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l9 16H3L12 3Z" /><path d="M12 10v4M12 17h.01" /></svg></span>
            <b><T fr="Réclamation" en="Complaint" /></b><span><T fr="Incident, qualité de service" en="Incident, service quality" /></span>
          </button>
          <button type="button" className="cat" data-cat="suggestion">
            <span className="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 1 4 10c-.7.7-1 1.4-1 2H9c0-.6-.3-1.3-1-2A6 6 0 0 1 12 3Z" /></svg></span>
            <b><T fr="Suggestion" en="Suggestion" /></b><span><T fr="Idée d'amélioration" en="Improvement idea" /></span>
          </button>
          <button type="button" className="cat" data-cat="autre">
            <span className="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg></span>
            <b><T fr="Autre demande" en="Other request" /></b><span><T fr="Tout autre sujet" en="Anything else" /></span>
          </button>
        </div>

        <h2 className="sec-h"><span className="step">2</span> <T fr="Décrivez votre demande" en="Describe your request" /></h2>

        {/* Confirmation (cachée au départ) */}
        <div className="success" id="success">
          <div className="success-top">
            <span className="chk"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4"><path d="m5 12 5 5 9-11" /></svg></span>
            <div><h2><T fr="Votre demande a bien été enregistrée" en="Your request has been registered" /></h2><p><T fr="Un accusé de réception vous a été envoyé par courriel." en="A confirmation has been sent to your e-mail." /></p></div>
          </div>
          <div className="success-body">
            <div className="ref">
              <div><div className="lbl"><T fr="Numéro de demande" en="Request number" /></div><div className="val" id="refNumber">TTE-2026-000000</div></div>
              <button type="button" className="btn btn-outline" id="newReq"><T fr="Nouvelle demande" en="New request" /></button>
            </div>
            <ul className="sum">
              <li><b><T fr="Demandeur" en="Requester" /></b><span id="sumUser">—</span></li>
              <li><b><T fr="Motif" en="Reason" /></b><span id="sumCat">—</span></li>
              <li><b><T fr="Sujet" en="Subject" /></b><span id="sumSubject">—</span></li>
              <li><b><T fr="Délai de réponse" en="Response time" /></b><span id="sumDelay">—</span></li>
            </ul>
            <p className="note">
              <T
                fr={<>Conservez votre numéro de demande&nbsp;: il permet de suivre le traitement de votre dossier. La réponse vous parviendra dans votre espace, lié à votre compte Discord. Aucune information bancaire ne vous sera jamais demandée.</>}
                en={<>Keep your request number&nbsp;— it lets you track your case. The response will arrive in your account, linked to your Discord account. We will never ask you for banking details.</>}
              />
            </p>
          </div>
        </div>

        {/* Formulaire */}
        <form className="form-card" id="reqForm" noValidate>
          <div className="form-top">
            <b id="formTitle"><T fr="Nouvelle demande" en="New request" /></b>
            <span id="formHint"><T fr="Sélectionnez un motif ci-dessus, puis remplissez le formulaire." en="Select a reason above, then fill in the form." /></span>
          </div>
          <div className="form-body">

            {/* Identification Discord */}
            {!user ? (
              <div className="steam-gate" id="steamGate">
                <div className="lead">
                  <svg width="20" height="20" viewBox="0 0 71 55" fill="currentColor" aria-hidden="true">
                    <path d="M60.1 4.9A58.5 58.5 0 0 0 45.4.5a41 41 0 0 0-1.9 3.9 54 54 0 0 0-16 0A41 41 0 0 0 25.5.5 58.4 58.4 0 0 0 10.8 4.9C1.6 18.8-.9 32.4.4 45.7a58.9 58.9 0 0 0 17.9 9.1 43 43 0 0 0 3.8-6.2 38 38 0 0 1-6-2.9c.5-.4 1-.7 1.5-1.1a42 42 0 0 0 36 0c.5.4 1 .7 1.5 1.1a38 38 0 0 1-6 2.9 43 43 0 0 0 3.8 6.2 58.7 58.7 0 0 0 17.9-9.1c1.5-15.4-2.5-28.9-10.7-40.8ZM23.7 37.8c-3.5 0-6.4-3.3-6.4-7.3s2.8-7.3 6.4-7.3c3.6 0 6.5 3.3 6.4 7.3 0 4-2.8 7.3-6.4 7.3Zm23.6 0c-3.5 0-6.4-3.3-6.4-7.3s2.8-7.3 6.4-7.3c3.6 0 6.5 3.3 6.4 7.3 0 4-2.8 7.3-6.4 7.3Z" />
                  </svg>
                  <span className="tx">
                    <b><T fr="Identifiez-vous avec Discord" en="Sign in with Discord" /></b>
                    <span>
                      <T
                        fr={<>Pas besoin d'e-mail&nbsp;: votre demande est reliée à votre compte Discord, et la réponse vous parvient dans votre espace.</>}
                        en={<>No e-mail needed&nbsp;— your request is linked to your Discord account, and the response arrives in your account.</>}
                      />
                    </span>
                  </span>
                </div>
                <a
                  href="/api/public/discord/login?redirect=/contact"
                  className="steam-btn"
                  style={{ background: "#5865F2", color: "#fff", textDecoration: "none" }}
                >
                  <svg className="slogo" viewBox="0 0 71 55" fill="currentColor" aria-hidden="true">
                    <path d="M60.1 4.9A58.5 58.5 0 0 0 45.4.5a41 41 0 0 0-1.9 3.9 54 54 0 0 0-16 0A41 41 0 0 0 25.5.5 58.4 58.4 0 0 0 10.8 4.9C1.6 18.8-.9 32.4.4 45.7a58.9 58.9 0 0 0 17.9 9.1 43 43 0 0 0 3.8-6.2 38 38 0 0 1-6-2.9c.5-.4 1-.7 1.5-1.1a42 42 0 0 0 36 0c.5.4 1 .7 1.5 1.1a38 38 0 0 1-6 2.9 43 43 0 0 0 3.8 6.2 58.7 58.7 0 0 0 17.9-9.1c1.5-15.4-2.5-28.9-10.7-40.8ZM23.7 37.8c-3.5 0-6.4-3.3-6.4-7.3s2.8-7.3 6.4-7.3c3.6 0 6.5 3.3 6.4 7.3 0 4-2.8 7.3-6.4 7.3Zm23.6 0c-3.5 0-6.4-3.3-6.4-7.3s2.8-7.3 6.4-7.3c3.6 0 6.5 3.3 6.4 7.3 0 4-2.8 7.3-6.4 7.3Z" />
                  </svg>
                  <span><T fr="Se connecter avec Discord" en="Sign in with Discord" /></span>
                </a>
              </div>
            ) : (
              <div className="steam-profile show" id="steamProfile">
                <span className="av" id="steamAv">
                  {user.avatar ? (
                    <img src={user.avatar} alt="" width={40} height={40} style={{ borderRadius: "50%", display: "block" }} />
                  ) : (
                    <span style={{ display: "grid", placeItems: "center", width: 40, height: 40, borderRadius: "50%", background: "#5865F2", color: "#fff", fontWeight: 700 }}>
                      {(user.displayName || user.username)[0]?.toUpperCase()}
                    </span>
                  )}
                </span>
                <div className="meta">
                  <div className="nm">
                    <span>{user.displayName || user.username}</span>{" "}
                    <span className="ok"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m5 12 5 5 9-11" /></svg> <T fr="Connecté avec Discord" en="Signed in with Discord" /></span>
                  </div>
                  <div className="sid">@{user.username}</div>
                </div>
                <a href="/api/public/discord/logout" className="dx" style={{ textDecoration: "none" }}><T fr="Changer de compte" en="Switch account" /></a>
              </div>
            )}


            <div className="form-err" id="formErr">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" /></svg>
              <span id="formErrTxt"><T fr="Merci de compléter les champs obligatoires." en="Please fill in the required fields." /></span>
            </div>

            <div className="fld">
              <label htmlFor="selType"><T fr="Motif de la demande" en="Reason for request" /> <span className="req">*</span></label>
              <select className="ctl" id="selType">
                <option value="">{t("— Sélectionnez un motif —", "— Select a reason —")}</option>
                <option value="remboursement">{t("Remboursement", "Refund")}</option>
                <option value="info">{t("Information voyageur", "Traveller information")}</option>
                <option value="presse">{t("Presse & médias", "Press & media")}</option>
                <option value="objets">{t("Objets trouvés", "Lost & found")}</option>
                <option value="accessibilite">{t("Accessibilité / PMR", "Accessibility")}</option>
                <option value="reclamation">{t("Réclamation", "Complaint")}</option>
                <option value="suggestion">{t("Suggestion", "Suggestion")}</option>
                <option value="autre">{t("Autre demande", "Other request")}</option>
              </select>
            </div>

            {/* Bloc Remboursement */}
            <div className="cond" id="blkRefund">
              <div className="cond-wrap">
                <div className="ttl"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="2.5" y="6" width="19" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /></svg> <T fr="Informations sur le titre concerné" en="Information about the ticket" /></div>
                <div className="grid2">
                  <div className="fld"><label htmlFor="rfRef"><T fr="N° de billet / référence" en="Ticket no. / reference" /> <span className="opt">({t("facultatif", "optional")})</span></label><input className="ctl" id="rfRef" type="text" placeholder="Ex. B-2026-018342" /></div>
                  <div className="fld"><label htmlFor="rfDate"><T fr="Date du trajet" en="Date of travel" /></label><input className="ctl" id="rfDate" type="date" /></div>
                </div>
                <div className="fld"><label htmlFor="rfLine"><T fr="Ligne concernée" en="Line concerned" /></label>
                  <select className="ctl" id="rfLine">
                    <option value="">{t("— Choisir une ligne —", "— Choose a line —")}</option>
                    <option>R1 · Townsend – Sevierville</option>
                    <option>R2 · Townsend – Mascot</option>
                    <option>R3 · Knoxville – Greeneville</option>
                    <option>R4 · Knoxville – Chattanooga</option>
                    <option>IC1 · Townsend – Nashville</option>
                    <option>IC2 · Smoky Express</option>
                    <option>{t("Ligne T · Train urbain de Townsend", "Line T · Townsend urban train")}</option>
                    <option>{t("Bus · Townsend", "Bus · Townsend")}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bloc Objets trouvés */}
            <div className="cond" id="blkLost">
              <div className="cond-wrap">
                <div className="ttl"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="4" y="8" width="16" height="12" rx="2" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg> <T fr="Détails de l'objet perdu" en="Details of the lost item" /></div>
                <div className="grid2">
                  <div className="fld"><label htmlFor="lsDate"><T fr="Date de l'oubli" en="Date it was lost" /></label><input className="ctl" id="lsDate" type="date" /></div>
                  <div className="fld"><label htmlFor="lsPlace"><T fr="Ligne ou gare concernée" en="Line or station concerned" /></label><input className="ctl" id="lsPlace" type="text" placeholder={t("Ex. IC2, gare centrale de Townsend", "E.g. IC2, Townsend central station")} /></div>
                </div>
                <div className="fld"><label htmlFor="lsDesc"><T fr="Description de l'objet" en="Description of the item" /></label><input className="ctl" id="lsDesc" type="text" placeholder={t("Couleur, marque, contenu…", "Colour, brand, contents…")} /></div>
              </div>
            </div>

            {/* Bloc Presse */}
            <div className="cond" id="blkPress">
              <div className="cond-wrap">
                <div className="ttl"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M3 8l11-4v16L3 16V8Z" /></svg> <T fr="Informations média" en="Media information" /></div>
                <div className="grid2">
                  <div className="fld"><label htmlFor="prMedia"><T fr="Média / organisation" en="Media / organisation" /></label><input className="ctl" id="prMedia" type="text" placeholder="Ex. Knoxville Daily" /></div>
                  <div className="fld"><label htmlFor="prRole"><T fr="Fonction" en="Role" /></label><input className="ctl" id="prRole" type="text" placeholder={t("Ex. Journaliste", "E.g. Journalist")} /></div>
                </div>
                <div className="fld"><label htmlFor="prDeadline"><T fr="Délai / bouclage souhaité" en="Deadline" /> <span className="opt">({t("facultatif", "optional")})</span></label><input className="ctl" id="prDeadline" type="text" placeholder={t("Ex. avant vendredi 18 h", "E.g. before Friday 6pm")} /></div>
              </div>
            </div>

            <div className="fld"><label htmlFor="sujet"><T fr="Sujet" en="Subject" /> <span className="req">*</span></label><input className="ctl" id="sujet" type="text" placeholder={t("Résumé en quelques mots", "Brief summary")} /></div>
            <div className="fld"><label htmlFor="message"><T fr="Votre message" en="Your message" /> <span className="req">*</span></label><textarea className="ctl" id="message" placeholder={t("Décrivez votre demande avec le plus de détails possible…", "Describe your request in as much detail as possible…")}></textarea></div>

            <label className="check" id="consentWrap">
              <input type="checkbox" id="consent" />{" "}
              <span>
                <T
                  fr={<>J'autorise Townsend Transit Express à traiter ma demande, associée à mon compte Discord, conformément à sa <a href="/confidentialite" target="_blank" rel="noreferrer">politique de confidentialité</a>.</>}
                  en={<>I authorise Townsend Transit Express to process my request, linked to my Discord account, in accordance with its <a href="/confidentialite" target="_blank" rel="noreferrer">privacy policy</a>.</>}
                /> <span className="req">*</span>
              </span>
            </label>

            <div className="submit">
              <button type="submit" className="btn btn-primary">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" /></svg>
                <T fr="Envoyer ma demande" en="Send my request" />
              </button>
              <small><T fr="Connexion Discord requise" en="Discord sign-in required" /> · <T fr="champs marqués" en="fields marked" /> <span style={{color: "var(--alert)"}}>*</span> <T fr="obligatoires" en="are required" /></small>
            </div>
          </div>
        </form>
      </div>

      {/* Colonne latérale */}
      <aside className="aside">
        {user && (
          <div className="card">
            <h3><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h10" /></svg> <T fr="Mon espace" en="My account" /></h3>
            <div style={{ display: "grid", gap: 8, marginTop: 6 }}>
              <a href="/mes-demandes" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#5865F2", color: "#fff", borderRadius: 8, textDecoration: "none", fontWeight: 600, fontSize: 13 }}>
                📄 <T fr="Voir mes demandes" en="View my requests" />
              </a>
              {isAdmin && (
                <a href="/suivi-demandes" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "rgba(225,29,72,0.15)", color: "#e11d48", border: "1px solid rgba(225,29,72,0.35)", borderRadius: 8, textDecoration: "none", fontWeight: 600, fontSize: 13 }}>
                  ⚙️ <T fr="Suivi (Direction)" en="Tracking (Management)" />
                </a>
              )}
            </div>
          </div>
        )}

        <div className="card">
          <h3><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 4h3l2 5-2 1a11 11 0 0 0 5 5l1-2 5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" /></svg> <T fr="Nous joindre autrement" en="Other ways to reach us" /></h3>
          <div className="contact-line"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 4h3l2 5-2 1a11 11 0 0 0 5 5l1-2 5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" /></svg><div><b><T fr="Service Clientèle" en="Customer Service" /></b><span>1-800-TTE-RAIL · {t("lun.–sam. 7 h – 20 h", "Mon–Sat 7am – 8pm")}</span></div></div>
          <div className="contact-line"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg><div><b><T fr="Courriel" en="E-mail" /></b><span>support@townsendtransitexpress.com</span></div></div>
          <div className="contact-line"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="10" r="3" /><path d="M12 2a8 8 0 0 0-8 8c0 5.4 8 12 8 12s8-6.6 8-12a8 8 0 0 0-8-8Z" /></svg><div><b><T fr="En gare" en="At the station" /></b><span><T fr="Guichets & bornes — gare centrale de Townsend" en="Ticket counters & machines — Townsend central station" /></span></div></div>
        </div>


        <div className="card">
          <h3><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg> <T fr="Délais de réponse indicatifs" en="Indicative response times" /></h3>
          <ul className="delays">
            <li><T fr="Remboursement" en="Refund" /> <span className="d">{t("sous 15 j", "within 15 days")}</span></li>
            <li><T fr="Information voyageur" en="Traveller information" /> <span className="d">{t("sous 3 j", "within 3 days")}</span></li>
            <li><T fr="Presse & médias" en="Press & media" /> <span className="d">24–48h</span></li>
            <li><T fr="Objets trouvés" en="Lost & found" /> <span className="d">{t("sous 5 j", "within 5 days")}</span></li>
            <li><T fr="Réclamation" en="Complaint" /> <span className="d">{t("sous 10 j", "within 10 days")}</span></li>
          </ul>
        </div>

        <div className="urg">
          <b><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 3l9 16H3L12 3Z" /><path d="M12 10v4M12 17h.01" /></svg> <T fr="Urgence ou sécurité" en="Emergency or safety" /></b>
          <p>
            <T
              fr="Pour toute situation urgente à bord ou en gare, contactez le personnel sur place ou appelez le numéro d'urgence dédié, disponible 24 h/24."
              en="For any urgent situation on board or at a station, contact staff on site or call the dedicated emergency number, available 24/7."
            />
          </p>
        </div>
      </aside>

    </div>
  </div>
</div>

{/* ===== FOOTER ===== */}
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
        <div className="addr">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="10" r="3" /><path d="M12 2a8 8 0 0 0-8 8c0 5.4 8 12 8 12s8-6.6 8-12a8 8 0 0 0-8-8Z" /></svg>
          <span><T fr="Siège social — Gare centrale, Townsend, Tennessee" en="Head office — Central station, Townsend, Tennessee" /></span>
        </div>
      </div>
      <div className="fcol">
        <h4><T fr="Voyageurs" en="Travellers" /></h4>
        <a href="/#lignes"><T fr="Lignes & horaires" en="Lines & timetables" /></a>
        <a href="/#tarifs"><T fr="Tarifs & titres" en="Fares & tickets" /></a>
        <a href="/contact#remboursement"><T fr="Remboursement" en="Refund" /></a>
        <a href="/contact#objets"><T fr="Objets trouvés" en="Lost & found" /></a>
        <a href="/contact#accessibilite"><T fr="Accessibilité" en="Accessibility" /></a>
      </div>
      <div className="fcol">
        <h4><T fr="Entreprise" en="Company" /></h4>
        <a href="#"><T fr="À propos de TTE" en="About TTE" /></a>
        <a href="/contact#presse"><T fr="Presse & médias" en="Press & media" /></a>
        <a href="/#rejoindre"><T fr="Recrutement" en="Careers" /></a>
        <a href="/espace-employes"><T fr="Espace employés" en="Staff area" /></a>
        <a href="/contact"><T fr="Nous contacter" en="Contact us" /></a>
      </div>
    </div>
    <div className="foot-bot">
      <p><T fr="© 2026 Townsend Transit Express. Tous droits réservés." en="© 2026 Townsend Transit Express. All rights reserved." /></p>
      <div className="links">
        <a href="/mentions-legales"><T fr="Mentions légales" en="Legal notice" /></a>
        <a href="/conditions-generales-transport-tte-v1.pdf" target="_blank" rel="noreferrer"><T fr="Conditions de transport" en="Terms of carriage" /></a>
        <a href="/confidentialite"><T fr="Confidentialité" en="Privacy" /></a>
        <a href="/"><T fr="Accueil" en="Home" /></a>
      </div>
    </div>
  </div>
</footer>



    </>
  );
}
