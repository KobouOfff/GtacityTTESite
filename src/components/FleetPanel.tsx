import { useEffect, useState } from "react";
import { useCurrentUser } from "./DiscordAuth";
import { canEditFleet } from "@/lib/discord-roles";

type Unit = {
  id: string;
  num: string;
  type: string;
  mod: string;
  aff: string;
  fuel: number;
  ins: string;
  st: "En service" | "Inspection due" | "Maintenance" | "Bad-order";
};

const KEY = "tte_fleet_state";

const DEFAULT: Unit[] = [
  { id: "u1", num: "TTE-3041", type: "Loco diesel", mod: "GE P42DC", aff: "IC2 → Nashville", fuel: 82, ins: "12 juil. 2026", st: "En service" },
  { id: "u2", num: "TTE-3042", type: "Loco diesel", mod: "GE P42DC", aff: "IC1 → Chattanooga", fuel: 45, ins: "02 juil. 2026", st: "Inspection due" },
  { id: "u3", num: "TTE-3043", type: "Loco diesel", mod: "Siemens SC-44 Charger", aff: "Réserve Townsend", fuel: 100, ins: "22 juil. 2026", st: "En service" },
  { id: "u4", num: "TTE-2201", type: "Automotrice", mod: "Stadler FLIRT DMU", aff: "R1 Sevierville", fuel: 73, ins: "28 juil. 2026", st: "En service" },
  { id: "u5", num: "TTE-2202", type: "Automotrice", mod: "Stadler FLIRT DMU", aff: "R2 Maryville", fuel: 66, ins: "30 juil. 2026", st: "En service" },
  { id: "u6", num: "TTE-2203", type: "Automotrice", mod: "Stadler FLIRT DMU", aff: "R4 Chattanooga", fuel: 31, ins: "04 juil. 2026", st: "Inspection due" },
  { id: "u7", num: "TTE-2204", type: "Automotrice", mod: "Stadler FLIRT DMU", aff: "Atelier — bogie", fuel: 0, ins: "—", st: "Bad-order" },
  { id: "u8", num: "TTE-1801", type: "Train urbain", mod: "CAF Urbos T3", aff: "T · Hôpital TMC", fuel: 88, ins: "18 juil. 2026", st: "En service" },
  { id: "u9", num: "TTE-1802", type: "Train urbain", mod: "CAF Urbos T3", aff: "T · réserve", fuel: 100, ins: "20 juil. 2026", st: "En service" },
  { id: "u10", num: "TTE-1803", type: "Train urbain", mod: "CAF Urbos T3", aff: "Atelier — climatisation", fuel: 50, ins: "—", st: "Maintenance" },
];

const STATUSES: Unit["st"][] = ["En service", "Inspection due", "Maintenance", "Bad-order"];

function load(): Unit[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT;
    return JSON.parse(raw);
  } catch {
    return DEFAULT;
  }
}

function statusColors(st: Unit["st"]) {
  if (/service/i.test(st)) return { col: "var(--ok)", bg: "var(--ok-bg)" };
  if (/Bad/i.test(st)) return { col: "var(--alert)", bg: "var(--alert-bg)" };
  return { col: "#8A5A12", bg: "var(--warn-bg)" };
}
function fuelColor(f: number) {
  return f < 40 ? "var(--alert)" : f < 70 ? "#8A5A12" : "var(--ok)";
}

