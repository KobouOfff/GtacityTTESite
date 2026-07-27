import { DISCORD_ROLES } from "./discord-roles";

export type OnlineCategory =
  | "conducteur"
  | "controleur"
  | "securite"
  | "bus"
  | "maintenance"
  | "regulation"
  | "direction"
  | "autre";

export function categorizePresenceRoles(roleIds: string[]): OnlineCategory {
  const has = (id: string) => roleIds.includes(id);
  if (has("1198611186263003157") || has("1309838693900619937") || has("1366488410046464081")) return "direction";
  if (has("1310226200718872606") || has("1310226197292257420") || has("1312803829368230028") || has("1312824207545208862")) return "regulation";
  if (has("1198611196207693866") || has("1309893638972506277") || has("1309893338102501507")) return "conducteur";
  if (has("1198611192990679081") || has("1198611191858221126") || has("1310228825023582248")) return "controleur";
  if (has("1198611187399659651") || has("1198611190721552475") || has("1310222702468137054")) return "securite";
  if (has("1313945489724669984") || has("1313945486314700810") || has("1493001324806013131")) return "bus";
  return "autre";
}

export function getPrimaryPresenceRole(roleIds: string[]) {
  let best: { name: string; color: string; level: number } | null = null;
  for (const id of roleIds) {
    const role = DISCORD_ROLES[id];
    if (role && (!best || role.level > best.level)) best = role;
  }
  return best;
}