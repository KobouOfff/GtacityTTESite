import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useCurrentUser } from "@/components/DiscordAuth";
import { getMyLoyaltyAccount } from "@/lib/loyalty.functions";
import type { SubscriptionPurchaseRow } from "@/lib/loyalty.server";
import { getRewardCatalog, getMyRewardClaims, claimRewardFn } from "@/lib/rewards.functions";
import type { RewardClaimRow, RewardTier, RewardTierId } from "@/lib/rewards.server";

/* ------------------------------------------------------------------ *
 * Palette "bleu ferroviaire sombre"
 * ------------------------------------------------------------------ */
const C = {
  bg: "var(--tte-bg)",
  bg2: "var(--tte-bg2)",
  line: "rgba(var(--tte-overlay),0.09)",
  text: "var(--tte-text)",
  muted: "var(--tte-muted)",
  accent: "#4B92DD",
  accentSoft: "rgba(75,146,221,0.12)",
  ok: "#34D399",
  warn: "#FBBF24",
  off: "var(--tte-muted)",
  danger: "#F87171",
};

const STATUS: Record<string, { label: string; color: string; dot: string }> = {
  paiement_initie: { label: "En attente d'attribution", color: C.warn, dot: C.warn },
  delivre: { label: "Billet attribué", color: C.ok, dot: C.ok },
  annule: { label: "Annulé", color: C.off, dot: C.off },
};

const REWARD_STATUS: Record<string, { label: string; color: string; dot: string }> = {
  a_recuperer: { label: "En attente de retrait", color: C.warn, dot: C.warn },
  recupere: { label: "Récompense remise", color: C.ok, dot: C.ok },
  annule: { label: "Annulée", color: C.off, dot: C.off },
};

// Tolérance réseau : le client peut circuler pendant 24h après son achat en
// attendant l'attribution du billet par un agent. Passé ce délai sans
// attribution, il n'est plus autorisé à circuler tant que le billet n'est
// pas validé.
const NETWORK_TOLERANCE_MS = 24 * 60 * 60 * 1000;

function getToleranceInfo(row: SubscriptionPurchaseRow): { deadline: Date; expired: boolean } | null {
  if (row.status !== "paiement_initie") return null;
  const deadline = new Date(new Date(row.created_at).getTime() + NETWORK_TOLERANCE_MS);
  return { deadline, expired: Date.now() > deadline.getTime() };
}

/* ------------------------------------------------------------------ *
 * Page
 * ------------------------------------------------------------------ */
