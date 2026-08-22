// Modèles de mails prédéfinis (compagnie ferroviaire), utilisés par le
// composeur de la messagerie web (MailPanel). Port de
// bot_discord/mail_templates.py — garder les deux fichiers alignés si l'un
// des deux évolue (mêmes modèles, mêmes libellés).
//
// Chaque modèle a un id, un titre (affiché dans la liste), un objet et un
// corps. Les {champs_entre_accolades} sont remplacés par les valeurs
// saisies par l'employé au moment de l'envoi.

export type MailTemplate = {
  id: number;
  title: string;
  subject: string;
  body: string;
};

export const MAIL_TEMPLATES: MailTemplate[] = [
  {
    id: 1,
    title: "Retard de train",
    subject: "Information : retard du train {numero_train}",
    body:
      "Bonjour {nom_client},\n\n" +
      "Nous vous informons que le train {numero_train} au départ de " +
      "{gare_depart} à destination de {gare_arrivee}, prévu le {date} " +
      "à {heure}, accuse un retard estimé de {duree_retard}.\n\n" +
      "Nous vous prions de nous excuser pour la gêne occasionnée et " +
      "restons à votre disposition pour toute information.\n\n" +
      "Cordialement,\nService Voyageurs",
  },
  {
    id: 2,
    title: "Confirmation de réservation",
    subject: "Confirmation de votre réservation n°{numero_reservation}",
    body:
      "Bonjour {nom_client},\n\n" +
      "Nous vous confirmons votre réservation n°{numero_reservation} " +
      "pour le trajet {gare_depart} - {gare_arrivee} le {date} à " +
      "{heure} (train {numero_train}).\n\n" +
      "Nous vous souhaitons un excellent voyage.\n\n" +
      "Cordialement,\nService Réservations",
  },
  {
    id: 3,
    title: "Annulation de trajet",
    subject: "Annulation du train {numero_train} du {date}",
    body:
      "Bonjour {nom_client},\n\n" +
      "Nous vous informons que le train {numero_train} du {date} " +
      "reliant {gare_depart} à {gare_arrivee} a été annulé pour la " +
      "raison suivante : {motif}.\n\n" +
      "Des solutions de remplacement vous seront proposées dans les " +
      "meilleurs délais. Nous vous prions de nous excuser pour la " +
      "gêne occasionnée.\n\n" +
      "Cordialement,\nService Voyageurs",
  },
  {
    id: 4,
    title: "Modification d'horaire",
    subject: "Modification de l'horaire de votre trajet du {date}",
    body:
      "Bonjour {nom_client},\n\n" +
      "L'horaire de votre trajet {gare_depart} - {gare_arrivee} du " +
      "{date} a été modifié.\n\n" +
      "Nouvel horaire : départ à {nouvelle_heure} au lieu de {heure}.\n\n" +
      "Nous vous remercions de votre compréhension.\n\n" +
      "Cordialement,\nService Voyageurs",
  },
  {
    id: 5,
    title: "Remboursement / dédommagement",
    subject: "Votre demande de remboursement - dossier n°{numero_dossier}",
    body:
      "Bonjour {nom_client},\n\n" +
      "Suite à votre demande concernant le trajet {gare_depart} - " +
      "{gare_arrivee} du {date}, nous vous informons qu'un " +
      "remboursement de {montant} va être effectué sur votre moyen de " +
      "paiement d'origine sous quelques jours.\n\n" +
      "Votre numéro de dossier est le {numero_dossier}.\n\n" +
      "Cordialement,\nService Relation Client",
  },
  {
    id: 6,
    title: "Accusé de réception de réclamation",
    subject: "Accusé de réception de votre réclamation - dossier n°{numero_dossier}",
    body:
      "Bonjour {nom_client},\n\n" +
      "Nous accusons réception de votre réclamation concernant : " +
      "{motif}.\n\n" +
      "Votre dossier a été enregistré sous le numéro {numero_dossier} " +
      "et est actuellement en cours de traitement. Nous reviendrons " +
      "vers vous dans les meilleurs délais.\n\n" +
      "Cordialement,\nService Relation Client",
  },
  {
    id: 7,
    title: "Travaux sur la ligne",
    subject: "Information travaux sur la ligne {ligne}",
    body:
      "Bonjour {nom_client},\n\n" +
      "Des travaux sont programmés sur la ligne {ligne} durant la " +
      "période suivante : {periode_travaux}.\n\n" +
      "Cela peut entraîner des perturbations sur votre trajet " +
      "{gare_depart} - {gare_arrivee}. Nous vous invitons à vérifier " +
      "vos horaires avant votre déplacement.\n\n" +
      "Cordialement,\nService Information Voyageurs",
  },
  {
    id: 8,
    title: "Convocation / rendez-vous",
    subject: "Convocation - rendez-vous du {date_rdv}",
    body:
      "Bonjour {nom_client},\n\n" +
      "Nous vous invitons à vous présenter le {date_rdv} à " +
      "{heure_rdv}, à l'adresse suivante : {lieu_rdv}, concernant : " +
      "{motif}.\n\n" +
      "Merci de vous munir d'une pièce d'identité.\n\n" +
      "Cordialement,\nService Administratif",
  },
  {
    id: 9,
    title: "Rappel de paiement (facture fret)",
    subject: "Rappel : facture n°{numero_facture} à échéance",
    body:
      "Bonjour {nom_client},\n\n" +
      "Nous vous informons que la facture n°{numero_facture}, d'un " +
      "montant de {montant}, arrive à échéance le {date_echeance}.\n\n" +
      "Nous vous remercions de bien vouloir procéder au règlement " +
      "dans les meilleurs délais.\n\n" +
      "Cordialement,\nService Facturation Fret",
  },
  {
    id: 10,
    title: "Remerciement client",
    subject: "Merci pour votre confiance",
    body:
      "Bonjour {nom_client},\n\n" +
      "Nous tenions à vous remercier d'avoir voyagé avec nous le " +
      "{date} sur le trajet {gare_depart} - {gare_arrivee}.\n\n" +
      "Au plaisir de vous accueillir de nouveau à bord.\n\n" +
      "Cordialement,\nService Voyageurs",
  },
  {
    id: 11,
    title: "Avertissement / blâme (RH)",
    subject: "Avertissement disciplinaire — {nom_employe}",
    body:
      "Bonjour {nom_employe},\n\n" +
      "Par la présente, la Direction des Ressources Humaines de Townsend " +
      "Transit Express vous notifie un avertissement disciplinaire " +
      "concernant votre comportement du {date_incident}.\n\n" +
      "Motif : {motif}.\n\n" +
      "Faits reprochés : {details_faits}\n\n" +
      "Ce comportement est contraire au règlement intérieur de " +
      "l'entreprise et aux procédures GCOR en vigueur. Nous vous " +
      "demandons de veiller strictement au respect des consignes de " +
      "service à l'avenir.\n\n" +
      "En l'absence d'amélioration constatée, ou en cas de récidive, " +
      "des mesures disciplinaires plus sévères pourront être engagées, " +
      "pouvant aller jusqu'à la suspension ou la fin de contrat.\n\n" +
      "Votre supérieur hiérarchique, {nom_superieur}, a été mis en " +
      "copie de ce courrier et reste à votre disposition pour en " +
      "discuter.\n\n" +
      "Cordialement,\nDirection des Ressources Humaines\nTownsend Transit Express",
  },
];

