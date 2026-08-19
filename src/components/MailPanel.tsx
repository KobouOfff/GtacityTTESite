import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyMailAddress, listMyInbox, getMyMail, sendMyMail } from "@/lib/mail.functions";
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

const REASON_LABELS: Record<string, string> = {
  not_logged_in: "Connecte-toi avec Discord pour accéder à ta messagerie.",
  not_registered: "Aucune adresse DeoMail n'est encore liée à ton compte Discord. Demande à un administrateur de t'enregistrer avec !register.",
  lookup_failed: "Impossible de retrouver ton adresse mail pour le moment.",
  read_failed: "Impossible de charger tes mails pour le moment.",
  send_failed: "L'envoi a échoué. Réessaie dans un instant.",
  forbidden: "Ce mail n'est pas accessible depuis ton compte.",
  invalid: "Vérifie les champs du formulaire (destinataire, objet, message).",
};

export default function MailPanel({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [composing, setComposing] = useState(false);
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const addressQuery = useQuery({
    queryKey: ["mail-address"],
    queryFn: () => getMyMailAddress(),
    staleTime: 5 * 60_000,
  });

  const inboxQuery = useQuery({
    queryKey: ["mail-inbox"],
    queryFn: () => listMyInbox(),
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
        queryClient.invalidateQueries({ queryKey: ["mail-inbox"] });
      }
    },
  });

  const address = addressQuery.data?.ok ? addressQuery.data.email : null;
  const mails = inboxQuery.data?.ok ? inboxQuery.data.mails : [];
  const globalError =
    (addressQuery.data && !addressQuery.data.ok && REASON_LABELS[addressQuery.data.reason]) ||
    (inboxQuery.data && !inboxQuery.data.ok && REASON_LABELS[inboxQuery.data.reason]) ||
    null;

  return (
    <div className="mailpanel-overlay" role="dialog" aria-label="Boîte mail employé">
      <div className="mailpanel">
        <div className="mp-head">
          <div className="mp-head-title">
            <span>Boîte mail</span>
            {address && <span className="mp-address">{address}</span>}
          </div>
          <div className="mp-head-actions">
            <button type="button" className="mp-btn mp-btn-primary" onClick={() => { setComposing(true); setSelectedId(null); }}>
              Nouveau message
            </button>
            <button type="button" className="mp-btn mp-close" onClick={onClose} aria-label="Fermer">
              ✕
            </button>
          </div>
        </div>

        {globalError && <div className="mp-banner">{globalError}</div>}

        <div className="mp-body">
          <aside className="mp-list">
            {inboxQuery.isLoading && addressQuery.data?.ok && (
              <div className="mp-empty">Chargement…</div>
            )}
            {addressQuery.data?.ok && !inboxQuery.isLoading && mails.length === 0 && !globalError && (
              <div className="mp-empty">Aucun mail reçu pour le moment.</div>
            )}
            {mails.map((m) => (
              <button
                key={m.id}
                type="button"
                className={`mp-item${selectedId === m.id ? " active" : ""}${m.isRead ? "" : " unread"}`}
                onClick={() => { setSelectedId(m.id); setComposing(false); }}
              >
                <div className="mp-item-top">
                  <span className="mp-item-from">{m.from}</span>
                  <span className="mp-item-date">{formatDate(m.createdAt)}</span>
                </div>
                <div className="mp-item-subject">{m.subject}</div>
                {m.preview && <div className="mp-item-preview">{m.preview}</div>}
              </button>
            ))}
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
                  <h3>{mailQuery.data.mail.subject}</h3>
                  <div className="mp-read-meta">
                    De <b>{mailQuery.data.mail.from}</b> · {formatDate(mailQuery.data.mail.createdAt)}
                  </div>
                  <div className="mp-read-body">
                    {mailQuery.data.mail.text ||
                      mailQuery.data.mail.html?.replace(/<[^>]+>/g, " ") ||
                      "(message vide)"}
                  </div>
                  <button
                    type="button"
                    className="mp-btn"
                    onClick={() => {
                      setTo(mailQuery.data!.mail.from);
                      setSubject(
                        mailQuery.data!.mail.subject.startsWith("Re:")
                          ? mailQuery.data!.mail.subject
                          : `Re: ${mailQuery.data!.mail.subject}`,
                      );
                      setBody("");
                      setComposing(true);
                    }}
                  >
                    Répondre
                  </button>
                </div>
              ) : (
                <div className="mp-empty">{REASON_LABELS[mailQuery.data?.reason ?? ""] ?? "Impossible d'afficher ce mail."}</div>
              )
            ) : (
              <div className="mp-empty">Sélectionne un mail dans la liste, ou compose un nouveau message.</div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
