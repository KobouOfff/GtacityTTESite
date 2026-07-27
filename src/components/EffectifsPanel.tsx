import { useQuery } from "@tanstack/react-query";
import { listOnlineEffectifs, type OnlineUser } from "@/lib/presence.functions";
import { useCurrentUser } from "@/components/DiscordAuth";

const CAT_LABELS: Record<OnlineUser["category"], string> = {
  conducteur: "Conducteurs",
  controleur: "Contrôleurs",
  securite: "Sécurité",
  bus: "Bus",
  maintenance: "Maintenance",
  regulation: "Régulation / Maintenance",
  direction: "Direction",
  autre: "Autres",
};

function timeAgo(iso: string): string {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const s = Math.floor(diff / 1000);
  if (s < 60) return `il y a ${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  return `il y a ${h} h`;
}

export default function EffectifsPanel() {
  const { data: me, isLoading: isUserLoading } = useCurrentUser();

  const { data, isLoading } = useQuery({
    queryKey: ["effectifs-online"],
    queryFn: () => listOnlineEffectifs(),
    refetchInterval: 20_000,
    staleTime: 10_000,
  });

  const users = data?.users ?? [];
  const statusMessage = !isUserLoading && !me
    ? "Connexion Discord non détectée : reconnecte-toi depuis l’accueil."
    : data?.reason === "no-session"
      ? "Session Discord absente côté serveur : reconnecte-toi avec Discord."
      : data?.reason === "save-failed"
        ? "Ta présence Discord est détectée, mais l’enregistrement en base a échoué."
        : data?.reason === "read-failed"
          ? "Présence enregistrée, mais la liste des effectifs n’a pas pu être lue."
          : null;

  const counts: Record<OnlineUser["category"], number> = {
    conducteur: 0, controleur: 0, securite: 0, bus: 0,
    maintenance: 0, regulation: 0, direction: 0, autre: 0,
  };
  for (const u of users) counts[u.category]++;

  return (
    <section className="view" id="v-eff">
      <h1 className="vt">Effectifs en service</h1>
      <p className="vt-sub">
        Basé sur les employés actuellement connectés au portail TTE via Discord (dernière activité &lt; 3 min).
      </p>

      <div className="kpis">
        <div className="kpi">
          <span className="lab">Total en ligne</span>
          <div className="v">{users.length}</div>
          <div className="d">agents connectés</div>
          <span className="badge">Live</span>
        </div>
        <div className="kpi">
          <span className="lab">Conducteurs</span>
          <div className="v">{counts.conducteur}</div>
          <div className="d">train &amp; formateurs</div>
        </div>
        <div className="kpi">
          <span className="lab">Contrôleurs</span>
          <div className="v">{counts.controleur}</div>
          <div className="d">brigades trains</div>
        </div>
        <div className="kpi">
          <span className="lab">Sécurité</span>
          <div className="v">{counts.securite}</div>
          <div className="d">agents en poste</div>
        </div>
        <div className="kpi">
          <span className="lab">Bus</span>
          <div className="v">{counts.bus}</div>
          <div className="d">chauffeurs</div>
        </div>
        <div className="kpi">
          <span className="lab">Régulation / Maintenance</span>
          <div className="v">{counts.regulation}</div>
          <div className="d">PCC &amp; atelier</div>
        </div>
        <div className="kpi">
          <span className="lab">Direction</span>
          <div className="v">{counts.direction}</div>
          <div className="d">gérants &amp; superviseurs</div>
        </div>
      </div>

      <div className="card">
        <h2>Agents actuellement connectés</h2>
        {statusMessage && (
          <p style={{ color: "#fbbf24", marginBottom: 12 }}>{statusMessage}</p>
        )}
        {isLoading || isUserLoading ? (
          <p style={{ color: "#94a3b8" }}>Chargement des effectifs…</p>
        ) : users.length === 0 ? (
          <p style={{ color: "#94a3b8" }}>Aucun employé connecté pour le moment.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Agent</th>
                  <th>Fonction</th>
                  <th>Catégorie</th>
                  <th>Dernière activité</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.discordId}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {u.avatar ? (
                          <img src={u.avatar} alt="" width={24} height={24} style={{ borderRadius: "50%" }} />
                        ) : (
                          <div style={{
                            width: 24, height: 24, borderRadius: "50%",
                            background: "#334155", display: "grid", placeItems: "center",
                            color: "#fff", fontSize: 10, fontWeight: 700,
                          }}>{u.username[0]?.toUpperCase()}</div>
                        )}
                        <b>{u.displayName || u.username}</b>
                      </div>
                    </td>
                    <td>
                      {u.primaryRoleName ? (
                        <span style={{
                          padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700,
                          background: `${u.primaryRoleColor ?? "#64748b"}22`,
                          color: u.primaryRoleColor ?? "#64748b",
                          border: `1px solid ${u.primaryRoleColor ?? "#64748b"}55`,
                        }}>{u.primaryRoleName}</span>
                      ) : <span style={{ color: "#64748b" }}>—</span>}
                    </td>
                    <td>{CAT_LABELS[u.category]}</td>
                    <td>{timeAgo(u.lastSeenAt)}</td>
                    <td>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        color: "#22c55e", fontWeight: 600, fontSize: 12,
                      }}>
                        <span style={{
                          width: 8, height: 8, borderRadius: "50%", background: "#22c55e",
                          boxShadow: "0 0 8px #22c55e",
                        }} />
                        En service
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
