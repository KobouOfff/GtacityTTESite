
CREATE TABLE public.contact_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ref text NOT NULL UNIQUE,
  requester_discord_id text NOT NULL,
  requester_username text NOT NULL,
  requester_display_name text,
  requester_avatar text,
  category text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  extra jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'nouveau',
  assigned_branch text,
  assigned_by_discord_id text,
  assigned_by_username text,
  assigned_at timestamptz,
  notes jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX contact_requests_requester_idx ON public.contact_requests (requester_discord_id, created_at DESC);
CREATE INDEX contact_requests_status_idx ON public.contact_requests (status, created_at DESC);
CREATE INDEX contact_requests_branch_idx ON public.contact_requests (assigned_branch, created_at DESC);

GRANT SELECT, INSERT, UPDATE ON public.contact_requests TO anon, authenticated;
GRANT ALL ON public.contact_requests TO service_role;

ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Internal presence can read contact requests"
  ON public.contact_requests FOR SELECT TO anon, authenticated
  USING (((current_setting('request.headers'::text, true))::jsonb ->> 'x-tte-presence-proof'::text) = '2a9f6e4f1f1e57079025c3797e7cb8ee33e86e2b629ccfa24fc50c834d639c3f'::text);

CREATE POLICY "Internal presence can insert contact requests"
  ON public.contact_requests FOR INSERT TO anon, authenticated
  WITH CHECK (((current_setting('request.headers'::text, true))::jsonb ->> 'x-tte-presence-proof'::text) = '2a9f6e4f1f1e57079025c3797e7cb8ee33e86e2b629ccfa24fc50c834d639c3f'::text);

CREATE POLICY "Internal presence can update contact requests"
  ON public.contact_requests FOR UPDATE TO anon, authenticated
  USING (((current_setting('request.headers'::text, true))::jsonb ->> 'x-tte-presence-proof'::text) = '2a9f6e4f1f1e57079025c3797e7cb8ee33e86e2b629ccfa24fc50c834d639c3f'::text)
  WITH CHECK (((current_setting('request.headers'::text, true))::jsonb ->> 'x-tte-presence-proof'::text) = '2a9f6e4f1f1e57079025c3797e7cb8ee33e86e2b629ccfa24fc50c834d639c3f'::text);

CREATE POLICY "Service role manages contact requests"
  ON public.contact_requests FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.contact_requests_touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER contact_requests_touch_updated_at
BEFORE UPDATE ON public.contact_requests
FOR EACH ROW EXECUTE FUNCTION public.contact_requests_touch_updated_at();
