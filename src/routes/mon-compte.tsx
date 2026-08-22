import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "@/components/DiscordAuth";
import { getMyLoyaltyAccount } from "@/lib/loyalty.functions";
import type { SubscriptionPurchaseRow } from "@/lib/loyalty.server";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  paiement_initie: { label: "En attente d'attribution", color: "#f59e0b" },
  delivre: { label: "Billet attribué", color: "#22c55e" },
  annule: { label: "Annulé", color: "#64748b" },
};

function MonComptePage() {
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["my-loyalty-account"],
    queryFn: () => getMyLoyaltyAccount(),
    enabled: !!user,
    staleTime: 15_000,
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
            Connecte-toi avec Discord pour retrouver ton compte client : solde de points fidélité et historique de tes achats d'abonnements.
          </p>
          <a href="/api/public/discord/login?redirect=/mon-compte" style={btnPrimary}>
            Se connecter avec Discord
          </a>
        </div>
      </Shell>
    );
  }

  const account = data?.ok ? data.account : null;
  const purchases = data?.ok ? data.purchases : [];

  return (
    <Shell>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: "0 0 4px" }}>Mon compte</h1>
          <p style={{ ...muted, margin: 0 }}>
            Ton compte client TTE, lié à ton compte Discord : points fidélité et historique de tes achats.
          </p>
        </div>
        <button onClick={() => refetch()} disabled={isFetching} style={btnGhost}>
          {isFetching ? "Actualisation…" : "↻ Actualiser"}
        </button>
      </div>

      {isLoading ? (
        <div style={muted}>Chargement de ton compte…</div>
      ) : data && !data.ok ? (
        <div style={{ ...card, borderColor: "#7f1d1d" }}>
          Impossible de charger ton compte ({data.reason}).
        </div>
      ) : (
        <>
          <div style={{ ...card, display: "flex", alignItems: "center", gap: 16 }}>
            {user.avatar ? (
              <img src={user.avatar} alt="" width={52} height={52} style={{ borderRadius: "50%" }} />
            ) : (
              <span style={{
                width: 52, height: 52, borderRadius: "50%", background: "#4B92DD22",
                display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 20,
              }}>
                {(user.displayName || user.username || "T")[0]?.toUpperCase()}
              </span>
            )}
            <div>
              <div style={{ fontWeight: 700, fontSize: 17 }}>{user.displayName || user.username}</div>
              <div style={{ ...muted, fontSize: 13, marginTop: 2 }}>
                Solde fidélité : <b style={{ color: "#e2e8f0" }}>{account?.points ?? 0} points</b>
              </div>
            </div>
          </div>

          <div className="notice" style={noticeBox}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>
            <p style={{ margin: 0 }}>
              Après un paiement en ligne, présente la <b>référence</b> de ton achat à un agent TTE (guichet en gare ou Discord) avec ton reçu de paiement pour faire attribuer ton billet.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: 16, margin: "18px 0 10px" }}>Historique de mes achats</h2>
            {purchases.length === 0 ? (
              <div style={card}>
                <p style={{ margin: 0 }}>Tu n'as pas encore effectué d'achat d'abonnement.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {purchases.map((p) => <PurchaseCard key={p.id} row={p} />)}
              </div>
            )}
          </div>
        </>
      )}
    </Shell>
  );
}

function PurchaseCard({ row }: { row: SubscriptionPurchaseRow }) {
  const status = STATUS_LABELS[row.status] ?? { label: row.status, color: "#64748b" };
  return (
    <article style={card}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{row.plan_name}</div>
          <div style={{ ...muted, marginTop: 4, fontSize: 13 }}>
            {row.price} $ · +{row.points_earned} points · acheté le{" "}
            {new Date(row.created_at).toLocaleString("fr-FR")}
          </div>
        </div>
        <span style={{ ...pill, background: status.color + "22", color: status.color, borderColor: status.color + "55" }}>
          {status.label}
        </span>
      </header>

      <div style={refBox}>
        <div style={{ ...muted, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 }}>
          Référence à présenter à un agent
        </div>
        <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 20, fontWeight: 700, color: "#4B92DD", letterSpacing: 1 }}>
          {row.reference}
        </div>
      </div>

      {row.status === "delivre" && row.delivered_at && (
        <div style={{ ...muted, marginTop: 10, fontSize: 12 }}>
          Billet attribué le {new Date(row.delivered_at).toLocaleString("fr-FR")}
          {row.delivered_by_username ? ` par ${row.delivered_by_username}` : ""}.
        </div>
      )}
    </article>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "#f1f5f9", fontFamily: "system-ui, sans-serif" }}>
      <header style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "14px 22px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <a href="/" style={{ color: "#f1f5f9", textDecoration: "none", fontWeight: 700, letterSpacing: -0.5 }}>
          <span style={{ color: "#4B92DD" }}>TTE</span> · Mon compte
        </a>
        <nav style={{ display: "flex", gap: 14, fontSize: 13 }}>
          <a href="/mes-demandes" style={{ color: "#94a3b8", textDecoration: "none" }}>Mes demandes</a>
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
const noticeBox: React.CSSProperties = {
  display: "flex",
  gap: 10,
  alignItems: "flex-start",
  background: "rgba(75,146,221,0.08)",
  border: "1px solid rgba(75,146,221,0.3)",
  borderRadius: 12,
  padding: "12px 14px",
  fontSize: 13,
  color: "#cbd5e1",
};
const refBox: React.CSSProperties = {
  marginTop: 14,
  borderTop: "1px dashed rgba(255,255,255,0.1)",
  paddingTop: 12,
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

export const Route = createFileRoute("/mon-compte")({
  head: () => ({
    meta: [
      { title: "Mon compte — Townsend Transit Express" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Votre compte client Townsend Transit Express : points fidélité et historique de vos achats d'abonnements." },
    ],
  }),
  component: MonComptePage,
});