// Libellés plus lisibles pour les champs à saisir (sinon le nom brut du
// placeholder est utilisé, ex : "nom_client").
export const MAIL_TEMPLATE_LABELS: Record<string, string> = {
  nom_client: "Nom du client",
  numero_train: "Numéro du train",
  gare_depart: "Gare de départ",
  gare_arrivee: "Gare d'arrivée",
  date: "Date",
  heure: "Heure",
  nouvelle_heure: "Nouvelle heure",
  duree_retard: "Durée du retard",
  motif: "Motif",
  numero_dossier: "Numéro de dossier",
  numero_reservation: "Numéro de réservation",
  montant: "Montant",
  ligne: "Ligne concernée",
  periode_travaux: "Période des travaux",
  date_rdv: "Date du rendez-vous",
  heure_rdv: "Heure du rendez-vous",
  lieu_rdv: "Lieu du rendez-vous",
  numero_facture: "Numéro de facture",
  date_echeance: "Date d'échéance",
  nom_employe: "Nom de l'employé",
  date_incident: "Date de l'incident",
  details_faits: "Détail des faits reprochés",
  nom_superieur: "Nom du supérieur hiérarchique",
};

export function getMailTemplate(id: number): MailTemplate | undefined {
  return MAIL_TEMPLATES.find((t) => t.id === id);
}

/** Renvoie les {placeholders} d'un modèle (objet + corps combinés), dans l'ordre, sans doublon. */
export function getTemplatePlaceholders(template: MailTemplate): string[] {
  const combined = `${template.subject}\n${template.body}`;
  const found = combined.match(/\{(\w+)\}/g) ?? [];
  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const raw of found) {
    const key = raw.slice(1, -1);
    if (!seen.has(key)) {
      seen.add(key);
      ordered.push(key);
    }
  }
  return ordered;
}

export function labelFor(placeholder: string): string {
  return MAIL_TEMPLATE_LABELS[placeholder] ?? placeholder.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
}

/** Remplace les {placeholders} d'un modèle par les valeurs saisies (vide -> placeholder laissé tel quel). */
export function fillTemplate(template: MailTemplate, values: Record<string, string>): { subject: string; body: string } {
  const apply = (text: string) =>
    text.replace(/\{(\w+)\}/g, (match, key: string) => {
      const v = values[key];
      return v && v.trim() ? v.trim() : match;
    });
  return { subject: apply(template.subject), body: apply(template.body) };
}
