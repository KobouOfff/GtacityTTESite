import { T } from "@/components/T";
import type { SubscriptionPlan } from "@/lib/subscription-plans";
import type { LoyaltyAccountRow, SubscriptionPurchaseRow } from "@/lib/loyalty.server";

export function SubscriptionPayModal({
  plan,
  onClose,
  purchaseState,
  loyaltyResult,
  onConfirmPaid,
}: {
  plan: SubscriptionPlan;
  onClose: () => void;
  purchaseState: "idle" | "pending" | "success" | "error";
  loyaltyResult?: { account: LoyaltyAccountRow; purchase: SubscriptionPurchaseRow } | null;
  onConfirmPaid: () => void;
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

        {purchaseState === "error" && (
          <div className="usbpay-loyalty-status err">
            <T
              fr="Impossible d'enregistrer votre demande pour le moment. Réessayez dans un instant."
              en="Couldn't register your request right now. Please try again shortly."
            />
          </div>
        )}

        {purchaseState === "pending" && (
          <div className="usbpay-loyalty-status ok">
            <T fr="Enregistrement de votre demande…" en="Registering your request…" />
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
                fr={<>Présentez cette référence avec votre reçu de paiement à un agent TTE (guichet ou Discord) pour faire activer votre abonnement. Vos points fidélité seront crédités à ce moment-là. Retrouvez votre référence à tout moment sur <a href="/mon-compte">votre compte</a>.</>}
                en={<>Show this reference with your payment receipt to a TTE staff member (station desk or Discord) to activate your pass. Your loyalty points will be credited at that point. You can find your reference anytime on <a href="/mon-compte">your account page</a>.</>}
              />
            </p>
          </div>
        )}

        <div className="notice usbpay-notice">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>
          <p>
            <T
              fr={<><b>Le paiement en ligne ne délivre pas l'abonnement automatiquement.</b> Une fois le paiement effectué ci-dessous, cliquez sur « J'ai terminé mon paiement » pour obtenir votre référence, puis contactez un agent TTE sur Discord ou présentez-vous à un guichet en gare avec votre reçu pour faire activer votre abonnement. <b>Aucun point fidélité n'est crédité avant cette vérification.</b></>}
              en={<><b>Online payment does not deliver the pass automatically.</b> Once you've paid below, click "I've completed my payment" to get your reference, then contact a TTE staff member on Discord or come to a station ticket desk with your receipt so your pass can be activated. <b>No loyalty points are credited before that check.</b></>}
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

        {purchaseState === "idle" || purchaseState === "error" ? (
          <button type="button" className="usbpay-confirm-btn" onClick={onConfirmPaid}>
            <T fr="✓ J'ai terminé mon paiement" en="✓ I've completed my payment" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
