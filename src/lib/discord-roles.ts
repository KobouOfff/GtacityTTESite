// Mapping des rôles Discord TTE → nom lisible + couleur + niveau hiérarchique
export const DISCORD_ROLES: Record<string, { name: string; color: string; level: number }> = {
  // Direction
  "1198611186263003157": { name: "Gérant", color: "#e11d48", level: 100 },
  "1309838693900619937": { name: "Superviseur", color: "#f97316", level: 90 },
  "1366488410046464081": { name: "Superviseur assistant", color: "#fb923c", level: 85 },
  // Gérants de branche
  "1309893638972506277": { name: "Gérant Train", color: "#0ea5e9", level: 70 },
  "1198611191858221126": { name: "Gérant Contrôleur", color: "#8b5cf6", level: 70 },
  "1198611190721552475": { name: "Gérant Sécurité", color: "#22c55e", level: 70 },
  "1312824207545208862": { name: "Gérant Maintenance", color: "#eab308", level: 70 },
  "1313945486314700810": { name: "Gérant Bus", color: "#06b6d4", level: 70 },
  // Formateurs
  "1343672417318600755": { name: "Formateur", color: "#a855f7", level: 60 },
  "1309893338102501507": { name: "Formateur Train", color: "#a855f7", level: 60 },
  "1310222702468137054": { name: "Formateur Sécurité", color: "#a855f7", level: 60 },
  "1310228825023582248": { name: "Formateur Contrôleur", color: "#a855f7", level: 60 },
  "1493001324806013131": { name: "Formateur Bus", color: "#a855f7", level: 60 },
  "1310226197292257420": { name: "Formateur Régulateur", color: "#a855f7", level: 60 },
  // Postes opérationnels
  "1198611196207693866": { name: "Conducteur de train", color: "#0ea5e9", level: 40 },
  "1198611187399659651": { name: "Agent de sécurité", color: "#22c55e", level: 40 },
  "1198611192990679081": { name: "Contrôleur", color: "#8b5cf6", level: 40 },
  "1313945489724669984": { name: "Chauffeur Bus", color: "#06b6d4", level: 40 },
  "1310226200718872606": { name: "Régulateur", color: "#f59e0b", level: 40 },
  "1312803829368230028": { name: "Maintenance", color: "#eab308", level: 40 },
  // Grades employés
  "1343672655751938098": { name: "Employé expérimenté", color: "#64748b", level: 30 },
  "1343672658662785156": { name: "Employé", color: "#64748b", level: 20 },
  "1343672661108064266": { name: "Recrue", color: "#94a3b8", level: 10 },
  // Rôle "membre de l'entreprise"
  "1198611202142634115": { name: "Employé TTE", color: "#64748b", level: 5 },
};

// Rôles ayant accès total (bypass toutes les pages)
export const ADMIN_ROLES = new Set([
  "1198611186263003157", // Gérant
  "1309838693900619937", // Superviseur
  "1366488410046464081", // Superviseur assistant
]);

// Matrice d'accès par page
export const PAGE_ACCESS: Record<string, string[]> = {
  // /centre-regulation : ouvert à tout employé connecté.
  // Les permissions fines (notes, départs, TSR, réseau & matériel)
  // sont gérées via les helpers can* ci-dessous.
  "/contact": [
    // Toute personne ayant le rôle "Employé TTE" (ou plus)
    "1198611202142634115",
  ],
  "/espace-employes": [
    "1198611202142634115",
  ],
};

// ===== Permissions internes au Centre de Régulation =====

// Direction (Gérant, Superviseur, Superviseur assistant)
const DIRECTION_ROLES = new Set([
  "1198611186263003157", // Gérant
  "1309838693900619937", // Superviseur
  "1366488410046464081", // Superviseur assistant
]);
// Gérants de branche
const BRANCH_MANAGER_IDS = new Set([
  "1309893638972506277", // Gérant Train
  "1198611191858221126", // Gérant Contrôleur
  "1198611190721552475", // Gérant Sécurité
  "1312824207545208862", // Gérant Maintenance
  "1313945486314700810", // Gérant Bus
]);
// Formateurs
const FORMATEUR_IDS = new Set([
  "1343672417318600755",
  "1309893338102501507",
  "1310222702468137054",
  "1310228825023582248",
  "1493001324806013131",
  "1310226197292257420",
]);
const REGULATEUR_ID = "1310226200718872606";
const MAINTENANCE_ID = "1312803829368230028";
const CHAUFFEUR_BUS_ID = "1313945489724669984"; // Chauffeur Bus

