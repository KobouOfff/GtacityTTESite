import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "@/components/DiscordAuth";
import { listAllContactRequests, updateContactRequest } from "@/lib/contact.functions";
import {
  CONTACT_CATEGORIES,
  CONTACT_STATUSES,
  CONTACT_BRANCHES,
  canManageContactRequests,
  getBranchLabel,
  getBranchColor,
  contactVisibleBranches,
  type DiscordSessionUser,
} from "@/lib/discord-roles";
import type { ContactRequestRow } from "@/lib/contact.server";

const BRAND = "#4B92DD";

function SuiviDemandesPage() {
  const { data: user, isLoading: userLoading } = useCurrentUser();

  if (userLoading) {
    return (
      <Shell>
        <div style={card}>
          <div style={{ ...muted, display: "flex", alignItems: "center", gap: 10 }}>
            <Spinner /> Chargement…
          </div>
        </div>
      </Shell>
    );
  }
  if (!user) {
    return (
      <Shell>
        <div style={{ ...card, textAlign: "center", padding: "38px 22px" }}>
          <div style={iconCircle}>🔒</div>
          <h2 style={{ margin: "14px 0 6px", fontSize: 22, letterSpacing: -0.3 }}>Connexion requise</h2>
          <p style={{ ...muted, margin: "0 auto 20px", maxWidth: 420, lineHeight: 1.6 }}>
            Cette page est réservée à la direction, aux gérants de branche et au secrétariat/accueil.
          </p>
          <a href="/api/public/discord/login?redirect=/suivi-demandes" className="tte-btn" style={btnPrimary}>
            Se connecter avec Discord
          </a>
        </div>
      </Shell>
    );
  }
  if (!canManageContactRequests(user as DiscordSessionUser)) {
    return (
      <Shell>
        <div style={{ ...card, borderColor: "rgba(248,113,113,0.4)", background: "var(--tte-error-bg)", textAlign: "center", padding: "38px 22px" }}>
          <div style={{ ...iconCircle, background: "rgba(248,113,113,0.14)", borderColor: "rgba(248,113,113,0.28)" }}>🛡</div>
          <h2 style={{ margin: "14px 0 6px", fontSize: 22, letterSpacing: -0.3 }}>Accès refusé</h2>
          <p style={{ ...muted, margin: "0 auto", maxWidth: 420, lineHeight: 1.6 }}>
            Cet espace est réservé au Gérant, au Superviseur, au Superviseur assistant, aux gérants de branche et au secrétariat/accueil.
          </p>
        </div>
      </Shell>
    );
  }
  return <SuiviBody user={user as DiscordSessionUser} />;
}

