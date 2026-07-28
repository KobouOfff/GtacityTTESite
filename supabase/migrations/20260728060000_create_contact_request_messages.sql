CREATE TABLE IF NOT EXISTS public.contact_request_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_request_id uuid NOT NULL REFERENCES public.contact_requests(id) ON DELETE CASCADE,
  visibility text NOT NULL CHECK (visibility IN ('public', 'internal')),
  author_type text NOT NULL CHECK (author_type IN ('client', 'staff')),
  author_discord_id text NOT NULL,
  author_name text NOT NULL,
  message text NOT NULL CHECK (char_length(message) BETWEEN 1 AND 5000),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS contact_request_messages_request_idx
  ON public.contact_request_messages (contact_request_id, created_at ASC);

GRANT SELECT, INSERT ON public.contact_request_messages TO anon, authenticated;
GRANT ALL ON public.contact_request_messages TO service_role;

ALTER TABLE public.contact_request_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Internal presence can read contact request messages"
  ON public.contact_request_messages;
CREATE POLICY "Internal presence can read contact request messages"
  ON public.contact_request_messages FOR SELECT TO anon, authenticated
  USING (
    ((current_setting('request.headers'::text, true))::jsonb ->> 'x-tte-presence-proof'::text)
      = '2a9f6e4f1f1e57079025c3797e7cb8ee33e86e2b629ccfa24fc50c834d639c3f'::text
  );

DROP POLICY IF EXISTS "Internal presence can insert contact request messages"
  ON public.contact_request_messages;
CREATE POLICY "Internal presence can insert contact request messages"
  ON public.contact_request_messages FOR INSERT TO anon, authenticated
  WITH CHECK (
    ((current_setting('request.headers'::text, true))::jsonb ->> 'x-tte-presence-proof'::text)
      = '2a9f6e4f1f1e57079025c3797e7cb8ee33e86e2b629ccfa24fc50c834d639c3f'::text
  );

DROP POLICY IF EXISTS "Service role manages contact request messages"
  ON public.contact_request_messages;
CREATE POLICY "Service role manages contact request messages"
  ON public.contact_request_messages FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.insert_contact_request_message(
  p_contact_request_id uuid,
  p_visibility text,
  p_author_type text,
  p_author_discord_id text,
  p_author_name text,
  p_message text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inserted_id uuid;
  request_owner text;
  request_status text;
BEGIN
  IF p_visibility NOT IN ('public', 'internal')
    OR p_author_type NOT IN ('client', 'staff')
    OR NULLIF(BTRIM(p_message), '') IS NULL
    OR char_length(p_message) > 5000
  THEN
    RAISE EXCEPTION 'invalid_message' USING ERRCODE = '22023';
  END IF;

  SELECT requester_discord_id, status
  INTO request_owner, request_status
  FROM public.contact_requests
  WHERE id = p_contact_request_id;

  IF request_owner IS NULL THEN
    RAISE EXCEPTION 'request_not_found' USING ERRCODE = 'P0002';
  END IF;

  IF p_author_type = 'client' THEN
    IF request_owner IS DISTINCT FROM p_author_discord_id THEN
      RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
    END IF;
    IF request_status = 'ferme' THEN
      RAISE EXCEPTION 'request_closed' USING ERRCODE = '22023';
    END IF;
    IF p_visibility <> 'public' THEN
      RAISE EXCEPTION 'client_message_must_be_public' USING ERRCODE = '42501';
    END IF;
  END IF;

  INSERT INTO public.contact_request_messages (
    contact_request_id,
    visibility,
    author_type,
    author_discord_id,
    author_name,
    message
  )
  VALUES (
    p_contact_request_id,
    p_visibility,
    p_author_type,
    p_author_discord_id,
    LEFT(COALESCE(NULLIF(BTRIM(p_author_name), ''), 'Utilisateur TTE'), 200),
    BTRIM(p_message)
  )
  RETURNING id INTO inserted_id;

  RETURN inserted_id;
END;
$$;

REVOKE ALL ON FUNCTION public.insert_contact_request_message(
  uuid, text, text, text, text, text
) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.insert_contact_request_message(
  uuid, text, text, text, text, text
) TO service_role;

-- Conserve les anciennes notes comme historique interne.
INSERT INTO public.contact_request_messages (
  contact_request_id,
  visibility,
  author_type,
  author_discord_id,
  author_name,
  message,
  created_at
)
SELECT
  request.id,
  'internal',
  'staff',
  COALESCE(note.value ->> 'author_id', 'legacy'),
  COALESCE(note.value ->> 'author', 'Équipe TTE'),
  note.value ->> 'message',
  COALESCE(NULLIF(note.value ->> 'at', '')::timestamptz, request.created_at)
FROM public.contact_requests AS request
CROSS JOIN LATERAL jsonb_array_elements(COALESCE(request.notes, '[]'::jsonb)) AS note(value)
WHERE NULLIF(BTRIM(note.value ->> 'message'), '') IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM public.contact_request_messages AS existing
    WHERE existing.contact_request_id = request.id
      AND existing.visibility = 'internal'
      AND existing.author_discord_id = COALESCE(note.value ->> 'author_id', 'legacy')
      AND existing.message = note.value ->> 'message'
      AND existing.created_at = COALESCE(NULLIF(note.value ->> 'at', '')::timestamptz, request.created_at)
  );
