import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyMailAddress, listMyMail, getMyMail, sendMyMail, type MailFolder } from "@/lib/mail.functions";
import "./MailPanel.css";

function formatDate(iso: string | null): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function initials(from: string): string {
  const name = from.split("@")[0]?.replace(/[._]/g, " ").trim() || "?";
  const parts = name.split(" ").filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

const REASON_LABELS: Record<string, string> = {
  not_logged_in: "Connecte-toi avec Discord pour accéder à ta messagerie.",
  not_registered: "Aucune adresse DeoMail n'est encore liée à ton compte Discord. Demande à un administrateur de t'enregistrer avec !register.",
  lookup_failed: "Impossible de retrouver ton adresse mail pour le moment.",
  read_failed: "Impossible de charger tes mails pour le moment.",
  send_failed: "L'envoi a échoué. Réessaie dans un instant.",
  forbidden: "Ce mail n'est pas accessible depuis ton compte.",
  invalid: "Vérifie les champs du formulaire (destinataire, objet, message).",
  // Codes détaillés remontés depuis deomail.server.ts, pour un diagnostic
  // direct sans avoir à aller lire les logs serveur.
  not_configured: "La messagerie n'est pas configurée sur le serveur (clé API DeoMail absente). Un administrateur doit définir DEOMAIL_API_KEY dans les variables d'environnement du site.",
  auth_failed: "DeoMail a refusé la clé API du site (clé invalide ou expirée). Vérifie la valeur de DEOMAIL_API_KEY.",
  network: "Le site n'arrive pas à contacter DeoMail (problème réseau ou service DeoMail indisponible). Réessaie dans un instant.",
};

// Dossiers façon webmail (Gmail / DeoMail). Inbox/Envoyés/Archives/
// Indésirables/Corbeille sont réellement branchés sur l'API DeoMail
// (GET /v1/emails?folder=...). Suivis et Brouillons restent désactivés :
// il n'existe pas d'équivalent (flag "starred" ou persistance de brouillon)
// exposé par l'API aujourd'hui.
const FOLDERS: Array<{ key: MailFolder | "starred" | "drafts"; label: string; icon: JSX.Element; enabled: boolean }> = [
  {
    key: "inbox",
    label: "Boîte de réception",
    enabled: true,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 12h4l2 3h6l2-3h4" />
        <path d="M5.5 6h13L21 12v7a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-7L5.5 6Z" />
      </svg>
    ),
  },
  {
    key: "starred",
    label: "Suivis",
    enabled: false,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m12 3 2.6 5.9 6.4.6-4.8 4.3 1.4 6.2L12 16.9 6.4 20l1.4-6.2-4.8-4.3 6.4-.6L12 3Z" />
      </svg>
    ),
  },
  {
    key: "sent",
    label: "Envoyés",
    enabled: true,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 2 11 13" />
        <path d="M22 2 15 22l-4-9-9-4 20-7Z" />
      </svg>
    ),
  },
  {
    key: "drafts",
    label: "Brouillons",
    enabled: false,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 4h12l4 4v12H4V4Z" />
        <path d="M8 12h8M8 16h5" />
      </svg>
    ),
  },
  {
    key: "archive",
    label: "Archives",
    enabled: true,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="5" rx="1" />
        <path d="M5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9M10 13h4" />
      </svg>
    ),
  },
  {
    key: "spam",
    label: "Indésirables",
    enabled: true,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9a2.5 2.5 0 1 1 3.7 2.2c-.7.4-1.2 1-1.2 1.8v.5M12 17h.01" />
      </svg>
    ),
  },
  {
    key: "trash",
    label: "Corbeille",
    enabled: true,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 7h16M9 7V4h6v3M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
      </svg>
    ),
  },
];