function MonComptePage() {
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const queryClient = useQueryClient();
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["my-loyalty-account"],
    queryFn: () => getMyLoyaltyAccount(),
    enabled: !!user,
    staleTime: 15_000,
  });

  const { data: catalogData } = useQuery({
    queryKey: ["reward-catalog"],
    queryFn: () => getRewardCatalog(),
    staleTime: Infinity,
  });

  const { data: claimsData, isLoading: claimsLoading } = useQuery({
    queryKey: ["my-reward-claims"],
    queryFn: () => getMyRewardClaims(),
    enabled: !!user,
    staleTime: 15_000,
  });

  const claimMutation = useMutation({
    mutationFn: (tierId: RewardTierId) => claimRewardFn({ data: { tierId } }),
    onSuccess: (res) => {
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ["my-loyalty-account"] });
        queryClient.invalidateQueries({ queryKey: ["my-reward-claims"] });
      }
    },
  });

  if (userLoading) {
    return (
      <Shell>
        <Skeleton height={132} />
        <Skeleton height={92} />
        <Skeleton height={168} />
      </Shell>
    );
  }

  if (!user) {
    return (
      <Shell>
        <section style={{ ...card, textAlign: "center", padding: "42px 24px" }}>
          <div style={badgeIcon}>
            <Icon name="user" size={26} />
          </div>
          <h1 style={{ margin: "16px 0 8px", fontSize: 24, letterSpacing: -0.4 }}>Connexion requise</h1>
          <p style={{ ...mutedText, maxWidth: 440, margin: "0 auto 22px", lineHeight: 1.6 }}>
            Connecte-toi avec Discord pour retrouver ton compte client&nbsp;: solde de points fidélité et
            historique de tes achats d'abonnements.
          </p>
          <a href="/api/public/discord/login?redirect=/mon-compte" className="tte-btn" style={btnDiscord}>
            <Icon name="discord" size={18} />
            Se connecter avec Discord
          </a>
        </section>
      </Shell>
    );
  }

  const account = data?.ok ? data.account : null;
  const purchases = data?.ok ? data.purchases : [];
  const delivered = purchases.filter((p) => p.status === "delivre").length;
  const pending = purchases.filter((p) => p.status === "paiement_initie").length;

  return (
    <Shell>
      {/* ---------- En-tête / identité ---------- */}
      <section style={heroCard}>
        <div style={heroGlow} aria-hidden="true" />
        <div style={{ position: "relative", display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
          <div style={avatarRing}>
            {user.avatar ? (
              <img src={user.avatar} alt="" width={62} height={62} style={{ borderRadius: "50%", display: "block" }} />
            ) : (
              <span style={avatarFallback}>
                {(user.displayName || user.username || "T")[0]?.toUpperCase()}
              </span>
            )}
          </div>

          <div style={{ flex: "1 1 220px", minWidth: 0 }}>
            <div style={eyebrow}>Compte client Townsend Transit Express</div>
            <h1 style={{ margin: "4px 0 0", fontSize: 26, letterSpacing: -0.6, lineHeight: 1.15 }}>
              {user.displayName || user.username}
            </h1>
            <p style={{ ...mutedText, margin: "6px 0 0", fontSize: 13 }}>
              Lié à ton compte Discord · points fidélité et historique d'achats.
            </p>
          </div>

          <button onClick={() => refetch()} disabled={isFetching} className="tte-btn" style={btnGhost}>
            <span style={{ display: "inline-flex", animation: isFetching ? "tte-spin 0.9s linear infinite" : "none" }}>
              <Icon name="refresh" size={15} />
            </span>
            {isFetching ? "Actualisation…" : "Actualiser"}
          </button>
        </div>

        <div style={statGrid}>
          <Stat label="Points fidélité" value={(account?.points ?? 0).toLocaleString("fr-FR")} accent={C.accent} icon="star" />
          <Stat label="Billets attribués" value={String(delivered)} accent={C.ok} icon="check" />
          <Stat label="En attente" value={String(pending)} accent={C.warn} icon="clock" />
        </div>
      </section>

      {/* ---------- Rappel procédure ---------- */}
      <aside style={notice}>
        <Icon name="info" size={18} />
        <p style={{ margin: 0, lineHeight: 1.6 }}>
          Après un paiement en ligne, tu bénéficies d'une <b style={{ color: C.text }}>tolérance de 24h</b> pour circuler sur le
          réseau le temps de faire attribuer ton billet. Présente la <b style={{ color: C.text }}>référence</b> de ton achat à un
          agent TTE (guichet en gare ou Discord) avec ton reçu de paiement avant l'expiration de ce délai — passé les 24h et sans
          billet attribué, tu ne peux plus circuler sur le réseau.
        </p>
      </aside>

      {/* ---------- Récompenses fidélité ---------- */}
      <section>
        <div style={sectionHead}>
          <h2 style={{ fontSize: 15, margin: 0, textTransform: "uppercase", letterSpacing: 1.2, color: C.muted }}>
            Récompenses fidélité
          </h2>
        </div>

        {catalogData?.ok && (
          <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
            {catalogData.tiers.map((tier) => (
              <RewardTierCard
                key={tier.id}
                tier={tier}
                points={account?.points ?? 0}
                onClaim={() => claimMutation.mutate(tier.id)}
                claiming={claimMutation.isPending && claimMutation.variables === tier.id}
                error={
                  claimMutation.data && !claimMutation.data.ok && claimMutation.variables === tier.id
                    ? claimMutation.data.reason
                    : null
                }
              />
            ))}
          </div>
        )}

        {claimMutation.data?.ok && (
          <div style={{ ...notice, marginTop: 14 }}>
            <Icon name="check" size={18} />
            <p style={{ margin: 0, lineHeight: 1.6 }}>
              Récompense réclamée&nbsp;! Présente le code{" "}
              <b style={{ color: C.text, fontFamily: "ui-monospace, monospace" }}>{claimMutation.data.claim.code}</b>{" "}
              à un agent TTE pour la récupérer.
            </p>
          </div>
        )}

        {!!(claimsData?.ok && claimsData.claims.length) && (
          <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
            {claimsData.claims.map((c) => (
              <RewardClaimCard key={c.id} row={c} />
            ))}
          </div>
        )}

        {claimsLoading && (
          <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
            <Skeleton height={72} />
          </div>
        )}
      </section>

      {/* ---------- Historique ---------- */}
      <section>
        <div style={sectionHead}>
          <h2 style={{ fontSize: 15, margin: 0, textTransform: "uppercase", letterSpacing: 1.2, color: C.muted }}>
            Historique de mes achats
          </h2>
          {purchases.length > 0 && <span style={countPill}>{purchases.length}</span>}
        </div>

        {isLoading ? (
          <div style={{ display: "grid", gap: 14 }}>
            <Skeleton height={168} />
            <Skeleton height={168} />
          </div>
        ) : data && !data.ok ? (
          <div style={{ ...card, borderColor: "rgba(248,113,113,0.35)", background: "rgba(248,113,113,0.07)", display: "flex", gap: 10 }}>
            <Icon name="alert" size={18} />
            <span>Impossible de charger ton compte ({data.reason}).</span>
          </div>
        ) : purchases.length === 0 ? (
          <div style={{ ...card, textAlign: "center", padding: "40px 22px" }}>
            <div style={badgeIcon}>
              <Icon name="ticket" size={24} />
            </div>
            <p style={{ margin: "14px 0 4px", fontWeight: 700 }}>Aucun achat pour le moment</p>
            <p style={{ ...mutedText, margin: 0, fontSize: 13 }}>
              Tes abonnements achetés en ligne apparaîtront ici avec leur référence.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            {purchases.map((p) => (
              <PurchaseCard key={p.id} row={p} />
            ))}
          </div>
        )}
      </section>
    </Shell>
  );
}

/* ------------------------------------------------------------------ *
 * Carte d'achat — style billet
 * ------------------------------------------------------------------ */
function PurchaseCard({ row }: { row: SubscriptionPurchaseRow }) {
  const status = STATUS[row.status] ?? { label: row.status, color: C.off, dot: C.off };
  const [copied, setCopied] = useState(false);
  const tolerance = getToleranceInfo(row);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(row.reference ?? "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* presse-papiers indisponible */
    }
  };

  return (
    <article className="tte-card" style={ticketCard}>
      <span style={{ ...ticketEdge, background: status.color }} aria-hidden="true" />

      <div style={{ padding: "18px 20px" }}>
        <header style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 17, letterSpacing: -0.2 }}>{row.plan_name}</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
              <span style={metaChip}>{row.price} $</span>
              <span style={{ ...metaChip, color: C.accent, borderColor: "rgba(75,146,221,0.35)", background: C.accentSoft }}>
                +{row.points_earned} points
              </span>
              <span style={metaChip}>
                {new Date(row.created_at).toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          <span style={{ ...pill, color: status.color, borderColor: status.color + "55", background: status.color + "1A" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: status.dot, display: "inline-block" }} />
            {status.label}
          </span>
        </header>
      </div>

      {tolerance && (
        <div style={{ padding: "0 20px 14px" }}>
          {tolerance.expired ? (
            <div style={{ ...notice, background: "rgba(248,113,113,0.1)", borderColor: "rgba(248,113,113,0.35)", color: "#FCA5A5", padding: "10px 12px", fontSize: 12.5 }}>
              <Icon name="alert" size={16} />
              <span style={{ margin: 0 }}>
                Tolérance de 24h dépassée depuis le {tolerance.deadline.toLocaleString("fr-FR")} — tu ne peux plus circuler sur le
                réseau tant que ce billet n'est pas attribué par un agent.
              </span>
            </div>
          ) : (
            <div style={{ ...notice, padding: "10px 12px", fontSize: 12.5 }}>
              <Icon name="clock" size={16} />
              <span style={{ margin: 0 }}>
                Tolérance réseau valable jusqu'au {tolerance.deadline.toLocaleString("fr-FR")} — fais attribuer ton billet avant
                cette échéance.
              </span>
            </div>
          )}
        </div>
      )}

      {/* perforation de billet */}
      <div style={perfRow} aria-hidden="true">
        <span style={{ ...perfNotch, left: -7 }} />
        <span style={perfLine} />
        <span style={{ ...perfNotch, right: -7 }} />
      </div>

      <div style={{ padding: "16px 20px 18px" }}>
        <div style={{ ...eyebrow, fontSize: 10.5 }}>Référence à présenter à un agent</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginTop: 8 }}>
          <code style={refCode}>{row.reference}</code>
          <button onClick={copy} className="tte-btn" style={btnCopy}>
            <Icon name={copied ? "check" : "copy"} size={14} />
            {copied ? "Copié" : "Copier"}
          </button>
        </div>

        {row.status === "delivre" && row.delivered_at && (
          <div style={{ ...mutedText, marginTop: 14, fontSize: 12.5, display: "flex", gap: 8, alignItems: "center" }}>
            <Icon name="check" size={14} />
            Billet attribué le {new Date(row.delivered_at).toLocaleString("fr-FR")}
            {row.delivered_by_username ? ` par ${row.delivered_by_username}` : ""}.
          </div>
        )}
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ *
 * Récompenses fidélité
 * ------------------------------------------------------------------ */
