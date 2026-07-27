ALTER TABLE public.discord_users ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now();
CREATE INDEX IF NOT EXISTS discord_users_last_seen_idx ON public.discord_users(last_seen_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS discord_users_discord_id_key ON public.discord_users(discord_id);