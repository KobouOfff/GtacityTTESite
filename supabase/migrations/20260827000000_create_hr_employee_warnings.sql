-- Registre des avertissements / blâmes / sanctions d'un employé.
--
-- Contrairement au champ texte libre "avertissements" de hr_employee_files
-- (une seule note globale, en clair), chaque ligne ici est un événement
-- daté et horodaté, conservé indéfiniment, avec pièce jointe optionnelle
-- (photo ou PDF) stockée dans un bucket privé.
--
-- Toute la lecture/écriture passe par des server functions authentifiées
-- (session Discord) utilisant supabaseAdmin (service_role) : pas d'accès
-- direct anon/authenticated nécessaire, même politique que hr_employee_files.

CREATE TABLE IF NOT EXISTS public.hr_employee_warnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  employee_discord_id text NOT NULL,
  employee_username text,
  employee_display_name text,

  type text NOT NULL CHECK (type IN ('avertissement', 'blame', 'sanction', 'note')),
  title text NOT NULL,
  description text,

  attachment_path text,
  attachment_filename text,
  attachment_mime text,

  created_by_discord_id text NOT NULL,
  created_by_username text,

  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS hr_employee_warnings_discord_idx
  ON public.hr_employee_warnings (employee_discord_id, created_at DESC);

ALTER TABLE public.hr_employee_warnings ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.hr_employee_warnings FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.hr_employee_warnings TO service_role;

DROP POLICY IF EXISTS "Service role manages hr employee warnings"
  ON public.hr_employee_warnings;
CREATE POLICY "Service role manages hr employee warnings"
  ON public.hr_employee_warnings FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Bucket privé pour les pièces jointes des avertissements/blâmes/sanctions.
-- On ne conserve que le chemin de l'objet en base ; le serveur génère des
-- URLs signées à durée limitée à chaque lecture (jamais d'URL publique).
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'hr-warning-attachments',
  'hr-warning-attachments',
  false,
  15728640, -- 15 Mo
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE
  SET public = false,
      file_size_limit = 15728640,
      allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

DROP POLICY IF EXISTS "Service role manages hr warning attachments" ON storage.objects;
CREATE POLICY "Service role manages hr warning attachments"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'hr-warning-attachments')
WITH CHECK (bucket_id = 'hr-warning-attachments');
