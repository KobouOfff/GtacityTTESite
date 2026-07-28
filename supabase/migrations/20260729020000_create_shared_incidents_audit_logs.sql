CREATE TABLE IF NOT EXISTS public.incident_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_type text NOT NULL CHECK (
    incident_type IN (
      'incivilite', 'agression', 'accident', 'malaise', 'degradation',
      'intrusion', 'bagage', 'fraude', 'materiel', 'autre'
    )
  ),
  severity text NOT NULL CHECK (severity IN ('info', 'warn', 'alert')),
  location text NOT NULL,
  passenger_count integer NOT NULL DEFAULT 0
    CHECK (passenger_count >= 0 AND passenger_count <= 9999),
  description text NOT NULL,
  measures_taken text NOT NULL DEFAULT '—',
  emergency_services text NOT NULL DEFAULT 'Aucun',
  follow_up text NOT NULL DEFAULT 'Aucune',
  created_by_discord_id text NOT NULL,
  created_by_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS incident_records_created_at_idx
  ON public.incident_records (created_at DESC);

CREATE TABLE IF NOT EXISTS public.employee_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_discord_id text NOT NULL,
  agent_name text NOT NULL,
  action_text text NOT NULL,
  source text NOT NULL DEFAULT 'centre_regulation',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS employee_audit_logs_created_at_idx
  ON public.employee_audit_logs (created_at DESC);

CREATE INDEX IF NOT EXISTS employee_audit_logs_agent_idx
  ON public.employee_audit_logs (agent_discord_id, created_at DESC);

ALTER TABLE public.incident_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_audit_logs ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.incident_records FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.employee_audit_logs FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.incident_records TO service_role;
GRANT ALL ON public.employee_audit_logs TO service_role;

DROP POLICY IF EXISTS "Service role manages incident records"
  ON public.incident_records;
CREATE POLICY "Service role manages incident records"
ON public.incident_records
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Service role manages employee audit logs"
  ON public.employee_audit_logs;
CREATE POLICY "Service role manages employee audit logs"
ON public.employee_audit_logs
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
