// Lit la table Supabase "employees" (créée par la migration
// supabase/migrations/20260819030000_create_employees.sql), remplie par le
// bot Discord via !register (voir bot_discord/employees.py) et lue ici pour
// retrouver l'adresse DeoMail liée au compte Discord connecté.
//
// SECURITY: n'importer ce module que depuis du code serveur (*.server.ts,
// server functions). supabaseAdmin utilise la clé de service et ne doit
// jamais atteindre le bundle client.

export type EmployeeRecord = {
  discordId: string;
  name: string | null;
  email: string;
};

export async function getEmployeeByDiscordId(discordId: string): Promise<EmployeeRecord | null> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("employees")
    .select("discord_id, name, email")
    .eq("discord_id", String(discordId))
    .maybeSingle();

  if (error) throw error;
  if (!data || !data.email) return null;

  return {
    discordId: data.discord_id,
    name: data.name,
    email: data.email.trim().toLowerCase(),
  };
}
