-- Dossiers RH individuels (un par employé), remplis/mis à jour par la RH
-- après un rendez-vous avec l'employé. Chaque employé peut consulter
-- uniquement son propre dossier (lecture seule) ; la RH (+ Direction)
-- peut créer/modifier n'importe quel dossier.
--
-- Toute la lecture/écriture passe par des server functions authentifiées
-- (session Discord) utilisant supabaseAdmin (service_role) : pas d'accès
-- direct anon/authenticated nécessaire, même politique que loyalty_accounts.

CREATE TABLE IF NOT EXISTS public.hr_employee_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  employee_discord_id text NOT NULL UNIQUE,
  employee_username text,
  employee_display_name text,

  -- 1) État civil
  prenom text,
  nom text,
  genre text,
  date_naissance date,
  situation_familiale text,

  -- 2) Coordonnées
  telephones text,
  adresse text,

  -- 3) Historique dans l'entreprise
  date_entree date,
  postes_actuels text,

  -- 4) Congés et absences
  conges_pris text,
  conges_restants integer,
  absences text,
  arrets_maladie text,

  -- 5) Discipline et incidents
  avertissements text,
  sanctions text,

  -- 6) Notes internes
  appreciation_rh text,
  observation_rh text,
  objectifs text,
  reglement_interne_ack boolean NOT NULL DEFAULT false,

  -- 7) Signatures et tampon
  signature_rh_nom text,
  signature_rh_date date,
  tampon boolean NOT NULL DEFAULT false,

  created_by_discord_id text,
  created_by_username text,
  updated_by_discord_id text,
  updated_by_username text,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS hr_employee_files_discord_idx
  ON public.hr_employee_files (employee_discord_id);

ALTER TABLE public.hr_employee_files ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.hr_employee_files FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.hr_employee_files TO service_role;

DROP POLICY IF EXISTS "Service role manages hr employee files"
  ON public.hr_employee_files;
CREATE POLICY "Service role manages hr employee files"
  ON public.hr_employee_files FOR ALL TO service_role
  USING (true) WITH CHECK (true);