const CLAIM_ERRORS: Record<string, string> = {
  not_logged_in: "Session expirée, reconnecte-toi.",
  unknown_tier: "Récompense inconnue.",
  account_not_found: "Compte fidélité introuvable, réessaie plus tard.",
  insufficient_points: "Pas encore assez de points pour cette récompense.",
  insert_failed: "Erreur serveur, réessaie.",
};

function RewardTierCard({
  tier,
  points,
  onClaim,
  claiming,
  error,
}: {
  tier: RewardTier;
  points: number;
  onClaim: () => void;
  claiming: boolean;
  error: string | null;
}) {
  const pct = Math.min(100, Math.round((points / tier.pointsCost) * 100));
  const unlocked = points >= tier.pointsCost;

  return (
    <article className="tte-card" style={{ ...card, display: "grid", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
        <div style={{ ...badgeIcon, width: 40, height: 40, margin: 0 }}>
          <Icon name="gift" size={18} />
        </div>
        <span style={{ ...metaChip, color: C.accent, borderColor: "rgba(75,146,221,0.35)", background: C.accentSoft }}>
          {tier.pointsCost.toLocaleString("fr-FR")} pts
        </span>
      </div>

      <div>
        <div style={{ fontWeight: 700, fontSize: 15.5 }}>{tier.label}</div>
        <p style={{ ...mutedText, margin: "6px 0 0", fontSize: 12.5, lineHeight: 1.5 }}>{tier.description}</p>
      </div>

      <div style={{ height: 7, borderRadius: 999, background: "rgba(var(--tte-overlay),0.06)", overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: unlocked ? C.ok : C.accent,
            borderRadius: 999,
            transition: "width .3s ease",
          }}
        />
      </div>
      <div style={{ ...mutedText, fontSize: 11.5 }}>
        {unlocked ? "Disponible" : `${Math.max(0, tier.pointsCost - points).toLocaleString("fr-FR")} points restants`}
      </div>

      {error && <div style={{ color: C.danger, fontSize: 12 }}>{CLAIM_ERRORS[error] ?? "Réclamation impossible."}</div>}

      <button
        type="button"
        className="tte-btn"
        onClick={onClaim}
        disabled={!unlocked || claiming}
        style={{ ...btnGhost, justifyContent: "center", opacity: !unlocked ? 0.5 : 1 }}
      >
        {claiming ? "Réclamation…" : unlocked ? "Réclamer" : "Verrouillée"}
      </button>
    </article>
  );
}

function RewardClaimCard({ row }: { row: RewardClaimRow }) {
  const status = REWARD_STATUS[row.status] ?? { label: row.status, color: C.off, dot: C.off };
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(row.code ?? "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* presse-papiers indisponible */
    }
  };

  return (
    <article className="tte-card" style={{ ...card, display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14.5 }}>{row.tier_label}</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8, alignItems: "center" }}>
          <code style={{ ...refCode, fontSize: 14, padding: "5px 10px" }}>{row.code}</code>
          <button onClick={copy} className="tte-btn" style={btnCopy}>
            <Icon name={copied ? "check" : "copy"} size={13} />
            {copied ? "Copié" : "Copier"}
          </button>
        </div>
      </div>
      <span style={{ ...pill, color: status.color, borderColor: status.color + "55", background: status.color + "1A" }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: status.dot, display: "inline-block" }} />
        {status.label}
      </span>
    </article>
  );
}

