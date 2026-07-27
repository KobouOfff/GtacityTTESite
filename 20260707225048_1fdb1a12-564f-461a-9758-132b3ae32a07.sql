DROP FUNCTION IF EXISTS public.upsert_discord_presence(text, text, text, text, text[]);
DROP FUNCTION IF EXISTS public.list_online_discord_users(timestamptz);

GRANT SELECT, INSERT, UPDATE ON public.discord_users TO anon;
GRANT SELECT, INSERT, UPDATE ON public.discord_users TO authenticated;
GRANT ALL ON public.discord_users TO service_role;

DROP POLICY IF EXISTS "Internal presence can read discord users" ON public.discord_users;
DROP POLICY IF EXISTS "Internal presence can insert discord users" ON public.discord_users;
DROP POLICY IF EXISTS "Internal presence can update discord users" ON public.discord_users;

CREATE POLICY "Internal presence can read discord users"
ON public.discord_users
FOR SELECT
TO anon, authenticated
USING (
  (current_setting('request.headers', true)::jsonb ->> 'x-tte-presence-proof') = '2a9f6e4f1f1e57079025c3797e7cb8ee33e86e2b629ccfa24fc50c834d639c3f'
);

CREATE POLICY "Internal presence can insert discord users"
ON public.discord_users
FOR INSERT
TO anon, authenticated
WITH CHECK (
  (current_setting('request.headers', true)::jsonb ->> 'x-tte-presence-proof') = '2a9f6e4f1f1e57079025c3797e7cb8ee33e86e2b629ccfa24fc50c834d639c3f'
);

CREATE POLICY "Internal presence can update discord users"
ON public.discord_users
FOR UPDATE
TO anon, authenticated
USING (
  (current_setting('request.headers', true)::jsonb ->> 'x-tte-presence-proof') = '2a9f6e4f1f1e57079025c3797e7cb8ee33e86e2b629ccfa24fc50c834d639c3f'
)
WITH CHECK (
  (current_setting('request.headers', true)::jsonb ->> 'x-tte-presence-proof') = '2a9f6e4f1f1e57079025c3797e7cb8ee33e86e2b629ccfa24fc50c834d639c3f'
);