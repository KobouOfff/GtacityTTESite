import { useEffect, useState, useCallback } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  listBlacklistEntries,
  createBlacklistEntry,
  revokeBlacklistEntry,
  addBlacklistNoteFn,
} from "@/lib/blacklist.functions";
import type { BlacklistRow } from "@/lib/blacklist.server";
import { createBlacklistPdf, blacklistPdfFilename } from "@/lib/blacklist-pdf";
import { useCurrentUser } from "@/components/DiscordAuth";
import { REASON_TEMPLATES, INFRACTION_TEMPLATES } from "@/lib/blacklist-templates";

type Draft = {
  first_name: string;
  last_name: string;
  alias: string;
  date_of_birth: string;
  physical_description: string;
  reason: string;
  infractions: string;
  scope: string;
  start_date: string;
  end_date: string;
  is_permanent: boolean;
};

const SCOPE_LABELS: Record<string, string> = {
  all: "Toutes les infrastructures TTE",
  stations: "Gares et quais",
  trains: "Trains et bus TTE",
  offices: "Bureaux et installations administratives",
  events: "Événements & manifestations TTE",
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function emptyDraft(): Draft {
  return {
    first_name: "",
    last_name: "",
    alias: "",
    date_of_birth: "",
    physical_description: "",
    reason: "",
    infractions: "",
    scope: "all",
    start_date: todayISO(),
    end_date: "",
    is_permanent: false,
  };
}

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
  } catch {
    return iso;
  }
}

