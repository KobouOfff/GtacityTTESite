import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { searchPurchaseByReference, deliverPurchaseByReferenceFn } from "@/lib/loyalty.functions";
import type { LoyaltyAccountRow, SubscriptionPurchaseRow } from "@/lib/loyalty.server";
import "./BilletsPanel.css";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  paiement_initie: { label: "En attente d'attribution", color: "#f59e0b" },
  delivre: { label: "Déjà attribué", color: "#22c55e" },
  annule: { label: "Annulé", color: "#64748b" },
};

const SEARCH_ERRORS: Record<string, string> = {
  not_logged_in: "Session Discord expirée, reconnecte-toi.",
  forbidden: "Tu n'as pas les droits pour attribuer un billet.",
  invalid_reference: "Format de référence invalide. Attendu : BIL-AAAA-000000.",
  not_found: "Aucun achat ne correspond à cette référence.",
  read_failed: "Erreur serveur pendant la recherche, réessaie.",
};

// Le client bénéficie d'une tolérance de 24h après son achat pour circuler
// sur le réseau en attendant l'attribution ; passé ce délai il n'est plus
// censé circuler sans billet attribué.
const NETWORK_TOLERANCE_MS = 24 * 60 * 60 * 1000;

const DELIVER_ERRORS: Record<string, string> = {
  not_logged_in: "Session Discord expirée, reconnecte-toi.",
  forbidden: "Tu n'as pas les droits pour attribuer un billet.",
  invalid_reference: "Format de référence invalide.",
  not_found: "Cet achat n'existe plus.",
  already_delivered: "Ce billet a déjà été attribué.",
  cancelled: "Cet achat a été annulé, impossible de l'attribuer.",
  update_failed: "Erreur serveur, réessaie.",
};

export default function BilletsPanel({ onClose }: { onClose: () => void }) {
  const [reference, setReference] = useState("");
  const [result, setResult] = useState<{ purchase: SubscriptionPurchaseRow; account: LoyaltyAccountRow | null } | null>(null);
  const [delivered, setDelivered] = useState(false);

  const searchMutation = useMutation({
    mutationFn: () => searchPurchaseByReference({ data: { reference: reference.trim() } }),
    onSuccess: (res) => {
      setDelivered(false);
      if (res.ok) setResult({ purchase: res.purchase, account: res.account });
      else setResult(null);
    },
  });

  const deliverMutation = useMutation({
    mutationFn: () => deliverPurchaseByReferenceFn({ data: { reference: reference.trim() } }),
    onSuccess: (res) => {
      if (res.ok) {
        setResult({ purchase: res.purchase, account: res.account });
        setDelivered(true);
      }
    },
  });

  const searchRes = searchMutation.data;
  const deliverRes = deliverMutation.data;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reference.trim()) return;
    setDelivered(false);
    searchMutation.mutate();
  }

  const purchase = result?.purchase;
  const account = result?.account;
  const status = purchase ? (STATUS_LABELS[purchase.status] ?? { label: purchase.status, color: "#64748b" }) : null;
  const canDeliver = purchase && purchase.status === "paiement_initie" && !delivered;
  const toleranceExpired =
    purchase &&
    purchase.status === "paiement_initie" &&
    Date.now() - new Date(purchase.created_at).getTime() > NETWORK_TOLERANCE_MS;

  return (
    <div
      className="bp-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Attribution d'un billet"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bp-panel">
        <div className="bp-head">
          <div>
            <h2>Attribuer un billet</h2>
            <p>Recherche la référence donnée par le client pour valider et attribuer son abonnement.</p>
          </div>
          <button type="button" className="bp-close" onClick={onClose} aria-label="Fermer">×</button>
        </div>

        <div className="bp-body">
          <form className="bp-search-row" onSubmit={onSubmit}>
            <input
              className="bp-input"
              placeholder="BIL-2026-123456"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              maxLength={20}
              autoFocus
            />
            <button type="submit" className="bp-btn" disabled={searchMutation.isPending || !reference.trim()}>
              {searchMutation.isPending ? "Recherche…" : "Rechercher"}
            </button>
          </form>

          {searchRes && !searchRes.ok && (
            <div className="bp-msg bp-msg-err">{SEARCH_ERRORS[searchRes.reason] ?? "Recherche impossible."}</div>
          )}

          {deliverRes && !deliverRes.ok && (
            <div className="bp-msg bp-msg-err">{DELIVER_ERRORS[deliverRes.reason] ?? "Attribution impossible."}</div>
          )}

          {delivered && deliverRes?.ok && (
            <div className="bp-msg bp-msg-ok">✓ Billet attribué avec succès.</div>
          )}

          {purchase && status && (
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

              <div className="bp-row"><span>Formule</span><b>{purchase.plan_name}</b></div>
              <div className="bp-row"><span>Montant</span><b>{purchase.price} $</b></div>
              <div className="bp-row"><span>Référence</span><b style={{ fontFamily: "ui-monospace, monospace" }}>{purchase.reference}</b></div>
              <div className="bp-row"><span>Achat effectué le</span><b>{new Date(purchase.created_at).toLocaleString("fr-FR")}</b></div>
              <div className="bp-row">
                <span>Statut</span>
                <span className="bp-pill" style={{ background: status.color + "22", color: status.color, borderColor: status.color + "55" }}>
                  {status.label}
                </span>
              </div>

              {purchase.status === "delivre" && purchase.delivered_at && (
                <div className="bp-msg bp-msg-warn">
                  Déjà attribué le {new Date(purchase.delivered_at).toLocaleString("fr-FR")}
                  {purchase.delivered_by_username ? ` par ${purchase.delivered_by_username}` : ""}.
                </div>
              )}

              {purchase.status === "annule" && (
                <div className="bp-msg bp-msg-warn">Cet achat a été annulé.</div>
              )}

              {toleranceExpired && (
                <div className="bp-msg bp-msg-err">
                  ⚠ Achat de plus de 24h : la tolérance réseau est dépassée. Ce client ne doit plus circuler sur le réseau tant
                  que le billet n'est pas attribué.
                </div>
              )}

              {canDeliver && (
                <button
                  type="button"
                  className="bp-btn bp-btn-success"
                  onClick={() => deliverMutation.mutate()}
                  disabled={deliverMutation.isPending}
                >
                  {deliverMutation.isPending ? "Attribution…" : "✓ Attribuer le billet"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
