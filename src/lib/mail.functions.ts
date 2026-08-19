import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { sessionConfig, type SessionData } from "./session.server";
import type { DiscordSessionUser } from "./discord-roles";
import type { DeoMailErrorCode } from "./deomail.server";

/** Traduit une erreur DeoMail en reason exploitable côté front (diagnostic direct). */
function deomailReason(e: unknown, fallback: "read_failed" | "send_failed"): DeoMailErrorCode | typeof fallback {
  const code = (e as { code?: DeoMailErrorCode } | null)?.code;
  if (code === "not_configured" || code === "auth_failed" || code === "network") return code;
  return fallback;
}

async function currentUser(): Promise<DiscordSessionUser | null> {
  const s = await useSession<SessionData>(sessionConfig);
  return (s.data.user ?? null) as DiscordSessionUser | null;
}

export type MailSummary = {
  id: string;
  from: string;
  to?: string;
  subject: string;
  createdAt: string | null;
  isRead: boolean;
  preview: string | null;
};

/** Adresse DeoMail liée au compte Discord connecté (ou null si non enregistré). */
export const getMyMailAddress = createServerFn({ method: "GET" }).handler(async () => {
  const user = await currentUser();
  if (!user) return { ok: false as const, reason: "not_logged_in" as const };
  try {
    const { getEmployeeByDiscordId } = await import("./employees.server");
    const employee = await getEmployeeByDiscordId(user.discordId);
    if (!employee) return { ok: false as const, reason: "not_registered" as const };
    return { ok: true as const, email: employee.email, name: employee.name };
  } catch (e) {
    console.error("[getMyMailAddress]", e);
    return { ok: false as const, reason: "lookup_failed" as const };
  }
});

export type MailFolder = "inbox" | "sent" | "archive" | "spam" | "trash";
const VALID_FOLDERS: readonly MailFolder[] = ["inbox", "sent", "archive", "spam", "trash"];

/** Mails d'un dossier DeoMail (inbox/sent/archive/spam/trash), filtrés sur l'employé connecté uniquement. */
export const listMyMail = createServerFn({ method: "GET" })
  .validator((d: { folder: MailFolder }) => d)
  .handler(async ({ data }) => {
    const user = await currentUser();
    if (!user) return { ok: false as const, reason: "not_logged_in" as const };
    const folder = VALID_FOLDERS.includes(data?.folder) ? data.folder : "inbox";
    try {
      const { getEmployeeByDiscordId } = await import("./employees.server");
      const employee = await getEmployeeByDiscordId(user.discordId);
      if (!employee) return { ok: false as const, reason: "not_registered" as const };

      const { listEmailsByFolder, extractAddress } = await import("./deomail.server");
      const all = await listEmailsByFolder(folder, 200);
      // "sent" ne doit contenir que ce que l'employé a lui-même envoyé ;
      // les autres dossiers (inbox/archive/spam/trash) sont filtrés sur
      // l'adresse employé côté expéditeur OU destinataire, puisqu'un mail
      // archivé ou supprimé peut avoir été reçu comme envoyé par elle/lui.
      const mine: MailSummary[] = all
        .filter((m) =>
          folder === "sent"
            ? extractAddress(m.from) === employee.email
            : extractAddress(m.to) === employee.email || extractAddress(m.from) === employee.email,
        )
        .map((m) => ({
          id: String(m.id),
          from: extractAddress(m.from) || String(m.from ?? ""),
          to: extractAddress(m.to) || String(m.to ?? ""),
          subject: (m.subject as string) || "(sans objet)",
          createdAt: (m.created_at as string) ?? null,
          isRead: Boolean(m.is_read),
          preview: typeof m.text === "string" ? m.text.slice(0, 140) : null,
        }));

      return { ok: true as const, email: employee.email, folder, mails: mine };
    } catch (e) {
      console.error("[listMyMail]", folder, e);
      return { ok: false as const, reason: deomailReason(e, "read_failed") };
    }
  });

/** Contenu complet d'un mail — refusé si le mail n'est pas adressé à l'employé connecté. */
export const getMyMail = createServerFn({ method: "POST" })
  .validator((d: { id: string }) => d)
  .handler(async ({ data }) => {
    const user = await currentUser();
    if (!user) return { ok: false as const, reason: "not_logged_in" as const };
    if (!data.id || typeof data.id !== "string") {
      return { ok: false as const, reason: "invalid" as const };
    }
    try {
      const { getEmployeeByDiscordId } = await import("./employees.server");
      const employee = await getEmployeeByDiscordId(user.discordId);
      if (!employee) return { ok: false as const, reason: "not_registered" as const };

      const { getEmailById, markEmailRead, extractAddress } = await import("./deomail.server");
      const full = await getEmailById(data.id);
      const isRecipient = extractAddress(full.to) === employee.email;
      const isSender = extractAddress(full.from) === employee.email;
      if (!isRecipient && !isSender) {
        return { ok: false as const, reason: "forbidden" as const };
      }
      // On ne marque "lu" que côté réception : marquer un mail qu'on a
      // soi-même envoyé (Sent) n'a pas de sens pour ce flag.
      if (isRecipient && !full.is_read) {
        try {
          await markEmailRead(data.id);
        } catch (e) {
          console.error("[getMyMail] markEmailRead failed", e);
        }
      }
      return {
        ok: true as const,
        mail: {
          id: String(full.id),
          from: extractAddress(full.from) || String(full.from ?? ""),
          to: extractAddress(full.to) || String(full.to ?? ""),
          subject: (full.subject as string) || "(sans objet)",
          createdAt: (full.created_at as string) ?? null,
          text: (full.text as string) ?? "",
          html: (full.html as string) ?? "",
        },
      };
    } catch (e) {
      console.error("[getMyMail]", e);
      return { ok: false as const, reason: deomailReason(e, "read_failed") };
    }
  });

const MAX_SUBJECT = 200;
const MAX_BODY = 20_000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Envoie un mail depuis l'adresse DeoMail de l'employé connecté. */
export const sendMyMail = createServerFn({ method: "POST" })
  .validator((d: { to: string; subject: string; body: string }) => d)
  .handler(async ({ data }) => {
    const user = await currentUser();
    if (!user) return { ok: false as const, reason: "not_logged_in" as const };

    const to = (data.to ?? "").trim().toLowerCase();
    const subject = (data.subject ?? "").trim();
    const body = (data.body ?? "").trim();
    if (
      !EMAIL_RE.test(to) ||
      !subject ||
      subject.length > MAX_SUBJECT ||
      !body ||
      body.length > MAX_BODY
    ) {
      return { ok: false as const, reason: "invalid" as const };
    }

    try {
      const { getEmployeeByDiscordId } = await import("./employees.server");
      const employee = await getEmployeeByDiscordId(user.discordId);
      if (!employee) return { ok: false as const, reason: "not_registered" as const };

      const { sendEmail } = await import("./deomail.server");
      await sendEmail({ from: employee.email, to, subject, bodyText: body });
      return { ok: true as const };
    } catch (e) {
      console.error("[sendMyMail]", e);
      return { ok: false as const, reason: deomailReason(e, "send_failed") };
    }
  });
