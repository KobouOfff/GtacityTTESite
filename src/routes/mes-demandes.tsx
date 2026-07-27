import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "@/components/DiscordAuth";
import { listMyContactRequests } from "@/lib/contact.functions";
import {
  CONTACT_CATEGORIES,
  CONTACT_STATUSES,
  getBranchLabel,
} from "@/lib/discord-roles";

function MesDemandesPage() {
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["my-contact-requests"],
    queryFn: () => listMyContactRequests(),
    enabled: !!user,
    staleTime: 30_000,
  });

  if (userLoading) {
    return <Shell><div style={muted}>Chargement…</div></Shell>;
  }
  if (!user) {
    return (
      <Shell>
        <div style={card}>
          <h2 style={{ marginTop: 0 }}>Connexion requise</h2>
          <p style={muted}>
            Connecte-toi avec Discord pour retrouver l'historique de tes demandes envoyées au service clientèle.
          </p>
          <a href="/api/public/discord/login?redirect=/mes-demandes" style={btnPrimary}>
            Se connecter avec Discord
          </a>
        </div>
      </Shell>
    );
  }

  const rows = data?.ok ? data.rows : [];

  return (
    <Shell>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: "0 0 4px" }}>Mes demandes</h1>
          <p style={{ ...muted, margin: 0 }}>
            Suivi des demandes envoyées au service clientèle TTE, liées à ton compte Discord.
          </p>
        </div>
        <button onClick={() => refetch()} disabled={isFetching} style={btnGhost}>
          {isFetching ? "Actualisation…" : "↻ Actualiser"}
        </button>
      </div>

      {isLoading ? (
        <div style={muted}>Chargement de tes demandes…</div>
      ) : data && !data.ok ? (
        <div style={{ ...card, borderColor: "#7f1d1d" }}>
          Impossible de charger tes demandes ({data.reason}).
        </div>
      ) : rows.length === 0 ? (
        <div style={card}>
          <p style={{ margin: 0 }}>Tu n'as pas encore envoyé de demande.</p>
          <a href="/contact" style={{ ...btnPrimary, marginTop: 12, display: "inline-block" }}>
            Ouvrir une demande
          </a>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {rows.map((r) => {
            const st = CONTACT_STATUSES[r.status] ?? { label: r.status, color: "#64748b" };
            return (
              <article key={r.id} style={card}>
                <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: 12, color: "#94a3b8", fontFamily: "ui-monospace, monospace" }}>{r.ref}</div>
                    <div style={{ fontWeight: 700, fontSize: 16, marginTop: 2 }}>{r.subject}</div>
                    <div style={{ ...muted, marginTop: 4, fontSize: 13 }}>
                      {CONTACT_CATEGORIES[r.category] ?? r.category} · déposée le{" "}
                      {new Date(r.created_at).toLocaleString("fr-FR")}
                    </div>
                  </div>
                  <span style={{ ...pill, background: st.color + "22", color: st.color, borderColor: st.color + "55" }}>
                    {st.label}
                  </span>
                </header>
                <p style={{ marginTop: 12, whiteSpace: "pre-wrap", color: "#cbd5e1" }}>{r.message}</p>
                {r.assigned_branch && (
                  <div style={{ marginTop: 10, ...muted, fontSize: 13 }}>
                    Transférée à : <b style={{ color: "#e2e8f0" }}>{getBranchLabel(r.assigned_branch)}</b>
                  </div>
                )}
                {r.notes && r.notes.length > 0 && (
                  <div style={{ marginTop: 12, borderTop: "1px dashed rgba(255,255,255,0.1)", paddingTop: 10 }}>
                    <div style={{ ...muted, fontSize: 12, marginBottom: 6 }}>Réponses de l'équipe :</div>
                    <div style={{ display: "grid", gap: 8 }}>
                      {r.notes.map((n, i) => (
                        <div key={i} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "8px 10px" }}>
                          <div style={{ fontSize: 12, color: "#94a3b8" }}>
                            <b style={{ color: "#e2e8f0" }}>{n.author}</b> · {new Date(n.at).toLocaleString("fr-FR")}
                          </div>
                          <div style={{ marginTop: 4, whiteSpace: "pre-wrap" }}>{n.message}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "#f1f5f9", fontFamily: "system-ui, sans-serif" }}>
      <header style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "14px 22px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <a href="/" style={{ color: "#f1f5f9", textDecoration: "none", fontWeight: 700, letterSpacing: -0.5 }}>
          <span style={{ color: "#4B92DD" }}>TTE</span> · Espace demandes
        </a>
        <nav style={{ display: "flex", gap: 14, fontSize: 13 }}>
          <a href="/contact" style={{ color: "#94a3b8", textDecoration: "none" }}>Nouvelle demande</a>
          <a href="/" style={{ color: "#94a3b8", textDecoration: "none" }}>Accueil</a>
        </nav>
      </header>
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "28px 22px 60px", display: "grid", gap: 18 }}>
        {children}
      </main>
    </div>
  );
}

const muted: React.CSSProperties = { color: "#94a3b8" };
const card: React.CSSProperties = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 14,
  padding: "16px 18px",
};
const pill: React.CSSProperties = {
  padding: "3px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
  border: "1px solid",
  whiteSpace: "nowrap",
};
const btnPrimary: React.CSSProperties = {
  padding: "10px 16px",
  background: "#5865F2",
  color: "#fff",
  borderRadius: 8,
  textDecoration: "none",
  fontWeight: 600,
  display: "inline-block",
  border: "none",
  cursor: "pointer",
};
const btnGhost: React.CSSProperties = {
  padding: "8px 14px",
  background: "rgba(255,255,255,0.05)",
  color: "#e2e8f0",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  fontSize: 13,
  cursor: "pointer",
};

export const Route = createFileRoute("/mes-demandes")({
  head: () => ({
    meta: [
      { title: "Mes demandes — Townsend Transit Express" },
      { name: "description", content: "Suivi de vos demandes envoyées au service clientèle Townsend Transit Express." },
    ],
  }),
  component: MesDemandesPage,
});
