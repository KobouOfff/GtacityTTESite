import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/auth.functions";
import { getPrimaryRole, hasPageAccess, type DiscordSessionUser } from "@/lib/discord-roles";
import type { ReactNode } from "react";

const currentUserQuery = {
  queryKey: ["discord-current-user"],
  queryFn: () => getCurrentUser(),
  staleTime: 60_000,
};

export function useCurrentUser() {
  return useQuery(currentUserQuery);
}

export function DiscordAuthButton() {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <div style={{
        padding: "6px 12px", fontSize: 13, color: "#94a3b8",
        borderRadius: 8, background: "rgba(255,255,255,0.05)",
      }}>…</div>
    );
  }

  if (!user) {
    return (
      <a href="/api/public/discord/login" style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        padding: "8px 14px", fontSize: 13, fontWeight: 600,
        color: "#fff", background: "#5865F2", borderRadius: 8,
        textDecoration: "none", border: "none", cursor: "pointer",
      }}>
        <svg width="18" height="14" viewBox="0 0 71 55" fill="currentColor" aria-hidden="true">
          <path d="M60.1 4.9A58.5 58.5 0 0 0 45.4.5a41 41 0 0 0-1.9 3.9 54 54 0 0 0-16 0A41 41 0 0 0 25.5.5 58.4 58.4 0 0 0 10.8 4.9C1.6 18.8-.9 32.4.4 45.7a58.9 58.9 0 0 0 17.9 9.1 43 43 0 0 0 3.8-6.2 38 38 0 0 1-6-2.9c.5-.4 1-.7 1.5-1.1a42 42 0 0 0 36 0c.5.4 1 .7 1.5 1.1a38 38 0 0 1-6 2.9 43 43 0 0 0 3.8 6.2 58.7 58.7 0 0 0 17.9-9.1c1.5-15.4-2.5-28.9-10.7-40.8ZM23.7 37.8c-3.5 0-6.4-3.3-6.4-7.3s2.8-7.3 6.4-7.3c3.6 0 6.5 3.3 6.4 7.3 0 4-2.8 7.3-6.4 7.3Zm23.6 0c-3.5 0-6.4-3.3-6.4-7.3s2.8-7.3 6.4-7.3c3.6 0 6.5 3.3 6.4 7.3 0 4-2.8 7.3-6.4 7.3Z"/>
        </svg>
        Se connecter avec Discord
      </a>
    );
  }

  const primary = getPrimaryRole(user.roleIds);
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 10,
      padding: "6px 10px 6px 6px", borderRadius: 999,
      background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
    }}>
      {user.avatar ? (
        <img src={user.avatar} alt="" width={28} height={28} style={{ borderRadius: "50%" }} />
      ) : (
        <div style={{
          width: 28, height: 28, borderRadius: "50%", background: "#334155",
          display: "grid", placeItems: "center", color: "#fff", fontSize: 12,
        }}>{user.username[0]?.toUpperCase()}</div>
      )}
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#f1f5f9" }}>
          {user.displayName || user.username}
        </span>
        {primary && (
          <span style={{ fontSize: 10, fontWeight: 600, color: primary.color }}>
            {primary.name}
          </span>
        )}
      </div>
      <a href="/api/public/discord/logout" title="Se déconnecter" style={{
        marginLeft: 4, padding: "4px 8px", fontSize: 11, color: "#94a3b8",
        textDecoration: "none", borderRadius: 6, background: "rgba(0,0,0,0.25)",
      }}>Déconnexion</a>
    </div>
  );
}

export function DiscordAccessGate({
  path,
  children,
}: {
  path: string;
  children: ReactNode;
}) {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <div style={{
        minHeight: "60vh", display: "grid", placeItems: "center",
        color: "#94a3b8", fontFamily: "system-ui",
      }}>
        Vérification de tes accès…
      </div>
    );
  }

  if (!user) return <AccessDeniedScreen reason="not_logged_in" />;
  if (!hasPageAccess(user as DiscordSessionUser, path)) {
    return <AccessDeniedScreen reason="no_role" user={user as DiscordSessionUser} />;
  }
  return <>{children}</>;
}

function AccessDeniedScreen({
  reason,
  user,
}: {
  reason: "not_logged_in" | "no_role";
  user?: DiscordSessionUser;
}) {
  return (
    <div style={{
      minHeight: "80vh", display: "grid", placeItems: "center",
      padding: "2rem", fontFamily: "system-ui", background: "#0f172a", color: "#f1f5f9",
    }}>
      <div style={{
        maxWidth: 520, textAlign: "center", padding: "2rem",
        border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16,
        background: "rgba(15,23,42,0.6)",
      }}>
        <div style={{ fontSize: 48 }}>{reason === "not_logged_in" ? "🔒" : "⛔"}</div>
        <h1 style={{ margin: "1rem 0 0.5rem", fontSize: 22 }}>
          {reason === "not_logged_in" ? "Connexion requise" : "Accès refusé"}
        </h1>
        <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.5 }}>
          {reason === "not_logged_in"
            ? "Cette page est réservée aux employés TTE. Connecte-toi avec Discord pour continuer."
            : `Salut ${user?.displayName || user?.username}, ton rôle Discord actuel ne te donne pas accès à cette page. Contacte un Gérant ou un Superviseur si tu penses que c'est une erreur.`}
        </p>
        <div style={{ marginTop: "1.5rem", display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          {reason === "not_logged_in" ? (
            <a href="/api/public/discord/login" style={{
              padding: "10px 18px", background: "#5865F2", color: "#fff",
              borderRadius: 8, textDecoration: "none", fontWeight: 600, fontSize: 14,
            }}>Se connecter avec Discord</a>
          ) : (
            <a href="/api/public/discord/logout" style={{
              padding: "10px 18px", background: "#334155", color: "#fff",
              borderRadius: 8, textDecoration: "none", fontWeight: 600, fontSize: 14,
            }}>Changer de compte</a>
          )}
          <a href="/" style={{
            padding: "10px 18px", background: "transparent", color: "#94a3b8",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 8, textDecoration: "none", fontWeight: 600, fontSize: 14,
          }}>Retour à l'accueil</a>
        </div>
      </div>
    </div>
  );
}
