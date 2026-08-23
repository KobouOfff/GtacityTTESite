import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "@/components/DiscordAuth";
import { listMyContactRequests, replyToMyContactRequest } from "@/lib/contact.functions";
import {
  CONTACT_CATEGORIES,
  CONTACT_STATUSES,
  getBranchLabel,
} from "@/lib/discord-roles";
import type { ContactRequestRow } from "@/lib/contact.server";

const BRAND = "#4B92DD";

function MesDemandesPage() {
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const [filter, setFilter] = useState<"all" | "open" | "closed">("all");
  const [search, setSearch] = useState("");
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["my-contact-requests"],
    queryFn: () => listMyContactRequests(),
    enabled: !!user,
    staleTime: 30_000,
  });

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
            Connecte-toi avec Discord pour retrouver l'historique de tes demandes envoyées au service clientèle.
          </p>
          <a href="/api/public/discord/login?redirect=/mes-demandes" className="tte-btn" style={btnPrimary}>
            Se connecter avec Discord
          </a>
        </div>
      </Shell>
    );
  }

  const rows = data?.ok ? data.rows : [];
  const openCount = rows.filter((row) => row.status !== "ferme").length;
  const closedCount = rows.length - openCount;
  const visibleRows = rows.filter((row) => {
    if (filter === "open" && row.status === "ferme") return false;
    if (filter === "closed" && row.status !== "ferme") return false;
    if (!search.trim()) return true;
    const needle = search.trim().toLowerCase();
    return (
      row.subject.toLowerCase().includes(needle) ||
      row.ref.toLowerCase().includes(needle) ||
      row.message.toLowerCase().includes(needle)
    );
  });

  return (
    <Shell>
      <section style={hero}>
        <div style={heroGlow} aria-hidden />
        <div style={heroGrid} aria-hidden />
        <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={eyebrow}>Espace client · Service clientèle</div>
            <h1 style={{ margin: "10px 0 8px", fontSize: 36, lineHeight: 1.05, letterSpacing: -1.4, fontWeight: 800 }}>
              Mes{" "}
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
            <p style={{ ...muted, margin: 0, maxWidth: 520, lineHeight: 1.65 }}>
              Bonjour <b style={{ color: "#e2e8f0" }}>{user.username}</b>, retrouve ici le suivi complet de tes échanges
              avec l’équipe Townsend Transit Express.
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

        {rows.length > 0 && (
          <div style={statRow}>
            <Stat label="Demandes" value={rows.length} color="#e2e8f0" icon="🗂" />
            <Stat label="En cours" value={openCount} color={BRAND} icon="⏳" />
            <Stat label="Fermées" value={closedCount} color="#94a3b8" icon="✓" />
          </div>
        )}
      </section>

      {rows.length > 1 && (
        <div style={toolbar}>
          <div style={{ display: "flex", gap: 6 }}>
            {([
              ["all", `Toutes · ${rows.length}`],
              ["open", `En cours · ${openCount}`],
              ["closed", `Fermées · ${closedCount}`],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className="tte-btn"
                style={{ ...chip, ...(filter === key ? chipActive : null) }}
              >
                {label}
              </button>
            ))}
          </div>
          <input
            className="tte-input"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher une référence, un sujet…"
            style={{ ...selectStyle, padding: "9px 13px", fontSize: 13.5, minWidth: 240, flex: "1 1 220px" }}
          />
        </div>
      )}

      {isLoading ? (
        <div style={{ display: "grid", gap: 14 }}>
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : data && !data.ok ? (
        <div style={{ ...card, borderColor: "rgba(248,113,113,0.4)", background: "rgba(127,29,29,0.18)" }}>
          Impossible de charger tes demandes ({data.reason}).
        </div>
      ) : rows.length === 0 ? (
        <div style={{ ...card, textAlign: "center", padding: "42px 22px" }}>
          <div style={iconCircle}>📮</div>
          <h2 style={{ margin: "14px 0 6px", fontSize: 20 }}>Aucune demande pour le moment</h2>
          <p style={{ ...muted, margin: "0 auto 20px", maxWidth: 400, lineHeight: 1.6 }}>
            Une question, une réclamation ou un objet perdu ? L'équipe TTE te répond depuis cet espace.
          </p>
          <a href="/contact" className="tte-btn" style={btnPrimary}>Ouvrir une demande</a>
        </div>
      ) : visibleRows.length === 0 ? (
        <div style={{ ...card, textAlign: "center", padding: "34px 22px", ...muted }}>
          Aucune demande ne correspond à ce filtre.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 14 }}>
          {visibleRows.map((row, index) => (
            <ClientRequestCard key={row.id} row={row} index={index} />
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

function ClientRequestCard({ row, index }: { row: ContactRequestRow; index: number }) {
  const queryClient = useQueryClient();
  const [reply, setReply] = useState("");
  const [open, setOpen] = useState(index === 0);
  const status = CONTACT_STATUSES[row.status] ?? { label: row.status, color: "#64748b" };
  const publicMessages = row.messages?.filter((message) => message.visibility === "public") ?? [];
  const exchanges = publicMessages.length + 1;

  const mutation = useMutation({
    mutationFn: () => replyToMyContactRequest({ data: { id: row.id, message: reply.trim() } }),
    onSuccess: async (result) => {
      if (result.ok) {
        setReply("");
        await queryClient.refetchQueries({
          queryKey: ["my-contact-requests"],
          type: "active",
        });
      } else {
        alert(
          result.reason === "closed"
            ? "Cette demande est fermée et ne peut plus recevoir de réponse."
            : `Impossible d’envoyer la réponse (${result.reason}).`,
        );
      }
    },
    onError: (error) => alert(`Erreur : ${String(error)}`),
  });

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
      <div style={{ height: 3, background: `linear-gradient(90deg, ${status.color}, transparent)` }} />
      <div style={{ padding: "16px 18px" }}>
        <header
          onClick={() => setOpen((value) => !value)}
          style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", cursor: "pointer" }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11, color: "#7c8db0", fontFamily: "ui-monospace, monospace", letterSpacing: 0.6 }}>
              {row.ref}
            </div>
            <div style={{ fontWeight: 700, fontSize: 17, marginTop: 3, letterSpacing: -0.3 }}>{row.subject}</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginTop: 8 }}>
              <span style={tag}>{CONTACT_CATEGORIES[row.category] ?? row.category}</span>
              <span style={{ ...muted, fontSize: 12.5 }}>
                déposée le {new Date(row.created_at).toLocaleString("fr-FR")}
              </span>
              <span style={{ ...muted, fontSize: 12.5 }}>· {exchanges} message{exchanges > 1 ? "s" : ""}</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ ...pill, background: status.color + "1f", color: status.color, borderColor: status.color + "55" }}>
              <span style={{ ...dot, background: status.color }} />
              {status.label}
            </span>
            <span style={{ ...muted, fontSize: 13, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
          </div>
        </header>

        {row.assigned_branch && (
          <div style={{ marginTop: 12, ...muted, fontSize: 13 }}>
            Service chargé du dossier : <b style={{ color: "#e2e8f0" }}>{getBranchLabel(row.assigned_branch)}</b>
          </div>
        )}

        {open && (
          <>
            <div style={{ marginTop: 14, borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 14 }}>
              <div style={{ ...muted, fontSize: 11, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>
                Conversation avec l’équipe TTE
              </div>
              <div style={{ display: "grid", gap: 10 }}>
                <ConversationBubble author="Vous" at={row.created_at} message={row.message} client />
                {publicMessages.map((message) => (
                  <ConversationBubble
                    key={message.id}
                    author={message.author_type === "client" ? "Vous" : message.author_name}
                    at={message.created_at}
                    message={message.message}
                    client={message.author_type === "client"}
                  />
                ))}
              </div>
            </div>

            {row.status !== "ferme" ? (
              <div style={{ marginTop: 16, display: "grid", gap: 8 }}>
                <label style={{ ...muted, fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>
                  Répondre à l’équipe TTE
                </label>
                <textarea
                  className="tte-input"
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  rows={3}
                  maxLength={5000}
                  placeholder="Écris ta réponse ou apporte une information complémentaire…"
                  style={{ ...selectStyle, resize: "vertical", fontFamily: "inherit", width: "100%", lineHeight: 1.5 }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                  <span style={{ ...muted, fontSize: 11 }}>{reply.length}/5000</span>
                  <button
                    onClick={() => mutation.mutate()}
                    disabled={mutation.isPending || !reply.trim()}
                    className="tte-btn"
                    style={{
                      ...btnPrimary,
                      opacity: mutation.isPending || !reply.trim() ? 0.5 : 1,
                      cursor: mutation.isPending || !reply.trim() ? "not-allowed" : "pointer",
                    }}
                  >
                    {mutation.isPending ? "Envoi…" : "Envoyer ma réponse"}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ ...closedNote }}>
                Cette demande est fermée. Ouvre une nouvelle demande si tu as besoin d’aide.
              </div>
            )}
          </>
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
        <div style={{ fontSize: 11.5, color: "#94a3b8" }}>
          <b style={{ color: "#e2e8f0" }}>{author}</b> · {new Date(at).toLocaleString("fr-FR")}
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
        border: `2px solid rgba(255,255,255,0.15)`,
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
        background: "radial-gradient(1000px 500px at 15% -10%, rgba(75,146,221,0.18), transparent 60%), #0b1220",
        color: "#f1f5f9",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <style>{css}</style>
      <header
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          padding: "14px 22px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "rgba(11,18,32,0.72)",
          backdropFilter: "blur(10px)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <a href="/" style={{ color: "#f1f5f9", textDecoration: "none", fontWeight: 800, letterSpacing: -0.5 }}>
          <span style={{ color: BRAND }}>TTE</span> · Espace demandes
        </a>
        <nav style={{ display: "flex", gap: 16, fontSize: 13 }}>
          <a href="/contact" className="tte-link" style={navLink}>Nouvelle demande</a>
          <a href="/" className="tte-link" style={navLink}>Accueil</a>
        </nav>
      </header>
      <main style={{ maxWidth: 920, margin: "0 auto", padding: "28px 22px 70px", display: "grid", gap: 20 }}>
        {children}
      </main>
    </div>
  );
}

const css = `
@keyframes tte-spin { to { transform: rotate(360deg); } }
@keyframes tte-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@keyframes tte-shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
.tte-shimmer {
  background: linear-gradient(90deg, rgba(255,255,255,0.02), rgba(255,255,255,0.07), rgba(255,255,255,0.02));
  background-size: 800px 100%;
  animation: tte-shimmer 1.3s linear infinite;
}
.tte-card { transition: border-color .2s ease, transform .2s ease, box-shadow .2s ease; }
.tte-card:hover { border-color: rgba(75,146,221,0.35); box-shadow: 0 14px 40px -22px rgba(0,0,0,0.9); }
.tte-btn { transition: filter .2s ease, transform .12s ease; }
.tte-btn:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); }
.tte-btn:active:not(:disabled) { transform: translateY(0); }
.tte-link { transition: color .18s ease; }
.tte-link:hover { color: #f1f5f9 !important; }
.tte-input { transition: border-color .2s ease, box-shadow .2s ease; outline: none; }
.tte-input:focus { border-color: rgba(75,146,221,0.6); box-shadow: 0 0 0 3px rgba(75,146,221,0.15); }
`;

const muted: React.CSSProperties = { color: "#94a3b8" };
const navLink: React.CSSProperties = { color: "#94a3b8", textDecoration: "none" };
const card: React.CSSProperties = {
  background: "rgba(255,255,255,0.035)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 16,
  padding: "16px 18px",
};
const hero: React.CSSProperties = {
  position: "relative",
  overflow: "hidden",
  borderRadius: 20,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "linear-gradient(160deg, rgba(75,146,221,0.16), rgba(255,255,255,0.02) 55%)",
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
  background: "linear-gradient(160deg, rgba(255,255,255,0.06), rgba(0,0,0,0.28))",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 14,
  padding: "12px 15px",
  display: "flex",
  alignItems: "center",
  gap: 12,
};
const heroGrid: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  backgroundImage:
    "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
  backgroundSize: "34px 34px",
  maskImage: "radial-gradient(120% 90% at 20% 0%, #000, transparent 70%)",
  WebkitMaskImage: "radial-gradient(120% 90% at 20% 0%, #000, transparent 70%)",
  pointerEvents: "none",
};
const toolbar: React.CSSProperties = {
  display: "flex",
  gap: 10,
  alignItems: "center",
  flexWrap: "wrap",
  justifyContent: "space-between",
};
const chip: React.CSSProperties = {
  padding: "8px 14px",
  borderRadius: 999,
  fontSize: 13,
  fontWeight: 600,
  background: "rgba(255,255,255,0.04)",
  color: "#94a3b8",
  border: "1px solid rgba(255,255,255,0.09)",
  cursor: "pointer",
};
const chipActive: React.CSSProperties = {
  background: "rgba(75,146,221,0.18)",
  borderColor: "rgba(75,146,221,0.45)",
  color: "#dcecff",
};
const statIcon: React.CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 15,
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
  flexShrink: 0,
};
const tag: React.CSSProperties = {
  fontSize: 11.5,
  padding: "3px 9px",
  borderRadius: 999,
  background: "rgba(75,146,221,0.14)",
  border: "1px solid rgba(75,146,221,0.28)",
  color: "#bcd8f5",
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
const closedNote: React.CSSProperties = {
  marginTop: 16,
  fontSize: 12.5,
  color: "#94a3b8",
  background: "rgba(255,255,255,0.03)",
  border: "1px dashed rgba(255,255,255,0.12)",
  borderRadius: 10,
  padding: "10px 12px",
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
  background: "rgba(255,255,255,0.05)",
  color: "#e2e8f0",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 10,
  fontSize: 13,
  cursor: "pointer",
  fontWeight: 600,
};
const selectStyle: React.CSSProperties = {
  padding: "11px 13px",
  background: "rgba(0,0,0,0.3)",
  color: "#f1f5f9",
  border: "1px solid rgba(255,255,255,0.13)",
  borderRadius: 10,
  fontSize: 14,
};

export const Route = createFileRoute("/mes-demandes")({
  head: () => ({
    meta: [
      { title: "Mes demandes — Townsend Transit Express" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Suivi de vos demandes envoyées au service clientèle Townsend Transit Express." },
    ],
  }),
  component: MesDemandesPage,
});
