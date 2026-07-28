CREATE TABLE IF NOT EXISTS public.lost_found_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  found_location text NOT NULL,
  found_by text NOT NULL DEFAULT 'Agent TTE',
  locker_reference text NOT NULL DEFAULT '—',
  description text NOT NULL,
  status text NOT NULL DEFAULT 'En attente'
    CHECK (status IN ('En attente', 'Restitué', 'Transféré')),
  created_by_discord_id text NOT NULL,
  created_by_name text NOT NULL,
  updated_by_discord_id text,
  updated_by_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS lost_found_items_created_at_idx
  ON public.lost_found_items (created_at DESC);

CREATE INDEX IF NOT EXISTS lost_found_items_status_idx
  ON public.lost_found_items (status);

ALTER TABLE public.lost_found_items ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.lost_found_items FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.lost_found_items TO service_role;

DROP POLICY IF EXISTS "Service role manages lost found items"
  ON public.lost_found_items;

CREATE POLICY "Service role manages lost found items"
ON public.lost_found_items
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
