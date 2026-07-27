import { useEffect, useState } from "react";
import { useCurrentUser } from "./DiscordAuth";
import { canEditWeather } from "@/lib/discord-roles";

type City = { name: string; temp: string; desc: string; badge: string; severity: "ok" | "warn" };
type Alert = { id: string; kind: string; color: string; title: string; message: string; severity: "info" | "warn" | "alert" };

type WeatherState = { cities: City[]; alerts: Alert[] };

const KEY = "tte_weather_state";

const DEFAULT_STATE: WeatherState = {
  cities: [
    { name: "Townsend", temp: "72°F", desc: "Partiellement nuageux", badge: "Clear", severity: "ok" },
    { name: "Knoxville", temp: "74°F", desc: "Ensoleillé", badge: "Clear", severity: "ok" },
    { name: "Chattanooga", temp: "89°F", desc: "Heat advisory — surveiller rail", badge: "Heat", severity: "warn" },
    { name: "Nashville", temp: "78°F", desc: "Orages 40 %", badge: "Watch", severity: "ok" },
  ],
  alerts: [
    {
      id: "a1", kind: "HEAT", color: "var(--warn)", severity: "warn",
      title: "Heat Advisory · Hamilton County TN — jusqu'à 20:00 EDT",
      message: "Températures 89–94 °F. Risque de sun-kink sur voie continue soudée entre Cleveland et Chattanooga (MP 108–142). TSR 40 mph recommandée en après-midi.",
    },
    {
      id: "a2", kind: "FLOOD", color: "var(--blue)", severity: "info",
      title: "Flood Watch · Little River (Blount County) — jusqu'à demain 06:00",
      message: "Pluies annoncées, surveillance du pont MP 8.4 (Smoky Sub). Inspection visuelle par équipe voie à 05:30.",
    },
  ],
};

function loadState(): WeatherState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_STATE;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_STATE;
  }
}

export default function WeatherPanel() {
  const { data: user } = useCurrentUser();
  const canEdit = canEditWeather(user ?? null);
  const [state, setState] = useState<WeatherState>(DEFAULT_STATE);
  const [editing, setEditing] = useState(false);

  useEffect(() => { setState(loadState()); }, []);

  function persist(next: WeatherState) {
    setState(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  }

  function updateCity(i: number, patch: Partial<City>) {
    const next = { ...state, cities: state.cities.map((c, idx) => idx === i ? { ...c, ...patch } : c) };
    persist(next);
  }
  function updateAlert(i: number, patch: Partial<Alert>) {
    const next = { ...state, alerts: state.alerts.map((a, idx) => idx === i ? { ...a, ...patch } : a) };
    persist(next);
  }
  function removeAlert(i: number) {
    persist({ ...state, alerts: state.alerts.filter((_, idx) => idx !== i) });
  }
  function addAlert() {
    persist({ ...state, alerts: [...state.alerts, { id: "a" + Date.now(), kind: "INFO", color: "var(--blue)", severity: "info", title: "Nouveau bulletin", message: "" }] });
  }
  function resetAll() {
    if (!confirm("Réinitialiser la météo aux valeurs par défaut ?")) return;
    localStorage.removeItem(KEY);
    setState(DEFAULT_STATE);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "4px 6px", fontSize: 13, borderRadius: 4,
    border: "1px solid rgba(255,255,255,0.15)", background: "rgba(0,0,0,0.25)", color: "inherit",
  };

  return (
    <section className="view" id="v-wx">
      <h1 className="vt">Météo &amp; conditions du réseau</h1>
      <p className="vt-sub">
        Bulletins NWS (National Weather Service, Morristown TN office) et alertes ayant un impact opérationnel : chaleur (rail sun-kink), crues, vent, neige/verglas.
      </p>

      {canEdit && (
        <div className="btn-row" style={{ marginBottom: 12 }}>
          <button className="btn" onClick={() => setEditing((e) => !e)}>
            {editing ? "✓ Terminer l'édition" : "✎ Modifier la météo"}
          </button>
          {editing && <button className="btn ghost" onClick={resetAll}>↺ Réinitialiser</button>}
        </div>
      )}

      <div className="kpis">
        {state.cities.map((c, i) => (
          <div key={i} className={"kpi" + (c.severity === "warn" ? " warn" : "")}>
            {editing && canEdit ? (
              <>
                <input style={inputStyle} value={c.name} onChange={(e) => updateCity(i, { name: e.target.value })} />
                <input style={{ ...inputStyle, marginTop: 6, fontSize: 18, fontWeight: 700 }} value={c.temp} onChange={(e) => updateCity(i, { temp: e.target.value })} />
                <input style={{ ...inputStyle, marginTop: 6 }} value={c.desc} onChange={(e) => updateCity(i, { desc: e.target.value })} />
                <input style={{ ...inputStyle, marginTop: 6 }} value={c.badge} onChange={(e) => updateCity(i, { badge: e.target.value })} />
                <select style={{ ...inputStyle, marginTop: 6 }} value={c.severity} onChange={(e) => updateCity(i, { severity: e.target.value as City["severity"] })}>
                  <option value="ok">Normal</option>
                  <option value="warn">Attention</option>
                </select>
              </>
            ) : (
              <>
                <span className="lab">{c.name}</span>
                <div className="v">{c.temp}</div>
                <div className="d">{c.desc}</div>
                <span className="badge">{c.badge}</span>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="card">
        <h2 style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Alertes NWS en cours</span>
          {editing && canEdit && <button className="btn sm" onClick={addAlert}>+ Ajouter</button>}
        </h2>
        {state.alerts.map((a, i) => (
          <div key={a.id} className={"pub sev-" + a.severity} style={{ marginTop: i === 0 ? 0 : 8 }}>
            <span className="ln" style={{ background: a.color }}>{a.kind}</span>
            <div className="body" style={{ flex: 1 }}>
              {editing && canEdit ? (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6, marginBottom: 6 }}>
                    <input style={inputStyle} value={a.kind} onChange={(e) => updateAlert(i, { kind: e.target.value })} placeholder="HEAT" />
                    <input style={inputStyle} value={a.color} onChange={(e) => updateAlert(i, { color: e.target.value })} placeholder="var(--warn)" />
                    <select style={inputStyle} value={a.severity} onChange={(e) => updateAlert(i, { severity: e.target.value as Alert["severity"] })}>
                      <option value="info">Info</option>
                      <option value="warn">Warn</option>
                      <option value="alert">Alert</option>
                    </select>
                    <button className="btn danger sm" onClick={() => removeAlert(i)}>Supprimer</button>
                  </div>
                  <input style={{ ...inputStyle, fontWeight: 700, marginBottom: 6 }} value={a.title} onChange={(e) => updateAlert(i, { title: e.target.value })} />
                  <textarea style={{ ...inputStyle, minHeight: 60 }} value={a.message} onChange={(e) => updateAlert(i, { message: e.target.value })} />
                </>
              ) : (
                <>
                  <div className="tt">{a.title}</div>
                  <div className="ms">{a.message}</div>
                </>
              )}
            </div>
          </div>
        ))}
        {state.alerts.length === 0 && (
          <p style={{ color: "var(--muted)", textAlign: "center", padding: "1rem" }}>Aucune alerte en cours.</p>
        )}
      </div>
    </section>
  );
}