function hasAny(user: DiscordSessionUser | null, ids: Iterable<string>): boolean {
  if (!user) return false;
  const set = ids instanceof Set ? ids : new Set(ids);
  return user.roleIds.some((r) => set.has(r));
}

// Notes de service : direction, gérants de branche, formateurs, régulateur, maintenance.
// Exclut conducteurs / chauffeurs / agents sécurité / contrôleurs / employés simples.
export function canWriteNotes(user: DiscordSessionUser | null): boolean {
  if (!user) return false;
  return (
    hasAny(user, DIRECTION_ROLES) ||
    hasAny(user, BRANCH_MANAGER_IDS) ||
    hasAny(user, FORMATEUR_IDS) ||
    user.roleIds.includes(REGULATEUR_ID) ||
    user.roleIds.includes(MAINTENANCE_ID)
  );
}

// Régulation des départs — trains : régulateur, maintenance, direction, gérants de branche.
export function canManageTrainDepartures(user: DiscordSessionUser | null): boolean {
  if (!user) return false;
  return (
    hasAny(user, DIRECTION_ROLES) ||
    hasAny(user, BRANCH_MANAGER_IDS) ||
    user.roleIds.includes(REGULATEUR_ID) ||
    user.roleIds.includes(MAINTENANCE_ID)
  );
}

// Régulation des départs — bus : chauffeurs de bus, direction, gérants de branche.
export function canManageBusDepartures(user: DiscordSessionUser | null): boolean {
  if (!user) return false;
  return (
    hasAny(user, DIRECTION_ROLES) ||
    hasAny(user, BRANCH_MANAGER_IDS) ||
    user.roleIds.includes(CHAUFFEUR_BUS_ID)
  );
}

// Utilitaire pour reconnaître une ligne de bus (B1, B2, ou l'ancien code générique "BUS").
export function isBusLine(line: string | null | undefined): boolean {
  return typeof line === "string" && line.toUpperCase().startsWith("B");
}

// Régulation des départs : routeur selon la ligne. Sans ligne précisée, renvoie
// l'accès global (train OU bus) — utilisé pour les bannières/permissions génériques.
export function canManageDepartures(user: DiscordSessionUser | null, line?: string): boolean {
  if (!user) return false;
  if (typeof line === "string") {
    return isBusLine(line) ? canManageBusDepartures(user) : canManageTrainDepartures(user);
  }
  return canManageTrainDepartures(user) || canManageBusDepartures(user);
}

// Slow orders (TSR) : maintenance, régulateur, direction, gérants de branche.
export function canManageTSR(user: DiscordSessionUser | null): boolean {
  return canManageTrainDepartures(user);
}

// Réseau & matériel (TSR, flotte, PA, météo, passages à niveau) — écriture :
// Gérant, Supervision, Gérants de branche, Maintenance, Régulateur.
export function canWriteNetworkAssets(user: DiscordSessionUser | null): boolean {
  return canManageTrainDepartures(user);
}

export type DiscordSessionUser = {
  discordId: string;
  username: string;
  displayName: string | null;
  avatar: string | null;
  roleIds: string[];
};

export function hasPageAccess(user: DiscordSessionUser | null, path: string): boolean {
  if (!user) return false;
  // Admins ont tout
  if (user.roleIds.some((r) => ADMIN_ROLES.has(r))) return true;
  const allowed = PAGE_ACCESS[path];
  if (!allowed) return true; // page non listée = ouverte aux connectés
  return user.roleIds.some((r) => allowed.includes(r));
}

// Météo & conditions (onglet Réseau & matériel) : mêmes droits que le réseau.
export function canEditWeather(user: DiscordSessionUser | null): boolean {
  return canWriteNetworkAssets(user);
}

// Flotte / matériel roulant (onglet Réseau & matériel) : mêmes droits.
export function canEditFleet(user: DiscordSessionUser | null): boolean {
  return canWriteNetworkAssets(user);
}

// Formations : uniquement Direction (Gérant, Supervision, Sup. assistant)
// et Gérants de branche peuvent ajouter/supprimer des formations au catalogue.
export function canManageTrainings(user: DiscordSessionUser | null): boolean {
  if (!user) return false;
  return hasAny(user, DIRECTION_ROLES) || hasAny(user, BRANCH_MANAGER_IDS);
}

// Blacklist : réservée à la Direction (Gérant, Superviseur, Superviseur assistant).
export function canManageBlacklist(user: DiscordSessionUser | null): boolean {
  if (!user) return false;
  return hasAny(user, DIRECTION_ROLES);
}

