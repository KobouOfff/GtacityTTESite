import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "@/components/DiscordAuth";
import { canManageHrFiles, type DiscordSessionUser } from "@/lib/discord-roles";
import { getMyHrFile, listAllHrFilesFn, getHrFileForEmployee, saveHrFile } from "@/lib/hr-files.functions";
import type { HrEmployeeFileRow, HrEmployeeFilePatch } from "@/lib/hr-files.server";

const BRAND = "#4B92DD";

/* ------------------------------------------------------------------ *
 * Page
 * ------------------------------------------------------------------ */
function DocumentsRhPage() {
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
            Cette page est réservée au personnel de Townsend Transit Express.
          </p>
          <a href="/api/public/discord/login?redirect=/documents-rh" className="tte-btn" style={btnPrimary}>
            Se connecter avec Discord
          </a>
        </div>
      </Shell>
    );
  }

  const rh = canManageHrFiles(user as DiscordSessionUser);
  return rh ? <RhView user={user as DiscordSessionUser} /> : <EmployeeView />;
}

/* ------------------------------------------------------------------ *
 * Vue employé : consultation seule de son propre dossier
 * ------------------------------------------------------------------ */
function EmployeeView() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-hr-file"],
    queryFn: () => getMyHrFile(),
  });

  return (
    <Shell>
      <Hero
        eyebrowText="Mon dossier"
        title="Mon document RH"
        subtitle="Fiche individuelle constituée par la RH lors de ton rendez-vous. Toi seul et la RH peuvent la consulter."
      />
      {isLoading ? (
        <div style={card}>
          <div style={{ ...muted, display: "flex", alignItems: "center", gap: 10 }}>
            <Spinner /> Chargement…
          </div>
        </div>
      ) : !data?.ok ? (
        <div style={card}>
          <div style={muted}>Impossible de charger ton dossier pour le moment. Réessaie plus tard.</div>
        </div>
      ) : !data.row ? (
        <div style={{ ...card, textAlign: "center", padding: "38px 22px" }}>
          <div style={iconCircle}>🗂️</div>
          <h2 style={{ margin: "14px 0 6px", fontSize: 20, letterSpacing: -0.3 }}>Aucun dossier pour le moment</h2>
          <p style={{ ...muted, margin: "0 auto", maxWidth: 420, lineHeight: 1.6 }}>
            La RH constitue ton dossier individuel lors d'un rendez-vous. Rapproche-toi du secrétariat / RH si tu penses
            que ce rendez-vous aurait déjà dû avoir lieu.
          </p>
        </div>
      ) : (
        <DossierView row={data.row} />
      )}
    </Shell>
  );
}

/* ------------------------------------------------------------------ *
 * Vue RH : annuaire + édition du dossier de n'importe quel employé
 * ------------------------------------------------------------------ */
