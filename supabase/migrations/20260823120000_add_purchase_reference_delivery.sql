-- Ajoute une référence d'achat courte et lisible sur chaque achat
-- d'abonnement, ainsi que le suivi de la délivrance du billet par un
-- agent TTE (qui, quand). Le client présente sa référence (page
-- "Mon compte") à un agent, qui la recherche ici pour attribuer le billet.

ALTER TABLE public.subscription_purchases
  ADD COLUMN IF NOT EXISTS reference text,
  ADD COLUMN IF NOT EXISTS delivered_by_discord_id text,
  ADD COLUMN IF NOT EXISTS delivered_by_username text,
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz;

-- Backfill défensif pour d'éventuelles lignes déjà existantes sans référence.
UPDATE public.subscription_purchases
SET reference = 'BIL-' || to_char(created_at, 'YYYY') || '-' || lpad((floor(random() * 900000) + 100000)::int::text, 6, '0')
WHERE reference IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS subscription_purchases_reference_idx
  ON public.subscription_purchases (reference);
