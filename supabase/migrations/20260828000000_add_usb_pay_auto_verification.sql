-- Vérification automatique des paiements USB Pay.
--
-- Le client saisit la référence de virement affichée par USB Pay
-- (ex. TRF-20260823-005) après son paiement. Le serveur interroge alors
-- l'API entreprise USB Pay (clé API côté serveur uniquement, jamais
-- exposée au client) pour confirmer qu'un encaissement correspondant a
-- bien été reçu sur le compte TTE, avant de marquer l'achat comme
-- "vérifié". Cela ne remplace pas la délivrance manuelle du billet par un
-- agent (canManageSubscriptions) : ça lui évite seulement d'avoir à
-- rechercher le reçu à la main, en lui montrant que la vérification
-- automatique a déjà confirmé le paiement.

ALTER TABLE public.subscription_purchases
  ADD COLUMN IF NOT EXISTS usb_pay_reference text,
  ADD COLUMN IF NOT EXISTS usb_pay_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS usb_pay_verify_note text;

-- Une même référence de virement USB Pay ne peut servir à vérifier
-- qu'un seul achat (empêche un client de réutiliser la référence d'un
-- paiement déjà vérifié pour "valider" un deuxième achat).
CREATE UNIQUE INDEX IF NOT EXISTS subscription_purchases_usb_pay_reference_idx
  ON public.subscription_purchases (usb_pay_reference)
  WHERE usb_pay_reference IS NOT NULL;