function RhView({ user }: { user: DiscordSessionUser }) {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<{ discordId: string; username: string | null; displayName: string | null } | null>(null);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["hr-files-all"],
    queryFn: () => listAllHrFilesFn(),
  });

  const filesByDiscordId = useMemo(() => {
    const map = new Map<string, HrEmployeeFileRow>();
    if (data?.ok) for (const f of data.files) map.set(f.employee_discord_id, f);
    return map;
  }, [data]);

  const employees = useMemo(() => {
    if (!data?.ok) return [];
    const q = search.trim().toLowerCase();
    return data.employees
      .filter((e) => !q || e.name?.toLowerCase().includes(q) || e.email.toLowerCase().includes(q))
      .sort((a, b) => (a.name || a.email).localeCompare(b.name || b.email));
  }, [data, search]);

  return (
    <Shell>
      <Hero
        eyebrowText="RH · Direction"
        title="Documents RH"
        subtitle="Un dossier individuel par employé. Prends rendez-vous avec chaque employé puis remplis ou mets à jour sa fiche ci-dessous."
      >
        <div style={statRow}>
          <div style={statBox}>
            <span style={{ ...statIcon, color: BRAND, background: "rgba(75,146,221,0.14)" }}>🗂️</span>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800 }}>{data?.ok ? data.files.length : "—"}</div>
              <div style={{ fontSize: 11.5, ...muted }}>Dossiers constitués</div>
            </div>
          </div>
          <div style={statBox}>
            <span style={{ ...statIcon, color: "#34D399", background: "rgba(34,197,94,0.14)" }}>👥</span>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800 }}>{data?.ok ? data.employees.length : "—"}</div>
              <div style={{ fontSize: 11.5, ...muted }}>Employés enregistrés</div>
            </div>
          </div>
        </div>
      </Hero>

      {selected ? (
        <EditorPanel
          key={selected.discordId}
          user={user}
          employee={selected}
          onClose={() => setSelected(null)}
          onSaved={() => {
            qc.invalidateQueries({ queryKey: ["hr-files-all"] });
          }}
        />
      ) : (
        <div style={toolbar}>
          <input
            className="tte-input"
            placeholder="Rechercher un employé (nom, e-mail)…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: "1 1 260px",
              padding: "9px 12px",
              background: "rgba(0,0,0,0.3)",
              color: "var(--tte-heading)",
              border: "1px solid rgba(var(--tte-overlay),0.13)",
              borderRadius: 10,
              fontSize: 13.5,
            }}
          />
          <button type="button" className="tte-btn" style={btnGhost} onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? "Actualisation…" : "Actualiser"}
          </button>
        </div>
      )}

      {!selected && (
        <div style={{ display: "grid", gap: 10 }}>
          {isLoading ? (
            <div style={card}>
              <div style={{ ...muted, display: "flex", alignItems: "center", gap: 10 }}>
                <Spinner /> Chargement de l'annuaire…
              </div>
            </div>
          ) : !data?.ok ? (
            <div style={card}>
              <div style={muted}>Impossible de charger l'annuaire des employés.</div>
            </div>
          ) : employees.length === 0 ? (
            <div style={card}>
              <div style={muted}>Aucun employé ne correspond à cette recherche.</div>
            </div>
          ) : (
            employees.map((e) => {
              const file = filesByDiscordId.get(e.discordId);
              return (
                <div key={e.discordId} className="tte-card" style={{ ...card, display: "flex", alignItems: "center", gap: 14, justifyContent: "space-between", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                    <div style={{ ...avatar, background: "rgba(75,146,221,0.16)", color: BRAND }}>
                      {(e.name || e.email)[0]?.toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14.5 }}>{e.name || e.email}</div>
                      <div style={{ fontSize: 12, ...muted }}>{e.email}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {file ? (
                      <span style={{ ...pill, color: "#34D399", borderColor: "rgba(34,197,94,0.3)", background: "rgba(34,197,94,0.1)" }}>
                        <span style={{ ...dot, background: "#34D399" }} /> Dossier à jour
                      </span>
                    ) : (
                      <span style={{ ...pill, color: "#FBBF24", borderColor: "rgba(245,158,11,0.3)", background: "rgba(245,158,11,0.1)" }}>
                        <span style={{ ...dot, background: "#FBBF24" }} /> Aucun dossier
                      </span>
                    )}
                    <button
                      type="button"
                      className="tte-btn"
                      style={btnPrimary}
                      onClick={() => setSelected({ discordId: e.discordId, username: e.email, displayName: e.name })}
                    >
                      {file ? "Modifier" : "Créer le dossier"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </Shell>
  );
}

/* ------------------------------------------------------------------ *
 * Formulaire d'édition (RH)
 * ------------------------------------------------------------------ */
const EMPTY_PATCH: HrEmployeeFilePatch = {};

function EditorPanel({
  user,
  employee,
  onClose,
  onSaved,
}: {
  user: DiscordSessionUser;
  employee: { discordId: string; username: string | null; displayName: string | null };
  onClose: () => void;
  onSaved: () => void;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["hr-file", employee.discordId],
    queryFn: () => getHrFileForEmployee({ data: employee.discordId }),
  });

  const [form, setForm] = useState<HrEmployeeFilePatch>(EMPTY_PATCH);
  const [loaded, setLoaded] = useState(false);
  if (!loaded && data?.ok) {
    setLoaded(true);
    setForm(data.row ?? {});
  }

  const save = useMutation({
    mutationFn: () =>
      saveHrFile({
        data: {
          discordId: employee.discordId,
          username: employee.username,
          displayName: employee.displayName,
          patch: form,
        },
      }),
    onSuccess: (res) => {
      if (res.ok) onSaved();
    },
  });

  function set<K extends keyof HrEmployeeFilePatch>(key: K, value: HrEmployeeFilePatch[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  if (isLoading) {
    return (
      <div style={card}>
        <div style={{ ...muted, display: "flex", alignItems: "center", gap: 10 }}>
          <Spinner /> Chargement du dossier…
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ ...card, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16 }}>{employee.displayName || employee.username}</div>
          <div style={{ fontSize: 12.5, ...muted }}>{employee.username}</div>
        </div>
        <button type="button" className="tte-btn" style={btnGhost} onClick={onClose}>
          ← Retour à l'annuaire
        </button>
      </div>

      <Section title="🪪 1) État civil">
        <Row>
          <Field label="Prénom(s)"><Input value={form.prenom ?? ""} onChange={(v) => set("prenom", v)} /></Field>
          <Field label="Nom"><Input value={form.nom ?? ""} onChange={(v) => set("nom", v)} /></Field>
        </Row>
        <Row>
          <Field label="Genre"><Input value={form.genre ?? ""} onChange={(v) => set("genre", v)} /></Field>
          <Field label="Date de naissance">
            <Input type="date" value={form.date_naissance ?? ""} onChange={(v) => set("date_naissance", v)} />
          </Field>
        </Row>
        <Field label="Situation familiale">
          <Input value={form.situation_familiale ?? ""} onChange={(v) => set("situation_familiale", v)} />
        </Field>
      </Section>

      <Section title="📞 2) Coordonnées">
        <Field label="Numéro(s) de téléphone">
          <Input value={form.telephones ?? ""} onChange={(v) => set("telephones", v)} />
        </Field>
        <Field label="Adresse(s)">
          <Textarea value={form.adresse ?? ""} onChange={(v) => set("adresse", v)} />
        </Field>
      </Section>

      <Section title="🔑 3) Historique dans l'entreprise">
        <Row>
          <Field label="Date d'entrée dans l'entreprise">
            <Input type="date" value={form.date_entree ?? ""} onChange={(v) => set("date_entree", v)} />
          </Field>
          <Field label="Poste(s) occupé(s) actuellement">
            <Input value={form.postes_actuels ?? ""} onChange={(v) => set("postes_actuels", v)} />
          </Field>
        </Row>
      </Section>

      <Section title="🌴 4) Congés et absences">
        <Row>
          <Field label="Congés pris"><Input value={form.conges_pris ?? ""} onChange={(v) => set("conges_pris", v)} /></Field>
          <Field label="Congés restants (jours)">
            <Input
              type="number"
              value={form.conges_restants ?? ""}
              onChange={(v) => set("conges_restants", v === "" ? null : Number(v))}
            />
          </Field>
        </Row>
        <Field label="Absence(s) justifiée(s) / injustifiée(s)">
          <Textarea value={form.absences ?? ""} onChange={(v) => set("absences", v)} />
        </Field>
        <Field label="Arrêt(s) maladie">
          <Textarea value={form.arrets_maladie ?? ""} onChange={(v) => set("arrets_maladie", v)} />
        </Field>
      </Section>

      <Section title="📑 5) Discipline et incidents">
        <Field label="Avertissement(s)">
          <Textarea value={form.avertissements ?? ""} onChange={(v) => set("avertissements", v)} />
        </Field>
        <Field label="Sanction(s)">
          <Textarea value={form.sanctions ?? ""} onChange={(v) => set("sanctions", v)} />
        </Field>
      </Section>

      <Section title="🗒️ 6) Notes internes">
        <Field label="Appréciation(s) RH">
          <Textarea value={form.appreciation_rh ?? ""} onChange={(v) => set("appreciation_rh", v)} />
        </Field>
        <Field label="Observation(s) RH">
          <Textarea value={form.observation_rh ?? ""} onChange={(v) => set("observation_rh", v)} />
        </Field>
        <Field label="Objectif(s)">
          <Textarea value={form.objectifs ?? ""} onChange={(v) => set("objectifs", v)} />
        </Field>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, marginTop: 4 }}>
          <input
            type="checkbox"
            checked={!!form.reglement_interne_ack}
            onChange={(e) => set("reglement_interne_ack", e.target.checked)}
          />
          L'employé affirme avoir pris connaissance du règlement interne de la TTE
        </label>
      </Section>

      <Section title="✅ 7) Signatures et tampon">
        <Row>
          <Field label="Signature RH (nom)">
            <Input value={form.signature_rh_nom ?? ""} onChange={(v) => set("signature_rh_nom", v)} />
          </Field>
          <Field label="Date de création du dossier">
            <Input type="date" value={form.signature_rh_date ?? ""} onChange={(v) => set("signature_rh_date", v)} />
          </Field>
        </Row>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, marginTop: 4 }}>
          <input type="checkbox" checked={!!form.tampon} onChange={(e) => set("tampon", e.target.checked)} />
          Tampon de la TTE apposé
        </label>
      </Section>

      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <button
          type="button"
          className="tte-btn"
          style={btnPrimary}
          disabled={save.isPending}
          onClick={() => save.mutate()}
        >
          {save.isPending ? "Enregistrement…" : "Enregistrer le dossier"}
        </button>
        {save.isSuccess && save.data?.ok && (
          <span style={{ fontSize: 12.5, color: "#34D399" }}>Dossier enregistré.</span>
        )}
        {save.isSuccess && !save.data?.ok && (
          <span style={{ fontSize: 12.5, color: "#F87171" }}>Échec de l'enregistrement, réessaie.</span>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Vue lecture seule (employé)
 * ------------------------------------------------------------------ */
function DossierView({ row }: { row: HrEmployeeFileRow }) {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Section title="🪪 1) État civil">
        <Info label="Prénom(s) + Nom" value={[row.prenom, row.nom].filter(Boolean).join(" ")} />
        <Info label="Genre" value={row.genre} />
        <Info label="Date de naissance" value={row.date_naissance} />
        <Info label="Situation familiale" value={row.situation_familiale} />
      </Section>
      <Section title="📞 2) Coordonnées">
        <Info label="Numéro(s) de téléphone" value={row.telephones} />
        <Info label="Adresse(s)" value={row.adresse} multiline />
      </Section>
      <Section title="🔑 3) Historique dans l'entreprise">
        <Info label="Date d'entrée dans l'entreprise" value={row.date_entree} />
        <Info label="Poste(s) occupé(s) actuellement" value={row.postes_actuels} />
      </Section>
      <Section title="🌴 4) Congés et absences">
        <Info label="Congés pris" value={row.conges_pris} />
        <Info label="Congés restants" value={row.conges_restants != null ? `${row.conges_restants} jours` : null} />
        <Info label="Absence(s) justifiée(s) / injustifiée(s)" value={row.absences} multiline />
        <Info label="Arrêt(s) maladie" value={row.arrets_maladie} multiline />
      </Section>
      <Section title="📑 5) Discipline et incidents">
        <Info label="Avertissement(s)" value={row.avertissements} multiline />
        <Info label="Sanction(s)" value={row.sanctions} multiline />
      </Section>
      <Section title="🗒️ 6) Notes internes">
        <Info label="Appréciation(s) RH" value={row.appreciation_rh} multiline />
        <Info label="Observation(s) RH" value={row.observation_rh} multiline />
        <Info label="Objectif(s)" value={row.objectifs} multiline />
        <Info label="Règlement interne" value={row.reglement_interne_ack ? "Pris connaissance" : "Non confirmé"} />
      </Section>
      <Section title="✅ 7) Signatures et tampon">
        <Info label="Signature RH" value={row.signature_rh_nom} />
        <Info label="Date de création du dossier" value={row.signature_rh_date} />
        <Info label="Tampon TTE" value={row.tampon ? "Apposé" : "Non apposé"} />
      </Section>
      <div style={{ fontSize: 11.5, ...muted }}>
        Dernière mise à jour : {new Date(row.updated_at).toLocaleString("fr-FR")}
        {row.updated_by_username ? ` par ${row.updated_by_username}` : ""}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Petits composants d'affichage / formulaire
 * ------------------------------------------------------------------ */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={card}>
      <div style={{ fontWeight: 800, fontSize: 14.5, marginBottom: 12 }}>{title}</div>
      <div style={{ display: "grid", gap: 12 }}>{children}</div>
    </div>
  );
}
function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>{children}</div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "grid", gap: 5 }}>
      <span style={{ fontSize: 12, ...muted, fontWeight: 600 }}>{label}</span>
      {children}
    </label>
  );
}
function Info({ label, value, multiline }: { label: string; value: string | number | null | undefined; multiline?: boolean }) {
  const display = value === null || value === undefined || value === "" ? "—" : String(value);
  return (
    <div style={{ display: "grid", gap: 3 }}>
      <span style={{ fontSize: 11.5, ...muted, textTransform: "uppercase", letterSpacing: 0.6, fontWeight: 700 }}>{label}</span>
      <span style={{ fontSize: 14, lineHeight: 1.5, whiteSpace: multiline ? "pre-wrap" : "normal" }}>{display}</span>
    </div>
  );
}
function Input({ value, onChange, type = "text" }: { value: string | number; onChange: (v: string) => void; type?: string }) {
  return (
    <input
      className="tte-input"
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        padding: "9px 12px",
        background: "rgba(0,0,0,0.3)",
        color: "var(--tte-heading)",
        border: "1px solid rgba(var(--tte-overlay),0.13)",
        borderRadius: 10,
        fontSize: 13.5,
      }}
    />
  );
}
function Textarea({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <textarea
      className="tte-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={2}
      style={{
        padding: "9px 12px",
        background: "rgba(0,0,0,0.3)",
        color: "var(--tte-heading)",
        border: "1px solid rgba(var(--tte-overlay),0.13)",
        borderRadius: 10,
        fontSize: 13.5,
        fontFamily: "inherit",
        resize: "vertical",
      }}
    />
  );
}
function Spinner() {
  return (
    <span
      style={{
        display: "inline-block",
        width: 14,
        height: 14,
        borderRadius: "50%",
        border: "2px solid rgba(75,146,221,0.25)",
        borderTopColor: BRAND,
        animation: "tte-spin 0.8s linear infinite",
      }}
    />
  );
}