/* ------------------------------------------------------------------ *
 * Coquille de page
 * ------------------------------------------------------------------ */
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={page}>
      <style>{css}</style>
      <header style={topbar}>
        <a href="/" style={brand}>
          <span style={brandMark}>TTE</span>
          <span style={{ color: C.muted, fontWeight: 500 }}>Mon compte</span>
        </a>
        <nav style={{ display: "flex", gap: 6, fontSize: 13 }}>
          <a href="/mes-demandes" className="tte-navlink" style={navLink}>
            Mes demandes
          </a>
          <a href="/" className="tte-navlink" style={navLink}>
            Accueil
          </a>
        </nav>
      </header>
      <main style={{ maxWidth: 940, margin: "0 auto", padding: "30px 20px 72px", display: "grid", gap: 20 }}>
        {children}
      </main>
    </div>
  );
}

function Stat({ label, value, accent, icon }: { label: string; value: string; accent: string; icon: IconName }) {
  return (
    <div style={statCard}>
      <span style={{ ...statIcon, color: accent, background: accent + "1A", borderColor: accent + "3d" }}>
        <Icon name={icon} size={15} />
      </span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.6, lineHeight: 1.1 }}>{value}</div>
        <div style={{ ...mutedText, fontSize: 11.5, textTransform: "uppercase", letterSpacing: 0.9, marginTop: 3 }}>
          {label}
        </div>
      </div>
    </div>
  );
}

