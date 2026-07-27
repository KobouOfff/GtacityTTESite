import { useEffect } from "react";
import "./Contact.css";
import { TTELogo } from "@/components/TTELogo";
import { script } from "./Contact.script";
import { useCurrentUser } from "@/components/DiscordAuth";
import { canManageContactRequests, type DiscordSessionUser } from "@/lib/discord-roles";

export default function ContactPage() {
  const { data: user } = useCurrentUser();
  const isAdmin = canManageContactRequests((user ?? null) as DiscordSessionUser | null);


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
      <a href="/#reseau">Plan du réseau</a>
      <a href="/#lignes">Horaires</a>
      <a href="/#infos">Gares &amp; services</a>
      <a href="/contact" className="cur">Aide &amp; contact</a>
    </div>
    <div className="util-grp">
      <a className="staff" href="/espace-employes">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="4" y="11" width="16" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
        Espace employés
      </a>
      <span className="sep"></span>
      <span className="lang">🇺🇸 FR</span>
    </div>
  </div>
</div>

{/* ===== HEADER ===== */}
<header className="hdr" id="hdr">
  <div className="hdr-in">
    <a href="/" className="brand" aria-label="Townsend Transit Express \u2014 accueil">
      <TTELogo className="logo" />
      <span className="brand-tx">
        <span className="nm">Townsend Transit Express</span>
        <span className="tg">Réseau ferroviaire du Tennessee</span>
      </span>
    </a>
    <nav className="mainnav">
      <a href="/#reseau">Le réseau</a>
      <a href="/#lignes">Lignes &amp; horaires</a>
      <a href="/#townsend">Townsend</a>
      <a href="/#tarifs">Tarifs &amp; titres</a>
      <a href="/#infos">Infos voyageurs</a>
    </nav>
    <div className="hdr-sp"></div>
    <div className="hdr-act">
      <a href="/#finder" className="btn btn-primary">Rechercher un horaire</a>
      <button className="burger" id="burger" aria-label="Ouvrir le menu"><span></span><span></span><span></span></button>
    </div>
  </div>
</header>

{/* ===== PAGE HERO ===== */}
<section className="phero">
  <div className="wrap">
    <nav className="crumb"><a href="/">Accueil</a> <span>›</span> Aide &amp; contact</nav>
    <h1>Aide &amp; contact</h1>
    <p>Une question, une demande de remboursement, une réclamation ou une sollicitation presse&nbsp;? Connectez-vous avec Discord et ouvrez une demande&nbsp;: pas besoin d'e-mail, nos équipes vous répondent dans les meilleurs délais.</p>
  </div>

</section>

{/* ===== MAIN ===== */}
<div className="main">
  <div className="wrap">
    <div className="grid">

      {/* Colonne formulaire */}
      <div>
        <h2 className="sec-h"><span className="step">1</span> Choisissez le motif de votre demande</h2>
        <div className="cat-grid" id="catGrid">
          <button type="button" className="cat" data-cat="remboursement">
            <span className="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2.5" y="6" width="19" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /><path d="M6 9.5v.01M18 14.5v.01" /></svg></span>
            <b>Remboursement</b><span>Billet, retard, annulation</span>
          </button>
          <button type="button" className="cat" data-cat="info">
            <span className="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg></span>
            <b>Information voyageur</b><span>Horaires, lignes, tarifs</span>
          </button>
          <button type="button" className="cat" data-cat="presse">
            <span className="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8l11-4v16L3 16V8Z" /><path d="M14 7l5-1v12l-5-1M7 16v4" /></svg></span>
            <b>Presse &amp; médias</b><span>Demande d'interview, infos</span>
          </button>
          <button type="button" className="cat" data-cat="objets">
            <span className="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="8" width="16" height="12" rx="2" /><path d="M9 8V6a3 3 0 0 1 6 0v2M4 13h16" /></svg></span>
            <b>Objets trouvés</b><span>Oubli à bord ou en gare</span>
          </button>
          <button type="button" className="cat" data-cat="accessibilite">
            <span className="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="4.5" r="2" /><path d="M12 7v6m0 0 4 6m-4-6-4 6m-1-9h10" /></svg></span>
            <b>Accessibilité / PMR</b><span>Assistance, aménagements</span>
          </button>
          <button type="button" className="cat" data-cat="reclamation">
            <span className="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l9 16H3L12 3Z" /><path d="M12 10v4M12 17h.01" /></svg></span>
            <b>Réclamation</b><span>Incident, qualité de service</span>
          </button>
          <button type="button" className="cat" data-cat="suggestion">
            <span className="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 1 4 10c-.7.7-1 1.4-1 2H9c0-.6-.3-1.3-1-2A6 6 0 0 1 12 3Z" /></svg></span>
            <b>Suggestion</b><span>Idée d'amélioration</span>
          </button>
          <button type="button" className="cat" data-cat="autre">
            <span className="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg></span>
            <b>Autre demande</b><span>Tout autre sujet</span>
          </button>
        </div>

        <h2 className="sec-h"><span className="step">2</span> Décrivez votre demande</h2>

        {/* Confirmation (cachée au départ) */}
        <div className="success" id="success">
          <div className="success-top">
            <span className="chk"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4"><path d="m5 12 5 5 9-11" /></svg></span>
            <div><h2>Votre demande a bien été enregistrée</h2><p>Un accusé de réception vous a été envoyé par courriel.</p></div>
          </div>
          <div className="success-body">
            <div className="ref">
              <div><div className="lbl">Numéro de demande</div><div className="val" id="refNumber">TTE-2026-000000</div></div>
              <button type="button" className="btn btn-outline" id="newReq">Nouvelle demande</button>
            </div>
            <ul className="sum">
              <li><b>Demandeur</b><span id="sumUser">—</span></li>
              <li><b>Motif</b><span id="sumCat">—</span></li>
              <li><b>Sujet</b><span id="sumSubject">—</span></li>
              <li><b>Délai de réponse</b><span id="sumDelay">—</span></li>
            </ul>
            <p className="note">Conservez votre numéro de demande&nbsp;: il permet de suivre le traitement de votre dossier. La réponse vous parviendra dans votre espace, lié à votre compte Discord. Aucune information bancaire ne vous sera jamais demandée.</p>
          </div>
        </div>

        {/* Formulaire */}
        <form className="form-card" id="reqForm" noValidate>
          <div className="form-top">
            <b id="formTitle">Nouvelle demande</b>
            <span id="formHint">Sélectionnez un motif ci-dessus, puis remplissez le formulaire.</span>
          </div>
          <div className="form-body">

            {/* Identification Discord */}
            {!user ? (
              <div className="steam-gate" id="steamGate">
                <div className="lead">
                  <svg width="20" height="20" viewBox="0 0 71 55" fill="currentColor" aria-hidden="true">
                    <path d="M60.1 4.9A58.5 58.5 0 0 0 45.4.5a41 41 0 0 0-1.9 3.9 54 54 0 0 0-16 0A41 41 0 0 0 25.5.5 58.4 58.4 0 0 0 10.8 4.9C1.6 18.8-.9 32.4.4 45.7a58.9 58.9 0 0 0 17.9 9.1 43 43 0 0 0 3.8-6.2 38 38 0 0 1-6-2.9c.5-.4 1-.7 1.5-1.1a42 42 0 0 0 36 0c.5.4 1 .7 1.5 1.1a38 38 0 0 1-6 2.9 43 43 0 0 0 3.8 6.2 58.7 58.7 0 0 0 17.9-9.1c1.5-15.4-2.5-28.9-10.7-40.8ZM23.7 37.8c-3.5 0-6.4-3.3-6.4-7.3s2.8-7.3 6.4-7.3c3.6 0 6.5 3.3 6.4 7.3 0 4-2.8 7.3-6.4 7.3Zm23.6 0c-3.5 0-6.4-3.3-6.4-7.3s2.8-7.3 6.4-7.3c3.6 0 6.5 3.3 6.4 7.3 0 4-2.8 7.3-6.4 7.3Z" />
                  </svg>
                  <span className="tx"><b>Identifiez-vous avec Discord</b><span>Pas besoin d'e-mail&nbsp;: votre demande est reliée à votre compte Discord, et la réponse vous parvient dans votre espace.</span></span>
                </div>
                <a
                  href="/api/public/discord/login?redirect=/contact"
                  className="steam-btn"
                  style={{ background: "#5865F2", color: "#fff", textDecoration: "none" }}
                >
                  <svg className="slogo" viewBox="0 0 71 55" fill="currentColor" aria-hidden="true">
                    <path d="M60.1 4.9A58.5 58.5 0 0 0 45.4.5a41 41 0 0 0-1.9 3.9 54 54 0 0 0-16 0A41 41 0 0 0 25.5.5 58.4 58.4 0 0 0 10.8 4.9C1.6 18.8-.9 32.4.4 45.7a58.9 58.9 0 0 0 17.9 9.1 43 43 0 0 0 3.8-6.2 38 38 0 0 1-6-2.9c.5-.4 1-.7 1.5-1.1a42 42 0 0 0 36 0c.5.4 1 .7 1.5 1.1a38 38 0 0 1-6 2.9 43 43 0 0 0 3.8 6.2 58.7 58.7 0 0 0 17.9-9.1c1.5-15.4-2.5-28.9-10.7-40.8ZM23.7 37.8c-3.5 0-6.4-3.3-6.4-7.3s2.8-7.3 6.4-7.3c3.6 0 6.5 3.3 6.4 7.3 0 4-2.8 7.3-6.4 7.3Zm23.6 0c-3.5 0-6.4-3.3-6.4-7.3s2.8-7.3 6.4-7.3c3.6 0 6.5 3.3 6.4 7.3 0 4-2.8 7.3-6.4 7.3Z" />
                  </svg>
                  <span>Se connecter avec Discord</span>
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
                    <span className="ok"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m5 12 5 5 9-11" /></svg> Connecté avec Discord</span>
                  </div>
                  <div className="sid">@{user.username}</div>
                </div>
                <a href="/api/public/discord/logout" className="dx" style={{ textDecoration: "none" }}>Changer de compte</a>
              </div>
            )}


            <div className="form-err" id="formErr">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" /></svg>
              <span id="formErrTxt">Merci de compléter les champs obligatoires.</span>
            </div>

            <div className="fld">
              <label htmlFor="selType">Motif de la demande <span className="req">*</span></label>
              <select className="ctl" id="selType">
                <option value="">— Sélectionnez un motif —</option>
                <option value="remboursement">Remboursement</option>
                <option value="info">Information voyageur</option>
                <option value="presse">Presse &amp; médias</option>
                <option value="objets">Objets trouvés</option>
                <option value="accessibilite">Accessibilité / PMR</option>
                <option value="reclamation">Réclamation</option>
                <option value="suggestion">Suggestion</option>
                <option value="autre">Autre demande</option>
              </select>
            </div>

            {/* Bloc Remboursement */}
            <div className="cond" id="blkRefund">
              <div className="cond-wrap">
                <div className="ttl"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="2.5" y="6" width="19" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /></svg> Informations sur le titre concerné</div>
                <div className="grid2">
                  <div className="fld"><label htmlFor="rfRef">N° de billet / référence <span className="opt">(facultatif)</span></label><input className="ctl" id="rfRef" type="text" placeholder="Ex. B-2026-018342" /></div>
                  <div className="fld"><label htmlFor="rfDate">Date du trajet</label><input className="ctl" id="rfDate" type="date" /></div>
                </div>
                <div className="fld"><label htmlFor="rfLine">Ligne concernée</label>
                  <select className="ctl" id="rfLine">
                    <option value="">— Choisir une ligne —</option>
                    <option>R1 · Townsend – Sevierville</option>
                    <option>R2 · Townsend – Mascot</option>
                    <option>R3 · Knoxville – Greeneville</option>
                    <option>R4 · Knoxville – Chattanooga</option>
                    <option>IC1 · Townsend – Nashville</option>
                    <option>IC2 · Smoky Express</option>
                    <option>Ligne T · Train urbain de Townsend</option>
                    <option>Bus · Townsend</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bloc Objets trouvés */}
            <div className="cond" id="blkLost">
              <div className="cond-wrap">
                <div className="ttl"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="4" y="8" width="16" height="12" rx="2" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg> Détails de l'objet perdu</div>
                <div className="grid2">
                  <div className="fld"><label htmlFor="lsDate">Date de l'oubli</label><input className="ctl" id="lsDate" type="date" /></div>
                  <div className="fld"><label htmlFor="lsPlace">Ligne ou gare concernée</label><input className="ctl" id="lsPlace" type="text" placeholder="Ex. IC2, gare centrale de Townsend" /></div>
                </div>
                <div className="fld"><label htmlFor="lsDesc">Description de l'objet</label><input className="ctl" id="lsDesc" type="text" placeholder="Couleur, marque, contenu\u2026" /></div>
              </div>
            </div>

            {/* Bloc Presse */}
            <div className="cond" id="blkPress">
              <div className="cond-wrap">
                <div className="ttl"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M3 8l11-4v16L3 16V8Z" /></svg> Informations média</div>
                <div className="grid2">
                  <div className="fld"><label htmlFor="prMedia">Média / organisation</label><input className="ctl" id="prMedia" type="text" placeholder="Ex. Knoxville Daily" /></div>
                  <div className="fld"><label htmlFor="prRole">Fonction</label><input className="ctl" id="prRole" type="text" placeholder="Ex. Journaliste" /></div>
                </div>
                <div className="fld"><label htmlFor="prDeadline">Délai / bouclage souhaité <span className="opt">(facultatif)</span></label><input className="ctl" id="prDeadline" type="text" placeholder="Ex. avant vendredi 18 h" /></div>
              </div>
            </div>

            <div className="fld"><label htmlFor="sujet">Sujet <span className="req">*</span></label><input className="ctl" id="sujet" type="text" placeholder="R\u00e9sum\u00e9 en quelques mots" /></div>
            <div className="fld"><label htmlFor="message">Votre message <span className="req">*</span></label><textarea className="ctl" id="message" placeholder="D\u00e9crivez votre demande avec le plus de d\u00e9tails possible\u2026"></textarea></div>

            <label className="check" id="consentWrap"><input type="checkbox" id="consent" /> <span>J'autorise Townsend Transit Express à traiter ma demande, associée à mon compte Discord, conformément à sa politique de confidentialité. <span className="req">*</span></span></label>

            <div className="submit">
              <button type="submit" className="btn btn-primary">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" /></svg>
                Envoyer ma demande
              </button>
              <small>Connexion Discord requise · champs marqués <span style={{color: "var(--alert)"}}>*</span> obligatoires</small>
            </div>
          </div>
        </form>
      </div>

      {/* Colonne latérale */}
      <aside className="aside">
        {user && (
          <div className="card">
            <h3><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h10" /></svg> Mon espace</h3>
            <div style={{ display: "grid", gap: 8, marginTop: 6 }}>
              <a href="/mes-demandes" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#5865F2", color: "#fff", borderRadius: 8, textDecoration: "none", fontWeight: 600, fontSize: 13 }}>
                📄 Voir mes demandes
              </a>
              {isAdmin && (
                <a href="/suivi-demandes" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "rgba(225,29,72,0.15)", color: "#e11d48", border: "1px solid rgba(225,29,72,0.35)", borderRadius: 8, textDecoration: "none", fontWeight: 600, fontSize: 13 }}>
                  ⚙️ Suivi (Direction)
                </a>
              )}
            </div>
          </div>
        )}

        <div className="card">
          <h3><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 4h3l2 5-2 1a11 11 0 0 0 5 5l1-2 5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" /></svg> Nous joindre autrement</h3>
          <div className="contact-line"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 4h3l2 5-2 1a11 11 0 0 0 5 5l1-2 5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" /></svg><div><b>Service Clientèle</b><span>1-800-TTE-RAIL · lun.–sam. 7 h – 20 h</span></div></div>
          <div className="contact-line"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg><div><b>Courriel</b><span>contact@tte-rail.us</span></div></div>
          <div className="contact-line"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="10" r="3" /><path d="M12 2a8 8 0 0 0-8 8c0 5.4 8 12 8 12s8-6.6 8-12a8 8 0 0 0-8-8Z" /></svg><div><b>En gare</b><span>Guichets &amp; bornes — gare centrale de Townsend</span></div></div>
        </div>


        <div className="card">
          <h3><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg> Délais de réponse indicatifs</h3>
          <ul className="delays">
            <li>Remboursement <span className="d">sous 15 j</span></li>
            <li>Information voyageur <span className="d">sous 3 j</span></li>
            <li>Presse &amp; médias <span className="d">24–48 h</span></li>
            <li>Objets trouvés <span className="d">sous 5 j</span></li>
            <li>Réclamation <span className="d">sous 10 j</span></li>
          </ul>
        </div>

        <div className="urg">
          <b><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 3l9 16H3L12 3Z" /><path d="M12 10v4M12 17h.01" /></svg> Urgence ou sécurité</b>
          <p>Pour toute situation urgente à bord ou en gare, contactez le personnel sur place ou appelez le numéro d'urgence dédié, disponible 24 h/24.</p>
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
        <p>Townsend Transit Express — le réseau ferroviaire de l'est du Tennessee, au départ de Townsend et des Great Smoky Mountains.</p>
        <div className="addr">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="10" r="3" /><path d="M12 2a8 8 0 0 0-8 8c0 5.4 8 12 8 12s8-6.6 8-12a8 8 0 0 0-8-8Z" /></svg>
          <span>Siège social — Gare centrale, Townsend, Tennessee</span>
        </div>
      </div>
      <div className="fcol">
        <h4>Voyageurs</h4>
        <a href="/#lignes">Lignes &amp; horaires</a>
        <a href="/#tarifs">Tarifs &amp; titres</a>
        <a href="/contact#remboursement">Remboursement</a>
        <a href="/contact#objets">Objets trouvés</a>
        <a href="/contact#accessibilite">Accessibilité</a>
      </div>
      <div className="fcol">
        <h4>Entreprise</h4>
        <a href="#">À propos de TTE</a>
        <a href="/contact#presse">Presse &amp; médias</a>
        <a href="#">Recrutement</a>
        <a href="/espace-employes">Espace employés</a>
        <a href="/contact">Nous contacter</a>
      </div>
    </div>
    <div className="foot-bot">
      <p>© 2026 Townsend Transit Express. Tous droits réservés.</p>
      <div className="links">
        <a href="/mentions-legales">Mentions légales</a>
        <a href="/conditions-generales-transport-tte-v1.pdf" target="_blank" rel="noreferrer">Conditions de transport</a>
        <a href="#">Confidentialité</a>
        <a href="/">Accueil</a>
      </div>
    </div>
  </div>
</footer>



    </>
  );
}
