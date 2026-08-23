-- Récompenses fidélité échangeables contre des points (voir catalogue
-- côté code dans src/lib/rewards.server.ts : palier "reduction8",
-- "pass24h_offert", "pass7j_offert").
--
-- Le client réclame une récompense depuis "Mon compte" quand il a assez de
-- points : les points sont débités immédiatement (comme un échange de
-- miles) et un code de retrait est généré. Le client présente ce code à un
-- agent TTE (guichet ou Discord), qui le valide pour marquer la récompense
-- comme remise — même principe que subscription_purchases / reference.
--
-- Toute la lecture/écriture passe par des server functions authentifiées
-- utilisant supabaseAdmin (service_role), pas d'accès direct anon/authenticated.

CREATE TABLE IF NOT EXISTS public.loyalty_reward_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discord_id text NOT NULL REFERENCES public.loyalty_accounts(discord_id) ON DELETE CASCADE,
  tier_id text NOT NULL CHECK (tier_id IN ('reduction8', 'pass24h_offert', 'pass7j_offert')),
  tier_label text NOT NULL,
  points_cost integer NOT NULL CHECK (points_cost > 0),
  code text NOT NULL,
  status text NOT NULL DEFAULT 'a_recuperer'
    CHECK (status IN ('a_recuperer', 'recupere', 'annule')),
  redeemed_by_discord_id text,
  redeemed_by_username text,
  redeemed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS loyalty_reward_claims_code_idx
  ON public.loyalty_reward_claims (code);

CREATE INDEX IF NOT EXISTS loyalty_reward_claims_discord_idx
  ON public.loyalty_reward_claims (discord_id, created_at DESC);

ALTER TABLE public.loyalty_reward_claims ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.loyalty_reward_claims FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.loyalty_reward_claims TO service_role;

DROP POLICY IF EXISTS "Service role manages loyalty reward claims"
  ON public.loyalty_reward_claims;
CREATE POLICY "Service role manages loyalty reward claims"
  ON public.loyalty_reward_claims FOR ALL TO service_role
  USING (true) WITH CHECK (true);
