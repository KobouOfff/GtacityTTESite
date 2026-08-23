// Lit/écrit la table Supabase "hr_employee_files" (créée par la migration
// supabase/migrations/20260825000000_create_hr_employee_files.sql).
//
// SECURITY: n'importer ce module que depuis du code serveur (*.server.ts,
// server functions). supabaseAdmin utilise la clé de service et ne doit
// jamais atteindre le bundle client.

import type { DiscordSessionUser } from "./discord-roles";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type HrEmployeeFileRow = {
  id: string;
  employee_discord_id: string;
  employee_username: string | null;
  employee_display_name: string | null;

  prenom: string | null;
  nom: string | null;
  genre: string | null;
  date_naissance: string | null;
  situation_familiale: string | null;

  telephones: string | null;
  adresse: string | null;

  date_entree: string | null;
  postes_actuels: string | null;

  conges_pris: string | null;
  conges_restants: number | null;
  absences: string | null;
  arrets_maladie: string | null;

  avertissements: string | null;
  sanctions: string | null;

  appreciation_rh: string | null;
  observation_rh: string | null;
  objectifs: string | null;
  reglement_interne_ack: boolean;

  signature_rh_nom: string | null;
  signature_rh_date: string | null;
  tampon: boolean;

  created_by_discord_id: string | null;
  created_by_username: string | null;
  updated_by_discord_id: string | null;
  updated_by_username: string | null;

  created_at: string;
  updated_at: string;
};

export type HrEmployeeFilePatch = Partial<
  Pick<
    HrEmployeeFileRow,
    | "prenom"
    | "nom"
    | "genre"
    | "date_naissance"
    | "situation_familiale"
    | "telephones"
    | "adresse"
    | "date_entree"
    | "postes_actuels"
    | "conges_pris"
    | "conges_restants"
    | "absences"
    | "arrets_maladie"
    | "avertissements"
    | "sanctions"
    | "appreciation_rh"
    | "observation_rh"
    | "objectifs"
    | "reglement_interne_ack"
    | "signature_rh_nom"
    | "signature_rh_date"
    | "tampon"
  >
>;

export async function getHrFileByDiscordId(discordId: string): Promise<HrEmployeeFileRow | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabaseAdmin.from("hr_employee_files" as any) as any)
    .select("*")
    .eq("employee_discord_id", discordId)
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as HrEmployeeFileRow | null;
}

export async function listAllHrFiles(): Promise<HrEmployeeFileRow[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabaseAdmin.from("hr_employee_files" as any) as any)
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as HrEmployeeFileRow[];
}

export async function upsertHrFile(
  employee: { discordId: string; username: string | null; displayName: string | null },
  actor: DiscordSessionUser,
  patch: HrEmployeeFilePatch,
): Promise<HrEmployeeFileRow> {
  const now = new Date().toISOString();
  const existing = await getHrFileByDiscordId(employee.discordId);

  const row: Record<string, unknown> = {
    ...patch,
    employee_discord_id: employee.discordId,
    employee_username: employee.username,
    employee_display_name: employee.displayName,
    updated_by_discord_id: actor.discordId,
    updated_by_username: actor.displayName || actor.username,
    updated_at: now,
  };
  if (!existing) {
    row.created_by_discord_id = actor.discordId;
    row.created_by_username = actor.displayName || actor.username;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabaseAdmin.from("hr_employee_files" as any) as any)
    .upsert(row, { onConflict: "employee_discord_id" })
    .select("*")
    .single();
  if (error) throw error;
  return data as HrEmployeeFileRow;
}
