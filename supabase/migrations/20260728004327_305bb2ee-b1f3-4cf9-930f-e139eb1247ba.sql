CREATE TABLE IF NOT EXISTS public.blacklist_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ref text NOT NULL UNIQUE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  alias text,
  date_of_birth date,
  discord_id text,
  discord_username text,
  steam_id text,
  physical_description text,
  reason text NOT NULL,
  infractions jsonb NOT NULL DEFAULT '[]'::jsonb,
  scope text NOT NULL DEFAULT 'all'
    CHECK (scope IN ('all', 'stations', 'trains', 'offices', 'events')),
  start_date date NOT NULL DEFAULT current_date,
  end_date date,
  is_permanent boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'revoked')),
  created_by_discord_id text NOT NULL,
  created_by_username text NOT NULL,
  revoked_by_discord_id text,
  revoked_by_username text,
  revoked_at timestamptz,
  revoke_reason text,
  internal_notes jsonb NOT NULL DEFAULT '[]'::jsonb,
  pdf_document_number text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT blacklist_end_date_check
    CHECK (is_permanent OR end_date IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS blacklist_entries_status_idx
  ON public.blacklist_entries (status, created_at DESC);

CREATE INDEX IF NOT EXISTS blacklist_entries_discord_idx
  ON public.blacklist_entries (discord_id);

ALTER TABLE public.blacklist_entries ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.blacklist_entries FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.blacklist_entries TO service_role;

DROP POLICY IF EXISTS "Internal presence can read blacklist"
  ON public.blacklist_entries;
DROP POLICY IF EXISTS "Internal presence can insert blacklist"
  ON public.blacklist_entries;
DROP POLICY IF EXISTS "Internal presence can update blacklist"
  ON public.blacklist_entries;
DROP POLICY IF EXISTS "Service role manages blacklist"
  ON public.blacklist_entries;

CREATE POLICY "Service role manages blacklist"
ON public.blacklist_entries
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
