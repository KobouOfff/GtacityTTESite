import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { DiscordSessionUser } from "./discord-roles";

export type LoyaltyAccountRow = {
  discord_id: string;
  username: string;
  display_name: string | null;
  avatar: string | null;
  points: number;
  created_at: string;
  updated_at: string;
};

export type SubscriptionPurchaseRow = {
  id: string;
  discord_id: string;
  plan_id: string;
  plan_name: string;
  price: number;
  points_earned: number;
  status: string;
  reference: string;
  delivered_by_discord_id: string | null;
  delivered_by_username: string | null;
  delivered_at: string | null;
  created_at: string;
};

// Référence courte présentée par le client à un agent pour se faire
// attribuer le billet (voir recordSubscriptionPurchase / findPurchaseByReference).
function makePurchaseRef() {
  const y = new Date().getFullYear();
  const n = Math.floor(100000 + Math.random() * 900000);
  return `BIL-${y}-${n}`;
}

function normalizeRef(input: string): string {
  return input.trim().toUpperCase();
}

// 1 point fidélité par dollar dépensé sur un abonnement.
const POINTS_PER_DOLLAR = 1;

/**
 * Crée le compte fidélité du client au premier accès s'il n'existe pas
 * encore (le "compte client" du site = l'identité Discord), et garde le
 * profil (pseudo/avatar) à jour sinon.
 */
export async function ensureLoyaltyAccount(user: DiscordSessionUser): Promise<LoyaltyAccountRow> {
  const supabase = supabaseAdmin;

  const { data: existing, error: readErr } = await supabase
    .from("loyalty_accounts")
    .select("*")
    .eq("discord_id", user.discordId)
    .maybeSingle();
  if (readErr) throw readErr;

  if (existing) {
    const stale =
      existing.username !== user.username ||
      existing.display_name !== user.displayName ||
      existing.avatar !== user.avatar;
    if (!stale) return existing as LoyaltyAccountRow;

    const { data: updated, error: updErr } = await supabase
      .from("loyalty_accounts")
      .update({
        username: user.username,
        display_name: user.displayName,
        avatar: user.avatar,
        updated_at: new Date().toISOString(),
      })
      .eq("discord_id", user.discordId)
      .select("*")
      .single();
    if (updErr) throw updErr;
    return updated as LoyaltyAccountRow;
  }

  const { data: created, error: insErr } = await supabase
    .from("loyalty_accounts")
    .insert({
      discord_id: user.discordId,
      username: user.username,
      display_name: user.displayName,
      avatar: user.avatar,
      points: 0,
    })
    .select("*")
    .single();
  if (insErr) throw insErr;
  return created as LoyaltyAccountRow;
}

export async function getLoyaltyAccountWithHistory(discordId: string): Promise<{
  account: LoyaltyAccountRow | null;
  purchases: SubscriptionPurchaseRow[];
}> {
  const supabase = supabaseAdmin;
  const { data: account, error: accErr } = await supabase
    .from("loyalty_accounts")
    .select("*")
    .eq("discord_id", discordId)
    .maybeSingle();
  if (accErr) throw accErr;

  const { data: purchases, error: purErr } = await supabase
    .from("subscription_purchases")
    .select("*")
    .eq("discord_id", discordId)
    .order("created_at", { ascending: false })
    .limit(20);
  if (purErr) throw purErr;

  return {
    account: (account as LoyaltyAccountRow) ?? null,
    purchases: (purchases as SubscriptionPurchaseRow[]) ?? [],
  };
}

/**
 * Enregistre l'intention d'achat d'un abonnement (déclenché quand le client
 * ouvre le terminal de paiement USB Pay) et crédite les points fidélité
 * correspondants sur son compte client.
 *
 * Ne confirme pas le paiement lui-même — USB Pay n'a pas de webhook
 * disponible ici. La délivrance réelle de l'abonnement reste manuelle,
 * faite par un agent TTE après vérification du reçu, comme prévu.
 */
