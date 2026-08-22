import { T } from "@/components/T";
import type { SubscriptionPlan } from "@/lib/subscription-plans";

export function LoginRequiredModal({
  plan,
  onClose,
}: {
  plan: SubscriptionPlan;
  onClose: () => void;
}) {
  return (
    <div
      className="usbpay-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Connexion requise"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="usbpay-modal usbpay-modal-sm">
        <button
          type="button"
          className="usbpay-close"
          onClick={onClose}
          aria-label="Fermer"
        >
          ×
        </button>

        <div className="usbpay-login-icon">🔒</div>

        <div className="usbpay-modal-head" style={{ paddingRight: 0, textAlign: "center" }}>
          <h3><T fr="Compte client requis" en="Client account required" /></h3>
        </div>

        <p className="usbpay-login-copy">
          <T
            fr={<>Pour acheter le <b>{plan.nameFr}</b> ({plan.price}$) en ligne, connectez-vous d'abord avec votre compte client (Discord). Cela crée aussi votre compte fidélité, qui cumule des points à chaque abonnement acheté.</>}
            en={<>To buy the <b>{plan.nameEn}</b> (${plan.price}) online, sign in first with your client account (Discord). This also creates your loyalty account, which earns points on every pass you buy.</>}
          />
        </p>

        <a
          href={`/api/public/discord/login?redirect=${encodeURIComponent("/#tarifs")}`}
          className="btn-primary usbpay-login-btn"
        >
          <svg width="18" height="14" viewBox="0 0 71 55" fill="currentColor" aria-hidden="true">
            <path d="M60.1 4.9A58.5 58.5 0 0 0 45.4.5a41 41 0 0 0-1.9 3.9 54 54 0 0 0-16 0A41 41 0 0 0 25.5.5 58.4 58.4 0 0 0 10.8 4.9C1.6 18.8-.9 32.4.4 45.7a58.9 58.9 0 0 0 17.9 9.1 43 43 0 0 0 3.8-6.2 38 38 0 0 1-6-2.9c.5-.4 1-.7 1.5-1.1a42 42 0 0 0 36 0c.5.4 1 .7 1.5 1.1a38 38 0 0 1-6 2.9 43 43 0 0 0 3.8 6.2 58.7 58.7 0 0 0 17.9-9.1c1.5-15.4-2.5-28.9-10.7-40.8ZM23.7 37.8c-3.5 0-6.4-3.3-6.4-7.3s2.8-7.3 6.4-7.3c3.6 0 6.5 3.3 6.4 7.3 0 4-2.8 7.3-6.4 7.3Zm23.6 0c-3.5 0-6.4-3.3-6.4-7.3s2.8-7.3 6.4-7.3c3.6 0 6.5 3.3 6.4 7.3 0 4-2.8 7.3-6.4 7.3Z" />
          </svg>
          <T fr="Se connecter avec Discord" en="Sign in with Discord" />
        </a>
      </div>
    </div>
  );
}