function SuiviBody({ user }: { user: DiscordSessionUser }) {
  const qc = useQueryClient();
  const visibleBranches = useMemo(() => contactVisibleBranches(user), [user]);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterBranch, setFilterBranch] = useState<string>("");
  const [search, setSearch] = useState("");

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["all-contact-requests"],
    queryFn: () => listAllContactRequests(),
    staleTime: 15_000,
  });

  const rows: ContactRequestRow[] = data?.ok ? data.rows : [];

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filterStatus && r.status !== filterStatus) return false;
      if (filterBranch) {
        if (filterBranch === "__unassigned__") {
          if (r.assigned_branch) return false;
        } else if (r.assigned_branch !== filterBranch) {
          return false;
        }
      }
      if (visibleBranches && !visibleBranches.includes(r.assigned_branch ?? "")) {
        return false;
      }
      if (!search.trim()) return true;
      const needle = search.trim().toLowerCase();
      return (
        r.subject.toLowerCase().includes(needle) ||
        r.ref.toLowerCase().includes(needle) ||
        r.requester_username.toLowerCase().includes(needle) ||
        (r.requester_display_name?.toLowerCase().includes(needle) ?? false) ||
        r.message.toLowerCase().includes(needle)
      );
    });
  }, [rows, filterStatus, filterBranch, visibleBranches, search]);

  const stats = useMemo(() => {
    const s: Record<string, number> = {};
    for (const r of rows) s[r.status] = (s[r.status] ?? 0) + 1;
    return s;
  }, [rows]);

  const refreshRequests = () =>
    qc.refetchQueries({
      queryKey: ["all-contact-requests"],
      type: "active",
    });

  const total = rows.length;
  const openCount = rows.filter((r) => r.status !== "ferme" && r.status !== "resolu").length;
  const resolvedCount = stats.resolu ?? 0;
  const closedCount = stats.ferme ?? 0;

  return (
    <Shell>
      <section style={hero}>
        <div style={heroGlow} aria-hidden />
        <div style={heroGrid} aria-hidden />
        <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={eyebrow}>Direction · Gestion des demandes clients</div>
            <h1 style={{ margin: "10px 0 8px", fontSize: 36, lineHeight: 1.05, letterSpacing: -1.4, fontWeight: 800 }}>
              Suivi des{" "}
              <span
                style={{
                  background: `linear-gradient(120deg, ${BRAND}, #a5d0ff)`,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                demandes
              </span>
            </h1>
            <p style={{ ...muted, margin: 0, maxWidth: 560, lineHeight: 1.65 }}>
              Bonjour <b style={{ color: "var(--tte-fg-strong)" }}>{user.displayName || user.username}</b>, gère ici les demandes clients,
              assigne-les aux bonnes branches et suis les échanges en temps réel.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={() => refetch()} disabled={isFetching} className="tte-btn" style={btnGhost}>
              <span style={{ display: "inline-block", animation: isFetching ? "tte-spin 0.9s linear infinite" : undefined }}>↻</span>{" "}
              {isFetching ? "Actualisation…" : "Actualiser"}
            </button>
            <a href="/contact" className="tte-btn" style={{ ...btnPrimary, padding: "9px 16px", fontSize: 14 }}>
              + Nouvelle demande
            </a>
          </div>
        </div>

        {total > 0 && (
          <div style={statRow}>
            <Stat label="Total" value={total} color="var(--tte-fg-strong)" icon="🗂" />
            <Stat label="Actives" value={openCount} color={BRAND} icon="⏳" />
            <Stat label="Résolues" value={resolvedCount} color="#22c55e" icon="✓" />
            <Stat label="Fermées" value={closedCount} color="var(--tte-muted)" icon="✕" />
          </div>
        )}
      </section>

      <div style={toolbar}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="tte-input"
            style={{ ...selectStyle, minWidth: 150 }}
          >
            <option value="">Tous les statuts</option>
            {Object.entries(CONTACT_STATUSES).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <select
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
            className="tte-input"
            style={{ ...selectStyle, minWidth: 180 }}
          >
            <option value="">Toutes les branches</option>
            <option value="__unassigned__">— Non assignée —</option>
            {CONTACT_BRANCHES.map((b) => (
              <option key={b.key} value={b.key}>{b.label}</option>
            ))}
          </select>
          <input
            className="tte-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher référence, sujet, client…"
            style={{ ...selectStyle, padding: "9px 13px", fontSize: 13.5, minWidth: 220, flex: "1 1 220px" }}
          />
        </div>
        <div style={{ ...muted, fontSize: 13, whiteSpace: "nowrap" }}>
          {filtered.length} demande{filtered.length > 1 ? "s" : ""} affichée{filtered.length > 1 ? "s" : ""}
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: "grid", gap: 14 }}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : data && !data.ok ? (
        <div style={{ ...card, borderColor: "rgba(248,113,113,0.4)", background: "var(--tte-error-bg)" }}>
          Erreur de lecture ({data.reason}).
        </div>
      ) : rows.length === 0 ? (
        <div style={{ ...card, textAlign: "center", padding: "42px 22px" }}>
          <div style={iconCircle}>📮</div>
          <h2 style={{ margin: "14px 0 6px", fontSize: 20 }}>Aucune demande pour le moment</h2>
          <p style={{ ...muted, margin: "0 auto 20px", maxWidth: 400, lineHeight: 1.6 }}>
            Les demandes clients apparaîtront ici dès leur réception.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ ...card, textAlign: "center", padding: "34px 22px", ...muted }}>
          Aucune demande ne correspond aux filtres.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 14 }}>
          {filtered.map((r, index) => (
            <RequestCard key={r.id} row={r} onChange={refreshRequests} index={index} />
          ))}
        </div>
      )}
    </Shell>
  );
}