export default function FleetPanel() {
  const { data: user } = useCurrentUser();
  const canEdit = canEditFleet(user ?? null);
  const [fleet, setFleet] = useState<Unit[]>(DEFAULT);
  const [editing, setEditing] = useState(false);

  useEffect(() => { setFleet(load()); }, []);

  function persist(next: Unit[]) {
    setFleet(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  }
  function update(id: string, patch: Partial<Unit>) {
    persist(fleet.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  }
  function remove(id: string) {
    if (!confirm("Retirer cette unité de la flotte ?")) return;
    persist(fleet.filter((u) => u.id !== id));
  }
  function add() {
    persist([
      ...fleet,
      { id: "u" + Date.now(), num: "TTE-XXXX", type: "Automotrice", mod: "—", aff: "—", fuel: 100, ins: "—", st: "En service" },
    ]);
  }
  function reset() {
    if (!confirm("Réinitialiser la flotte ?")) return;
    localStorage.removeItem(KEY);
    setFleet(DEFAULT);
  }

  const iS = fleet.filter((u) => /service/i.test(u.st)).length;
  const mA = fleet.filter((u) => /Maintenance|Inspection/i.test(u.st)).length;
  const hS = fleet.filter((u) => /Bad/i.test(u.st)).length;
  const dueSoon = fleet.filter((u) => /Inspection due/i.test(u.st)).length;

  const inp: React.CSSProperties = {
    width: "100%", padding: "3px 5px", fontSize: 12, borderRadius: 4,
    border: "1px solid rgba(255,255,255,0.15)", background: "rgba(0,0,0,0.25)", color: "inherit",
  };

  return (
    <section className="view" id="v-fleet">
      <h1 className="vt">Flotte &amp; matériel roulant</h1>
      <p className="vt-sub">
        État en temps réel de la flotte TTE — locomotives diesel-électriques et automotrices. Suivi kilométrage, carburant, prochaine inspection FRA (Blue Card 92-day).
      </p>

      {canEdit && (
        <div className="btn-row" style={{ marginBottom: 12 }}>
          <button className="btn" onClick={() => setEditing((e) => !e)}>
            {editing ? "✓ Terminer l'édition" : "✎ Modifier la flotte"}
          </button>
          {editing && <button className="btn" onClick={add}>+ Ajouter une unité</button>}
          {editing && <button className="btn ghost" onClick={reset}>↺ Réinitialiser</button>}
        </div>
      )}

      <div className="kpis">
        <div className="kpi"><span className="lab">En service</span><div className="v">{iS}</div><div className="d">unités actives</div><span className="badge">OK</span></div>
        <div className="kpi warn"><span className="lab">Maintenance</span><div className="v">{mA}</div><div className="d">atelier Townsend</div><span className="badge">À suivre</span></div>
        <div className="kpi alert"><span className="lab">Hors service</span><div className="v">{hS}</div><div className="d">bad order</div><span className="badge">Bad-order</span></div>
        <div className="kpi"><span className="lab">Inspection ≤ 7 j</span><div className="v">{dueSoon}</div><div className="d">Blue Card à renouveler</div></div>
      </div>

      <div className="card">
        <h2>Parc TTE</h2>
        <div style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>N°</th><th>Type</th><th>Modèle</th><th>Affecté à</th>
                <th>Carburant</th><th>Prochaine inspection</th><th>Statut</th>
                {editing && canEdit && <th></th>}
              </tr>
            </thead>
            <tbody>
              {fleet.map((u) => {
                const sc = statusColors(u.st);
                const fc = fuelColor(u.fuel);
                if (editing && canEdit) {
                  return (
                    <tr key={u.id}>
                      <td><input style={inp} value={u.num} onChange={(e) => update(u.id, { num: e.target.value })} /></td>
                      <td><input style={inp} value={u.type} onChange={(e) => update(u.id, { type: e.target.value })} /></td>
                      <td><input style={inp} value={u.mod} onChange={(e) => update(u.id, { mod: e.target.value })} /></td>
                      <td><input style={inp} value={u.aff} onChange={(e) => update(u.id, { aff: e.target.value })} /></td>
                      <td style={{ minWidth: 90 }}>
                        <input type="number" min={0} max={100} style={inp} value={u.fuel}
                          onChange={(e) => update(u.id, { fuel: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })} />
                      </td>
                      <td><input style={inp} value={u.ins} onChange={(e) => update(u.id, { ins: e.target.value })} placeholder="12 juil. 2026" /></td>
                      <td>
                        <select style={inp} value={u.st} onChange={(e) => update(u.id, { st: e.target.value as Unit["st"] })}>
                          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td><button className="btn danger sm" onClick={() => remove(u.id)}>×</button></td>
                    </tr>
                  );
                }
                return (
                  <tr key={u.id}>
                    <td style={{ fontFamily: "var(--ff-mono)", fontWeight: 700 }}>{u.num}</td>
                    <td>{u.type}</td>
                    <td>{u.mod}</td>
                    <td>{u.aff}</td>
                    <td>
                      <b style={{ color: fc, fontFamily: "var(--ff-mono)" }}>{u.fuel}%</b>
                      <div style={{ height: 4, background: "var(--line-2)", borderRadius: 99, marginTop: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${u.fuel}%`, background: fc }} />
                      </div>
                    </td>
                    <td style={{ fontFamily: "var(--ff-mono)", fontSize: 12.5 }}>{u.ins}</td>
                    <td>
                      <span style={{ background: sc.bg, color: sc.col, fontWeight: 700, fontSize: 12, padding: "3px 8px", borderRadius: 6 }}>
                        {u.st}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
