// Import ponctuel (à lancer une fois) des fils RH créés à la main dans
// 1484614182946082898 AVANT la mise en place de la synchro automatique
// (hr-files-discord.server.ts). Parcourt tous les fils du salon forum
// (actifs + archivés), extrait les infos du message de présentation
// (toujours le même gabarit à labels), et crée le dossier Supabase
// correspondant pour les employés qui n'ont pas encore de dossier.
//
// Ne touche jamais un dossier déjà existant en base (site = source de
// vérité une fois qu'un dossier a été créé/modifié via le formulaire) :
// on se contente de le lier à son fil existant si ce lien manque encore.

import type { EmployeeRecord } from "@/employees.server";
import type { HrEmployeeFileRow, HrEmployeeFilePatch } from "./hr-files.server";
import type { DiscordSessionUser } from "./discord-roles";

type DiscordThread = {
  id: string;
  name: string;
  parent_id?: string | null;
};

export type LegacyImportReport = {
  totalThreads: number;
  imported: string[]; // noms importés (nouveau dossier créé)
  fixed: string[]; // dossier existant mais vide (bug précédent) -> rempli
  linkedOnly: string[]; // dossier déjà en base, juste relié à son fil
  alreadyLinked: string[]; // dossier déjà relié et déjà rempli, rien à faire
  unmatched: string[]; // nom du fil non retrouvé dans l'annuaire employés
  parseFailed: string[]; // fil dont le message n'a pas pu être lu/parsé
};

