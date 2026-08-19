import { useState } from "react";
import "./EspaceEmployes.css";
import { useCurrentUser } from "@/components/DiscordAuth";
import { getPrimaryRole } from "@/lib/discord-roles";
import { TTELogo } from "@/components/TTELogo";
import MailPanel from "@/components/MailPanel";

export default function EspaceEmployesPage() {
  const { data: user } = useCurrentUser();
  const primaryRole = user ? getPrimaryRole(user.roleIds) : null;
  const [mailOpen, setMailOpen] = useState(false);

  return (
    <>
      <div className="bar">
        <div className="bar-in">
          <div className="brand">
            <TTELogo className="logo" />
            <span className="who">Espace employés</span>
          </div>
          <a className="back" href="/">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M15 5l-7 7 7 7" /></svg>
            Retour au site public
          </a>
        </div>
      </div>

      <div className="restricted">
        <div className="restricted-in">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 3l9 16H3L12 3Z" /><path d="M12 10v4M12 17h.01" /></svg>
          Accès strictement réservé au personnel autorisé de Townsend Transit Express. Toute connexion est enregistrée.
        </div>
      </div>

      <main>
        <div className="panel">
          <div className="intro">
            <span className="eyebrow">Intranet TTE</span>
            <h1>Votre portail interne</h1>
            <p>Retrouvez en un seul endroit les outils du quotidien des équipes : exploitation, conduite, gares et maintenance.</p>
            <div className="mods">
              <div className="mod">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4M16 2v4" /></svg>
                <div><b>Planning &amp; roulements</b><span>Vos services à venir</span></div>
              </div>
              <div className="mod">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></svg>
                <div><b>Fiches de service</b><span>Roulements &amp; consignes</span></div>
              </div>
              <div className="mod">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16v12H7l-3 3V4Z" /><path d="M8 9h8M8 12h5" /></svg>
                <div><b>Notes de service</b><span>Communications internes</span></div>
              </div>
              <div className="mod">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3Z" /><path d="m9 12 2 2 4-4" /></svg>
                <div><b>Sécurité</b><span>Consignes &amp; bulletins</span></div>
              </div>
            </div>
            <div className="foot-note">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="4" y="11" width="16" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
              Connexion sécurisée · réservée au personnel TTE
            </div>
          </div>

          <div className="login">
            <span className="lock"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="4" y="11" width="16" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg></span>
            <h2>Accès personnel validé</h2>
            <p className="sub">Votre session Discord est active. Vous pouvez accéder aux outils internes autorisés par vos rôles TTE.</p>

            <div className="discord-prof">
              {user?.avatar ? (
                <img className="av" src={user.avatar} alt="" width={46} height={46} />
              ) : (
                <span className="av fallback">{(user?.displayName || user?.username || "T")[0]?.toUpperCase()}</span>
              )}
              <div className="meta">
                <div className="nm">{user?.displayName || user?.username || "Personnel TTE"}</div>
                <div className="st"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m5 12 5 5 9-11" /></svg> Discord · authentifié</div>
                <div className="sid">Rôle principal : <span style={{ color: primaryRole?.color }}>{primaryRole?.name || "Personnel autorisé"}</span></div>
              </div>
              <a className="dx" href="/api/public/discord/logout">Déconnexion</a>
            </div>

            <div className="staff-actions">
              <a href="/centre-regulation" className="btn" style={{ textDecoration: "none" }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M10 17l5-5-5-5M15 12H3M14 4h5a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-5" /></svg>
                Centre de Contrôle
              </a>
              <button type="button" className="tool-btn" onClick={() => setMailOpen(true)}>Boîte mail</button>
              <button type="button" className="tool-btn">Planning &amp; roulements</button>
              <button type="button" className="tool-btn">Fiches de service</button>
              <button type="button" className="tool-btn">Documents RH</button>
            </div>

            <div className="discord-tip">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>
              <span>Aucune identification Steam n'est nécessaire : l'accès employé utilise uniquement Discord.</span>
            </div>
          </div>
        </div>
      </main>

      {mailOpen && <MailPanel onClose={() => setMailOpen(false)} />}

      <footer>
        <div className="f-in">
          <span>© 2026 Townsend Transit Express — Intranet réservé au personnel.</span>
          <a href="/">Site public</a>
        </div>
      </footer>
    </>
  );
}
