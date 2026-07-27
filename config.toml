REVOKE EXECUTE ON FUNCTION public.upsert_discord_presence(text, text, text, text, text[]) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.list_online_discord_users(timestamptz) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_discord_presence(text, text, text, text, text[]) TO service_role;
GRANT EXECUTE ON FUNCTION public.list_online_discord_users(timestamptz) TO service_role;