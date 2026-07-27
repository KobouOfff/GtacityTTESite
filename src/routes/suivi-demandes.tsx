import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "@/components/DiscordAuth";
import { listAllContactRequests, updateContactRequest } from "@/lib/contact.functions";
import {
  CONTACT_CATEGORIES,
  CONTACT_STATUSES,
  CONTACT_BRANCHES,
  canManageContactRequests,
  getBranchLabel,
  getBranchColor,
  type DiscordSessionUser,
} from "@/lib/discord-roles";
import type { ContactRequestRow } from "@/lib/contact.server";

function SuiviDemandesPage() {
  const { data: user, isLoading: userLoading } = useCurrentUser();

  if (userLoading) return <Shell><div style={muted}>Chargement…</div></Shell>;
  if (!user) {
    return (
      <Shell>
        <div style={card}>
          <h2 style={{ marginTop: 0 }}>Connexion requise</h2>
          <p style={muted}>Cette page est réservée à la direction (Gérant, Superviseur, Superviseur assistant).</p>
          <a href="/api/public/discord/login?redirect=/suivi-demandes" style={btnPrimary}>Se connecter avec Discord</a>
        </div>
      </Shell>
    );
  }
  if (!canManageContactRequests(user as DiscordSessionUser)) {
    return (
      <Shell>
        <div style={{ ...card, borderColor: "#7f1d1d" }}>
          <h2 style={{ marginTop: 0 }}>Accès refusé</h2>
          <p style={muted}>Cet espace est réservé au Gérant, au Superviseur et au Superviseur assistant.</p>
        </div>
      </Shell>
    );
  }
  return <SuiviBody />;
}

function SuiviBody() {
  const qc = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterBranch, setFilterBranch] = useState<string>("");

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["all-contact-requests"],
    queryFn: () => listAllContactRequests(),
    staleTime: 15_000,
  });

  const rows: ContactRequestRow[] = data?.ok ? data.rows : [];
  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filterStatus && r.status !== filterStatus) return false;
      if (filterBranch && r.assigned_branch !== filterBranch) return false;
      return true;
    });
  }, [rows, filterStatus, filterBranch]);

  const stats = useMemo(() => {
    const s: Record<string, number> = {};
    for (const r of rows) s[r.status] = (s[r.status] ?? 0) + 1;
    return s;
  }, [rows]);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["all-contact-requests"] });

  return (
    <Shell>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: "0 0 4px" }}>Suivi des demandes</h1>
          <p style={{ ...muted, margin: 0 }}>Gestion des demandes clients — assigner à une branche, ajouter une note, changer le statut.</p>
        </div>
        <button onClick={() => refetch()} disabled={isFetching} style={btnGhost}>
          {isFetching ? "Actualisation…" : "↻ Actualiser"}
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {Object.entries(CONTACT_STATUSES).map(([k, v]) => (
          <div key={k} style={{ ...card, padding: "10px 14px", minWidth: 110 }}>
            <div style={{ fontSize: 11, color: v.color, fontWeight: 700, letterSpacing: 0.3, textTransform: "uppercase" }}>{v.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, marginTop: 2 }}>{stats[k] ?? 0}</div>
          </div>
        ))}
      </div>

      <div style={{ ...card, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, ...muted }}>
          Statut
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={selectStyle}>
            <option value="">Tous</option>
            {Object.entries(CONTACT_STATUSES).map(([k, v]) => (<option key={k} value={k}>{v.label}</option>))}
          </select>
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, ...muted }}>
          Branche
          <select value={filterBranch} onChange={(e) => setFilterBranch(e.target.value)} style={selectStyle}>
            <option value="">Toutes</option>
            <option value="">— Non assignée —</option>
            {CONTACT_BRANCHES.map((b) => (<option key={b.key} value={b.key}>{b.label}</option>))}
          </select>
        </label>
        <div style={{ marginLeft: "auto", ...muted, fontSize: 13 }}>
          {filtered.length} demande{filtered.length > 1 ? "s" : ""} affichée{filtered.length > 1 ? "s" : ""}
        </div>
      </div>

      {isLoading ? (
        <div style={muted}>Chargement…</div>
      ) : data && !data.ok ? (
        <div style={{ ...card, borderColor: "#7f1d1d" }}>Erreur de lecture ({data.reason}).</div>
      ) : filtered.length === 0 ? (
        <div style={card}>Aucune demande ne correspond aux filtres.</div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {filtered.map((r) => (
            <RequestCard key={r.id} row={r} onChange={invalidate} />
          ))}
        </div>
      )}
    </Shell>
  );
}

