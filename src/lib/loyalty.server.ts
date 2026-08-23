import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { DiscordSessionUser } from "./discord-roles";
import { fetchRecentUsbPayments, isUsbPayConfigured } from "./usb-pay.server";

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
  usb_pay_reference: string | null;
  usb_pay_verified_at: string | null;
  usb_pay_verify_note: string | null;
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
 * confirme avoir terminé son paiement dans le terminal USB Pay) et génère
 * sa référence de suivi.
 *
 * NE crédite PAS les points fidélité ici : USB Pay n'a pas de webhook
 * disponible, donc rien ne prouve à ce stade que le paiement a réellement
 * abouti. Les points ne sont crédités qu'à la délivrance du billet
 * (voir deliverPurchaseByReference), une fois qu'un agent TTE a vérifié le
 * reçu de paiement — ce qui évite qu'un client accumule des points ou une
 * référence "valide" sans avoir payé.
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

  // Le compte fidélité n'est PAS modifié ici (voir commentaire ci-dessus) :
  // on renvoie le solde actuel, inchangé.
  return {
    account,
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
 *
 * C'est ICI, et seulement ici, que les points fidélité sont crédités :
 * la vérification du reçu par l'agent est la seule confirmation réelle du
 * paiement dont on dispose (pas de webhook USB Pay). Un achat resté au
 * statut "paiement_initie" (client qui a fermé la fenêtre sans payer, par
 * exemple) ne crédite donc jamais de points.
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
    .eq("status", found.purchase.status) // évite une double-attribution (et un double crédit de points) en cas de course
    .select("*")
    .maybeSingle();
  if (error) throw error;
  if (!updated) return { ok: false, reason: "already_delivered" };

  // Crédite les points fidélité maintenant que l'agent a confirmé le paiement.
  let updatedAccount = found.account;
  if (found.account) {
    const { data: creditedAccount, error: creditErr } = await supabase
      .from("loyalty_accounts")
      .update({
        points: found.account.points + (updated as SubscriptionPurchaseRow).points_earned,
        updated_at: new Date().toISOString(),
      })
      .eq("discord_id", found.account.discord_id)
      .select("*")
      .single();
    if (creditErr) throw creditErr;
    updatedAccount = creditedAccount as LoyaltyAccountRow;
  }

  return { ok: true, purchase: updated as SubscriptionPurchaseRow, account: updatedAccount };
}

// ===== Vérification automatique via l'API entreprise USB Pay =====

/**
 * On ne connaît pas le schéma exact d'un encaissement renvoyé par l'API
 * USB Pay (noms de champs non documentés côté TTE), donc la recherche se
 * fait "en profondeur" dans l'objet plutôt que sur des clés précises :
 * - la référence doit apparaître quelque part dans l'objet ;
 * - un montant numérique quelque part dans l'objet doit correspondre au
 *   prix du plan (à 1 cent près), en dollars ou en centimes.
 * C'est volontairement tolérant : un faux positif nécessiterait qu'un
 * encaissement totalement différent contienne à la fois la même
 * référence texte ET le même montant, ce qui n'arrive pas en pratique.
 */
function deepContainsText(value: unknown, needle: string): boolean {
  if (value == null) return false;
  if (typeof value === "string") return value.toUpperCase().includes(needle);
  if (typeof value === "number") return String(value).includes(needle);
  if (Array.isArray(value)) return value.some((v) => deepContainsText(v, needle));
  if (typeof value === "object") return Object.values(value as object).some((v) => deepContainsText(v, needle));
  return false;
}

function deepContainsAmount(value: unknown, target: number): boolean {
  const matchesNumber = (n: number) => Math.abs(n - target) < 0.01 || Math.abs(n - target * 100) < 1;
  if (value == null) return false;
  if (typeof value === "number") return matchesNumber(value);
  if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) {
    return matchesNumber(Number(value));
  }
  if (Array.isArray(value)) return value.some((v) => deepContainsAmount(v, target));
  if (typeof value === "object") return Object.values(value as object).some((v) => deepContainsAmount(v, target));
  return false;
}

function matchesPayment(payment: unknown, usbReference: string, price: number): boolean {
  return deepContainsText(payment, usbReference.toUpperCase()) && deepContainsAmount(payment, price);
}

export type VerifyPaymentResult =
  | { ok: true; purchase: SubscriptionPurchaseRow }
  | {
      ok: false;
      reason:
        | "not_configured"
        | "not_found"
        | "not_owner"
        | "already_delivered"
        | "cancelled"
        | "already_verified"
        | "reference_already_used"
        | "no_match"
        | "api_error";
    };

/**
 * Vérifie automatiquement, via l'API entreprise USB Pay, qu'un encaissement
 * correspondant à la référence de virement donnée par le client (affichée
 * par le terminal USB Pay après paiement) a bien été reçu sur le compte
 * TTE, pour le bon montant.
 *
 * Ceci NE délivre PAS le billet et NE crédite PAS les points : ça marque
 * seulement l'achat comme "vérifié" pour qu'un agent TTE (toujours requis
 * pour l'attribution finale, voir deliverPurchaseByReference) puisse
 * l'attribuer en confiance sans avoir à rechercher le reçu lui-même.
 */
export async function autoVerifySubscriptionPayment(
  requester: DiscordSessionUser,
  purchaseReference: string,
  usbPayReference: string,
): Promise<VerifyPaymentResult> {
  if (!isUsbPayConfigured()) return { ok: false, reason: "not_configured" };

  const found = await findPurchaseByReference(purchaseReference);
  if (!found) return { ok: false, reason: "not_found" };
  if (found.purchase.discord_id !== requester.discordId) return { ok: false, reason: "not_owner" };
  if (found.purchase.status === "delivre") return { ok: false, reason: "already_delivered" };
  if (found.purchase.status === "annule") return { ok: false, reason: "cancelled" };
  if (found.purchase.usb_pay_verified_at) return { ok: false, reason: "already_verified" };

  const usbRef = usbPayReference.trim().toUpperCase();
  if (!usbRef) return { ok: false, reason: "no_match" };

  let payments: unknown[];
  try {
    payments = await fetchRecentUsbPayments(50);
  } catch (e) {
    console.error("[autoVerifySubscriptionPayment] usb pay api", e);
    return { ok: false, reason: "api_error" };
  }

  const match = payments.find((p) => matchesPayment(p, usbRef, found.purchase.price));
  if (!match) return { ok: false, reason: "no_match" };

  const supabase = supabaseAdmin;
  const { data: updated, error } = await supabase
    .from("subscription_purchases")
    .update({
      usb_pay_reference: usbRef,
      usb_pay_verified_at: new Date().toISOString(),
      usb_pay_verify_note: "Encaissement retrouvé automatiquement via l'API USB Pay.",
    })
    .eq("id", found.purchase.id)
    .is("usb_pay_verified_at", null) // évite une double-vérification en cas de double-clic
    .select("*")
    .maybeSingle();
  if (error) {
    // Violation de l'index unique usb_pay_reference = cette référence USB Pay
    // a déjà servi à vérifier un autre achat.
    if ((error as { code?: string }).code === "23505") return { ok: false, reason: "reference_already_used" };
    throw error;
  }
  if (!updated) return { ok: false, reason: "already_verified" };

  return { ok: true, purchase: updated as SubscriptionPurchaseRow };
}