function Skeleton({ height }: { height: number }) {
  return <div className="tte-skeleton" style={{ height, borderRadius: 16 }} />;
}

/* ------------------------------------------------------------------ *
 * Icônes (inline, aucune dépendance)
 * ------------------------------------------------------------------ */
type IconName =
  | "refresh" | "info" | "star" | "check" | "clock" | "copy" | "ticket" | "alert" | "user" | "discord" | "gift";

function Icon({ name, size = 16 }: { name: IconName; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    style: { flex: "0 0 auto" },
  };
  switch (name) {
    case "refresh":
      return <svg {...common}><path d="M21 12a9 9 0 1 1-3-6.7" /><path d="M21 4v5h-5" /></svg>;
    case "info":
      return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>;
    case "star":
      return <svg {...common}><path d="M12 3.5l2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" /></svg>;
    case "check":
      return <svg {...common}><path d="M20 6L9 17l-5-5" /></svg>;
    case "clock":
      return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></svg>;
    case "copy":
      return <svg {...common}><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h8" /></svg>;
    case "ticket":
      return <svg {...common}><path d="M3 9V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 6v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-6z" /><path d="M12 8v8" strokeDasharray="2 3" /></svg>;
    case "alert":
      return <svg {...common}><path d="M12 4l9 16H3z" /><path d="M12 10v4M12 17h.01" /></svg>;
    case "user":
      return <svg {...common}><circle cx="12" cy="8" r="4" /><path d="M4.5 20a7.5 7.5 0 0 1 15 0" /></svg>;
    case "gift":
      return <svg {...common}><rect x="3" y="8" width="18" height="13" rx="1" /><path d="M12 8v13M3 12h18" /><path d="M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5" /></svg>;
    case "discord":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ flex: "0 0 auto" }}>
          <path d="M19.5 5.4A16 16 0 0 0 15.6 4l-.3.6a12 12 0 0 1 3.4 1.7 15.6 15.6 0 0 0-13.4 0A12 12 0 0 1 8.7 4.6L8.4 4a16 16 0 0 0-3.9 1.4C2 9.8 1.4 14 1.7 18a16 16 0 0 0 4.9 2.4l.6-1a11 11 0 0 1-1.8-.9l.4-.3a11.4 11.4 0 0 0 9.8 0l.4.3c-.6.4-1.2.7-1.8.9l.6 1A16 16 0 0 0 20.3 18c.4-4.7-.6-8.8-.8-12.6zM8.6 15.3c-1 0-1.7-.9-1.7-1.9s.8-1.9 1.7-1.9 1.8.9 1.7 1.9c0 1-.8 1.9-1.7 1.9zm6.8 0c-1 0-1.7-.9-1.7-1.9s.8-1.9 1.7-1.9 1.8.9 1.7 1.9c0 1-.8 1.9-1.7 1.9z" />
        </svg>
      );
  }
}

