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

function MesDemandesPage() {
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["my-contact-requests"],
    queryFn: () => listMyContactRequests(),
    enabled: !!user,
    staleTime: 30_000,
  });

  if (userLoading) {
    return <Shell><div style={muted}>Chargement…</div></Shell>;
  }
  if (!user) {
    return (
      <Shell>
        <div style={card}>
          <h2 style={{ marginTop: 0 }}>Connexion requise</h2>
          <p style={muted}>
            Connecte-toi avec Discord pour retrouver l'historique de tes demandes envoyées au service clientèle.
          </p>
          <a href="/api/public/discord/login?redirect=/mes-demandes" style={btnPrimary}>
            Se connecter avec Discord
          </a>
        </div>
      </Shell>
    );
  }

  const rows = data?.ok ? data.rows : [];

  return (
    <Shell>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: "0 0 4px" }}>Mes demandes</h1>
          <p style={{ ...muted, margin: 0 }}>
            Suivi des demandes envoyées au service clientèle TTE, liées à ton compte Discord.
          </p>
        </div>
        <button onClick={() => refetch()} disabled={isFetching} style={btnGhost}>
          {isFetching ? "Actualisation…" : "↻ Actualiser"}
        </button>
      </div>

      {isLoading ? (
        <div style={muted}>Chargement de tes demandes…</div>
      ) : data && !data.ok ? (
        <div style={{ ...card, borderColor: "#7f1d1d" }}>
          Impossible de charger tes demandes ({data.reason}).
        </div>
      ) : rows.length === 0 ? (
        <div style={card}>
          <p style={{ margin: 0 }}>Tu n'as pas encore envoyé de demande.</p>
          <a href="/contact" style={{ ...btnPrimary, marginTop: 12, display: "inline-block" }}>
            Ouvrir une demande
          </a>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {rows.map((row) => <ClientRequestCard key={row.id} row={row} />)}
        </div>
      )}
    </Shell>
  );
}

function ClientRequestCard({ row }: { row: ContactRequestRow }) {
  const queryClient = useQueryClient();
  const [reply, setReply] = useState("");
  const status = CONTACT_STATUSES[row.status] ?? { label: row.status, color: "#64748b" };
  const publicMessages = row.messages?.filter((message) => message.visibility === "public") ?? [];

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
    <article style={card}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 12, color: "#94a3b8", fontFamily: "ui-monospace, monospace" }}>{row.ref}</div>
          <div style={{ fontWeight: 700, fontSize: 16, marginTop: 2 }}>{row.subject}</div>
          <div style={{ ...muted, marginTop: 4, fontSize: 13 }}>
            {CONTACT_CATEGORIES[row.category] ?? row.category} · déposée le{" "}
            {new Date(row.created_at).toLocaleString("fr-FR")}
          </div>
        </div>
        <span style={{ ...pill, background: status.color + "22", color: status.color, borderColor: status.color + "55" }}>
          {status.label}
        </span>
      </header>

      {row.assigned_branch && (
        <div style={{ marginTop: 10, ...muted, fontSize: 13 }}>
          Service chargé du dossier : <b style={{ color: "#e2e8f0" }}>{getBranchLabel(row.assigned_branch)}</b>
        </div>
      )}

      <div style={{ marginTop: 14, borderTop: "1px dashed rgba(255,255,255,0.1)", paddingTop: 12 }}>
        <div style={{ ...muted, fontSize: 12, marginBottom: 8 }}>Conversation avec l’équipe TTE</div>
        <div style={{ display: "grid", gap: 8 }}>
          <ConversationBubble
            author="Vous"
            at={row.created_at}
            message={row.message}
            client
          />
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
        <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
          <label style={{ ...muted, fontSize: 12 }}>Répondre à l’équipe TTE</label>
          <textarea
            value={reply}
            onChange={(event) => setReply(event.target.value)}
            rows={3}
            maxLength={5000}
            placeholder="Écris ta réponse ou apporte une information complémentaire…"
            style={{ ...selectStyle, resize: "vertical", fontFamily: "inherit", width: "100%" }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending || !reply.trim()}
              style={{
                ...btnPrimary,
                opacity: mutation.isPending || !reply.trim() ? 0.55 : 1,
              }}
            >
              {mutation.isPending ? "Envoi…" : "Envoyer ma réponse"}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ ...muted, marginTop: 14, fontSize: 12 }}>
          Cette demande est fermée. Ouvre une nouvelle demande si tu as besoin d’aide.
        </div>
      )}
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
  return (
    <div
      style={{
        background: client ? "rgba(88,101,242,0.14)" : "rgba(34,197,94,0.1)",
        border: `1px solid ${client ? "rgba(88,101,242,0.3)" : "rgba(34,197,94,0.24)"}`,
        borderRadius: 10,
        padding: "9px 11px",
        marginLeft: client ? 32 : 0,
        marginRight: client ? 0 : 32,
      }}
    >
      <div style={{ fontSize: 12, color: "#94a3b8" }}>
        <b style={{ color: "#e2e8f0" }}>{author}</b> · {new Date(at).toLocaleString("fr-FR")}
      </div>
      <div style={{ marginTop: 4, whiteSpace: "pre-wrap" }}>{message}</div>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "#f1f5f9", fontFamily: "system-ui, sans-serif" }}>
      <header style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "14px 22px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <a href="/" style={{ color: "#f1f5f9", textDecoration: "none", fontWeight: 700, letterSpacing: -0.5 }}>
          <span style={{ color: "#4B92DD" }}>TTE</span> · Espace demandes
        </a>
        <nav style={{ display: "flex", gap: 14, fontSize: 13 }}>
          <a href="/contact" style={{ color: "#94a3b8", textDecoration: "none" }}>Nouvelle demande</a>
          <a href="/" style={{ color: "#94a3b8", textDecoration: "none" }}>Accueil</a>
        </nav>
      </header>
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "28px 22px 60px", display: "grid", gap: 18 }}>
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
  padding: "10px 16px",
  background: "#5865F2",
  color: "#fff",
  borderRadius: 8,
  textDecoration: "none",
  fontWeight: 600,
  display: "inline-block",
  border: "none",
  cursor: "pointer",
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
  padding: "9px 11px",
  background: "rgba(0,0,0,0.3)",
  color: "#f1f5f9",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 8,
  fontSize: 13,
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
