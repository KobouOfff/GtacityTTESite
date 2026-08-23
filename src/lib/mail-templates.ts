// Modèles de mails prédéfinis (compagnie ferroviaire), utilisés par le
// composeur de la messagerie web (MailPanel). Port de
// bot_discord/mail_templates.py — garder les deux fichiers alignés si l'un
// des deux évolue (mêmes modèles, mêmes libellés).
//
// La messagerie sert avant tout aux communications internes entre employés
// (RH, service, sécurité, planning...) : c'est environ 90% des usages
// réels. Les échanges avec des clients externes restent minoritaires
// (~10%). La liste ci-dessous reflète cette répartition : une majorité de
// modèles internes, et une poignée de modèles orientés client pour les cas
// les plus courants (retard, remboursement).
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
  // ---------------------------------------------------------------------
  // Modèles internes (RH / service / sécurité) — usage majoritaire.
  // ---------------------------------------------------------------------
  {
    id: 1,
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
  {
    id: 2,
    title: "Convocation entretien (RH)",
    subject: "Convocation - entretien du {date_rdv}",
    body:
      "Bonjour {nom_employe},\n\n" +
      "Nous vous invitons à vous présenter le {date_rdv} à " +
      "{heure_rdv}, à l'adresse suivante : {lieu_rdv}, concernant : " +
      "{motif}.\n\n" +
      "Merci de vous munir d'une pièce d'identité et de votre badge " +
      "employé.\n\n" +
      "Cordialement,\nDirection des Ressources Humaines\nTownsend Transit Express",
  },
  {
    id: 3,
    title: "Confirmation d'embauche",
    subject: "Confirmation d'embauche — {nom_employe}",
    body:
      "Bonjour {nom_employe},\n\n" +
      "Nous avons le plaisir de vous confirmer votre embauche au poste " +
      "de {poste}, au sein du service {service}, à compter du " +
      "{date_prise_poste}.\n\n" +
      "Votre supérieur hiérarchique direct sera {nom_superieur}. Une " +
      "session d'accueil et de formation vous sera communiquée " +
      "prochainement.\n\n" +
      "Bienvenue chez Townsend Transit Express.\n\n" +
      "Cordialement,\nDirection des Ressources Humaines\nTownsend Transit Express",
  },
  {
    id: 4,
    title: "Changement d'affectation / mutation",
    subject: "Changement d'affectation — {nom_employe}",
    body:
      "Bonjour {nom_employe},\n\n" +
      "Nous vous informons qu'à compter du {date_effet}, vous serez " +
      "affecté(e) au service {service}, sous la responsabilité de " +
      "{nom_superieur}.\n\n" +
      "Motif : {motif}.\n\n" +
      "Merci de vous rapprocher de votre nouveau responsable pour " +
      "organiser votre prise de poste.\n\n" +
      "Cordialement,\nDirection des Ressources Humaines\nTownsend Transit Express",
  },
  {
    id: 5,
    title: "Promotion / changement de grade",
    subject: "Promotion — {nom_employe}",
    body:
      "Bonjour {nom_employe},\n\n" +
      "Nous vous informons que, suite à votre engagement au sein de " +
      "l'entreprise, vous êtes promu(e) au grade de {nouveau_grade} au " +
      "sein du service {service}, à compter du {date_effet}.\n\n" +
      "Toutes nos félicitations pour cette évolution.\n\n" +
      "Cordialement,\nDirection des Ressources Humaines\nTownsend Transit Express",
  },
  {
    id: 6,
    title: "Fin de période d'essai / titularisation",
    subject: "Titularisation — {nom_employe}",
    body:
      "Bonjour {nom_employe},\n\n" +
      "Votre période d'essai au poste de {poste} s'achevant le " +
      "{date_fin_essai}, nous vous confirmons votre titularisation au " +
      "sein du service {service}.\n\n" +
      "Nous vous remercions pour votre implication et vous souhaitons " +
      "une pleine réussite dans vos fonctions.\n\n" +
      "Cordialement,\nDirection des Ressources Humaines\nTownsend Transit Express",
  },
  {
    id: 7,
    title: "Demande de congé — réponse",
    subject: "Réponse à votre demande de congé du {date_debut} au {date_fin}",
    body:
      "Bonjour {nom_employe},\n\n" +
      "Nous accusons réception de votre demande de congé du " +
      "{date_debut} au {date_fin}.\n\n" +
      "Décision : {decision}.\n\n" +
      "{commentaire}\n\n" +
      "Cordialement,\nDirection des Ressources Humaines\nTownsend Transit Express",
  },
  {
    id: 8,
    title: "Planning de service / affectation d'horaires",
    subject: "Votre planning de service — semaine du {date_debut}",
    body:
      "Bonjour {nom_employe},\n\n" +
      "Voici votre planning de service pour la semaine du {date_debut} " +
      "au sein du service {service} :\n\n" +
      "{details_planning}\n\n" +
      "Merci de vous présenter à votre poste 15 minutes avant chaque " +
      "prise de service. Pour toute indisponibilité, contactez votre " +
      "supérieur hiérarchique dans les meilleurs délais.\n\n" +
      "Cordialement,\n{nom_superieur}\nService {service}",
  },
  {
    id: 9,
    title: "Convocation à une formation",
    subject: "Convocation formation — {intitule_formation}",
    body:
      "Bonjour {nom_employe},\n\n" +
      "Vous êtes convoqué(e) à la formation « {intitule_formation} », " +
      "qui se déroulera le {date_rdv} à {heure_rdv}, à l'adresse " +
      "suivante : {lieu_rdv}.\n\n" +
      "Cette formation est obligatoire dans le cadre des procédures " +
      "GCOR en vigueur. Merci de confirmer votre présence auprès de " +
      "votre supérieur hiérarchique.\n\n" +
      "Cordialement,\nService Formation\nTownsend Transit Express",
  },
  {
    id: 10,
    title: "Rappel de procédure de sécurité (GCOR)",
    subject: "Rappel de procédure de sécurité — {sujet_procedure}",
    body:
      "Bonjour {nom_employe},\n\n" +
      "Suite à {motif}, nous tenons à vous rappeler la procédure de " +
      "sécurité en vigueur concernant : {sujet_procedure}.\n\n" +
      "{details_faits}\n\n" +
      "Le respect strict des procédures GCOR est indispensable à la " +
      "sécurité de tous. Nous vous remercions d'y veiller.\n\n" +
      "Cordialement,\nService Sécurité\nTownsend Transit Express",
  },
  {
    id: 11,
    title: "Rapport d'incident interne",
    subject: "Rapport d'incident — {date_incident}",
    body:
      "Bonjour {nom_superieur},\n\n" +
      "Je vous transmets un rapport d'incident survenu le " +
      "{date_incident}, concernant : {motif}.\n\n" +
      "Détail des faits : {details_faits}\n\n" +
      "Je reste disponible pour tout complément d'information.\n\n" +
      "Cordialement,\n{nom_employe}\nService {service}",
  },
  {
    id: 12,
    title: "Demande de matériel / équipement",
    subject: "Demande de matériel — {nom_employe}",
    body:
      "Bonjour,\n\n" +
      "Je sollicite l'attribution du matériel suivant dans le cadre de " +
      "mes fonctions au sein du service {service} : {materiel_demande}.\n\n" +
      "Motif : {motif}.\n\n" +
      "Merci de votre retour.\n\n" +
      "Cordialement,\n{nom_employe}",
  },
  {
    id: 13,
    title: "Note de service / annonce interne",
    subject: "Note de service — {sujet_procedure}",
    body:
      "Bonjour à toutes et à tous,\n\n" +
      "Nous vous informons de ce qui suit concernant le service " +
      "{service} :\n\n" +
      "{details_faits}\n\n" +
      "Prise d'effet : {date_effet}.\n\n" +
      "Merci de prendre connaissance de cette note et de la respecter.\n\n" +
      "Cordialement,\nDirection\nTownsend Transit Express",
  },
  // ---------------------------------------------------------------------
  // Modèles orientés client — usage minoritaire, cas les plus fréquents.
  // ---------------------------------------------------------------------
  {
    id: 14,
    title: "Retard / annulation de train (client)",
    subject: "Information : perturbation du train {numero_train}",
    body:
      "Bonjour {nom_client},\n\n" +
      "Nous vous informons que le train {numero_train} au départ de " +
      "{gare_depart} à destination de {gare_arrivee}, prévu le {date} " +
      "à {heure}, est {statut} ({details_faits}).\n\n" +
      "Nous vous prions de nous excuser pour la gêne occasionnée et " +
      "restons à votre disposition pour toute information.\n\n" +
      "Cordialement,\nService Voyageurs",
  },
  {
    id: 15,
    title: "Remboursement / dédommagement (client)",
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
];

// Libellés plus lisibles pour les champs à saisir (sinon le nom brut du
// placeholder est utilisé, ex : "nom_client").
export const MAIL_TEMPLATE_LABELS: Record<string, string> = {
  // Interne / RH / service
  nom_employe: "Nom de l'employé",
  nom_superieur: "Nom du supérieur hiérarchique",
  date_incident: "Date de l'incident",
  details_faits: "Détail des faits",
  motif: "Motif",
  date_rdv: "Date du rendez-vous",
  heure_rdv: "Heure du rendez-vous",
  lieu_rdv: "Lieu du rendez-vous",
  poste: "Poste",
  service: "Service",
  date_prise_poste: "Date de prise de poste",
  date_effet: "Date d'effet",
  nouveau_grade: "Nouveau grade",
  date_fin_essai: "Date de fin de période d'essai",
  date_debut: "Date de début",
  date_fin: "Date de fin",
  decision: "Décision (accordé / refusé)",
  commentaire: "Commentaire",
  details_planning: "Détail du planning",
  intitule_formation: "Intitulé de la formation",
  sujet_procedure: "Sujet de la procédure",
  materiel_demande: "Matériel demandé",
  // Client
  nom_client: "Nom du client",
  numero_train: "Numéro du train",
  gare_depart: "Gare de départ",
  gare_arrivee: "Gare d'arrivée",
  date: "Date",
  heure: "Heure",
  statut: "Statut (retardé / annulé...)",
  numero_dossier: "Numéro de dossier",
  montant: "Montant",
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
