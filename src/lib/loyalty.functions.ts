import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { sessionConfig, type SessionData } from "./session.server";
import type { DiscordSessionUser } from "./discord-roles";
import type { LoyaltyAccountRow, SubscriptionPurchaseRow } from "./loyalty.server";

async function currentUser(): Promise<DiscordSessionUser | null> {
  const s = await useSession<SessionData>(sessionConfig);
  return (s.data.user ?? null) as DiscordSessionUser | null;
}

// Prix côté serveur — source de vérité, jamais le montant envoyé par le client.
const PLAN_CATALOG: Record<"24h" | "7j" | "30j", { nameFr: string; price: number }> = {
  "24h": { nameFr: "Pass 24h", price: 10 },
  "7j": { nameFr: "Pass 7 jours", price: 75 },
  "30j": { nameFr: "Pass 30 jours", price: 275 },
};

export const getMyLoyaltyAccount = createServerFn({ method: "GET" }).handler(async () => {
  const user = await currentUser();
  if (!user) return { ok: false as const, reason: "not_logged_in" as const };
  try {
    const { ensureLoyaltyAccount, getLoyaltyAccountWithHistory } = await import("./loyalty.server");
    await ensureLoyaltyAccount(user);
    const { account, purchases } = await getLoyaltyAccountWithHistory(user.discordId);
    return {
      ok: true as const,
      account: account as LoyaltyAccountRow,
      purchases: purchases as SubscriptionPurchaseRow[],
    };
  } catch (e) {
    console.error("[getMyLoyaltyAccount]", e);
    return { ok: false as const, reason: "read_failed" as const };
  }
});

export const startSubscriptionPurchase = createServerFn({ method: "POST" })
  .validator((d: { planId: "24h" | "7j" | "30j" }) => d)
  .handler(async ({ data }) => {
    const user = await currentUser();
    if (!user) return { ok: false as const, reason: "not_logged_in" as const };
    const plan = PLAN_CATALOG[data.planId];
    if (!plan) return { ok: false as const, reason: "invalid_plan" as const };
    try {
      const { recordSubscriptionPurchase } = await import("./loyalty.server");
      const { account, purchase } = await recordSubscriptionPurchase(user, {
        id: data.planId,
        nameFr: plan.nameFr,
        price: plan.price,
      });
      return { ok: true as const, account, purchase };
    } catch (e) {
      console.error("[startSubscriptionPurchase]", e);
      return { ok: false as const, reason: "insert_failed" as const };
    }
  });
