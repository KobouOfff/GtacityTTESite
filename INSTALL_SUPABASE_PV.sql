-- À exécuter une seule fois dans Supabase > SQL Editor.
-- Cette copie correspond à la migration 20260727190000_create_shared_pv_records.sql.

CREATE SEQUENCE IF NOT EXISTS public.pv_number_seq START WITH 1;

CREATE TABLE IF NOT EXISTS public.pv_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  num text NOT NULL UNIQUE,
  offender_name text NOT NULL,
  identity_document text NOT NULL DEFAULT '—',
  date_of_birth date,
  reason text NOT NULL,
  line text NOT NULL,
  amount integer NOT NULL CHECK (amount IN (500, 750, 1000, 1500)),
  payment_status text NOT NULL,
  observations text NOT NULL DEFAULT '',
  agent_discord_id text NOT NULL,
  agent_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pv_records_created_at_idx
  ON public.pv_records (created_at DESC);

CREATE INDEX IF NOT EXISTS pv_records_offender_name_idx
  ON public.pv_records (offender_name);

CREATE OR REPLACE FUNCTION public.pv_records_assign_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.num IS NULL OR NEW.num = '' THEN
    NEW.num :=
      'PV-' ||
      to_char(COALESCE(NEW.created_at, now()), 'YYYY') ||
      '-' ||
      lpad(nextval('public.pv_number_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS pv_records_assign_number_trigger ON public.pv_records;
CREATE TRIGGER pv_records_assign_number_trigger
BEFORE INSERT ON public.pv_records
FOR EACH ROW EXECUTE FUNCTION public.pv_records_assign_number();

ALTER TABLE public.pv_records ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.pv_records FROM PUBLIC, anon, authenticated;
REVOKE ALL ON SEQUENCE public.pv_number_seq FROM PUBLIC, anon, authenticated;

GRANT ALL ON public.pv_records TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.pv_number_seq TO service_role;

DROP POLICY IF EXISTS "Service role manages PV records" ON public.pv_records;
CREATE POLICY "Service role manages PV records"
ON public.pv_records
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

