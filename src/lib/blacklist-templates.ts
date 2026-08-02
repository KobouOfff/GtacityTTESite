/**
 * Pre-written, roleplay-flavored phrases for the blacklist form. Staff can
 * insert one with a click and then tweak the wording instead of writing the
 * whole notice from scratch every time.
 */

export type ReasonTemplate = {
  label: string;
  text: string;
};

export const REASON_TEMPLATES: ReasonTemplate[] = [
  {
    label: "Agression envers un agent",
    text:
      "L'intéressé(e) s'en est pris physiquement à un agent de Townsend Transit Express dans l'exercice de ses fonctions, mettant en cause la sécurité du personnel et des voyageurs présents sur place.",
  },
  {
    label: "Menaces envers le personnel",
    text:
      "Des propos menaçants ont été tenus à l'encontre d'un ou plusieurs agents TTE, créant un climat d'insécurité incompatible avec la présence de l'intéressé(e) au sein du réseau.",
  },
  {
    label: "Dégradation de matériel",
    text:
      "L'intéressé(e) a volontairement dégradé des infrastructures ou du matériel appartenant à Townsend Transit Express, occasionnant des frais de remise en état à la charge de la société.",
  },
  {
    label: "Intrusion en zone interdite",
    text:
      "L'intéressé(e) a pénétré sans autorisation dans une zone d'accès réservé au personnel (voies, ateliers, locaux techniques), en violation manifeste des consignes de sécurité affichées sur site.",
  },
  {
    label: "Fraude / resquille répétée",
    text:
      "Plusieurs contrôles ont établi que l'intéressé(e) voyageait de façon répétée sans titre de transport valide, malgré des rappels à l'ordre antérieurs des agents de contrôle.",
  },
  {
    label: "Trouble à l'ordre public en gare",
    text:
      "Le comportement de l'intéressé(e) en gare (tapage, occupation abusive des espaces, nuisances envers les voyageurs) a nécessité l'intervention des agents de sûreté à plusieurs reprises.",
  },
  {
    label: "Vol en gare ou à bord",
    text:
      "L'intéressé(e) a été identifié(e) comme l'auteur d'un vol commis au préjudice d'un voyageur ou de Townsend Transit Express dans l'enceinte du réseau.",
  },
];

export const INFRACTION_TEMPLATES: string[] = [
  "Voies de fait sur agent TTE",
  "Menaces verbales envers le personnel",
  "Dégradation volontaire de biens TTE",
  "Intrusion en zone technique / voies",
  "Fraude au titre de transport",
  "Trouble à l'ordre public",
  "Vol au préjudice d'un voyageur",
  "Vol au préjudice de TTE",
  "Refus d'obtempérer face aux agents de sûreté",
  "Non-respect d'une interdiction d'accès antérieure",
];