function normalizeName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function parseFrDate(value: string): string | null {
  const m = value.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const [, d, mo, y] = m;
  return `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

function parseYesNo(value: string): boolean {
  return /^oui/i.test(value.trim());
}

function parseCongesRestants(value: string): number | null {
  const n = parseInt(value.trim(), 10);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

// Labels EXACTS du gabarit utilisé à la main (dans l'ordre où ils
// apparaissent dans le message). Le texte entre un label et le suivant
// est la valeur de ce champ.
const LABELS: Array<{ label: string; key: string }> = [
  { label: "Prénom(s) + Nom :", key: "nomComplet" },
  { label: "Genre :", key: "genre" },
  { label: "Date de naissance :", key: "date_naissance" },
  { label: "Situation familiale :", key: "situation_familiale" },
  { label: "Numéro(s) de téléphone :", key: "telephones" },
  { label: "Adresse(s) :", key: "adresse" },
  { label: "Date d'entrée dans l'entreprise :", key: "date_entree" },
  { label: "Poste(s) occupé(s) actuellement :", key: "postes_actuels" },
  { label: "Congés pris :", key: "conges_pris" },
  { label: "Congés restants :", key: "conges_restants" },
  { label: "Absence(s) justifiée(s) / injustifiée(s) :", key: "absences" },
  { label: "Arrêt(s) maladie :", key: "arrets_maladie" },
  { label: "Avertissement(s) :", key: "avertissements" },
  { label: "Sanction(s) :", key: "sanctions" },
  { label: "Appréciation(s) RH :", key: "appreciation_rh" },
  { label: "Observation(s) RH :", key: "observation_rh" },
  { label: "Objectif(s) :", key: "objectifs" },
  { label: "Affirmez vous avoir pris conscience du règlement interne de la TTE ? :", key: "reglement_interne_ack" },
  { label: "Signature du RH la création du dossier :", key: "signature_rh_nom" },
  { label: "Tampon de la TTE :", key: "tampon" },
];

function normalizeLabel(value: string) {
  return value
    .normalize("NFKC")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

// Table de correspondance label normalisé -> clé, construite une seule fois.
const NORMALIZED_LABELS = new Map(LABELS.map(({ label, key }) => [normalizeLabel(label), key]));

function parseLegacyMessage(content: string): Record<string, string> {
  const found: Array<{ key: string; index: number; end: number }> = [];
  for (const { label, key } of LABELS) {
    const idx = content.indexOf(label);
    if (idx !== -1) found.push({ key, index: idx, end: idx + label.length });
  }
  found.sort((a, b) => a.index - b.index);

  const values: Record<string, string> = {};
  for (let i = 0; i < found.length; i++) {
    const start = found[i].end;
    const end = i + 1 < found.length ? found[i + 1].index : content.length;
    values[found[i].key] = content.slice(start, end).trim();
  }
  return values;
}

/**
 * Les anciens fils postaient le formulaire sous forme d'EMBED Discord
 * (titre + liste de champs name/value), pas en texte brut — c'est ce que
 * l'on voit en copiant le message affiché dans Discord. On extrait donc
 * en priorité les champs de l'embed ; le parsing en texte brut ne sert
 * que de repli si jamais un message a été posté sans embed.
 */
function extractLegacyFields(message: {
  content?: string;
  embeds?: Array<{ fields?: Array<{ name?: string; value?: string }> }>;
}): Record<string, string> {
  const embedFields = message.embeds?.[0]?.fields;
  if (embedFields && embedFields.length > 0) {
    const values: Record<string, string> = {};
    for (const f of embedFields) {
      if (!f.name) continue;
      const key = NORMALIZED_LABELS.get(normalizeLabel(f.name));
      if (key) values[key] = (f.value ?? "").trim();
    }
    if (Object.keys(values).length > 0) return values;
  }
  return parseLegacyMessage(message.content ?? "");
}

function splitNomComplet(nomComplet: string): { prenom: string | null; nom: string | null } {
  const parts = nomComplet.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return { prenom: null, nom: null };
  if (parts.length === 1) return { prenom: parts[0], nom: null };
  const nom = parts[parts.length - 1];
  const prenom = parts.slice(0, -1).join(" ");
  return { prenom, nom };
}

function buildPatchFromLegacy(values: Record<string, string>): HrEmployeeFilePatch {
  const { prenom, nom } = splitNomComplet(values.nomComplet ?? "");
  const patch: HrEmployeeFilePatch & { prenom?: string | null; nom?: string | null; date_naissance?: string | null; date_entree?: string | null } = {
    prenom,
    nom,
    genre: values.genre || null,
    situation_familiale: values.situation_familiale || null,
    telephones: values.telephones || null,
    adresse: values.adresse || null,
    postes_actuels: values.postes_actuels || null,
    conges_pris: values.conges_pris || null,
    conges_restants: values.conges_restants ? parseCongesRestants(values.conges_restants) : null,
    absences: values.absences || null,
    arrets_maladie: values.arrets_maladie || null,
    avertissements: values.avertissements || null,
    sanctions: values.sanctions || null,
    appreciation_rh: values.appreciation_rh || null,
    observation_rh: values.observation_rh || null,
    objectifs: values.objectifs || null,
    reglement_interne_ack: values.reglement_interne_ack ? parseYesNo(values.reglement_interne_ack) : false,
    signature_rh_nom: values.signature_rh_nom || null,
    tampon: values.tampon ? values.tampon.trim().length > 0 : false,
  };
  // Les dates ont un type dédié côté DB (date_naissance / date_entree ne
  // sont pas dans HrEmployeeFilePatch car non éditables via le formulaire
  // web actuel) : on les ajoute quand même pour l'écriture directe ci-dessous.
  (patch as Record<string, unknown>).date_naissance = values.date_naissance ? parseFrDate(values.date_naissance) : null;
  (patch as Record<string, unknown>).date_entree = values.date_entree ? parseFrDate(values.date_entree) : null;
  return patch;
}

async function fetchAllThreads(token: string, guildId: string, channelId: string): Promise<DiscordThread[]> {
  const headers = { Authorization: `Bot ${token}` };
  const results: DiscordThread[] = [];

  // Fils actifs : uniquement listables au niveau guilde, on filtre par salon.
  const activeRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}/threads/active`, { headers });
  if (activeRes.ok) {
    const activeData = (await activeRes.json()) as { threads: DiscordThread[] };
    results.push(...activeData.threads.filter((t) => t.parent_id === channelId));
  }

  // Fils archivés (publics), paginés.
  let before: string | undefined;
  for (let page = 0; page < 20; page++) {
    const url = new URL(`https://discord.com/api/v10/channels/${channelId}/threads/archived/public`);
    url.searchParams.set("limit", "100");
    if (before) url.searchParams.set("before", before);
    const res = await fetch(url, { headers });
    if (!res.ok) break;
    const data = (await res.json()) as {
      threads: (DiscordThread & { thread_metadata?: { archive_timestamp?: string } })[];
      has_more: boolean;
    };
    results.push(...data.threads);
    if (!data.has_more || data.threads.length === 0) break;
    before = data.threads[data.threads.length - 1]?.thread_metadata?.archive_timestamp;
    if (!before) break;
  }

  // Dédoublonnage par sécurité.
  const seen = new Set<string>();
  return results.filter((t) => (seen.has(t.id) ? false : (seen.add(t.id), true)));
}

async function fetchStarterMessage(
  token: string,
  threadId: string,
): Promise<{ content: string; embeds?: Array<{ fields?: Array<{ name?: string; value?: string }>; title?: string }> } | null> {
  // L'ID du message de départ d'un fil est TOUJOURS égal à l'ID du fil.
  const res = await fetch(
    `https://discord.com/api/v10/channels/${threadId}/messages/${threadId}`,
    { headers: { Authorization: `Bot ${token}` } },
  );
  if (!res.ok) return null;
  return (await res.json()) as { content: string; embeds?: Array<{ fields?: Array<{ name?: string; value?: string }>; title?: string }> };
}

