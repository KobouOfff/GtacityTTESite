import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { sessionConfig, type SessionData } from "./session.server";
import { canManageSubscriptions, type DiscordSessionUser } from "./discord-roles";
import type { LoyaltyAccountRow, SubscriptionPurchaseRow } from "./loyalty.server";

const REF_PATTERN = /^BIL-\d{4}-\d{6}$/i;

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

export const verifySubscriptionPaymentFn = createServerFn({ method: "POST" })
  .validator((d: { purchaseReference: string; usbPayReference: string }) => d)
  .handler(async ({ data }) => {
    const user = await currentUser();
    if (!user) return { ok: false as const, reason: "not_logged_in" as const };
    if (!data.purchaseReference?.trim() || !data.usbPayReference?.trim()) {
      return { ok: false as const, reason: "no_match" as const };
    }
    try {
      const { autoVerifySubscriptionPayment } = await import("./loyalty.server");
      const result = await autoVerifySubscriptionPayment(user, data.purchaseReference, data.usbPayReference);
      if (!result.ok) return result;
      return { ok: true as const, purchase: result.purchase };
    } catch (e) {
      console.error("[verifySubscriptionPaymentFn]", e);
      return { ok: false as const, reason: "api_error" as const };
    }
  });

// ===== Attribution des billets par un agent TTE (guichet / Discord) =====

export const searchPurchaseByReference = createServerFn({ method: "POST" })
  .validator((d: { reference: string }) => d)
  .handler(async ({ data }) => {
    const user = await currentUser();
    if (!user) return { ok: false as const, reason: "not_logged_in" as const };
    if (!canManageSubscriptions(user)) return { ok: false as const, reason: "forbidden" as const };
    const reference = data.reference?.trim();
    if (!reference || !REF_PATTERN.test(reference)) {
      return { ok: false as const, reason: "invalid_reference" as const };
    }
    try {
      const { findPurchaseByReference } = await import("./loyalty.server");
      const found = await findPurchaseByReference(reference);
      if (!found) return { ok: false as const, reason: "not_found" as const };
      return {
        ok: true as const,
        purchase: found.purchase as SubscriptionPurchaseRow,
        account: found.account as LoyaltyAccountRow | null,
      };
    } catch (e) {
      console.error("[searchPurchaseByReference]", e);
      return { ok: false as const, reason: "read_failed" as const };
    }
  });

export const deliverPurchaseByReferenceFn = createServerFn({ method: "POST" })
  .validator((d: { reference: string }) => d)
  .handler(async ({ data }) => {
    const user = await currentUser();
    if (!user) return { ok: false as const, reason: "not_logged_in" as const };
    if (!canManageSubscriptions(user)) return { ok: false as const, reason: "forbidden" as const };
    const reference = data.reference?.trim();
    if (!reference || !REF_PATTERN.test(reference)) {
      return { ok: false as const, reason: "invalid_reference" as const };
    }
    try {
      const { deliverPurchaseByReference } = await import("./loyalty.server");
      const result = await deliverPurchaseByReference(reference, user);
      if (!result.ok) return { ok: false as const, reason: result.reason };
      return {
        ok: true as const,
        purchase: result.purchase as SubscriptionPurchaseRow,
        account: result.account as LoyaltyAccountRow | null,
      };
    } catch (e) {
      console.error("[deliverPurchaseByReferenceFn]", e);
      return { ok: false as const, reason: "update_failed" as const };
    }
  });
