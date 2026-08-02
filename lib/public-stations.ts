export type PublicStation = {
  slug: string;
  name: string;
  shortName: string;
  description: string;
  descriptionEn: string;
  address: string;
  lines: string[];
  services: string[];
};

/** English labels for the (French) service tags stored on each station. */
export const SERVICE_LABELS_EN: Record<string, string> = {
  "Guichets": "Ticket counters",
  "Bornes": "Ticket machines",
  "Accessibilité PMR": "Wheelchair accessible",
  "Parking": "Parking",
  "Accueil voyageurs": "Traveller information desk",
  "Abri": "Shelter",
  "Hôpital à proximité": "Hospital nearby",
  "Salle d'attente": "Waiting room",
  "Correspondances urbaines": "Urban connections",
};

export const PUBLIC_STATIONS: PublicStation[] = [
  { slug: "townsend", name: "Townsend — Gare centrale", shortName: "Townsend", description: "Gare centrale et principal pôle de correspondance du réseau TTE.", descriptionEn: "Central station and main interchange hub of the TTE network.", address: "Gare centrale de Townsend, Tennessee", lines: ["R1", "R2", "R4", "IC1", "IC2", "T"], services: ["Guichets", "Bornes", "Accessibilité PMR", "Parking", "Accueil voyageurs"] },
  { slug: "quartier-arlington", name: "Quartier Arlington", shortName: "Quartier Arlington", description: "Arrêt urbain de la ligne Townsend desservant le quartier Arlington.", descriptionEn: "Urban stop on the Townsend line serving the Arlington district.", address: "Diger Street, Townsend", lines: ["T"], services: ["Abri", "Accessibilité PMR"] },
  { slug: "hopital-tmc", name: "Hôpital TMC", shortName: "Hôpital TMC", description: "Terminus de la ligne Townsend au centre hospitalier TMC.", descriptionEn: "Terminus of the Townsend line at the TMC medical centre.", address: "Koella Street, Townsend", lines: ["T"], services: ["Accessibilité PMR", "Hôpital à proximité"] },
  { slug: "maryville", name: "Maryville", shortName: "Maryville", description: "Gare régionale entre Townsend, Alcoa et Knoxville.", descriptionEn: "Regional station between Townsend, Alcoa and Knoxville.", address: "Maryville, Tennessee", lines: ["R2", "IC2"], services: ["Bornes", "Accessibilité PMR", "Parking"] },
  { slug: "alcoa", name: "Alcoa", shortName: "Alcoa", description: "Desserte régionale de l'agglomération d'Alcoa.", descriptionEn: "Regional service for the Alcoa metropolitan area.", address: "Alcoa, Tennessee", lines: ["R2"], services: ["Bornes", "Accessibilité PMR"] },
  { slug: "knoxville", name: "Knoxville", shortName: "Knoxville", description: "Grande gare de correspondance de l'est du Tennessee.", descriptionEn: "Major interchange station in eastern Tennessee.", address: "Knoxville, Tennessee", lines: ["R2", "R3", "R4", "IC1", "IC2"], services: ["Guichets", "Bornes", "Accessibilité PMR", "Parking", "Salle d'attente"] },
  { slug: "pigeon-forge", name: "Pigeon Forge", shortName: "Pigeon Forge", description: "Gare touristique de la ligne R1.", descriptionEn: "Tourist station on the R1 line.", address: "Pigeon Forge, Tennessee", lines: ["R1"], services: ["Bornes", "Accessibilité PMR"] },
  { slug: "sevierville", name: "Sevierville", shortName: "Sevierville", description: "Terminus régional de la ligne R1.", descriptionEn: "Regional terminus of the R1 line.", address: "Sevierville, Tennessee", lines: ["R1"], services: ["Bornes", "Accessibilité PMR", "Parking"] },
  { slug: "strawberry-plains", name: "Strawberry Plains", shortName: "Strawberry Plains", description: "Arrêt régional sur l'axe de Mascot.", descriptionEn: "Regional stop on the Mascot line.", address: "Strawberry Plains, Tennessee", lines: ["R2"], services: ["Abri", "Accessibilité PMR"] },
  { slug: "mascot", name: "Mascot", shortName: "Mascot", description: "Terminus est de la ligne R2.", descriptionEn: "Eastern terminus of the R2 line.", address: "Mascot, Tennessee", lines: ["R2"], services: ["Bornes", "Parking"] },
  { slug: "jefferson-city", name: "Jefferson City", shortName: "Jefferson City", description: "Gare de la ligne R3 entre Knoxville et Morristown.", descriptionEn: "Station on the R3 line between Knoxville and Morristown.", address: "Jefferson City, Tennessee", lines: ["R3"], services: ["Bornes", "Accessibilité PMR"] },
  { slug: "morristown", name: "Morristown", shortName: "Morristown", description: "Gare régionale de la ligne R3.", descriptionEn: "Regional station on the R3 line.", address: "Morristown, Tennessee", lines: ["R3"], services: ["Bornes", "Parking"] },
  { slug: "greeneville", name: "Greeneville", shortName: "Greeneville", description: "Terminus est de la ligne R3.", descriptionEn: "Eastern terminus of the R3 line.", address: "Greeneville, Tennessee", lines: ["R3"], services: ["Bornes", "Accessibilité PMR"] },
  { slug: "lenoir-city", name: "Lenoir City", shortName: "Lenoir City", description: "Gare de la ligne R4 au sud de Knoxville.", descriptionEn: "Station on the R4 line south of Knoxville.", address: "Lenoir City, Tennessee", lines: ["R4"], services: ["Bornes", "Accessibilité PMR"] },
  { slug: "sweetwater", name: "Sweetwater", shortName: "Sweetwater", description: "Gare régionale de la ligne R4.", descriptionEn: "Regional station on the R4 line.", address: "Sweetwater, Tennessee", lines: ["R4"], services: ["Bornes", "Parking"] },
  { slug: "athens", name: "Athens", shortName: "Athens", description: "Gare régionale de la ligne R4.", descriptionEn: "Regional station on the R4 line.", address: "Athens, Tennessee", lines: ["R4"], services: ["Bornes", "Accessibilité PMR"] },
  { slug: "cleveland", name: "Cleveland", shortName: "Cleveland", description: "Dernière gare avant Chattanooga sur la ligne R4.", descriptionEn: "Last station before Chattanooga on the R4 line.", address: "Cleveland, Tennessee", lines: ["R4"], services: ["Bornes", "Parking"] },
  { slug: "chattanooga", name: "Chattanooga", shortName: "Chattanooga", description: "Terminus sud du réseau TTE.", descriptionEn: "Southern terminus of the TTE network.", address: "Chattanooga, Tennessee", lines: ["R4"], services: ["Guichets", "Bornes", "Accessibilité PMR", "Parking"] },
  { slug: "oak-ridge", name: "Oak Ridge", shortName: "Oak Ridge", description: "Gare InterCité de l'axe Nashville.", descriptionEn: "Intercity station on the Nashville axis.", address: "Oak Ridge, Tennessee", lines: ["IC1"], services: ["Bornes", "Accessibilité PMR"] },
  { slug: "crossville", name: "Crossville", shortName: "Crossville", description: "Gare InterCité du plateau de Cumberland.", descriptionEn: "Intercity station on the Cumberland Plateau.", address: "Crossville, Tennessee", lines: ["IC1"], services: ["Bornes", "Parking"] },
  { slug: "cookeville", name: "Cookeville", shortName: "Cookeville", description: "Gare commune aux liaisons InterCité vers Nashville.", descriptionEn: "Shared station for Intercity services to Nashville.", address: "Cookeville, Tennessee", lines: ["IC1", "IC2"], services: ["Guichets", "Bornes", "Accessibilité PMR"] },
  { slug: "lebanon", name: "Lebanon", shortName: "Lebanon", description: "Dernière gare avant Nashville.", descriptionEn: "Last station before Nashville.", address: "Lebanon, Tennessee", lines: ["IC1", "IC2"], services: ["Bornes", "Accessibilité PMR"] },
  { slug: "nashville", name: "Nashville", shortName: "Nashville", description: "Terminus ouest des lignes InterCité TTE.", descriptionEn: "Western terminus of the TTE Intercity lines.", address: "Nashville, Tennessee", lines: ["IC1", "IC2"], services: ["Guichets", "Bornes", "Accessibilité PMR", "Correspondances urbaines"] },
];

export const stationBySlug = (slug: string) =>
  PUBLIC_STATIONS.find((station) => station.slug === slug);

export const stationSlugFromName = (value: string) => {
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s*\(townsend\)\s*/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  if (normalized === "gare-centrale-de-townsend") return "townsend";
  if (normalized === "quartier-residentiel") return "quartier-arlington";
  return normalized;
};
