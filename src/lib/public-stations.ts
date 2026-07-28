export type PublicStation = {
  slug: string;
  name: string;
  shortName: string;
  description: string;
  address: string;
  lines: string[];
  services: string[];
};

export const PUBLIC_STATIONS: PublicStation[] = [
  { slug: "townsend", name: "Townsend — Gare centrale", shortName: "Townsend", description: "Gare centrale et principal pôle de correspondance du réseau TTE.", address: "Gare centrale de Townsend, Tennessee", lines: ["R1", "R2", "R4", "IC1", "IC2", "T"], services: ["Guichets", "Bornes", "Accessibilité PMR", "Parking", "Accueil voyageurs"] },
  { slug: "quartier-arlington", name: "Quartier Arlington", shortName: "Quartier Arlington", description: "Arrêt urbain de la ligne Townsend desservant le quartier Arlington.", address: "Diger Street, Townsend", lines: ["T"], services: ["Abri", "Accessibilité PMR"] },
  { slug: "hopital-tmc", name: "Hôpital TMC", shortName: "Hôpital TMC", description: "Terminus de la ligne Townsend au centre hospitalier TMC.", address: "Koella Street, Townsend", lines: ["T"], services: ["Accessibilité PMR", "Hôpital à proximité"] },
  { slug: "maryville", name: "Maryville", shortName: "Maryville", description: "Gare régionale entre Townsend, Alcoa et Knoxville.", address: "Maryville, Tennessee", lines: ["R2", "IC2"], services: ["Bornes", "Accessibilité PMR", "Parking"] },
  { slug: "alcoa", name: "Alcoa", shortName: "Alcoa", description: "Desserte régionale de l'agglomération d'Alcoa.", address: "Alcoa, Tennessee", lines: ["R2"], services: ["Bornes", "Accessibilité PMR"] },
  { slug: "knoxville", name: "Knoxville", shortName: "Knoxville", description: "Grande gare de correspondance de l'est du Tennessee.", address: "Knoxville, Tennessee", lines: ["R2", "R3", "R4", "IC1", "IC2"], services: ["Guichets", "Bornes", "Accessibilité PMR", "Parking", "Salle d'attente"] },
  { slug: "pigeon-forge", name: "Pigeon Forge", shortName: "Pigeon Forge", description: "Gare touristique de la ligne R1.", address: "Pigeon Forge, Tennessee", lines: ["R1"], services: ["Bornes", "Accessibilité PMR"] },
  { slug: "sevierville", name: "Sevierville", shortName: "Sevierville", description: "Terminus régional de la ligne R1.", address: "Sevierville, Tennessee", lines: ["R1"], services: ["Bornes", "Accessibilité PMR", "Parking"] },
  { slug: "strawberry-plains", name: "Strawberry Plains", shortName: "Strawberry Plains", description: "Arrêt régional sur l'axe de Mascot.", address: "Strawberry Plains, Tennessee", lines: ["R2"], services: ["Abri", "Accessibilité PMR"] },
  { slug: "mascot", name: "Mascot", shortName: "Mascot", description: "Terminus est de la ligne R2.", address: "Mascot, Tennessee", lines: ["R2"], services: ["Bornes", "Parking"] },
  { slug: "jefferson-city", name: "Jefferson City", shortName: "Jefferson City", description: "Gare de la ligne R3 entre Knoxville et Morristown.", address: "Jefferson City, Tennessee", lines: ["R3"], services: ["Bornes", "Accessibilité PMR"] },
  { slug: "morristown", name: "Morristown", shortName: "Morristown", description: "Gare régionale de la ligne R3.", address: "Morristown, Tennessee", lines: ["R3"], services: ["Bornes", "Parking"] },
  { slug: "greeneville", name: "Greeneville", shortName: "Greeneville", description: "Terminus est de la ligne R3.", address: "Greeneville, Tennessee", lines: ["R3"], services: ["Bornes", "Accessibilité PMR"] },
  { slug: "lenoir-city", name: "Lenoir City", shortName: "Lenoir City", description: "Gare de la ligne R4 au sud de Knoxville.", address: "Lenoir City, Tennessee", lines: ["R4"], services: ["Bornes", "Accessibilité PMR"] },
  { slug: "sweetwater", name: "Sweetwater", shortName: "Sweetwater", description: "Gare régionale de la ligne R4.", address: "Sweetwater, Tennessee", lines: ["R4"], services: ["Bornes", "Parking"] },
  { slug: "athens", name: "Athens", shortName: "Athens", description: "Gare régionale de la ligne R4.", address: "Athens, Tennessee", lines: ["R4"], services: ["Bornes", "Accessibilité PMR"] },
  { slug: "cleveland", name: "Cleveland", shortName: "Cleveland", description: "Dernière gare avant Chattanooga sur la ligne R4.", address: "Cleveland, Tennessee", lines: ["R4"], services: ["Bornes", "Parking"] },
  { slug: "chattanooga", name: "Chattanooga", shortName: "Chattanooga", description: "Terminus sud du réseau TTE.", address: "Chattanooga, Tennessee", lines: ["R4"], services: ["Guichets", "Bornes", "Accessibilité PMR", "Parking"] },
  { slug: "oak-ridge", name: "Oak Ridge", shortName: "Oak Ridge", description: "Gare InterCité de l'axe Nashville.", address: "Oak Ridge, Tennessee", lines: ["IC1"], services: ["Bornes", "Accessibilité PMR"] },
  { slug: "crossville", name: "Crossville", shortName: "Crossville", description: "Gare InterCité du plateau de Cumberland.", address: "Crossville, Tennessee", lines: ["IC1"], services: ["Bornes", "Parking"] },
  { slug: "cookeville", name: "Cookeville", shortName: "Cookeville", description: "Gare commune aux liaisons InterCité vers Nashville.", address: "Cookeville, Tennessee", lines: ["IC1", "IC2"], services: ["Guichets", "Bornes", "Accessibilité PMR"] },
  { slug: "lebanon", name: "Lebanon", shortName: "Lebanon", description: "Dernière gare avant Nashville.", address: "Lebanon, Tennessee", lines: ["IC1", "IC2"], services: ["Bornes", "Accessibilité PMR"] },
  { slug: "nashville", name: "Nashville", shortName: "Nashville", description: "Terminus ouest des lignes InterCité TTE.", address: "Nashville, Tennessee", lines: ["IC1", "IC2"], services: ["Guichets", "Bornes", "Accessibilité PMR", "Correspondances urbaines"] },
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
