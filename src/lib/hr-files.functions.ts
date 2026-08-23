import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { sessionConfig, type SessionData } from "./session.server";
import { canManageHrFiles, type DiscordSessionUser } from "./discord-roles";
import type { HrEmployeeFileRow, HrEmployeeFilePatch } from "./hr-files.server";

async function currentUser(): Promise<DiscordSessionUser | null> {
  const s = await useSession<SessionData>(sessionConfig);
  return (s.data.user ?? null) as DiscordSessionUser | null;
}

const DISCORD_ID = /^[0-9]{5,25}$/;

/** Le dossier RH de l'employé connecté (lecture seule, pour /mon-compte etc.). */
export const getMyHrFile = createServerFn({ method: "GET" }).handler(async () => {
  const user = await currentUser();
  if (!user) return { ok: false as const, reason: "not_logged_in" as const };
  try {
    const { getHrFileByDiscordId } = await import("./hr-files.server");
    const row = await getHrFileByDiscordId(user.discordId);
    return { ok: true as const, row: row as HrEmployeeFileRow | null };
  } catch (e) {
    console.error("[getMyHrFile]", e);
    return { ok: false as const, reason: "read_failed" as const };
  }
});

/** Annuaire complet des dossiers RH, réservé à la RH / Direction. */
export const listAllHrFilesFn = createServerFn({ method: "GET" }).handler(async () => {
  const user = await currentUser();
  if (!user) return { ok: false as const, reason: "not_logged_in" as const };
  if (!canManageHrFiles(user)) return { ok: false as const, reason: "forbidden" as const };
  try {
    const { listAllHrFiles } = await import("./hr-files.server");
    const { listAllEmployees } = await import("./employees.server");
    const [files, employees] = await Promise.all([listAllHrFiles(), listAllEmployees()]);
    return { ok: true as const, files: files as HrEmployeeFileRow[], employees };
  } catch (e) {
    console.error("[listAllHrFilesFn]", e);
    return { ok: false as const, reason: "read_failed" as const };
  }
});

/** Le dossier RH d'un employé donné, réservé à la RH / Direction. */
export const getHrFileForEmployee = createServerFn({ method: "GET" })
  .validator((discordId: string) => discordId)
  .handler(async ({ data: discordId }) => {
    const user = await currentUser();
    if (!user) return { ok: false as const, reason: "not_logged_in" as const };
    if (!canManageHrFiles(user)) return { ok: false as const, reason: "forbidden" as const };
    if (!DISCORD_ID.test(discordId)) return { ok: false as const, reason: "invalid" as const };
    try {
      const { getHrFileByDiscordId } = await import("./hr-files.server");
      const row = await getHrFileByDiscordId(discordId);
      return { ok: true as const, row: row as HrEmployeeFileRow | null };
    } catch (e) {
      console.error("[getHrFileForEmployee]", e);
      return { ok: false as const, reason: "read_failed" as const };
    }
  });

/** Créer/mettre à jour le dossier RH d'un employé, réservé à la RH / Direction. */
export const saveHrFile = createServerFn({ method: "POST" })
  .validator(
    (d: {
      discordId: string;
      username: string | null;
      displayName: string | null;
      patch: HrEmployeeFilePatch;
    }) => d,
  )
  .handler(async ({ data }) => {
    const user = await currentUser();
    if (!user) return { ok: false as const, reason: "not_logged_in" as const };
    if (!canManageHrFiles(user)) return { ok: false as const, reason: "forbidden" as const };
    if (!DISCORD_ID.test(data.discordId)) return { ok: false as const, reason: "invalid" as const };

    const textFields: Array<keyof HrEmployeeFilePatch> = [
      "prenom",
      "nom",
      "genre",
      "situation_familiale",
      "telephones",
      "adresse",
      "postes_actuels",
      "conges_pris",
      "absences",
      "arrets_maladie",
      "avertissements",
      "sanctions",
      "appreciation_rh",
      "observation_rh",
      "objectifs",
      "signature_rh_nom",
    ];
    for (const field of textFields) {
      const v = data.patch[field];
      if (typeof v === "string" && v.length > 5000) {
        return { ok: false as const, reason: "invalid" as const };
      }
    }
    if (
      data.patch.conges_restants !== undefined &&
      data.patch.conges_restants !== null &&
      (!Number.isFinite(data.patch.conges_restants) || data.patch.conges_restants < 0)
    ) {
      return { ok: false as const, reason: "invalid" as const };
    }

    try {
      const { upsertHrFile, setHrFileDiscordIds } = await import("./hr-files.server");
      const row = await upsertHrFile(
        { discordId: data.discordId, username: data.username, displayName: data.displayName },
        user,
        data.patch,
      );

      const { syncHrFileToDiscord } = await import("./hr-files-discord.server");
      const discordSync = await syncHrFileToDiscord(row);
      if (discordSync.status === "sent") {
        await setHrFileDiscordIds(row.id, discordSync.threadId, discordSync.messageId);
        row.discord_thread_id = discordSync.threadId;
        row.discord_summary_message_id = discordSync.messageId;
      }

      return { ok: true as const, row: row as HrEmployeeFileRow, discordSync: discordSync.status };
    } catch (e) {
      console.error("[saveHrFile]", e);
      return { ok: false as const, reason: "save_failed" as const };
    }
  });
