import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { searchRewardClaimByCode, redeemRewardClaimFn } from "@/lib/rewards.functions";
import type { RewardClaimRow } from "@/lib/rewards.server";
import type { LoyaltyAccountRow } from "@/lib/loyalty.server";
import "./BilletsPanel.css";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  a_recuperer: { label: "En attente de retrait", color: "#f59e0b" },
  recupere: { label: "Déjà remise", color: "#22c55e" },
  annule: { label: "Annulée", color: "#64748b" },
};

const SEARCH_ERRORS: Record<string, string> = {
  not_logged_in: "Session Discord expirée, reconnecte-toi.",
  forbidden: "Tu n'as pas les droits pour remettre une récompense.",
  invalid_code: "Format de code invalide. Attendu : REC-AAAA-000000.",
  not_found: "Aucune récompense ne correspond à ce code.",
  read_failed: "Erreur serveur pendant la recherche, réessaie.",
};

const REDEEM_ERRORS: Record<string, string> = {
  not_logged_in: "Session Discord expirée, reconnecte-toi.",
  forbidden: "Tu n'as pas les droits pour remettre une récompense.",
  invalid_code: "Format de code invalide.",
  not_found: "Cette récompense n'existe plus.",
  already_redeemed: "Cette récompense a déjà été remise.",
  cancelled: "Cette récompense a été annulée.",
  update_failed: "Erreur serveur, réessaie.",
};

export default function RecompensesPanel({ onClose }: { onClose: () => void }) {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<{ claim: RewardClaimRow; account: LoyaltyAccountRow | null } | null>(null);
  const [redeemed, setRedeemed] = useState(false);

  const searchMutation = useMutation({
    mutationFn: () => searchRewardClaimByCode({ data: { code: code.trim() } }),
    onSuccess: (res) => {
      setRedeemed(false);
      if (res.ok) setResult({ claim: res.claim, account: res.account });
      else setResult(null);
    },
  });

  const redeemMutation = useMutation({
    mutationFn: () => redeemRewardClaimFn({ data: { code: code.trim() } }),
    onSuccess: (res) => {
      if (res.ok) {
        setResult((prev) => (prev ? { claim: res.claim, account: prev.account } : { claim: res.claim, account: res.account }));
        setRedeemed(true);
      }
    },
  });

  const searchRes = searchMutation.data;
  const redeemRes = redeemMutation.data;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setRedeemed(false);
    searchMutation.mutate();
  }

  const claim = result?.claim;
  const account = result?.account;
  const status = claim ? (STATUS_LABELS[claim.status] ?? { label: claim.status, color: "#64748b" }) : null;
  const canRedeem = claim && claim.status === "a_recuperer" && !redeemed;

  return (
    <div
      className="bp-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Remise d'une récompense fidélité"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bp-panel">
        <div className="bp-head">
          <div>
            <h2>Remettre une récompense</h2>
            <p>Recherche le code donné par le client pour valider et remettre sa récompense fidélité.</p>
          </div>
          <button type="button" className="bp-close" onClick={onClose} aria-label="Fermer">×</button>
        </div>

        <div className="bp-body">
          <form className="bp-search-row" onSubmit={onSubmit}>
            <input
              className="bp-input"
              placeholder="REC-2026-123456"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={20}
              autoFocus
            />
            <button type="submit" className="bp-btn" disabled={searchMutation.isPending || !code.trim()}>
              {searchMutation.isPending ? "Recherche…" : "Rechercher"}
            </button>
          </form>

          {searchRes && !searchRes.ok && (
            <div className="bp-msg bp-msg-err">{SEARCH_ERRORS[searchRes.reason] ?? "Recherche impossible."}</div>
          )}

          {redeemRes && !redeemRes.ok && (
            <div className="bp-msg bp-msg-err">{REDEEM_ERRORS[redeemRes.reason] ?? "Remise impossible."}</div>
          )}

          {redeemed && redeemRes?.ok && (
            <div className="bp-msg bp-msg-ok">✓ Récompense remise avec succès.</div>
          )}

          {claim && status && (
            <div className="bp-card">
              <div className="bp-client">
                {account?.avatar ? (
                  <img className="bp-avatar" src={account.avatar} alt="" />
                ) : (
                  <span className="bp-avatar-fallback">
                    {(account?.display_name || account?.username || "?")[0]?.toUpperCase()}
                  </span>
                )}
                <div>
                  <div style={{ fontWeight: 700 }}>{account?.display_name || account?.username || "Client inconnu"}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>Solde fidélité : {account?.points ?? 0} points</div>
                </div>
              </div>

              <div className="bp-row"><span>Récompense</span><b>{claim.tier_label}</b></div>
              <div className="bp-row"><span>Coût</span><b>{claim.points_cost} points</b></div>
              <div className="bp-row"><span>Code</span><b style={{ fontFamily: "ui-monospace, monospace" }}>{claim.code}</b></div>
              <div className="bp-row"><span>Réclamée le</span><b>{new Date(claim.created_at).toLocaleString("fr-FR")}</b></div>
              <div className="bp-row">
                <span>Statut</span>
                <span className="bp-pill" style={{ background: status.color + "22", color: status.color, borderColor: status.color + "55" }}>
                  {status.label}
                </span>
              </div>

              {claim.status === "recupere" && claim.redeemed_at && (
                <div className="bp-msg bp-msg-warn">
                  Déjà remise le {new Date(claim.redeemed_at).toLocaleString("fr-FR")}
                  {claim.redeemed_by_username ? ` par ${claim.redeemed_by_username}` : ""}.
                </div>
              )}

              {claim.status === "annule" && (
                <div className="bp-msg bp-msg-warn">Cette récompense a été annulée.</div>
              )}

              {canRedeem && (
                <button
                  type="button"
                  className="bp-btn bp-btn-success"
                  onClick={() => redeemMutation.mutate()}
                  disabled={redeemMutation.isPending}
                >
                  {redeemMutation.isPending ? "Remise…" : "✓ Remettre la récompense"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
