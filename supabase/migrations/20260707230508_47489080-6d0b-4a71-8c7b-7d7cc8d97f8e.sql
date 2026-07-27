CREATE OR REPLACE FUNCTION public.upsert_discord_presence(
  p_discord_id text,
  p_username text,
  p_display_name text,
  p_avatar text,
  p_role_ids text[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.discord_users (
    discord_id,
    username,
    display_name,
    avatar,
    role_ids,
    last_seen_at,
    updated_at
  ) VALUES (
    p_discord_id,
    p_username,
    p_display_name,
    p_avatar,
    COALESCE(p_role_ids, '{}'::text[]),
    now(),
    now()
  )
  ON CONFLICT (discord_id) DO UPDATE SET
    username = EXCLUDED.username,
    display_name = EXCLUDED.display_name,
    avatar = EXCLUDED.avatar,
    role_ids = EXCLUDED.role_ids,
    last_seen_at = now(),
    updated_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION public.list_online_discord_users(p_cutoff timestamptz)
RETURNS TABLE (
  discord_id text,
  username text,
  display_name text,
  avatar text,
  role_ids text[],
  last_seen_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    du.discord_id,
    du.username,
    du.display_name,
    du.avatar,
    du.role_ids,
    du.last_seen_at
  FROM public.discord_users du
  WHERE du.last_seen_at >= p_cutoff
  ORDER BY du.last_seen_at DESC
  LIMIT 200;
$$;

GRANT EXECUTE ON FUNCTION public.upsert_discord_presence(text, text, text, text, text[]) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.list_online_discord_users(timestamptz) TO anon, authenticated, service_role;