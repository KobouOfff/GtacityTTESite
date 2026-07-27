CREATE TABLE IF NOT EXISTS public.traffic_publications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  line text,
  severity text NOT NULL CHECK (severity IN ('info', 'warn', 'alert')),
  title text NOT NULL,
  message text NOT NULL,
  valid_until timestamptz,
  channel_web boolean NOT NULL DEFAULT true,
  channel_screen boolean NOT NULL DEFAULT true,
  channel_app boolean NOT NULL DEFAULT false,
  channel_audio boolean NOT NULL DEFAULT false,
  author_discord_id text NOT NULL,
  author_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT traffic_publications_line_check
    CHECK (line IS NULL OR line IN ('R1', 'R2', 'R3', 'R4', 'IC1', 'IC2', 'T', 'BUS'))
);

CREATE INDEX IF NOT EXISTS traffic_publications_created_at_idx
  ON public.traffic_publications (created_at DESC);

CREATE INDEX IF NOT EXISTS traffic_publications_valid_until_idx
  ON public.traffic_publications (valid_until);

ALTER TABLE public.traffic_publications ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.traffic_publications FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.traffic_publications TO service_role;

DROP POLICY IF EXISTS "Service role manages traffic publications"
  ON public.traffic_publications;

CREATE POLICY "Service role manages traffic publications"
ON public.traffic_publications
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