function RequestCard({ row, onChange }: { row: ContactRequestRow; onChange: () => void }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(row.status);
  const [branch, setBranch] = useState<string>(row.assigned_branch ?? "");
  const [note, setNote] = useState("");

  const mutate = useMutation({
    mutationFn: (payload: { id: string; status?: string; assigned_branch?: string | null; note?: string }) =>
      updateContactRequest({ data: payload }),
    onSuccess: (res) => {
      if (res?.ok) {
        setNote("");
        setOpen(false);
        onChange();
      } else {
        alert("Échec de la mise à jour : " + (res?.reason ?? "inconnue"));
      }
    },
    onError: (e) => alert("Erreur : " + String(e)),
  });

  const st = CONTACT_STATUSES[row.status] ?? { label: row.status, color: "#64748b" };
  const bc = getBranchColor(row.assigned_branch);

  return (
    <article style={card}>
      <header
        style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", cursor: "pointer" }}
        onClick={() => setOpen((v) => !v)}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 12, color: "#94a3b8", fontFamily: "ui-monospace, monospace" }}>{row.ref}</div>
          <div style={{ fontWeight: 700, fontSize: 16, marginTop: 2 }}>{row.subject}</div>
          <div style={{ ...muted, marginTop: 4, fontSize: 13 }}>
            {CONTACT_CATEGORIES[row.category] ?? row.category} · par{" "}
            <b style={{ color: "#e2e8f0" }}>{row.requester_display_name || row.requester_username}</b>
            {" "}(@{row.requester_username}) · {new Date(row.created_at).toLocaleString("fr-FR")}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ ...pill, background: st.color + "22", color: st.color, borderColor: st.color + "55" }}>{st.label}</span>
          {row.assigned_branch ? (
            <span style={{ ...pill, background: bc + "22", color: bc, borderColor: bc + "55" }}>
              → {getBranchLabel(row.assigned_branch)}
            </span>
          ) : (
            <span style={{ ...pill, background: "rgba(148,163,184,0.15)", color: "#94a3b8", borderColor: "rgba(148,163,184,0.35)" }}>
              Non assignée
            </span>
          )}
          <span style={{ ...muted, fontSize: 12 }}>{open ? "▲" : "▼"}</span>
        </div>
      </header>

      {open && (
        <div style={{ marginTop: 14, display: "grid", gap: 14 }}>
          <div>
            <div style={{ ...muted, fontSize: 12, marginBottom: 4 }}>Message du client</div>
            <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "10px 12px", whiteSpace: "pre-wrap" }}>
              {row.message}
            </div>
          </div>

          {row.extra && Object.keys(row.extra).length > 0 && (
            <div>
              <div style={{ ...muted, fontSize: 12, marginBottom: 4 }}>Informations complémentaires</div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13 }}>
                {Object.entries(row.extra).map(([k, v]) =>
                  v ? <li key={k}><b>{k}</b> : {String(v)}</li> : null,
                )}
              </ul>
            </div>
          )}

          {row.notes && row.notes.length > 0 && (
            <div>
              <div style={{ ...muted, fontSize: 12, marginBottom: 4 }}>Historique interne</div>
              <div style={{ display: "grid", gap: 6 }}>
                {row.notes.map((n, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "8px 10px", fontSize: 13 }}>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>
                      <b style={{ color: "#e2e8f0" }}>{n.author}</b> · {new Date(n.at).toLocaleString("fr-FR")}
                    </div>
                    <div style={{ marginTop: 4, whiteSpace: "pre-wrap" }}>{n.message}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ borderTop: "1px dashed rgba(255,255,255,0.1)", paddingTop: 12, display: "grid", gap: 10 }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, ...muted, flex: 1, minWidth: 180 }}>
                Statut
                <select value={status} onChange={(e) => setStatus(e.target.value)} style={selectStyle}>
                  {Object.entries(CONTACT_STATUSES).map(([k, v]) => (<option key={k} value={k}>{v.label}</option>))}
                </select>
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, ...muted, flex: 2, minWidth: 240 }}>
                Rediriger vers
                <select value={branch} onChange={(e) => setBranch(e.target.value)} style={selectStyle}>
                  <option value="">— Non assignée —</option>
                  {CONTACT_BRANCHES.map((b) => (<option key={b.key} value={b.key}>{b.label}</option>))}
                </select>
              </label>
            </div>
            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, ...muted }}>
              Note / réponse (visible du client si ajoutée)
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Ex. Transmis au Gérant Train, il te répondra sous 48 h."
                style={{ ...selectStyle, resize: "vertical", fontFamily: "inherit" }}
              />
            </label>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                onClick={() =>
                  mutate.mutate({
                    id: row.id,
                    status: status !== row.status ? status : undefined,
                    assigned_branch: (branch || null) !== (row.assigned_branch ?? null) ? (branch || null) : undefined,
                    note: note.trim() ? note : undefined,
                  })
                }
                disabled={mutate.isPending}
                style={btnPrimary}
              >
                {mutate.isPending ? "Enregistrement…" : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "#f1f5f9", fontFamily: "system-ui, sans-serif" }}>
      <header style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "14px 22px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <a href="/" style={{ color: "#f1f5f9", textDecoration: "none", fontWeight: 700, letterSpacing: -0.5 }}>
          <span style={{ color: "#4B92DD" }}>TTE</span> · Direction · Suivi des demandes
        </a>
        <nav style={{ display: "flex", gap: 14, fontSize: 13 }}>
          <a href="/espace-employes" style={{ color: "#94a3b8", textDecoration: "none" }}>Espace employés</a>
          <a href="/" style={{ color: "#94a3b8", textDecoration: "none" }}>Accueil</a>
        </nav>
      </header>
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 22px 60px", display: "grid", gap: 18 }}>
        {children}
      </main>
    </div>
  );
}

