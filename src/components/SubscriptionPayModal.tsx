import { T } from "@/components/T";
import type { SubscriptionPlan } from "@/lib/subscription-plans";
import type { LoyaltyAccountRow, SubscriptionPurchaseRow } from "@/lib/loyalty.server";

export function SubscriptionPayModal({
  plan,
  onClose,
  purchaseState,
  loyaltyResult,
}: {
  plan: SubscriptionPlan;
  onClose: () => void;
  purchaseState: "pending" | "success" | "error";
  loyaltyResult?: { account: LoyaltyAccountRow; purchase: SubscriptionPurchaseRow } | null;
}) {
  return (
    <div
      className="usbpay-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Paiement en ligne"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="usbpay-modal">
        <button
          type="button"
          className="usbpay-close"
          onClick={onClose}
          aria-label="Fermer"
        >
          ×
        </button>

        <div className="usbpay-modal-head">
          <span className="eyebrow"><T fr="Paiement en ligne" en="Online payment" /></span>
          <h3>
            <T fr={plan.nameFr} en={plan.nameEn} />
            <span className="usbpay-modal-price"> — ${plan.price}</span>
          </h3>
        </div>

        {purchaseState === "error" ? (
          <div className="usbpay-loyalty-status err">
            <T
              fr="Impossible d'enregistrer votre commande pour le moment. Réessayez dans un instant."
              en="Couldn't register your order right now. Please try again shortly."
            />
          </div>
        ) : (
          <div className="usbpay-loyalty-status ok">
            {purchaseState === "pending" ? (
              <T fr="Enregistrement de votre commande…" en="Registering your order…" />
            ) : (
              <T
                fr={<>+{loyaltyResult?.purchase.points_earned ?? 0} points fidélité ajoutés à votre compte — solde : <b>{loyaltyResult?.account.points ?? 0} points</b>.</>}
                en={<>+{loyaltyResult?.purchase.points_earned ?? 0} loyalty points added to your account — balance: <b>{loyaltyResult?.account.points ?? 0} points</b>.</>}
              />
            )}
          </div>
        )}

        {purchaseState === "success" && loyaltyResult?.purchase.reference && (
          <div className="usbpay-reference">
            <span className="eyebrow">
              <T fr="Référence de votre achat" en="Your purchase reference" />
            </span>
            <div className="usbpay-reference-code">{loyaltyResult.purchase.reference}</div>
            <p>
              <T
                fr={<>Présentez cette référence avec votre reçu de paiement à un agent TTE (guichet ou Discord) pour faire activer votre abonnement. Retrouvez-la à tout moment sur <a href="/mon-compte">votre compte</a>.</>}
                en={<>Show this reference with your payment receipt to a TTE staff member (station desk or Discord) to activate your pass. You can find it anytime on <a href="/mon-compte">your account page</a>.</>}
              />
            </p>
          </div>
        )}

        <div className="notice usbpay-notice">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>
          <p>
            <T
              fr={<><b>Le paiement en ligne ne délivre pas l'abonnement automatiquement.</b> Une fois le paiement effectué, contactez un agent TTE sur Discord ou présentez-vous à un guichet en gare avec votre reçu de paiement pour faire activer votre abonnement.</>}
              en={<><b>Online payment does not deliver the pass automatically.</b> Once paid, contact a TTE staff member on Discord or come to a station ticket desk with your payment receipt so your pass can be activated.</>}
            />
          </p>
        </div>

        {plan.usbPayUrl ? (
          <iframe
            src={plan.usbPayUrl}
            title={`USB Pay — ${plan.nameFr}`}
            className="usbpay-iframe"
            allow="payment"
          />
        ) : (
          <div className="usbpay-missing">
            <T
              fr="Le lien de paiement pour cette formule n'est pas encore configuré. Revenez bientôt ou contactez-nous."
              en="The payment link for this plan isn't configured yet. Check back soon or contact us."
            />
          </div>
        )}
      </div>
    </div>
  );
}
