import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { DiscordSessionUser } from "./discord-roles";
import type { LoyaltyAccountRow } from "./loyalty.server";

export type RewardTierId = "reduction8" | "pass24h_offert" | "pass7j_offert";

export type RewardTier = {
  id: RewardTierId;
  label: string;
  description: string;
  pointsCost: number;
};

// Catalogue des récompenses — source de vérité côté serveur (jamais le
// coût envoyé par le client). 3 paliers réalistes basés sur 1 point = 1$
// dépensé (voir POINTS_PER_DOLLAR dans loyalty.server.ts) : le premier est
// atteignable après un ou deux abonnements, les deux suivants demandent une
// fidélité installée dans la durée.
export const REWARD_CATALOG: RewardTier[] = [
  {
    id: "reduction8",
    label: "8 $ de réduction",
    description: "Une réduction de 8 $ sur votre prochain abonnement, à faire valoir au guichet.",
    pointsCost: 120,
  },
  {
    id: "pass24h_offert",
    label: "Pass 24h offert",
    description: "Un Pass 24h gratuit, attribué directement par un agent TTE.",
    pointsCost: 300,
  },
  {
    id: "pass7j_offert",
    label: "Pass 7 jours offert",
    description: "Un Pass 7 jours gratuit, la récompense la plus généreuse du programme fidélité.",
    pointsCost: 700,
  },
];

export type RewardClaimRow = {
  id: string;
  discord_id: string;
  tier_id: RewardTierId;
  tier_label: string;
  points_cost: number;
  code: string;
  status: "a_recuperer" | "recupere" | "annule";
  redeemed_by_discord_id: string | null;
  redeemed_by_username: string | null;
  redeemed_at: string | null;
  created_at: string;
};

function makeRewardCode() {
  const y = new Date().getFullYear();
  const n = Math.floor(100000 + Math.random() * 900000);
  return `REC-${y}-${n}`;
}

function normalizeCode(input: string): string {
  return input.trim().toUpperCase();
}

export async function listMyRewardClaims(discordId: string): Promise<RewardClaimRow[]> {
  const { data, error } = await supabaseAdmin
    .from("loyalty_reward_claims")
    .select("*")
    .eq("discord_id", discordId)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  return (data as RewardClaimRow[]) ?? [];
}

/**
 * Réclame une récompense du catalogue : débite immédiatement les points
 * (comme un échange de miles) et génère un code de retrait à présenter à un
 * agent. Refuse si le solde est insuffisant — la vérification et le débit
 * se font en une seule requête conditionnelle pour éviter qu'un double-clic
 * ne fasse passer le solde en négatif.
 */
export async function claimReward(
  user: DiscordSessionUser,
  tierId: RewardTierId,
): Promise<
  | { ok: true; account: LoyaltyAccountRow; claim: RewardClaimRow }
  | { ok: false; reason: "unknown_tier" | "account_not_found" | "insufficient_points" | "insert_failed" }
> {
  const tier = REWARD_CATALOG.find((t) => t.id === tierId);
  if (!tier) return { ok: false, reason: "unknown_tier" };

  const supabase = supabaseAdmin;
  const { data: account, error: accErr } = await supabase
    .from("loyalty_accounts")
    .select("*")
    .eq("discord_id", user.discordId)
    .maybeSingle();
  if (accErr) throw accErr;
  if (!account) return { ok: false, reason: "account_not_found" };
  if ((account as LoyaltyAccountRow).points < tier.pointsCost) {
    return { ok: false, reason: "insufficient_points" };
  }

  // Débit conditionnel : n'aboutit que si le solde lu est toujours le
  // solde en base (protège contre une réclamation concurrente).
  const { data: debited, error: debitErr } = await supabase
    .from("loyalty_accounts")
    .update({
      points: (account as LoyaltyAccountRow).points - tier.pointsCost,
      updated_at: new Date().toISOString(),
    })
    .eq("discord_id", user.discordId)
    .eq("points", (account as LoyaltyAccountRow).points)
    .select("*")
    .maybeSingle();
  if (debitErr) throw debitErr;
  if (!debited) return { ok: false, reason: "insufficient_points" };

  let claim: RewardClaimRow | null = null;
  let lastErr: unknown = null;
  for (let i = 0; i < 4; i++) {
    const code = makeRewardCode();
    const { data, error } = await supabase
      .from("loyalty_reward_claims")
      .insert({
        discord_id: user.discordId,
        tier_id: tier.id,
        tier_label: tier.label,
        points_cost: tier.pointsCost,
        code,
        status: "a_recuperer",
      })
      .select("*")
      .single();
    if (!error && data) {
      claim = data as RewardClaimRow;
      break;
    }
    lastErr = error;
    if (error && (error as { code?: string }).code !== "23505") throw error;
  }

  if (!claim) {
    // Repose les points débités si on n'a pas réussi à créer la réclamation.
    await supabase
      .from("loyalty_accounts")
      .update({ points: (account as LoyaltyAccountRow).points, updated_at: new Date().toISOString() })
      .eq("discord_id", user.discordId);
    console.error("[claimReward] insert_failed", lastErr);
    return { ok: false, reason: "insert_failed" };
  }

  return { ok: true, account: debited as LoyaltyAccountRow, claim };
}

/**
 * Recherche une réclamation par son code de retrait (donné par le client à
 * un agent) pour vérification avant remise de la récompense.
 */
export async function findRewardClaimByCode(code: string): Promise<{
  claim: RewardClaimRow;
  account: LoyaltyAccountRow | null;
} | null> {
  const supabase = supabaseAdmin;
  const normalized = normalizeCode(code);
  const { data: claim, error } = await supabase
    .from("loyalty_reward_claims")
    .select("*")
    .eq("code", normalized)
    .maybeSingle();
  if (error) throw error;
  if (!claim) return null;

  const { data: account, error: accErr } = await supabase
    .from("loyalty_accounts")
    .select("*")
    .eq("discord_id", (claim as RewardClaimRow).discord_id)
    .maybeSingle();
  if (accErr) throw accErr;

  return {
    claim: claim as RewardClaimRow,
    account: (account as LoyaltyAccountRow) ?? null,
  };
}

/**
 * Remet la récompense : un agent TTE valide le code présenté par le client
 * et marque la réclamation comme récupérée. Idempotent côté statut : refuse
 * si déjà récupérée ou annulée.
 */
export async function redeemRewardClaim(
  code: string,
  agent: DiscordSessionUser,
): Promise<
  | { ok: true; claim: RewardClaimRow; account: LoyaltyAccountRow | null }
  | { ok: false; reason: "not_found" | "already_redeemed" | "cancelled" }
> {
  const found = await findRewardClaimByCode(code);
  if (!found) return { ok: false, reason: "not_found" };
  if (found.claim.status === "recupere") return { ok: false, reason: "already_redeemed" };
  if (found.claim.status === "annule") return { ok: false, reason: "cancelled" };

  const supabase = supabaseAdmin;
  const { data: updated, error } = await supabase
    .from("loyalty_reward_claims")
    .update({
      status: "recupere",
      redeemed_by_discord_id: agent.discordId,
      redeemed_by_username: agent.displayName || agent.username,
      redeemed_at: new Date().toISOString(),
    })
    .eq("id", found.claim.id)
    .eq("status", found.claim.status) // évite une double-remise en cas de course
    .select("*")
    .maybeSingle();
  if (error) throw error;
  if (!updated) return { ok: false, reason: "already_redeemed" };

  return { ok: true, claim: updated as RewardClaimRow, account: found.account };
}