function isEffectivelyEmpty(row: HrEmployeeFileRow): boolean {
  return (
    !row.prenom &&
    !row.nom &&
    !row.telephones &&
    !row.adresse &&
    !row.postes_actuels &&
    !row.appreciation_rh &&
    !row.observation_rh
  );
}

export async function importLegacyHrThreads(
  actor: DiscordSessionUser,
): Promise<{ ok: true; report: LegacyImportReport } | { ok: false; reason: string }> {
  const token = process.env.DISCORD_BOT_TOKEN?.trim();
  const guildId = process.env.DISCORD_GUILD_ID?.trim();
  const channelId = process.env.DISCORD_HR_CHANNEL_ID?.trim();
  if (!token || !guildId || !channelId) {
    return { ok: false, reason: "missing_env" };
  }

  const { listAllEmployees } = await import("@/employees.server");
  const { listAllHrFiles, upsertHrFile, setHrFileDiscordIds } = await import("./hr-files.server");

  const [employees, existingFiles, threads] = await Promise.all([
    listAllEmployees(),
    listAllHrFiles(),
    fetchAllThreads(token, guildId, channelId),
  ]);

  const employeesByName = new Map<string, EmployeeRecord>();
  for (const e of employees) {
    if (e.name) employeesByName.set(normalizeName(e.name), e);
  }
  const filesByDiscordId = new Map<string, HrEmployeeFileRow>();
  for (const f of existingFiles) filesByDiscordId.set(f.employee_discord_id, f);

  const report: LegacyImportReport = {
    totalThreads: threads.length,
    imported: [],
    fixed: [],
    linkedOnly: [],
    alreadyLinked: [],
    unmatched: [],
    parseFailed: [],
  };

  for (const thread of threads) {
    const threadLabel = thread.name;
    const message = await fetchStarterMessage(token, thread.id);
    if (!message) {
      report.parseFailed.push(threadLabel);
      continue;
    }

    const values = extractLegacyFields(message);
    if (Object.keys(values).length === 0) {
      report.parseFailed.push(threadLabel);
      continue;
    }
    const nameFromTitle = thread.name.replace(/^Dossier RH\s*-\s*/i, "").trim();
    const nameCandidate = values.nomComplet || nameFromTitle;
    const employee = employeesByName.get(normalizeName(nameCandidate));

    if (!employee) {
      report.unmatched.push(threadLabel);
      continue;
    }

    const existing = filesByDiscordId.get(employee.discordId);

    if (existing) {
      const linkedElsewhere = existing.discord_thread_id && existing.discord_thread_id !== thread.id;
      if (linkedElsewhere && !isEffectivelyEmpty(existing)) {
        // Déjà relié à un autre fil et déjà rempli : on ne touche à rien.
        report.alreadyLinked.push(threadLabel);
        continue;
      }
      if (existing.discord_thread_id === thread.id && !isEffectivelyEmpty(existing)) {
        // Déjà relié à CE fil et déjà rempli : rien à faire.
        report.alreadyLinked.push(threadLabel);
        continue;
      }

      if (isEffectivelyEmpty(existing)) {
        // Dossier vide (créé par un import précédent avant la correction du
        // parsing, ou jamais rempli) : on (re)remplit à partir du fil.
        const patch = buildPatchFromLegacy(values);
        try {
          const row = await upsertHrFile(
            { discordId: employee.discordId, username: employee.email, displayName: employee.name },
            actor,
            patch,
          );
          await setHrFileDiscordIds(row.id, thread.id, "");
          report.fixed.push(threadLabel);
        } catch (e) {
          console.error(`[hr-files/legacy-import] Échec correction "${threadLabel}"`, e);
          report.parseFailed.push(threadLabel);
        }
        continue;
      }

      // Dossier déjà rempli via le site, pas encore relié à un fil : on ne
      // touche pas aux champs déjà saisis, on relie juste le fil historique.
      await setHrFileDiscordIds(existing.id, thread.id, "");
      report.linkedOnly.push(threadLabel);
      continue;
    }

    // Pas de dossier en base : on crée à partir du contenu du fil.
    const patch = buildPatchFromLegacy(values);
    try {
      const row = await upsertHrFile(
        { discordId: employee.discordId, username: employee.email, displayName: employee.name },
        actor,
        patch,
      );
      await setHrFileDiscordIds(row.id, thread.id, "");
      report.imported.push(threadLabel);
    } catch (e) {
      console.error(`[hr-files/legacy-import] Échec import "${threadLabel}"`, e);
      report.parseFailed.push(threadLabel);
    }
  }

  return { ok: true, report };
}
