/**
 * Client serveur pour l'API entreprise USB Pay (https://usbank.zyrion.dev).
 *
 * IMPORTANT : ce fichier ne doit être importé QUE depuis du code serveur
 * (server functions / *.server.ts), jamais depuis un composant client — la
 * clé API entreprise donne accès au solde et à l'historique des comptes
 * TTE et ne doit donc jamais transiter vers le navigateur.
 *
 * Configuration : définir la variable d'environnement USB_PAY_API_KEY
 * (clé au format usbent_sk_...) sur le serveur de déploiement. Tant
 * qu'elle est absente, la vérification automatique des paiements reste
 * indisponible et le site retombe sur la vérification manuelle par un
 * agent (comportement historique, toujours utilisable dans tous les cas).
 */

const USB_PAY_BASE_URL = "https://usbank.zyrion.dev/api/v1/enterprise";

function apiKey(): string | null {
  const key = process.env.USB_PAY_API_KEY;
  return key && key.trim() ? key.trim() : null;
}

export function isUsbPayConfigured(): boolean {
  return apiKey() !== null;
}

async function usbPayFetch(path: string): Promise<unknown> {
  const key = apiKey();
  if (!key) throw new Error("usb_pay_not_configured");
  const res = await fetch(`${USB_PAY_BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${key}` },
  });
  if (!res.ok) {
    throw new Error(`usb_pay_http_${res.status}`);
  }
  return res.json();
}

/**
 * Retourne la liste brute des derniers encaissements USB Pay tels que
 * renvoyés par l'API. On ne connaît pas précisément le nom de chaque
 * champ (référence, montant...) donc le reste du code fait une recherche
 * "défensive" dans l'objet complet plutôt que de dépendre d'un schéma
 * strict — voir matchesPayment() dans loyalty.server.ts.
 */
export async function fetchRecentUsbPayments(limit = 50): Promise<unknown[]> {
  const json = await usbPayFetch(`/payments?limit=${limit}`);
  if (Array.isArray(json)) return json;
  if (json && typeof json === "object") {
    const obj = json as Record<string, unknown>;
    const list = obj.payments ?? obj.data ?? obj.results ?? obj.items;
    if (Array.isArray(list)) return list;
  }
  return [];
}
