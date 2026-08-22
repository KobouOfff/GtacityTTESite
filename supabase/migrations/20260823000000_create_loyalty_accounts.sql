-- Comptes fidélité clients (liés à l'identité Discord, réutilisée comme
-- "compte client" public du site) + historique des achats d'abonnements
-- payés en ligne via USB Pay.
--
-- Toute la lecture/écriture passe par des server functions authentifiées
-- (session Discord) utilisant supabaseAdmin (service_role) : pas d'accès
-- direct anon/authenticated nécessaire, même politique que
-- departure_overrides.

CREATE TABLE IF NOT EXISTS public.loyalty_accounts (
  discord_id text PRIMARY KEY,
  username text NOT NULL,
  display_name text,
  avatar text,
  points integer NOT NULL DEFAULT 0 CHECK (points >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.subscription_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discord_id text NOT NULL REFERENCES public.loyalty_accounts(discord_id) ON DELETE CASCADE,
  plan_id text NOT NULL CHECK (plan_id IN ('24h', '7j', '30j')),
  plan_name text NOT NULL,
  price numeric(10, 2) NOT NULL CHECK (price > 0),
  points_earned integer NOT NULL DEFAULT 0 CHECK (points_earned >= 0),
  status text NOT NULL DEFAULT 'paiement_initie'
    CHECK (status IN ('paiement_initie', 'delivre', 'annule')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS subscription_purchases_discord_idx
  ON public.subscription_purchases (discord_id, created_at DESC);

ALTER TABLE public.loyalty_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_purchases ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.loyalty_accounts FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.subscription_purchases FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.loyalty_accounts TO service_role;
GRANT ALL ON public.subscription_purchases TO service_role;

DROP POLICY IF EXISTS "Service role manages loyalty accounts"
  ON public.loyalty_accounts;
CREATE POLICY "Service role manages loyalty accounts"
  ON public.loyalty_accounts FOR ALL TO service_role
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role manages subscription purchases"
  ON public.subscription_purchases;
CREATE POLICY "Service role manages subscription purchases"
  ON public.subscription_purchases FOR ALL TO service_role
  USING (true) WITH CHECK (true);
