-- Ajoute la prise en charge d'une photo pour les fiches de blacklist.
-- Le stockage se fait dans un bucket PRIVÉ ("blacklist-photos") : on ne
-- conserve que le chemin de l'objet en base, et le serveur génère des URLs
-- signées à durée limitée à chaque lecture (jamais d'URL publique directe).

ALTER TABLE public.blacklist_entries
  ADD COLUMN IF NOT EXISTS photo_path text;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'blacklist-photos',
  'blacklist-photos',
  false,
  8388608, -- 8 Mo
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
  SET public = false,
      file_size_limit = 8388608,
      allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

DROP POLICY IF EXISTS "Service role manages blacklist photos" ON storage.objects;
CREATE POLICY "Service role manages blacklist photos"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'blacklist-photos')
WITH CHECK (bucket_id = 'blacklist-photos');
