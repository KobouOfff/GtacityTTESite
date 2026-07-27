GRANT SELECT, INSERT, UPDATE, DELETE ON public.discord_users TO authenticated;
GRANT ALL ON public.discord_users TO service_role;

DROP POLICY IF EXISTS "Service role can manage discord users" ON public.discord_users;
CREATE POLICY "Service role can manage discord users"
ON public.discord_users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated can read discord users" ON public.discord_users;
CREATE POLICY "Authenticated can read discord users"
ON public.discord_users
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);