// Journal d'audit complet des actions des employés :
// réservé à la Direction et à la Supervision.
export function canViewAuditLogs(user: DiscordSessionUser | null): boolean {
  if (!user) return false;
  return hasAny(user, DIRECTION_ROLES);
}

export function getPrimaryRole(roleIds: string[]): { name: string; color: string } | null {
  let best: { name: string; color: string; level: number } | null = null;
  for (const id of roleIds) {
    const r = DISCORD_ROLES[id];
    if (r && (!best || r.level > best.level)) best = r;
  }
  return best ? { name: best.name, color: best.color } : null;
}

// Accès à la gestion des demandes de contact : Direction + Gérants de branche
const CONTACT_DIRECTION_ROLES = new Set([
  "1198611186263003157", // Gérant
  "1309838693900619937", // Superviseur
  "1366488410046464081", // Superviseur assistant
]);
// Gérants de branche → clé de branche (voir CONTACT_BRANCHES)
const BRANCH_MANAGER_ROLES: Record<string, string> = {
  "1309893638972506277": "train",       // Gérant Train
  "1313945486314700810": "bus",         // Gérant Bus
  "1198611190721552475": "securite",    // Gérant Sécurité
  "1198611191858221126": "controleur",  // Gérant Contrôleur
  "1312824207545208862": "maintenance", // Gérant Maintenance
};
const CONTACT_ADMIN_ROLES = new Set<string>([
  ...CONTACT_DIRECTION_ROLES,
  ...Object.keys(BRANCH_MANAGER_ROLES),
]);
export function canManageContactRequests(user: DiscordSessionUser | null): boolean {
  if (!user) return false;
  return user.roleIds.some((r) => CONTACT_ADMIN_ROLES.has(r));
}
// Direction : voit tout. Sinon renvoie la liste des clés de branche visibles.
// null = accès complet, [] = aucun accès, [x,y] = filtré sur ces branches.
export function contactVisibleBranches(user: DiscordSessionUser | null): string[] | null {
  if (!user) return [];
  if (user.roleIds.some((r) => CONTACT_DIRECTION_ROLES.has(r))) return null;
  const branches = new Set<string>();
  for (const r of user.roleIds) {
    const b = BRANCH_MANAGER_ROLES[r];
    if (b) branches.add(b);
  }
  return Array.from(branches);
}

// Branches vers lesquelles une demande peut être redirigée
export const CONTACT_BRANCHES: Array<{ key: string; label: string; color: string }> = [
  { key: "direction", label: "Direction (Gérant / Superviseur)", color: "#e11d48" },
  { key: "train", label: "Branche Train — Gérant Train", color: "#0ea5e9" },
  { key: "bus", label: "Branche Bus — Gérant Bus", color: "#06b6d4" },
  { key: "securite", label: "Branche Sécurité — Gérant Sécurité", color: "#22c55e" },
  { key: "controleur", label: "Branche Contrôleur — Gérant Contrôleur", color: "#8b5cf6" },
  { key: "maintenance", label: "Branche Maintenance — Gérant Maintenance", color: "#eab308" },
  { key: "regulation", label: "Régulation — Formateur Régulateur", color: "#f59e0b" },
];
export function getBranchLabel(key: string | null | undefined): string {
  if (!key) return "Non assignée";
  return CONTACT_BRANCHES.find((b) => b.key === key)?.label ?? key;
}
export function getBranchColor(key: string | null | undefined): string {
  if (!key) return "#64748b";
  return CONTACT_BRANCHES.find((b) => b.key === key)?.color ?? "#64748b";
}

// Statuts d'une demande
export const CONTACT_STATUSES: Record<string, { label: string; color: string }> = {
  nouveau: { label: "Nouveau", color: "#3b82f6" },
  en_cours: { label: "En cours", color: "#f59e0b" },
  transfere: { label: "Transféré", color: "#8b5cf6" },
  resolu: { label: "Résolu", color: "#22c55e" },
  ferme: { label: "Fermé", color: "#64748b" },
};

// Libellés lisibles des motifs
export const CONTACT_CATEGORIES: Record<string, string> = {
  remboursement: "Remboursement",
  info: "Information voyageur",
  presse: "Presse & médias",
  objets: "Objets trouvés",
  accessibilite: "Accessibilité / PMR",
  reclamation: "Réclamation",
  suggestion: "Suggestion",
  autre: "Autre demande",
};