function Stat({ label, value, color, icon }: { label: string; value: number; color: string; icon: string }) {
  return (
    <div style={statBox}>
      <div style={{ ...statIcon, color }}>{icon}</div>
      <div>
        <div style={{ fontSize: 24, fontWeight: 800, color, letterSpacing: -0.5, lineHeight: 1.1 }}>{value}</div>
        <div style={{ ...muted, fontSize: 10.5, textTransform: "uppercase", letterSpacing: 1.2 }}>{label}</div>
      </div>
    </div>
  );
}

function RequestCard({
  row,
  onChange,
  index,
}: {
  row: ContactRequestRow;
  onChange: () => Promise<unknown>;
  index: number;
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(row.status);
  const [branch, setBranch] = useState<string>(row.assigned_branch ?? "");
  const [internalMessage, setInternalMessage] = useState("");
  const [clientMessage, setClientMessage] = useState("");

  const mutate = useMutation({
    mutationFn: (payload: {
      id: string;
      status?: string;
      assigned_branch?: string | null;
      internal_message?: string;
      client_message?: string;
    }) => updateContactRequest({ data: payload }),
    onSuccess: async (res) => {
      if (res?.ok) {
        setInternalMessage("");
        setClientMessage("");
        await onChange();
      } else {
        alert(
          res?.reason === "internal_message_required"
            ? "Ajoutez une consigne interne pour expliquer le transfert au service concerné."
            : "Échec de la mise à jour : " + (res?.reason ?? "inconnue"),
        );
      }
    },
    onError: (e) => alert("Erreur : " + String(e)),
  });

  const st = CONTACT_STATUSES[row.status] ?? { label: row.status, color: "#64748b" };
  const bc = getBranchColor(row.assigned_branch);
  const publicMessages = row.messages?.filter((m) => m.visibility === "public") ?? [];
  const internalMessages = row.messages?.filter((m) => m.visibility === "internal") ?? [];
  const branchChanged = (branch || null) !== (row.assigned_branch ?? null);

  return (
    <article
      className="tte-card"
      style={{
        ...card,
        padding: 0,
        overflow: "hidden",
        animation: `tte-in 0.4s ease both ${Math.min(index, 6) * 0.05}s`,
      }}
    >
      <div style={{ height: 3, background: `linear-gradient(90deg, ${st.color}, transparent)` }} />
      <div style={{ padding: "16px 18px" }}>
        <header
          onClick={() => setOpen((v) => !v)}
          style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", cursor: "pointer" }}
        >
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ fontSize: 11, color: "var(--tte-subtle)", fontFamily: "ui-monospace, monospace", letterSpacing: 0.6 }}>{row.ref}</div>
              <span style={tag}>{CONTACT_CATEGORIES[row.category] ?? row.category}</span>
            </div>
            <div style={{ fontWeight: 700, fontSize: 17, marginTop: 5, letterSpacing: -0.3 }}>{row.subject}</div>
            <div style={{ ...muted, marginTop: 6, fontSize: 13, lineHeight: 1.5 }}>
              Par <b style={{ color: "var(--tte-fg-strong)" }}>{row.requester_display_name || row.requester_username}</b> (@{row.requester_username}) ·
              déposée le {new Date(row.created_at).toLocaleString("fr-FR")}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ ...pill, background: st.color + "1f", color: st.color, borderColor: st.color + "55" }}>
              <span style={{ ...dot, background: st.color }} />
              {st.label}
            </span>
            {row.assigned_branch ? (
              <span style={{ ...pill, background: bc + "1f", color: bc, borderColor: bc + "55" }}>
                → {getBranchLabel(row.assigned_branch)}
              </span>
            ) : (
              <span style={{ ...pill, background: "rgba(148,163,184,0.12)", color: "var(--tte-muted)", borderColor: "rgba(148,163,184,0.3)" }}>
                Non assignée
              </span>
            )}
            <span style={{ ...muted, fontSize: 13, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
          </div>
        </header>

        {open && (
          <div style={{ marginTop: 16, display: "grid", gap: 16 }}>
            <div style={{ border: "1px solid rgba(34,197,94,0.22)", borderRadius: 14, padding: 14, background: "rgba(34,197,94,0.04)" }}>
              <div style={{ color: "var(--tte-ok-text)", fontSize: 11, fontWeight: 700, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>
                Messagerie avec le client
              </div>
              <div style={{ display: "grid", gap: 10 }}>
                <ConversationBubble
                  author={row.requester_display_name || row.requester_username}
                  at={row.created_at}
                  message={row.message}
                  client
                />
                {publicMessages.map((m) => (
                  <ConversationBubble
                    key={m.id}
                    author={m.author_name}
                    at={m.created_at}
                    message={m.message}
                    client={m.author_type === "client"}
                  />
                ))}
              </div>
            </div>

            {row.extra && Object.keys(row.extra).length > 0 && (
              <div>
                <div style={{ ...muted, fontSize: 11, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Informations complémentaires</div>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13 }}>
                  {Object.entries(row.extra).map(([k, v]) =>
                    v ? <li key={k}><b>{k}</b> : {String(v)}</li> : null,
                  )}
                </ul>
              </div>
            )}

            {(internalMessages.length > 0 || (row.notes?.length ?? 0) > 0) && (
              <div style={{ border: "1px solid rgba(245,158,11,0.24)", borderRadius: 14, padding: 14, background: "rgba(245,158,11,0.04)" }}>
                <div style={{ color: "var(--tte-warn-text)", fontSize: 11, fontWeight: 700, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>
                  Fil interne — invisible du client
                </div>
                <div style={{ display: "grid", gap: 8 }}>
                  {internalMessages.map((m) => (
                    <div key={m.id} style={{ background: "rgba(245,158,11,0.08)", borderRadius: 10, padding: "10px 12px", fontSize: 13 }}>
                      <div style={{ fontSize: 12, color: "var(--tte-muted)" }}>
                        <b style={{ color: "var(--tte-warn-text)" }}>{m.author_name}</b> · {new Date(m.created_at).toLocaleString("fr-FR")}
                      </div>
                      <div style={{ marginTop: 4, whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{m.message}</div>
                    </div>
                  ))}
                  {internalMessages.length === 0 && row.notes?.map((n, i) => (
                    <div key={i} style={{ background: "var(--tte-surface-2)", borderRadius: 10, padding: "10px 12px", fontSize: 13 }}>
                      <div style={{ fontSize: 12, color: "var(--tte-muted)" }}>
                        <b style={{ color: "var(--tte-fg-strong)" }}>{n.author}</b> · {new Date(n.at).toLocaleString("fr-FR")}
                      </div>
                      <div style={{ marginTop: 4, whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{n.message}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ borderTop: "1px dashed var(--tte-border-strong)", paddingTop: 16, display: "grid", gap: 12 }}>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, ...muted, flex: 1, minWidth: 180 }}>
                  Statut
                  <select value={status} onChange={(e) => setStatus(e.target.value)} className="tte-input" style={selectStyle}>
                    {Object.entries(CONTACT_STATUSES).map(([k, v]) => (<option key={k} value={k}>{v.label}</option>))}
                  </select>
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, ...muted, flex: 2, minWidth: 240 }}>
                  Rediriger vers
                  <select value={branch} onChange={(e) => setBranch(e.target.value)} className="tte-input" style={selectStyle}>
                    <option value="">— Non assignée —</option>
                    {CONTACT_BRANCHES.map((b) => (<option key={b.key} value={b.key}>{b.label}</option>))}
                  </select>
                </label>
              </div>
              <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, ...muted }}>
                <span>
                  Message interne / consigne au service
                  {branchChanged && branch && <b style={{ color: "var(--tte-warn-text)" }}> — obligatoire pour transférer</b>}
                </span>
                <textarea
                  value={internalMessage}
                  onChange={(e) => setInternalMessage(e.target.value)}
                  rows={3}
                  maxLength={5000}
                  placeholder="Ex. Merci de vérifier les caméras de la gare et de reprendre ce dossier."
                  className="tte-input"
                  style={{ ...selectStyle, resize: "vertical", fontFamily: "inherit", borderColor: "rgba(245,158,11,0.45)" }}
                />
                <small style={{ color: "var(--tte-warn-text)" }}>Ce message est réservé aux employés. Le client ne le verra jamais.</small>
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, ...muted }}>
                Message au client — facultatif
                <textarea
                  value={clientMessage}
                  onChange={(e) => setClientMessage(e.target.value)}
                  rows={3}
                  maxLength={5000}
                  placeholder="Ex. Votre demande vient d’être transmise au service Train. Nous revenons vers vous prochainement."
                  className="tte-input"
                  style={{ ...selectStyle, resize: "vertical", fontFamily: "inherit", borderColor: "rgba(34,197,94,0.4)" }}
                />
                <small style={{ color: "var(--tte-ok-text)" }}>Ce message apparaîtra dans « Mes demandes » et le client pourra répondre.</small>
              </label>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button
                  onClick={() =>
                    branchChanged && branch && !internalMessage.trim()
                      ? alert("Écrivez une consigne interne avant de transférer la demande.")
                      : mutate.mutate({
                          id: row.id,
                          status: status !== row.status ? status : undefined,
                          assigned_branch: branchChanged ? (branch || null) : undefined,
                          internal_message: internalMessage.trim() || undefined,
                          client_message: clientMessage.trim() || undefined,
                        })
                  }
                  disabled={
                    mutate.isPending ||
                    (status === row.status && !branchChanged && !internalMessage.trim() && !clientMessage.trim())
                  }
                  className="tte-btn"
                  style={{
                    ...btnPrimary,
                    opacity:
                      mutate.isPending ||
                      (status === row.status && !branchChanged && !internalMessage.trim() && !clientMessage.trim())
                        ? 0.55
                        : 1,
                    cursor:
                      mutate.isPending ||
                      (status === row.status && !branchChanged && !internalMessage.trim() && !clientMessage.trim())
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {mutate.isPending ? "Enregistrement…" : "Enregistrer"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

function ConversationBubble({
  author,
  at,
  message,
  client,
}: {
  author: string;
  at: string;
  message: string;
  client: boolean;
}) {
  const accent = client ? "#5865F2" : "#22c55e";
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        flexDirection: client ? "row-reverse" : "row",
      }}
    >
      <div style={{ ...avatar, background: accent + "26", color: accent, border: `1px solid ${accent}44` }}>
        {author.slice(0, 1).toUpperCase()}
      </div>
      <div
        style={{
          background: client ? "rgba(88,101,242,0.13)" : "rgba(34,197,94,0.09)",
          border: `1px solid ${client ? "rgba(88,101,242,0.28)" : "rgba(34,197,94,0.22)"}`,
          borderRadius: 14,
          borderTopRightRadius: client ? 4 : 14,
          borderTopLeftRadius: client ? 14 : 4,
          padding: "10px 13px",
          maxWidth: "min(560px, 82%)",
        }}
      >
        <div style={{ fontSize: 11.5, color: "var(--tte-muted)" }}>
          <b style={{ color: "var(--tte-fg-strong)" }}>{author}</b> · {new Date(at).toLocaleString("fr-FR")}
        </div>
        <div style={{ marginTop: 5, whiteSpace: "pre-wrap", lineHeight: 1.55, fontSize: 14.5 }}>{message}</div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div style={{ ...card, height: 128, position: "relative", overflow: "hidden" }}>
      <div className="tte-shimmer" style={{ position: "absolute", inset: 0 }} />
    </div>
  );
}

function Spinner() {
  return (
    <span
      style={{
        width: 14,
        height: 14,
        borderRadius: "50%",
        border: "2px solid var(--tte-border-strong)",
        borderTopColor: BRAND,
        display: "inline-block",
        animation: "tte-spin 0.8s linear infinite",
      }}
    />
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(1000px 500px at 15% -10%, rgba(75,146,221,0.18), transparent 60%), var(--tte-bg)",
        color: "var(--tte-fg)",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <style>{css}</style>
      <header
        style={{
          borderBottom: "1px solid var(--tte-border)",
          padding: "14px 22px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "var(--tte-header-bg)",
          backdropFilter: "blur(10px)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <a href="/" style={{ color: "var(--tte-fg)", textDecoration: "none", fontWeight: 800, letterSpacing: -0.5 }}>
          <span style={{ color: BRAND }}>TTE</span> · Direction · Suivi des demandes
        </a>
        <nav style={{ display: "flex", gap: 16, fontSize: 13 }}>
          <a href="/espace-employes" className="tte-link" style={navLink}>Espace employés</a>
          <a href="/" className="tte-link" style={navLink}>Accueil</a>
        </nav>
      </header>
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 22px 70px", display: "grid", gap: 20 }}>
        {children}
      </main>
    </div>
  );
}

const css = `
:root {
  --tte-bg: #f3f6fb;
  --tte-fg: #0f172a;
  --tte-fg-strong: #0b1220;
  --tte-muted: #57647c;
  --tte-subtle: #6b7891;
  --tte-border: rgba(15,23,42,0.11);
  --tte-border-strong: rgba(15,23,42,0.16);
  --tte-surface-1: rgba(15,23,42,0.035);
  --tte-surface-2: rgba(15,23,42,0.03);
  --tte-surface-3: rgba(15,23,42,0.05);
  --tte-surface-4: rgba(15,23,42,0.02);
  --tte-surface-5: rgba(15,23,42,0.04);
  --tte-header-bg: rgba(255,255,255,0.78);
  --tte-input-bg: rgba(255,255,255,0.6);
  --tte-shimmer-1: rgba(15,23,42,0.02);
  --tte-shimmer-2: rgba(15,23,42,0.08);
  --tte-shadow: rgba(15,23,42,0.18);
  --tte-warn-text: #92400e;
  --tte-ok-text: #15803d;
  --tte-error-bg: rgba(254,202,202,0.4);
  --tte-tag-text: #1d5c9e;
}
.dark {
  --tte-bg: #0b1220;
  --tte-fg: #f1f5f9;
  --tte-fg-strong: #e2e8f0;
  --tte-muted: #94a3b8;
  --tte-subtle: #7c8db0;
  --tte-border: rgba(255,255,255,0.08);
  --tte-border-strong: rgba(255,255,255,0.13);
  --tte-surface-1: rgba(255,255,255,0.035);
  --tte-surface-2: rgba(255,255,255,0.03);
  --tte-surface-3: rgba(255,255,255,0.06);
  --tte-surface-4: rgba(0,0,0,0.28);
  --tte-surface-5: rgba(255,255,255,0.05);
  --tte-header-bg: rgba(11,18,32,0.72);
  --tte-input-bg: rgba(0,0,0,0.3);
  --tte-shimmer-1: rgba(255,255,255,0.02);
  --tte-shimmer-2: rgba(255,255,255,0.07);
  --tte-shadow: rgba(0,0,0,0.9);
  --tte-warn-text: #fbbf24;
  --tte-ok-text: #4ade80;
  --tte-error-bg: rgba(127,29,29,0.18);
  --tte-tag-text: #bcd8f5;
}
@keyframes tte-spin { to { transform: rotate(360deg); } }
@keyframes tte-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@keyframes tte-shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
.tte-shimmer {
  background: linear-gradient(90deg, var(--tte-shimmer-1), var(--tte-shimmer-2), var(--tte-shimmer-1));
  background-size: 800px 100%;
  animation: tte-shimmer 1.3s linear infinite;
}
.tte-card { transition: border-color .2s ease, transform .2s ease, box-shadow .2s ease; }
.tte-card:hover { border-color: rgba(75,146,221,0.35); box-shadow: 0 14px 40px -22px var(--tte-shadow); }
.tte-btn { transition: filter .2s ease, transform .12s ease; }
.tte-btn:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); }
.tte-btn:active:not(:disabled) { transform: translateY(0); }
.tte-link { transition: color .18s ease; }
.tte-link:hover { color: var(--tte-fg) !important; }
.tte-input { transition: border-color .2s ease, box-shadow .2s ease; outline: none; }
.tte-input:focus { border-color: rgba(75,146,221,0.6); box-shadow: 0 0 0 3px rgba(75,146,221,0.15); }
`;

const muted: React.CSSProperties = { color: "var(--tte-muted)" };
const navLink: React.CSSProperties = { color: "var(--tte-muted)", textDecoration: "none" };
const card: React.CSSProperties = {
  background: "var(--tte-surface-1)",
  border: "1px solid var(--tte-border)",
  borderRadius: 16,
  padding: "16px 18px",
};
const hero: React.CSSProperties = {
  position: "relative",
  overflow: "hidden",
  borderRadius: 20,
  border: "1px solid var(--tte-border)",
  background: "linear-gradient(160deg, rgba(75,146,221,0.16), var(--tte-surface-4) 55%)",
  padding: "26px 24px",
};
const heroGlow: React.CSSProperties = {
  position: "absolute",
  top: -120,
  right: -80,
  width: 300,
  height: 300,
  background: "radial-gradient(circle, rgba(75,146,221,0.28), transparent 65%)",
  pointerEvents: "none",
};
const heroGrid: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  backgroundImage:
    "linear-gradient(var(--tte-surface-1) 1px, transparent 1px), linear-gradient(90deg, var(--tte-surface-1) 1px, transparent 1px)",
  backgroundSize: "34px 34px",
  maskImage: "radial-gradient(120% 90% at 20% 0%, #000, transparent 70%)",
  WebkitMaskImage: "radial-gradient(120% 90% at 20% 0%, #000, transparent 70%)",
  pointerEvents: "none",
};
const eyebrow: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: 2,
  textTransform: "uppercase",
  color: BRAND,
  fontWeight: 700,
};
const statRow: React.CSSProperties = {
  position: "relative",
  display: "flex",
  gap: 10,
  marginTop: 22,
  flexWrap: "wrap",
};
const statBox: React.CSSProperties = {
  flex: "1 1 120px",
  background: "linear-gradient(160deg, var(--tte-surface-3), var(--tte-surface-4))",
  border: "1px solid var(--tte-border)",
  borderRadius: 14,
  padding: "12px 15px",
  display: "flex",
  alignItems: "center",
  gap: 12,
};
const statIcon: React.CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 15,
  background: "var(--tte-surface-5)",
  border: "1px solid var(--tte-border)",
  flexShrink: 0,
};
const toolbar: React.CSSProperties = {
  display: "flex",
  gap: 12,
  alignItems: "center",
  flexWrap: "wrap",
  justifyContent: "space-between",
  background: "var(--tte-surface-2)",
  border: "1px solid var(--tte-border)",
  borderRadius: 16,
  padding: "12px 14px",
};
const tag: React.CSSProperties = {
  fontSize: 11,
  padding: "3px 9px",
  borderRadius: 999,
  background: "rgba(75,146,221,0.14)",
  border: "1px solid rgba(75,146,221,0.28)",
  color: "var(--tte-tag-text)",
  fontWeight: 600,
};
const pill: React.CSSProperties = {
  padding: "4px 11px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
  border: "1px solid",
  whiteSpace: "nowrap",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
};
const dot: React.CSSProperties = { width: 6, height: 6, borderRadius: "50%", display: "inline-block" };
const avatar: React.CSSProperties = {
  width: 30,
  height: 30,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 13,
  fontWeight: 800,
  flexShrink: 0,
};
const iconCircle: React.CSSProperties = {
  width: 56,
  height: 56,
  borderRadius: "50%",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 24,
  background: "rgba(75,146,221,0.14)",
  border: "1px solid rgba(75,146,221,0.28)",
};
const btnPrimary: React.CSSProperties = {
  padding: "10px 18px",
  background: `linear-gradient(135deg, ${BRAND}, #2f6fb5)`,
  color: "#fff",
  borderRadius: 10,
  textDecoration: "none",
  fontWeight: 700,
  display: "inline-block",
  border: "none",
  cursor: "pointer",
  boxShadow: "0 10px 26px -14px rgba(75,146,221,0.9)",
};
const btnGhost: React.CSSProperties = {
  padding: "9px 15px",
  background: "var(--tte-surface-5)",
  color: "var(--tte-fg-strong)",
  border: "1px solid var(--tte-border-strong)",
  borderRadius: 10,
  fontSize: 13,
  cursor: "pointer",
  fontWeight: 600,
};
const selectStyle: React.CSSProperties = {
  padding: "9px 12px",
  background: "var(--tte-input-bg)",
  color: "var(--tte-fg)",
  border: "1px solid var(--tte-border-strong)",
  borderRadius: 10,
  fontSize: 13.5,
};

export const Route = createFileRoute("/suivi-demandes")({
  head: () => ({
    meta: [
      { title: "Suivi des demandes — Townsend Transit Express" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Espace de gestion des demandes clients — Direction TTE." },
    ],
  }),
  component: SuiviDemandesPage,
});