/* ------------------------------------------------------------------ *
 * Styles
 * ------------------------------------------------------------------ */
const page: React.CSSProperties = {
  minHeight: "100vh",
  background: `radial-gradient(1100px 520px at 12% -8%, rgba(75,146,221,0.16), transparent 60%), ${C.bg}`,
  color: C.text,
  fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
};
const topbar: React.CSSProperties = {
  borderBottom: `1px solid ${C.line}`,
  background: "rgba(var(--tte-bg-rgb),0.75)",
  backdropFilter: "blur(10px)",
  position: "sticky",
  top: 0,
  zIndex: 10,
  padding: "13px 20px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
};
const brand: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  color: C.text,
  textDecoration: "none",
  fontWeight: 700,
  letterSpacing: -0.3,
  fontSize: 15,
};
const brandMark: React.CSSProperties = {
  background: `linear-gradient(135deg, ${C.accent}, #7BB8F0)`,
  color: "#04101f",
  borderRadius: 8,
  padding: "3px 8px",
  fontWeight: 900,
  letterSpacing: 0.5,
  fontSize: 13,
};
const navLink: React.CSSProperties = {
  color: C.muted,
  textDecoration: "none",
  padding: "6px 10px",
  borderRadius: 8,
};
const card: React.CSSProperties = {
  background: `linear-gradient(180deg, rgba(var(--tte-overlay),0.045), rgba(var(--tte-overlay),0.015))`,
  border: `1px solid ${C.line}`,
  borderRadius: 16,
  padding: "18px 20px",
};
const heroCard: React.CSSProperties = {
  ...card,
  position: "relative",
  overflow: "hidden",
  padding: "22px 22px 20px",
};
const heroGlow: React.CSSProperties = {
  position: "absolute",
  inset: "-60% 40% auto -10%",
  height: 260,
  background: "radial-gradient(closest-side, rgba(75,146,221,0.28), transparent)",
  pointerEvents: "none",
};
const avatarRing: React.CSSProperties = {
  padding: 3,
  borderRadius: "50%",
  background: `linear-gradient(135deg, ${C.accent}, rgba(75,146,221,0.15))`,
  display: "inline-flex",
};
const avatarFallback: React.CSSProperties = {
  width: 62,
  height: 62,
  borderRadius: "50%",
  background: C.bg2,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 800,
  fontSize: 24,
  color: C.accent,
};
const eyebrow: React.CSSProperties = {
  color: C.muted,
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: 1.3,
  fontWeight: 700,
};
const statGrid: React.CSSProperties = {
  position: "relative",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
  gap: 12,
  marginTop: 22,
};
const statCard: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  background: "rgba(var(--tte-overlay),0.035)",
  border: `1px solid ${C.line}`,
  borderRadius: 13,
  padding: "13px 15px",
};
const statIcon: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: 10,
  border: "1px solid",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flex: "0 0 auto",
};
const notice: React.CSSProperties = {
  display: "flex",
  gap: 12,
  alignItems: "flex-start",
  background: C.accentSoft,
  border: "1px solid rgba(75,146,221,0.3)",
  borderRadius: 14,
  padding: "14px 16px",
  fontSize: 13.5,
  color: "var(--tte-muted)",
};
const sectionHead: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  margin: "4px 0 14px",
};
const countPill: React.CSSProperties = {
  fontSize: 11.5,
  fontWeight: 800,
  color: C.accent,
  background: C.accentSoft,
  border: "1px solid rgba(75,146,221,0.3)",
  borderRadius: 999,
  padding: "1px 9px",
};
const ticketCard: React.CSSProperties = {
  position: "relative",
  background: `linear-gradient(180deg, rgba(var(--tte-overlay),0.05), rgba(var(--tte-overlay),0.015))`,
  border: `1px solid ${C.line}`,
  borderRadius: 16,
  overflow: "hidden",
  paddingLeft: 4,
};
const ticketEdge: React.CSSProperties = {
  position: "absolute",
  left: 0,
  top: 0,
  bottom: 0,
  width: 4,
};
const perfRow: React.CSSProperties = {
  position: "relative",
  height: 1,
  margin: "0 20px",
};
const perfLine: React.CSSProperties = {
  display: "block",
  height: 1,
  background: "repeating-linear-gradient(90deg, rgba(var(--tte-overlay),0.22) 0 6px, transparent 6px 12px)",
};
const perfNotch: React.CSSProperties = {
  position: "absolute",
  top: -7,
  width: 14,
  height: 14,
  borderRadius: "50%",
  background: C.bg,
  border: `1px solid ${C.line}`,
};
const metaChip: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: C.muted,
  background: "rgba(var(--tte-overlay),0.04)",
  border: `1px solid ${C.line}`,
  borderRadius: 999,
  padding: "3px 10px",
};
const pill: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 7,
  padding: "5px 12px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
  border: "1px solid",
  whiteSpace: "nowrap",
  height: "fit-content",
};
const refCode: React.CSSProperties = {
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
  fontSize: 21,
  fontWeight: 800,
  color: C.accent,
  letterSpacing: 2,
  background: C.accentSoft,
  border: "1px dashed rgba(75,146,221,0.45)",
  borderRadius: 10,
  padding: "8px 14px",
};
const btnGhost: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "9px 15px",
  background: "rgba(var(--tte-overlay),0.05)",
  color: C.text,
  border: `1px solid ${C.line}`,
  borderRadius: 10,
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  height: "fit-content",
};
const btnCopy: React.CSSProperties = { ...btnGhost, padding: "7px 12px", fontSize: 12.5 };
const btnDiscord: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 10,
  padding: "12px 20px",
  background: "linear-gradient(135deg, #5865F2, #4752C4)",
  color: "#fff",
  borderRadius: 12,
  textDecoration: "none",
  fontWeight: 700,
  border: "none",
  cursor: "pointer",
  boxShadow: "0 10px 24px -12px rgba(88,101,242,0.9)",
};
const badgeIcon: React.CSSProperties = {
  width: 54,
  height: 54,
  borderRadius: 16,
  margin: "0 auto",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: C.accent,
  background: C.accentSoft,
  border: "1px solid rgba(75,146,221,0.3)",
};
const mutedText: React.CSSProperties = { color: C.muted };