function Hero({
  eyebrowText,
  title,
  subtitle,
  children,
}: {
  eyebrowText: string;
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}) {
  return (
    <div style={hero}>
      <div style={heroGrid} />
      <div style={heroGlow} />
      <div style={{ position: "relative" }}>
        <span style={eyebrow}>{eyebrowText}</span>
        <h1 style={{ margin: "8px 0 6px", fontSize: 26, letterSpacing: -0.5 }}>{title}</h1>
        <p style={{ ...muted, margin: 0, maxWidth: 560, lineHeight: 1.6, fontSize: 14 }}>{subtitle}</p>
        {children}
      </div>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(1000px 500px at 15% -10%, rgba(75,146,221,0.18), transparent 60%), var(--tte-bg)",
        color: "var(--tte-heading)",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <style>{css}</style>
      <header
        style={{
          borderBottom: "1px solid rgba(var(--tte-overlay),0.07)",
          padding: "14px 22px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "rgba(var(--tte-bg-rgb),0.72)",
          backdropFilter: "blur(10px)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <a href="/" style={{ color: "var(--tte-heading)", textDecoration: "none", fontWeight: 800, letterSpacing: -0.5 }}>
          <span style={{ color: BRAND }}>TTE</span> · Documents RH
        </a>
        <nav style={{ display: "flex", gap: 16, fontSize: 13 }}>
          <a href="/mon-compte" className="tte-link" style={navLink}>Mon compte</a>
          <a href="/espace-employes" className="tte-link" style={navLink}>Espace employés</a>
          <a href="/" className="tte-link" style={navLink}>Accueil</a>
        </nav>
      </header>
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "28px 22px 70px", display: "grid", gap: 20 }}>
        {children}
      </main>
    </div>
  );
}