const muted: React.CSSProperties = { color: "#94a3b8" };
const card: React.CSSProperties = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 14,
  padding: "16px 18px",
};
const pill: React.CSSProperties = {
  padding: "3px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
  border: "1px solid",
  whiteSpace: "nowrap",
};
const btnPrimary: React.CSSProperties = {
  padding: "9px 16px",
  background: "#5865F2",
  color: "#fff",
  borderRadius: 8,
  textDecoration: "none",
  fontWeight: 600,
  border: "none",
  cursor: "pointer",
  fontSize: 13,
};
const btnGhost: React.CSSProperties = {
  padding: "8px 14px",
  background: "rgba(255,255,255,0.05)",
  color: "#e2e8f0",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  fontSize: 13,
  cursor: "pointer",
};
const selectStyle: React.CSSProperties = {
  padding: "8px 10px",
  background: "rgba(0,0,0,0.3)",
  color: "#f1f5f9",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 8,
  fontSize: 13,
  minWidth: 160,
};

export const Route = createFileRoute("/suivi-demandes")({
  head: () => ({
    meta: [
      { title: "Suivi des demandes — TTE" },
      { name: "description", content: "Espace de gestion des demandes clients — Direction TTE." },
    ],
  }),
  component: SuiviDemandesPage,
});
