import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { sessionConfig, type SessionData } from "./session.server";
import { canManageSubscriptions, type DiscordSessionUser } from "./discord-roles";
import type { LoyaltyAccountRow } from "./loyalty.server";
import { REWARD_CATALOG, type RewardClaimRow, type RewardTierId } from "./rewards.server";

const CODE_PATTERN = /^REC-\d{4}-\d{6}$/i;

async function currentUser(): Promise<DiscordSessionUser | null> {
  const s = await useSession<SessionData>(sessionConfig);
  return (s.data.user ?? null) as DiscordSessionUser | null;
}

export const getRewardCatalog = createServerFn({ method: "GET" }).handler(async () => {
  return { ok: true as const, tiers: REWARD_CATALOG };
});

export const getMyRewardClaims = createServerFn({ method: "GET" }).handler(async () => {
  const user = await currentUser();
  if (!user) return { ok: false as const, reason: "not_logged_in" as const };
  try {
    const { listMyRewardClaims } = await import("./rewards.server");
    const claims = await listMyRewardClaims(user.discordId);
    return { ok: true as const, claims: claims as RewardClaimRow[] };
  } catch (e) {
    console.error("[getMyRewardClaims]", e);
    return { ok: false as const, reason: "read_failed" as const };
  }
});

export const claimRewardFn = createServerFn({ method: "POST" })
  .validator((d: { tierId: RewardTierId }) => d)
  .handler(async ({ data }) => {
    const user = await currentUser();
    if (!user) return { ok: false as const, reason: "not_logged_in" as const };
    try {
      const { claimReward } = await import("./rewards.server");
      const result = await claimReward(user, data.tierId);
      if (!result.ok) return { ok: false as const, reason: result.reason };
      return { ok: true as const, account: result.account as LoyaltyAccountRow, claim: result.claim };
    } catch (e) {
      console.error("[claimRewardFn]", e);
      return { ok: false as const, reason: "insert_failed" as const };
    }
  });

// ===== Remise des récompenses par un agent TTE (guichet / Discord) =====

export const searchRewardClaimByCode = createServerFn({ method: "POST" })
  .validator((d: { code: string }) => d)
  .handler(async ({ data }) => {
    const user = await currentUser();
    if (!user) return { ok: false as const, reason: "not_logged_in" as const };
    if (!canManageSubscriptions(user)) return { ok: false as const, reason: "forbidden" as const };
    const code = data.code?.trim();
    if (!code || !CODE_PATTERN.test(code)) {
      return { ok: false as const, reason: "invalid_code" as const };
    }
    try {
      const { findRewardClaimByCode } = await import("./rewards.server");
      const found = await findRewardClaimByCode(code);
      if (!found) return { ok: false as const, reason: "not_found" as const };
      return {
        ok: true as const,
        claim: found.claim as RewardClaimRow,
        account: found.account as LoyaltyAccountRow | null,
      };
    } catch (e) {
      console.error("[searchRewardClaimByCode]", e);
      return { ok: false as const, reason: "read_failed" as const };
    }
  });

export const redeemRewardClaimFn = createServerFn({ method: "POST" })
  .validator((d: { code: string }) => d)
  .handler(async ({ data }) => {
    const user = await currentUser();
    if (!user) return { ok: false as const, reason: "not_logged_in" as const };
    if (!canManageSubscriptions(user)) return { ok: false as const, reason: "forbidden" as const };
    const code = data.code?.trim();
    if (!code || !CODE_PATTERN.test(code)) {
      return { ok: false as const, reason: "invalid_code" as const };
    }
    try {
      const { redeemRewardClaim } = await import("./rewards.server");
      const result = await redeemRewardClaim(code, user);
      if (!result.ok) return { ok: false as const, reason: result.reason };
      return {
        ok: true as const,
        claim: result.claim as RewardClaimRow,
        account: result.account as LoyaltyAccountRow | null,
      };
    } catch (e) {
      console.error("[redeemRewardClaimFn]", e);
      return { ok: false as const, reason: "update_failed" as const };
    }
  });
