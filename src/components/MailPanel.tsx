import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyMailAddress, listMyMail, getMyMail, sendMyMail, moveMyMail, listMailableEmployees, type MailFolder, type MailAttachmentInput } from "@/lib/mail.functions";
import { MAIL_TEMPLATES, getMailTemplate, getTemplatePlaceholders, labelFor, fillTemplate } from "@/lib/mail-templates";
import "./MailPanel.css";

const MAX_ATTACHMENTS = 5;
const MAX_ATTACHMENTS_TOTAL_BYTES = 10 * 1024 * 1024;

type PendingAttachment = {
  filename: string;
  size: number;
  contentType: string;
  content: string; // base64, sans préfixe data:...
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // "data:<mime>;base64,<data>" -> on ne garde que la partie base64.
      const idx = result.indexOf(",");
      resolve(idx >= 0 ? result.slice(idx + 1) : result);
    };
    reader.onerror = () => reject(reader.error ?? new Error("Lecture du fichier impossible"));
    reader.readAsDataURL(file);
  });
}

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

// Dossiers vers lesquels un mail peut être déplacé (on exclut "sent", qui
// est un dossier calculé sur la direction d'envoi, pas une destination).
const MOVE_TARGETS: Array<{ key: MailFolder; label: string }> = [
  { key: "inbox", label: "Boîte de réception" },
  { key: "archive", label: "Archives" },
  { key: "spam", label: "Indésirables" },
  { key: "trash", label: "Corbeille" },
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
  const [templateId, setTemplateId] = useState<number>(0);
  const [templateValues, setTemplateValues] = useState<Record<string, string>>({});
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);

  const selectedTemplate = templateId ? getMailTemplate(templateId) : undefined;
  const placeholders = useMemo(
    () => (selectedTemplate ? getTemplatePlaceholders(selectedTemplate) : []),
    [selectedTemplate],
  );

  // Recalcule l'objet/le corps à partir du modèle choisi à chaque fois que
  // le modèle ou une valeur de champ change (comme l'aperçu de !mail sur Discord).
  useEffect(() => {
    if (!selectedTemplate) return;
    const { subject: s, body: b } = fillTemplate(selectedTemplate, templateValues);
    setSubject(s);
    setBody(b);
  }, [selectedTemplate, templateValues]);

  function resetCompose() {
    setTo("");
    setSubject("");
    setBody("");
    setTemplateId(0);
    setTemplateValues({});
    setAttachments([]);
    setAttachmentError(null);
  }

  async function handleFilesSelected(files: FileList | null) {
    if (!files || files.length === 0) return;
    setAttachmentError(null);
    const incoming = Array.from(files);
    if (attachments.length + incoming.length > MAX_ATTACHMENTS) {
      setAttachmentError(`⚠️ ${MAX_ATTACHMENTS} fichiers maximum.`);
      return;
    }
    const currentTotal = attachments.reduce((sum, a) => sum + a.size, 0);
    const incomingTotal = incoming.reduce((sum, f) => sum + f.size, 0);
    if (currentTotal + incomingTotal > MAX_ATTACHMENTS_TOTAL_BYTES) {
      setAttachmentError("⚠️ 10 Mo maximum au total.");
      return;
    }
    try {
      const read = await Promise.all(
        incoming.map(async (f) => ({
          filename: f.name,
          size: f.size,
          contentType: f.type || "application/octet-stream",
          content: await readFileAsBase64(f),
        })),
      );
      setAttachments((prev) => [...prev, ...read]);
    } catch {
      setAttachmentError("⚠️ Impossible de lire un des fichiers, réessaie.");
    }
  }

  function removeAttachment(filename: string) {
    setAttachments((prev) => prev.filter((a) => a.filename !== filename));
  }

  const addressQuery = useQuery({
    queryKey: ["mail-address"],
    queryFn: () => getMyMailAddress(),
    staleTime: 5 * 60_000,
  });

  const directoryQuery = useQuery({
    queryKey: ["mail-directory"],
    queryFn: () => listMailableEmployees(),
    staleTime: 5 * 60_000,
  });
  const directory = directoryQuery.data?.ok ? directoryQuery.data.employees : [];

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
    mutationFn: () => {
      const attachmentsPayload: MailAttachmentInput[] | undefined = attachments.length
        ? attachments.map((a) => ({ filename: a.filename, content: a.content, contentType: a.contentType }))
        : undefined;
      return sendMyMail({ data: { to, subject, body, attachments: attachmentsPayload } });
    },
    onSuccess: (res) => {
      if (res.ok) {
        resetCompose();
        setComposing(false);
        queryClient.invalidateQueries({ queryKey: ["mail-folder", "inbox"] });
        queryClient.invalidateQueries({ queryKey: ["mail-folder", "sent"] });
      }
    },
  });

  const moveMutation = useMutation({
    mutationFn: (vars: { id: string; targetFolder: MailFolder; sourceFolder: MailFolder }) =>
      moveMyMail({ data: { id: vars.id, folder: vars.targetFolder } }),
    onSuccess: (res, vars) => {
      if (res.ok) {
        setSelectedId(null);
        queryClient.invalidateQueries({ queryKey: ["mail-folder", vars.sourceFolder] });
        queryClient.invalidateQueries({ queryKey: ["mail-folder", vars.targetFolder] });
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
            onClick={() => { resetCompose(); setComposing(true); setSelectedId(null); }}
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
                    Destinataire (annuaire employés)
                    <select
                      value=""
                      onChange={(e) => {
                        if (e.target.value) setTo(e.target.value);
                        e.target.value = "";
                      }}
                    >
                      <option value="">
                        {directoryQuery.isLoading
                          ? "Chargement de l'annuaire…"
                          : directory.length === 0
                            ? "Aucun employé enregistré"
                            : "— Choisir un employé —"}
                      </option>
                      {directory.map((emp) => (
                        <option key={emp.email} value={emp.email}>
                          {emp.name ? `${emp.name} — ${emp.email}` : emp.email}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    À
                    <input
                      type="email"
                      required
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                      placeholder="destinataire@domaine.com"
                      list="mp-employee-directory"
                    />
                    <datalist id="mp-employee-directory">
                      {directory.map((emp) => (
                        <option key={emp.email} value={emp.email}>
                          {emp.name ? `${emp.name} (${emp.email})` : emp.email}
                        </option>
                      ))}
                    </datalist>
                  </label>

                  <label>
                    Modèle prédéfini
                    <select
                      value={templateId}
                      onChange={(e) => {
                        const id = Number(e.target.value);
                        setTemplateId(id);
                        setTemplateValues({});
                        if (id === 0) {
                          setSubject("");
                          setBody("");
                        }
                      }}
                    >
                      <option value={0}>Mail libre (rédiger moi-même)</option>
                      {MAIL_TEMPLATES.map((t) => (
                        <option key={t.id} value={t.id}>{t.title}</option>
                      ))}
                    </select>
                  </label>

                  {selectedTemplate && placeholders.length > 0 && (
                    <div className="mp-template-fields">
                      {placeholders.map((ph) => (
                        <label key={ph}>
                          {labelFor(ph)}
                          <input
                            type="text"
                            value={templateValues[ph] ?? ""}
                            onChange={(e) => setTemplateValues((prev) => ({ ...prev, [ph]: e.target.value }))}
                            placeholder={labelFor(ph)}
                          />
                        </label>
                      ))}
                    </div>
                  )}

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
                      rows={selectedTemplate ? 8 : 12}
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                    />
                  </label>

                  <div className="mp-attachments">
                    <div className="mp-attachments-head">
                      <span>Pièces jointes</span>
                      <label className="mp-attach-btn">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21.44 11.05 12.25 20.24a5 5 0 0 1-7.07-7.07l9.19-9.19a3.5 3.5 0 0 1 4.95 4.95L9.83 18.42a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
                        Joindre
                        <input
                          type="file"
                          multiple
                          hidden
                          onChange={(e) => {
                            void handleFilesSelected(e.target.files);
                            e.target.value = "";
                          }}
                        />
                      </label>
                    </div>
                    {attachments.length > 0 && (
                      <ul className="mp-attach-list">
                        {attachments.map((a) => (
                          <li key={a.filename} className="mp-attach-chip">
                            <span className="mp-attach-name" title={a.filename}>{a.filename}</span>
                            <span className="mp-attach-size">{formatSize(a.size)}</span>
                            <button type="button" onClick={() => removeAttachment(a.filename)} aria-label={`Retirer ${a.filename}`}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 6l12 12M18 6 6 18" /></svg>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="mp-attach-hint">Jusqu'à {MAX_ATTACHMENTS} fichiers, 10 Mo au total.</div>
                    {attachmentError && <div className="mp-banner">{attachmentError}</div>}
                  </div>

                  {sendMutation.data && !sendMutation.data.ok && (
                    <div className="mp-banner">
                      {REASON_LABELS[sendMutation.data.reason] ?? "L'envoi a échoué."}
                    </div>
                  )}
                  <div className="mp-compose-actions">
                    <button type="submit" className="mp-btn mp-btn-primary" disabled={sendMutation.isPending}>
                      {sendMutation.isPending ? "Envoi…" : "Envoyer"}
                    </button>
                    <button type="button" className="mp-btn" onClick={() => { resetCompose(); setComposing(false); }}>
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
                          setTemplateId(0);
                          setTemplateValues({});
                          setAttachments([]);
                          setAttachmentError(null);
                          setComposing(true);
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3"><path d="m9 17-5-5 5-5M4 12h11a5 5 0 0 1 5 5v1" /></svg>
                        Répondre
                      </button>
                      <label className="mp-move-select">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 8a2 2 0 0 0-2-2h-6l-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h5" /><path d="M16 19h6M19 16l3 3-3 3" /></svg>
                        <select
                          value=""
                          disabled={moveMutation.isPending}
                          onChange={(e) => {
                            const targetFolder = e.target.value as MailFolder;
                            if (!targetFolder || targetFolder === folder || !selectedId) return;
                            moveMutation.mutate({ id: selectedId, targetFolder, sourceFolder: folder });
                          }}
                        >
                          <option value="" disabled>
                            {moveMutation.isPending ? "Déplacement…" : "Déplacer vers…"}
                          </option>
                          {MOVE_TARGETS.filter((t) => t.key !== folder).map((t) => (
                            <option key={t.key} value={t.key}>{t.label}</option>
                          ))}
                        </select>
                      </label>
                      {moveMutation.isError && (
                        <span className="mp-move-error">Échec du déplacement.</span>
                      )}
                      {moveMutation.data && !moveMutation.data.ok && (
                        <span className="mp-move-error">
                          {REASON_LABELS[moveMutation.data.reason] ?? "Échec du déplacement."}
                        </span>
                      )}
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
