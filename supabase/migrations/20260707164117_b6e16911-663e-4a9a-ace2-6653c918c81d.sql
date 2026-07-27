CREATE TABLE public.discord_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  discord_id TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL,
  display_name TEXT,
  avatar TEXT,
  role_ids TEXT[] NOT NULL DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.discord_users TO authenticated;
GRANT ALL ON public.discord_users TO service_role;

ALTER TABLE public.discord_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own discord profile" ON public.discord_users
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Service role can manage discord users" ON public.discord_users
  FOR ALL TO service_role USING (true) WITH CHECK (true);