export async function recordSubscriptionPurchase(
  user: DiscordSessionUser,
  plan: { id: "24h" | "7j" | "30j"; nameFr: string; price: number },
): Promise<{ account: LoyaltyAccountRow; purchase: SubscriptionPurchaseRow }> {
  const supabase = supabaseAdmin;
  const account = await ensureLoyaltyAccount(user);
  const pointsEarned = Math.round(plan.price * POINTS_PER_DOLLAR);

  let purchase: SubscriptionPurchaseRow | null = null;
  let lastErr: unknown = null;
  for (let i = 0; i < 4; i++) {
    const reference = makePurchaseRef();
    const { data, error } = await supabase
      .from("subscription_purchases")
      .insert({
        discord_id: user.discordId,
        plan_id: plan.id,
        plan_name: plan.nameFr,
        price: plan.price,
        points_earned: pointsEarned,
        status: "paiement_initie",
        reference,
      })
      .select("*")
      .single();
    if (!error && data) {
      purchase = data as SubscriptionPurchaseRow;
      break;
    }
    lastErr = error;
    // 23505 = unique_violation (référence déjà prise) → on retente avec une nouvelle référence
    if (error && (error as { code?: string }).code !== "23505") throw error;
  }
  if (!purchase) throw new Error(`Impossible d'enregistrer l'achat: ${String(lastErr)}`);

  const { data: updatedAccount, error: updErr } = await supabase
    .from("loyalty_accounts")
    .update({
      points: account.points + pointsEarned,
      updated_at: new Date().toISOString(),
    })
    .eq("discord_id", user.discordId)
    .select("*")
    .single();
  if (updErr) throw updErr;

  return {
    account: updatedAccount as LoyaltyAccountRow,
    purchase,
  };
}

/**
 * Recherche un achat par sa référence (donnée par le client à un agent au
 * guichet ou sur Discord) pour vérification avant attribution du billet.
 */
export async function findPurchaseByReference(reference: string): Promise<{
  purchase: SubscriptionPurchaseRow;
  account: LoyaltyAccountRow | null;
} | null> {
  const supabase = supabaseAdmin;
  const ref = normalizeRef(reference);
  const { data: purchase, error } = await supabase
    .from("subscription_purchases")
    .select("*")
    .eq("reference", ref)
    .maybeSingle();
  if (error) throw error;
  if (!purchase) return null;

  const { data: account, error: accErr } = await supabase
    .from("loyalty_accounts")
    .select("*")
    .eq("discord_id", (purchase as SubscriptionPurchaseRow).discord_id)
    .maybeSingle();
  if (accErr) throw accErr;

  return {
    purchase: purchase as SubscriptionPurchaseRow,
    account: (account as LoyaltyAccountRow) ?? null,
  };
}

/**
 * Attribue le billet : un agent TTE valide la référence présentée par le
 * client (après vérification du reçu de paiement) et marque l'achat comme
 * délivré. Idempotent côté statut : refuse si déjà délivré ou annulé.
 */
export async function deliverPurchaseByReference(
  reference: string,
  agent: DiscordSessionUser,
): Promise<
  | { ok: true; purchase: SubscriptionPurchaseRow; account: LoyaltyAccountRow | null }
  | { ok: false; reason: "not_found" | "already_delivered" | "cancelled" }
> {
  const found = await findPurchaseByReference(reference);
  if (!found) return { ok: false, reason: "not_found" };
  if (found.purchase.status === "delivre") return { ok: false, reason: "already_delivered" };
  if (found.purchase.status === "annule") return { ok: false, reason: "cancelled" };

  const supabase = supabaseAdmin;
  const { data: updated, error } = await supabase
    .from("subscription_purchases")
    .update({
      status: "delivre",
      delivered_by_discord_id: agent.discordId,
      delivered_by_username: agent.displayName || agent.username,
      delivered_at: new Date().toISOString(),
    })
    .eq("id", found.purchase.id)
    .eq("status", found.purchase.status) // évite une double-attribution en cas de course
    .select("*")
    .maybeSingle();
  if (error) throw error;
  if (!updated) return { ok: false, reason: "already_delivered" };

  return { ok: true, purchase: updated as SubscriptionPurchaseRow, account: found.account };
}
