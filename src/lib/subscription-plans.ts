/**
 * Abonnements TTE payables en ligne via USB Pay.
 *
 * Pour chaque formule, créez un "Nouveau lien" > "Lien fixe" dans le
 * tableau de bord USB Pay (https://usbank.zyrion.dev) avec le montant exact
 * de l'abonnement, puis collez l'URL du lien ci-dessous dans `usbPayUrl`.
 *
 * Tant que `usbPayUrl` est vide, le bouton "Payer en ligne" affiche un
 * message "bientôt disponible" au lieu du terminal de paiement — ça évite
 * de publier un bouton qui ne mène nulle part avant d'avoir généré les
 * liens.
 *
 * Rappel : le paiement en ligne ne délivre PAS l'abonnement automatiquement.
 * Le client doit ensuite contacter un agent TTE (Discord) ou se présenter
 * en gare avec la preuve de paiement pour que l'abonnement soit activé
 * manuellement côté personnel.
 */

export interface SubscriptionPlan {
  id: "24h" | "7j" | "30j";
  nameFr: string;
  nameEn: string;
  price: number;
  descFr: string;
  descEn: string;
  /** URL du "Lien fixe" USB Pay pour ce tarif exact. Laisser vide si pas encore créé. */
  usbPayUrl: string;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "24h",
    nameFr: "Pass 24h",
    nameEn: "24h pass",
    price: 10,
    descFr: "Trajets illimités pendant 24h sur l'ensemble du réseau.",
    descEn: "Unlimited journeys for 24h across the whole network.",
    usbPayUrl: "", // TODO: coller le lien fixe USB Pay du pass 24h ($10)
  },
  {
    id: "7j",
    nameFr: "Pass 7 jours",
    nameEn: "7-day pass",
    price: 75,
    descFr: "Sept jours de trajets illimités sur l'ensemble du réseau.",
    descEn: "Seven days of unlimited journeys across the whole network.",
    usbPayUrl: "", // TODO: coller le lien fixe USB Pay du pass 7 jours ($75)
  },
  {
    id: "30j",
    nameFr: "Pass 30 jours",
    nameEn: "30-day pass",
    price: 275,
    descFr: "Trente jours de trajets illimités, pour les voyageurs réguliers.",
    descEn: "Thirty days of unlimited journeys, for regular travellers.",
    usbPayUrl: "", // TODO: coller le lien fixe USB Pay du pass 30 jours ($275)
  },
];