const css = `
@keyframes tte-spin { to { transform: rotate(360deg); } }
.tte-card { transition: border-color .2s ease, transform .2s ease, box-shadow .2s ease; }
.tte-card:hover { border-color: rgba(75,146,221,0.35); box-shadow: 0 14px 40px -22px rgba(0,0,0,0.9); }
.tte-btn { transition: filter .2s ease, transform .12s ease; }
.tte-btn:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); }
.tte-btn:active:not(:disabled) { transform: translateY(0); }
.tte-link { transition: color .18s ease; }
.tte-link:hover { color: var(--tte-heading) !important; }
.tte-input { transition: border-color .2s ease, box-shadow .2s ease; outline: none; }
.tte-input:focus { border-color: rgba(75,146,221,0.6); box-shadow: 0 0 0 3px rgba(75,146,221,0.15); }
`;

const muted: React.CSSProperties = { color: "var(--tte-muted)" };
const navLink: React.CSSProperties = { color: "var(--tte-muted)", textDecoration: "none" };
const card: React.CSSProperties = {
  background: "rgba(var(--tte-overlay),0.035)",
  border: "1px solid rgba(var(--tte-overlay),0.08)",
  borderRadius: 16,
  padding: "16px 18px",
};
const hero: React.CSSProperties = {
  position: "relative",
  overflow: "hidden",
  borderRadius: 20,
  border: "1px solid rgba(var(--tte-overlay),0.08)",
  background: "linear-gradient(160deg, rgba(75,146,221,0.16), rgba(var(--tte-overlay),0.02) 55%)",
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
    "linear-gradient(rgba(var(--tte-overlay),0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--tte-overlay),0.035) 1px, transparent 1px)",
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
  flex: "1 1 160px",
  background: "linear-gradient(160deg, rgba(var(--tte-overlay),0.06), rgba(0,0,0,0.28))",
  border: "1px solid rgba(var(--tte-overlay),0.08)",
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
  flexShrink: 0,
};
const toolbar: React.CSSProperties = {
  display: "flex",
  gap: 12,
  alignItems: "center",
  flexWrap: "wrap",
  justifyContent: "space-between",
  background: "rgba(var(--tte-overlay),0.03)",
  border: "1px solid rgba(var(--tte-overlay),0.08)",
  borderRadius: 16,
  padding: "12px 14px",
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
  width: 34,
  height: 34,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 14,
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
  background: "rgba(var(--tte-overlay),0.05)",
  color: "var(--tte-text)",
  border: "1px solid rgba(var(--tte-overlay),0.12)",
  borderRadius: 10,
  fontSize: 13,
  cursor: "pointer",
  fontWeight: 600,
};

export const Route = createFileRoute("/documents-rh")({
  head: () => ({
    meta: [
      { title: "Documents RH — Townsend Transit Express" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Dossier RH individuel du personnel — Townsend Transit Express." },
    ],
  }),
  component: DocumentsRhPage,
});