function fmtDateTime(iso: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

function generatePdf(row: BlacklistRow) {
  createBlacklistPdf(row).save(blacklistPdfFilename(row));
}

export default function BlacklistPanel() {
  const { data: user } = useCurrentUser();
  const list = useServerFn(listBlacklistEntries);
  const create = useServerFn(createBlacklistEntry);
  const revoke = useServerFn(revokeBlacklistEntry);
  const addNote = useServerFn(addBlacklistNoteFn);

  const [rows, setRows] = useState<BlacklistRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "revoked">("active");
  const [openId, setOpenId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [revokeDraft, setRevokeDraft] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setErr(null);
    const r = await list();
    if (r.ok) setRows(r.rows);
    else setErr(r.reason);
    setLoading(false);
  }, [list]);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    function onPvToBlacklist(e: Event) {
      const detail = (e as CustomEvent).detail as
        | { nom?: string; pid?: string; dob?: string; motif?: string; num?: string; ligne?: string; priorCount?: number }
        | undefined;
      if (!detail) return;
      const fullName = (detail.nom || "").trim();
      const parts = fullName.split(/\s+/).filter(Boolean);
      const first_name = parts.length > 1 ? parts[0] : "";
      const last_name = parts.length > 1 ? parts.slice(1).join(" ") : fullName;
      const recidNote =
        detail.priorCount && detail.priorCount > 1
          ? ` Récidive constatée : ${detail.priorCount} PV enregistrés à ce nom.`
          : "";
      setDraft((d) => ({
        ...d,
        first_name,
        last_name,
        date_of_birth: detail.dob || "",
        reason: `Suite au PV ${detail.num || "—"} (${detail.motif || "infraction"}, ligne ${detail.ligne || "—"}).${recidNote}`,
        infractions: detail.motif || "",
      }));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    window.addEventListener("tte:pv-to-blacklist", onPvToBlacklist);
    return () => window.removeEventListener("tte:pv-to-blacklist", onPvToBlacklist);
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.first_name.trim() || !draft.last_name.trim() || !draft.reason.trim()) return;
    if (!draft.is_permanent && !draft.end_date) {
      alert("Précisez une date de fin ou cochez « Bannissement permanent ».");
      return;
    }
    setSubmitting(true);
    const infractions = draft.infractions
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const r = await create({
      data: {
        first_name: draft.first_name.trim(),
        last_name: draft.last_name.trim(),
        alias: draft.alias || null,
        date_of_birth: draft.date_of_birth || null,
        discord_id: null,
        discord_username: null,
        steam_id: null,
        physical_description: draft.physical_description || null,
        reason: draft.reason.trim(),
        infractions,
        scope: draft.scope,
        start_date: draft.start_date,
        end_date: draft.is_permanent ? null : draft.end_date,
        is_permanent: draft.is_permanent,
      },
    });
    setSubmitting(false);
    if (r.ok) {
      setDraft(emptyDraft());
      generatePdf(r.row);
      refresh();
      if (r.discordDelivery === "failed") {
        alert(
          "La blacklist est bien enregistrée et le PDF a été généré, mais l’envoi dans le salon Discord a échoué. Vérifiez le salon et les permissions du bot.",
        );
      } else if (r.discordDelivery === "skipped") {
        alert(
          "La blacklist est bien enregistrée. L’envoi Discord n’est pas encore configuré : ajoutez DISCORD_BLACKLIST_CHANNEL_ID dans Vercel.",
        );
      }
    } else {
      alert("Erreur : " + r.reason);
    }
  };

  if (!user) {
    return (
      <section className="view" id="v-blk">
        <h1 className="vt">Blacklist</h1>
        <div className="perm-banner">Connexion Discord requise.</div>
      </section>
    );
  }

  const filtered = rows.filter((r) => {
    if (filter === "active") return r.status === "active";
    if (filter === "revoked") return r.status !== "active";
    return true;
  });

  return (
    <section className="view" id="v-blk">
      <h1 className="vt">Registre Blacklist — interdictions d'accès</h1>
      <p className="vt-sub">
        Réservé à la Direction (Gérant, Superviseur, Superviseur assistant). Chaque entrée génère un document
        officiel PDF téléchargeable, à remettre à la personne concernée.
      </p>

      <div className="card">
        <h2>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" /><path d="M5 5l14 14" />
          </svg>
          Nouvelle interdiction
        </h2>
        <form className="form-grid" onSubmit={onSubmit}>
          <div className="fg col-4">
            <label>Prénom *</label>
            <input value={draft.first_name} onChange={(e) => setDraft({ ...draft, first_name: e.target.value })} required />
          </div>
          <div className="fg col-4">
            <label>Nom *</label>
            <input value={draft.last_name} onChange={(e) => setDraft({ ...draft, last_name: e.target.value })} required />
          </div>
          <div className="fg col-4">
            <label>Alias / surnom</label>
            <input value={draft.alias} onChange={(e) => setDraft({ ...draft, alias: e.target.value })} />
          </div>
          <div className="fg col-4">
            <label>Date de naissance</label>
            <input type="date" value={draft.date_of_birth} onChange={(e) => setDraft({ ...draft, date_of_birth: e.target.value })} />
          </div>
          <div className="fg col-6">
            <label>Signalement / description physique</label>
            <input value={draft.physical_description} onChange={(e) => setDraft({ ...draft, physical_description: e.target.value })} placeholder="Ex. Homme, ~1m80, veste rouge…" />
          </div>

          <div className="fg col-6">
            <label>Périmètre du bannissement *</label>
            <select value={draft.scope} onChange={(e) => setDraft({ ...draft, scope: e.target.value })}>
              {Object.entries(SCOPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div className="fg col-3">
            <label>Prise d'effet *</label>
            <input type="date" value={draft.start_date} onChange={(e) => setDraft({ ...draft, start_date: e.target.value })} required />
          </div>
          <div className="fg col-3">
            <label>Fin</label>
            <input
              type="date"
              value={draft.end_date}
              onChange={(e) => setDraft({ ...draft, end_date: e.target.value })}
              disabled={draft.is_permanent}
              required={!draft.is_permanent}
            />
          </div>
          <div className="fg col-12">
            <label className="chk">
              <input
                type="checkbox"
                checked={draft.is_permanent}
                onChange={(e) => setDraft({ ...draft, is_permanent: e.target.checked, end_date: e.target.checked ? "" : draft.end_date })}
              />
              Bannissement permanent (à durée indéterminée)
            </label>
          </div>

          <div className="fg col-12">
            <label>Motif détaillé *</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 6 }}>
              {REASON_TEMPLATES.map((t) => (
                <button
                  key={t.label}
                  type="button"
                  className="btn ghost sm"
                  title={t.text}
                  onClick={() =>
                    setDraft({
                      ...draft,
                      reason: draft.reason.trim() ? `${draft.reason.trim()}\n\n${t.text}` : t.text,
                    })
                  }
                >
                  + {t.label}
                </button>
              ))}
            </div>
            <textarea
              value={draft.reason}
              onChange={(e) => setDraft({ ...draft, reason: e.target.value })}
              placeholder="Faits précis, contexte, gravité, mesures antérieures… (ou cliquez sur une phrase type ci-dessus, puis modifiez-la)"
              required
              style={{ minHeight: 100 }}
            />
          </div>
          <div className="fg col-12">
            <label>Infractions retenues (une par ligne)</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 6 }}>
              {INFRACTION_TEMPLATES.map((t) => (
                <button
                  key={t}
                  type="button"
                  className="btn ghost sm"
                  onClick={() => {
                    const lines = draft.infractions
                      .split("\n")
                      .map((s) => s.trim())
                      .filter(Boolean);
                    if (!lines.includes(t)) lines.push(t);
                    setDraft({ ...draft, infractions: lines.join("\n") });
                  }}
                >
                  + {t}
                </button>
              ))}
            </div>
            <textarea
              value={draft.infractions}
              onChange={(e) => setDraft({ ...draft, infractions: e.target.value })}
              placeholder={"Ex. Agression verbale envers un agent\nFraude tarifaire répétée\nDégradation de matériel"}
              style={{ minHeight: 80 }}
            />
          </div>

          <div className="fg col-12">
            <div className="btn-row">
              <button type="submit" className="btn" disabled={submitting}>
                {submitting ? "Enregistrement…" : "🚫 Enregistrer & générer le PDF"}
              </button>
              <button type="button" className="btn ghost" onClick={() => setDraft(emptyDraft())}>Réinitialiser</button>
            </div>
          </div>
        </form>
      </div>

      <div className="card">
        <h2 style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <span>Registre des interdictions</span>
          <span style={{ display: "flex", gap: 6 }}>
            {(["active", "revoked", "all"] as const).map((k) => (
              <button
                key={k}
                type="button"
                className={"btn ghost sm" + (filter === k ? " active" : "")}
                style={filter === k ? { background: "var(--blue, #1e3a8a)", color: "#fff" } : {}}
                onClick={() => setFilter(k)}
              >
                {k === "active" ? "Actives" : k === "revoked" ? "Levées" : "Toutes"}
              </button>
            ))}
          </span>
        </h2>

        {loading && <p style={{ color: "var(--muted)" }}>Chargement…</p>}
        {err && <div className="perm-banner">Erreur : {err}</div>}
        {!loading && !err && filtered.length === 0 && (
          <div className="pub-empty" style={{ padding: "2rem", textAlign: "center", color: "var(--muted)" }}>
            Aucune interdiction enregistrée.
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((row) => {
            const expired = !row.is_permanent && row.end_date && new Date(row.end_date) < new Date();
            const isRevoked = row.status !== "active";
            const isOpen = openId === row.id;
            return (
              <div
                key={row.id}
                className="blacklist-entry"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "14px 16px",
                  borderRadius: 10,
                  border: "1px solid var(--line, #e5e7eb)",
                  background: isRevoked ? "rgba(100,116,139,.06)" : expired ? "rgba(234,179,8,.06)" : "rgba(220,38,38,.05)",
                  opacity: isRevoked ? 0.75 : 1,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>
                      {row.first_name} <span style={{ textTransform: "uppercase" }}>{row.last_name}</span>
                      {row.alias && <span style={{ color: "var(--muted)", fontWeight: 500 }}> — « {row.alias} »</span>}
                    </div>
                    <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>
                      Réf. <b>{row.ref}</b> · {SCOPE_LABELS[row.scope] ?? row.scope} ·{" "}
                      {row.is_permanent
                        ? <span style={{ color: "#b91c1c", fontWeight: 600 }}>Permanent</span>
                        : <>Du {fmtDate(row.start_date)} au {fmtDate(row.end_date)}</>}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                    <span style={{
                      padding: "3px 10px",
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 700,
                      background: isRevoked ? "#64748b" : expired ? "#eab308" : "#dc2626",
                      color: "#fff",
                    }}>
                      {isRevoked ? "LEVÉE" : expired ? "EXPIRÉE" : "ACTIVE"}
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: 8, fontSize: 13.5, color: "var(--ink-2, #334155)" }}>{row.reason}</div>

                <div className="btn-row" style={{ marginTop: 10 }}>
                  <button type="button" className="btn ghost sm" onClick={() => generatePdf(row)}>📄 Télécharger le PDF officiel</button>
                  <button type="button" className="btn ghost sm" onClick={() => setOpenId(isOpen ? null : row.id)}>
                    {isOpen ? "Masquer" : "Détails / notes"}
                  </button>
                  {!isRevoked && (
                    <button type="button" className="btn ghost sm" style={{ color: "#dc2626" }} onClick={() => setOpenId(isOpen ? null : row.id)}>
                      Lever le bannissement
                    </button>
                  )}
                </div>

                {isOpen && (
                  <div style={{ marginTop: 12, padding: 12, background: "rgba(0,0,0,.03)", borderRadius: 8 }}>
                    <div style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 8 }}>
                      Émis par <b>{row.created_by_username}</b> le {fmtDateTime(row.created_at)}
                      {row.date_of_birth && <> · Né(e) le {fmtDate(row.date_of_birth)}</>}
                    </div>
                    {row.infractions.length > 0 && (
                      <div style={{ marginBottom: 10 }}>
                        <b style={{ fontSize: 12.5 }}>Infractions :</b>
                        <ul style={{ margin: "4px 0 0 18px", fontSize: 13 }}>
                          {row.infractions.map((i, idx) => <li key={idx}>{i}</li>)}
                        </ul>
                      </div>
                    )}
                    {row.physical_description && (
                      <div style={{ fontSize: 13, marginBottom: 8 }}><b>Signalement :</b> {row.physical_description}</div>
                    )}
                    {isRevoked && (
                      <div style={{ padding: 10, background: "rgba(100,116,139,.15)", borderRadius: 6, fontSize: 13, marginBottom: 10 }}>
                        <b>Bannissement levé</b> par {row.revoked_by_username} le {fmtDateTime(row.revoked_at)}
                        {row.revoke_reason && <div style={{ marginTop: 4, color: "var(--muted)" }}>Motif : {row.revoke_reason}</div>}
                      </div>
                    )}

                    <div style={{ marginTop: 10 }}>
                      <b style={{ fontSize: 12.5 }}>Notes internes :</b>
                      {row.internal_notes.length === 0 ? (
                        <p style={{ color: "var(--muted)", fontSize: 12.5, margin: "4px 0" }}>Aucune note.</p>
                      ) : (
                        <ul style={{ margin: "4px 0 0 0", padding: 0, listStyle: "none", fontSize: 13 }}>
                          {row.internal_notes.map((n, i) => (
                            <li key={i} style={{ padding: "6px 8px", borderLeft: "3px solid var(--blue, #1e3a8a)", marginBottom: 4, background: "var(--bg, #fff)" }}>
                              <b>{n.author}</b> <span style={{ color: "var(--muted)", fontSize: 11 }}>· {fmtDateTime(n.at)}</span>
                              <div>{n.message}</div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <input
                        placeholder="Ajouter une note interne…"
                        value={openId === row.id ? noteDraft : ""}
                        onChange={(e) => setNoteDraft(e.target.value)}
                        style={{ flex: 1, minWidth: 240, padding: "6px 10px", border: "1px solid var(--line, #cbd5e1)", borderRadius: 6 }}
                      />
                      <button
                        type="button"
                        className="btn ghost sm"
                        onClick={async () => {
                          if (!noteDraft.trim()) return;
                          const r = await addNote({ data: { id: row.id, message: noteDraft } });
                          if (r.ok) { setNoteDraft(""); refresh(); }
                        }}
                      >Ajouter</button>
                    </div>

                    {!isRevoked && (
                      <div style={{ marginTop: 12, padding: 10, border: "1px solid #fecaca", borderRadius: 6, background: "var(--bg, #fff)" }}>
                        <b style={{ fontSize: 12.5, color: "#b91c1c" }}>Lever ce bannissement</b>
                        <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                          <input
                            placeholder="Motif de la levée (facultatif)"
                            value={revokeDraft}
                            onChange={(e) => setRevokeDraft(e.target.value)}
                            style={{ flex: 1, minWidth: 240, padding: "6px 10px", border: "1px solid var(--line, #cbd5e1)", borderRadius: 6 }}
                          />
                          <button
                            type="button"
                            className="btn danger sm"
                            style={{ background: "#dc2626", color: "#fff" }}
                            onClick={async () => {
                              if (!confirm("Confirmer la levée de ce bannissement ?")) return;
                              const r = await revoke({ data: { id: row.id, reason: revokeDraft } });
                              if (r.ok) { setRevokeDraft(""); refresh(); }
                            }}
                          >Confirmer la levée</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