const css = `
@keyframes tte-spin { to { transform: rotate(360deg); } }
@keyframes tte-pulse { 0%,100% { opacity: .45 } 50% { opacity: .8 } }
.tte-skeleton {
  background: linear-gradient(180deg, rgba(var(--tte-overlay),0.06), rgba(var(--tte-overlay),0.02));
  border: 1px solid rgba(var(--tte-overlay),0.07);
  animation: tte-pulse 1.4s ease-in-out infinite;
}
.tte-btn { transition: background .18s ease, transform .18s ease, box-shadow .18s ease, border-color .18s ease; }
.tte-btn:hover { background: rgba(var(--tte-overlay),0.1); transform: translateY(-1px); border-color: rgba(75,146,221,0.5); }
.tte-btn:disabled { opacity: .6; cursor: default; transform: none; }
.tte-navlink { transition: color .18s ease, background .18s ease; }
.tte-navlink:hover { color: var(--tte-text); background: rgba(var(--tte-overlay),0.06); }
.tte-card { transition: transform .2s ease, border-color .2s ease, box-shadow .2s ease; }
.tte-card:hover { transform: translateY(-2px); border-color: rgba(75,146,221,0.35); box-shadow: 0 18px 40px -28px rgba(0,0,0,0.9); }
@media (prefers-reduced-motion: reduce) {
  .tte-btn, .tte-card, .tte-navlink { transition: none; }
  .tte-btn:hover, .tte-card:hover { transform: none; }
  .tte-skeleton { animation: none; }
}
`;

export const Route = createFileRoute("/mon-compte")({
  head: () => ({
    meta: [
      { title: "Mon compte — Townsend Transit Express" },
      { name: "robots", content: "noindex, nofollow" },
      {
        name: "description",
        content:
          "Votre compte client Townsend Transit Express : points fidélité et historique de vos achats d'abonnements.",
      },
    ],
  }),
  component: MonComptePage,
});
