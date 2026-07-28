CREATE TABLE IF NOT EXISTS public.departure_overrides (
  departure_key text PRIMARY KEY
    CHECK (departure_key IN ('d-r1', 'd-ic2', 'd-t1', 'd-r2', 'd-bus', 'd-ic1', 'd-r4', 'd-t2')),
  status text NOT NULL
    CHECK (status IN (
      'À l''heure',
      'Embarquement',
      'Retard ~5 min',
      'Retard ~10 min',
      'Retard ~20 min',
      'Quai modifié',
      'Supprimé'
    )),
  updated_by_discord_id text NOT NULL,
  updated_by_name text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS departure_overrides_updated_idx
  ON public.departure_overrides (updated_at DESC);

ALTER TABLE public.departure_overrides ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.departure_overrides FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.departure_overrides TO service_role;

DROP POLICY IF EXISTS "Service role manages departure overrides"
  ON public.departure_overrides;

CREATE POLICY "Service role manages departure overrides"
ON public.departure_overrides
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
