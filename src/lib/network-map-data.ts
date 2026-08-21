import { PUBLIC_STATIONS, stationBySlug } from "@/lib/public-stations";

/** Schematic (non-geographic) coordinates for each station, in a 1000×620 SVG viewBox. */
export const STATION_POS: Record<string, { x: number; y: number }> = {
  townsend: { x: 150, y: 320 },
  "quartier-arlington": { x: 55, y: 368 },
  "hopital-tmc": { x: 92, y: 452 },

  maryville: { x: 236, y: 340 },
  alcoa: { x: 302, y: 322 },
  knoxville: { x: 382, y: 298 },
  "strawberry-plains": { x: 472, y: 262 },
  mascot: { x: 556, y: 232 },

  "pigeon-forge": { x: 236, y: 196 },
  sevierville: { x: 306, y: 148 },

  "jefferson-city": { x: 466, y: 204 },
  morristown: { x: 556, y: 164 },
  greeneville: { x: 648, y: 128 },

  "lenoir-city": { x: 406, y: 380 },
  sweetwater: { x: 436, y: 446 },
  athens: { x: 470, y: 496 },
  cleveland: { x: 520, y: 538 },
  chattanooga: { x: 582, y: 570 },

  "oak-ridge": { x: 482, y: 326 },
  crossville: { x: 602, y: 346 },
  cookeville: { x: 722, y: 320 },
  lebanon: { x: 832, y: 280 },
  nashville: { x: 922, y: 228 },
};

export type LineCode = "R1" | "R2" | "R3" | "R4" | "IC1" | "IC2" | "T";

/** Ordered list of station slugs that each line runs through, used to draw the schematic route. */
export const LINE_PATHS: Record<LineCode, string[]> = {
  T: ["quartier-arlington", "townsend", "hopital-tmc"],
  R1: ["townsend", "pigeon-forge", "sevierville"],
  R2: ["townsend", "maryville", "alcoa", "knoxville", "strawberry-plains", "mascot"],
  R3: ["knoxville", "jefferson-city", "morristown", "greeneville"],
  R4: ["townsend", "knoxville", "lenoir-city", "sweetwater", "athens", "cleveland", "chattanooga"],
  IC1: ["townsend", "knoxville", "oak-ridge", "crossville", "cookeville", "lebanon", "nashville"],
  IC2: ["townsend", "maryville", "knoxville", "cookeville", "lebanon", "nashville"],
};

export const LINE_META: Record<LineCode, { cssVar: string; labelFr: string; labelEn: string; dash?: string }> = {
  R1: { cssVar: "--l-r1", labelFr: "Vallées des Smokies", labelEn: "Smoky Mountain valleys" },
  R2: { cssVar: "--l-r2", labelFr: "Knoxville", labelEn: "Knoxville" },
  R3: { cssVar: "--l-r3", labelFr: "Est Tennessee", labelEn: "East Tennessee" },
  R4: { cssVar: "--l-r4", labelFr: "Corridor Sud", labelEn: "Southern corridor" },
  IC1: { cssVar: "--l-ic1", labelFr: "InterCité Est-Ouest", labelEn: "East-West Intercity", dash: "10 5" },
  IC2: { cssVar: "--l-ic2", labelFr: "Smoky Express", labelEn: "Smoky Express" },
  T: { cssVar: "--l-t", labelFr: "Ligne T · Train urbain", labelEn: "Line T · Urban train" },
};

export const HUB_SLUGS = new Set(["townsend", "knoxville"]);

/** Every line code that stops at a given station slug. */
export function linesForStation(slug: string): LineCode[] {
  const codes = Object.keys(LINE_PATHS) as LineCode[];
  return codes.filter((code) => LINE_PATHS[code].includes(slug));
}

/** Convenience: full station record + position + lines, for every station on the map. */
export const MAP_STATIONS = PUBLIC_STATIONS.map((station) => ({
  ...station,
  pos: STATION_POS[station.slug] ?? { x: 0, y: 0 },
  mapLines: linesForStation(station.slug) as LineCode[],
})).filter((station) => STATION_POS[station.slug]);

export { stationBySlug };
