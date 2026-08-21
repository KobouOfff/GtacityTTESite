import { useEffect, useMemo, useState } from "react";
import { T } from "@/components/T";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  LINE_META,
  LINE_PATHS,
  MAP_STATIONS,
  STATION_POS,
  HUB_SLUGS,
  type LineCode,
} from "@/lib/network-map-data";

type TrafficRecord = {
  line: string;
  severity: string;
  title: string;
  message: string;
  until: string;
};

const VIEW_W = 1000;
const VIEW_H = 620;

/** True if a station is the first or last stop of at least one of its lines (i.e. a terminus). */
function isTerminus(slug: string, mapLines: LineCode[]): boolean {
  return mapLines.some((code) => {
    const path = LINE_PATHS[code];
    return path[0] === slug || path[path.length - 1] === slug;
  });
}

function pointsFor(code: LineCode): string {
  return LINE_PATHS[code]
    .map((slug) => STATION_POS[slug])
    .filter(Boolean)
    .map((p) => `${p.x},${p.y}`)
    .join(" ");
}

export default function NetworkMap() {
  const { t } = useLanguage();
  const [hovered, setHovered] = useState<string | null>(null);
  const [activeLine, setActiveLine] = useState<LineCode | null>(null);
  const [disrupted, setDisrupted] = useState<Record<string, TrafficRecord[]>>({});

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch("/api/traffic", { cache: "no-store" });
        const json = await res.json();
        if (!mounted || !res.ok || !json.ok) return;
        const now = Date.now();
        const byLine: Record<string, TrafficRecord[]> = {};
        for (const record of json.records as TrafficRecord[]) {
          if (!record.line || record.line === "BUS") continue;
          if (record.severity !== "warn" && record.severity !== "alert") continue;
          if (record.until && new Date(record.until).getTime() < now) continue;
          (byLine[record.line] ||= []).push(record);
        }
        setDisrupted(byLine);
      } catch {
        // silent — the map still works without live status
      }
    };
    load();
    const timer = window.setInterval(load, 30000);
    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, []);

  const lineCodes = useMemo(() => Object.keys(LINE_META) as LineCode[], []);
  const hoveredStation = hovered ? MAP_STATIONS.find((s) => s.slug === hovered) : null;
  const hoveredPos = hoveredStation?.pos;

  const isLineDimmed = (code: LineCode) => activeLine !== null && activeLine !== code;
  const isStationDimmed = (mapLines: LineCode[]) =>
    activeLine !== null && !mapLines.includes(activeLine);

  return (
    <>
      <div className="mapview" style={{ position: "relative" }}>
        <svg
          className="netmap"
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label={t("Plan interactif du réseau TTE", "Interactive map of the TTE network")}
        >
          <rect width={VIEW_W} height={VIEW_H} fill="#F7FAFD" />
          <g opacity=".5" stroke="#E2EAF3" strokeWidth="1">
            <line x1="0" y1="155" x2={VIEW_W} y2="155" />
            <line x1="0" y1="310" x2={VIEW_W} y2="310" />
            <line x1="0" y1="465" x2={VIEW_W} y2="465" />
            <line x1="250" y1="0" x2="250" y2={VIEW_H} />
            <line x1="500" y1="0" x2="500" y2={VIEW_H} />
            <line x1="750" y1="0" x2="750" y2={VIEW_H} />
          </g>

          {/* ===== lines ===== */}
          {lineCodes.map((code) => {
            const meta = LINE_META[code];
            const isDisrupted = !!disrupted[code]?.length;
            return (
              <polyline
                key={code}
                points={pointsFor(code)}
                fill="none"
                stroke={isDisrupted ? "var(--alert)" : `var(${meta.cssVar})`}
                strokeWidth={activeLine === code ? 5.5 : 3.4}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={isDisrupted ? "8 6" : meta.dash}
                opacity={isLineDimmed(code) ? 0.15 : 1}
                style={{ transition: "opacity .18s, stroke-width .18s" }}
                className={isDisrupted ? "netmap-line-disrupted" : undefined}
              />
            );
          })}

          {/* ===== stations ===== */}
          {MAP_STATIONS.map((station) => {
            const isHub = HUB_SLUGS.has(station.slug);
            const dimmed = isStationDimmed(station.mapLines);
            const isMulti = station.mapLines.length > 1;
            const r = isHub ? 12 : isMulti ? 7 : 5;
            const primaryColor = `var(${LINE_META[station.mapLines[0]]?.cssVar ?? "--navy"})`;
            return (
              <a
                key={station.slug}
                href={`/gares/${station.slug}`}
                aria-label={`${station.shortName} — ${t("voir la gare", "view station")}`}
                onMouseEnter={() => setHovered(station.slug)}
                onMouseLeave={() => setHovered((h) => (h === station.slug ? null : h))}
                onFocus={() => setHovered(station.slug)}
                onBlur={() => setHovered((h) => (h === station.slug ? null : h))}
                style={{ cursor: "pointer" }}
              >
                {/* generous invisible hit-area for easier hover/tap */}
                <circle cx={station.pos.x} cy={station.pos.y} r={16} fill="transparent" />
                <circle
                  cx={station.pos.x}
                  cy={station.pos.y}
                  r={r}
                  fill={isMulti || isHub ? "#fff" : "#F7FAFD"}
                  stroke={isMulti || isHub ? "var(--navy)" : primaryColor}
                  strokeWidth={isHub ? 3.4 : 2.6}
                  opacity={dimmed ? 0.2 : 1}
                  style={{ transition: "opacity .18s, r .18s" }}
                />
                {isHub && (
                  <circle
                    cx={station.pos.x}
                    cy={station.pos.y}
                    r={4}
                    fill="var(--navy)"
                    opacity={dimmed ? 0.2 : 1}
                  />
                )}
                {hovered === station.slug && (
                  <circle
                    cx={station.pos.x}
                    cy={station.pos.y}
                    r={r + 6}
                    fill="none"
                    stroke="var(--navy)"
                    strokeWidth="1.4"
                    opacity=".5"
                  />
                )}
              </a>
            );
          })}

          {/* ===== labels for hubs & termini ===== */}
          <g fontFamily="'Libre Franklin',sans-serif" fontWeight="700" fontSize="13" fill="#16202E">
            {MAP_STATIONS.filter((s) => HUB_SLUGS.has(s.slug) || isTerminus(s.slug, s.mapLines))
              .map((s) => (
                <text
                  key={s.slug}
                  x={s.pos.x}
                  y={s.pos.y + (s.pos.y > VIEW_H / 2 ? -16 : 24)}
                  textAnchor="middle"
                  opacity={isStationDimmed(s.mapLines) ? 0.25 : 1}
                >
                  {s.shortName}
                </text>
              ))}
          </g>

          <text x="18" y={VIEW_H - 14} fontFamily="'Source Sans 3',sans-serif" fontSize="11" fill="#9FB0C2">
            <tspan className="i18n-fr">{`Schéma non contractuel · ${lineCodes.length} lignes · cliquez une gare pour ses horaires`}</tspan>
            <tspan className="i18n-en">{`Not to scale · ${lineCodes.length} lines · click a station for its timetable`}</tspan>
          </text>
        </svg>

        {hoveredStation && hoveredPos && (
          <div
            className="netmap-tooltip"
            style={{
              position: "absolute",
              left: `${(hoveredPos.x / VIEW_W) * 100}%`,
              top: `${(hoveredPos.y / VIEW_H) * 100}%`,
              transform: "translate(-50%, -130%)",
              pointerEvents: "none",
            }}
          >
            <b>{hoveredStation.shortName}</b>
            <div className="netmap-tooltip-lines">
              {hoveredStation.mapLines.map((code) => (
                <span key={code} className="line-pill" style={{ background: `var(${LINE_META[code].cssVar})` }}>
                  {code}
                </span>
              ))}
            </div>
            {hoveredStation.mapLines.some((code) => disrupted[code]?.length) ? (
              <div className="netmap-tooltip-alert">
                <T fr="⚠ Perturbation en cours" en="⚠ Service disruption" />
              </div>
            ) : (
              <div className="netmap-tooltip-cta">
                <T fr="Voir les horaires →" en="See timetables →" />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="maplegend">
        {lineCodes.map((code) => {
          const meta = LINE_META[code];
          const isDisrupted = !!disrupted[code]?.length;
          const selected = activeLine === code;
          return (
            <button
              key={code}
              type="button"
              className={`leg leg-btn${selected ? " leg-active" : ""}`}
              onClick={() => setActiveLine((cur) => (cur === code ? null : code))}
              aria-pressed={selected}
            >
              <span className="ll" style={{ background: isDisrupted ? "var(--alert)" : `var(${meta.cssVar})` }}></span>
              {code} · <T fr={meta.labelFr} en={meta.labelEn} />
              {isDisrupted && <span className="netmap-legend-warn" title={t("Perturbation", "Disruption")}>!</span>}
            </button>
          );
        })}
        {activeLine && (
          <button type="button" className="leg leg-btn leg-reset" onClick={() => setActiveLine(null)}>
            <T fr="✕ Réinitialiser" en="✕ Reset" />
          </button>
        )}
      </div>
    </>
  );
}