export default function MailPanel({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [composing, setComposing] = useState(false);
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"all" | "unread">("all");
  const [folder, setFolder] = useState<MailFolder>("inbox");

  const addressQuery = useQuery({
    queryKey: ["mail-address"],
    queryFn: () => getMyMailAddress(),
    staleTime: 5 * 60_000,
  });

  const inboxQuery = useQuery({
    queryKey: ["mail-folder", folder],
    queryFn: () => listMyMail({ data: { folder } }),
    refetchInterval: 30_000,
    staleTime: 15_000,
    enabled: addressQuery.data?.ok === true,
  });

  const mailQuery = useQuery({
    queryKey: ["mail-detail", selectedId],
    queryFn: () => getMyMail({ data: { id: selectedId as string } }),
    enabled: !!selectedId,
  });

  const sendMutation = useMutation({
    mutationFn: () => sendMyMail({ data: { to, subject, body } }),
    onSuccess: (res) => {
      if (res.ok) {
        setTo("");
        setSubject("");
        setBody("");
        setComposing(false);
        queryClient.invalidateQueries({ queryKey: ["mail-folder", "inbox"] });
        queryClient.invalidateQueries({ queryKey: ["mail-folder", "sent"] });
      }
    },
  });

  const address = addressQuery.data?.ok ? addressQuery.data.email : null;
  const allMails = inboxQuery.data?.ok ? inboxQuery.data.mails : [];
  const isInbox = folder === "inbox";
  const unreadCount = isInbox ? allMails.filter((m) => !m.isRead).length : 0;

  const mails = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allMails
      .filter((m) => (tab === "unread" && isInbox ? !m.isRead : true))
      .filter((m) =>
        q
          ? m.subject.toLowerCase().includes(q) ||
            m.from.toLowerCase().includes(q) ||
            (m.to ?? "").toLowerCase().includes(q) ||
            (m.preview ?? "").toLowerCase().includes(q)
          : true,
      );
  }, [allMails, tab, isInbox, search]);

  const globalError =
    (addressQuery.data && !addressQuery.data.ok && REASON_LABELS[addressQuery.data.reason]) ||
    (inboxQuery.data && !inboxQuery.data.ok && REASON_LABELS[inboxQuery.data.reason]) ||
    null;

  return (
    <div className="mailpanel-overlay" role="dialog" aria-label="Boîte mail employé">
      <div className="mailpanel">
        {/* ===== SIDEBAR ===== */}
        <aside className="mp-side">
          <div className="mp-side-top">
            <div className="mp-side-title">Mail TTE</div>
            {address && <div className="mp-side-address" title={address}>{address}</div>}
          </div>

          <button
            type="button"
            className="mp-compose-btn"
            onClick={() => { setComposing(true); setSelectedId(null); }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3"><path d="M12 5v14M5 12h14" /></svg>
            Nouveau message
          </button>

          <nav className="mp-folders">
            {FOLDERS.map((f) => (
              <button
                key={f.key}
                type="button"
                disabled={!f.enabled}
                title={f.enabled ? f.label : `${f.label} — bientôt disponible`}
                className={`mp-folder${folder === f.key ? " active" : ""}`}
                onClick={() => { if (f.enabled) { setFolder(f.key as MailFolder); setComposing(false); setSelectedId(null); } }}
              >
                {f.icon}
                <span>{f.label}</span>
                {f.key === "inbox" && unreadCount > 0 && <span className="mp-folder-count">{unreadCount}</span>}
                {!f.enabled && <span className="mp-folder-soon">Bientôt</span>}
              </button>
            ))}
          </nav>

          <button type="button" className="mp-side-close" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3"><path d="M15 3h4a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-4M10 17l-5-5 5-5M5 12h12" /></svg>
            Fermer
          </button>
        </aside>

        {/* ===== MAIN ===== */}
        <div className="mp-main">
          <div className="mp-topbar">
            <div className="mp-search">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" /></svg>
              <input
                type="text"
                placeholder="Rechercher des mails…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="mp-tabs">
              <button type="button" className={`mp-tab${tab === "all" ? " active" : ""}`} onClick={() => setTab("all")}>Tous</button>
              {isInbox && (
                <button type="button" className={`mp-tab${tab === "unread" ? " active" : ""}`} onClick={() => setTab("unread")}>Non lus</button>
              )}
            </div>
          </div>

          {globalError && <div className="mp-banner">{globalError}</div>}

          <div className="mp-body">
            <aside className="mp-list">
              {inboxQuery.isLoading && addressQuery.data?.ok && (
                <div className="mp-empty">Chargement…</div>
              )}
              {addressQuery.data?.ok && !inboxQuery.isLoading && mails.length === 0 && !globalError && (
                <div className="mp-empty">
                  {search ? "Aucun mail ne correspond à ta recherche." : tab === "unread" ? "Aucun mail non lu." : "Aucun mail dans ce dossier pour le moment."}
                </div>
              )}
              {mails.map((m) => {
                const counterparty = folder === "sent" ? (m.to || m.from) : m.from;
                return (
                  <button
                    key={m.id}
                    type="button"
                    className={`mp-item${selectedId === m.id ? " active" : ""}${isInbox && !m.isRead ? " unread" : ""}`}
                    onClick={() => { setSelectedId(m.id); setComposing(false); }}
                  >
                    <div className="mp-item-avatar">{initials(counterparty)}</div>
                    <div className="mp-item-main">
                      <div className="mp-item-top">
                        <span className="mp-item-from">{folder === "sent" ? `À ${counterparty}` : counterparty}</span>
                        <span className="mp-item-date">{formatDate(m.createdAt)}</span>
                      </div>
                      <div className="mp-item-subject">{m.subject}</div>
                      {m.preview && <div className="mp-item-preview">{m.preview}</div>}
                    </div>
                    {isInbox && !m.isRead && <span className="mp-item-dot" />}
                  </button>
                );
              })}
            </aside>

            <section className="mp-reader">
              {composing ? (
                <form
                  className="mp-compose"
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendMutation.mutate();
                  }}
                >
                  <div className="mp-compose-head">Nouveau message</div>
                  <label>
                    À
                    <input
                      type="email"
                      required
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                      placeholder="destinataire@domaine.com"
                    />
                  </label>
                  <label>
                    Objet
                    <input
                      type="text"
                      required
                      maxLength={200}
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </label>
                  <label className="mp-compose-body">
                    Message
                    <textarea
                      required
                      maxLength={20000}
                      rows={12}
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                    />
                  </label>
                  {sendMutation.data && !sendMutation.data.ok && (
                    <div className="mp-banner">
                      {REASON_LABELS[sendMutation.data.reason] ?? "L'envoi a échoué."}
                    </div>
                  )}
                  <div className="mp-compose-actions">
                    <button type="submit" className="mp-btn mp-btn-primary" disabled={sendMutation.isPending}>
                      {sendMutation.isPending ? "Envoi…" : "Envoyer"}
                    </button>
                    <button type="button" className="mp-btn" onClick={() => setComposing(false)}>
                      Annuler
                    </button>
                  </div>
                </form>
              ) : selectedId ? (
                mailQuery.isLoading ? (
                  <div className="mp-empty">Chargement du mail…</div>
                ) : mailQuery.data?.ok ? (
                  <div className="mp-read">
                    <div className="mp-read-toolbar">
                      <button type="button" className="mp-btn mp-back-mobile" onClick={() => setSelectedId(null)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3"><path d="m15 5-7 7 7 7" /></svg>
                        Retour
                      </button>
                      <button
                        type="button"
                        className="mp-btn"
                        onClick={() => {
                          setTo(folder === "sent" ? (mailQuery.data!.mail.to || mailQuery.data!.mail.from) : mailQuery.data!.mail.from);
                          setSubject(
                            mailQuery.data!.mail.subject.startsWith("Re:")
                              ? mailQuery.data!.mail.subject
                              : `Re: ${mailQuery.data!.mail.subject}`,
                          );
                          setBody("");
                          setComposing(true);
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3"><path d="m9 17-5-5 5-5M4 12h11a5 5 0 0 1 5 5v1" /></svg>
                        Répondre
                      </button>
                    </div>

                    <h3>{mailQuery.data.mail.subject}</h3>
                    <div className="mp-read-meta">
                      {folder === "sent" ? (
                        <>À <b>{mailQuery.data.mail.to || mailQuery.data.mail.from}</b></>
                      ) : (
                        <>De <b>{mailQuery.data.mail.from}</b></>
                      )} · {formatDate(mailQuery.data.mail.createdAt)}
                    </div>

                    {mailQuery.data.mail.html ? (
                      <div
                        className="mp-read-card"
                        // Contenu HTML généré côté serveur (deomail.server.ts / DeoMail),
                        // jamais saisi librement par un tiers non authentifié.
                        dangerouslySetInnerHTML={{ __html: mailQuery.data.mail.html }}
                      />
                    ) : (
                      <div className="mp-read-card mp-read-plain">
                        {mailQuery.data.mail.text || "(message vide)"}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mp-empty">{REASON_LABELS[mailQuery.data?.reason ?? ""] ?? "Impossible d'afficher ce mail."}</div>
                )
              ) : (
                <div className="mp-empty mp-empty-center">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 12h4l2 3h6l2-3h4" /><path d="M5.5 6h13L21 12v7a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-7L5.5 6Z" /></svg>
                  Sélectionne un mail dans la liste, ou compose un nouveau message.
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
