import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { sessionConfig, type SessionData } from "./session.server";
import type { DiscordSessionUser } from "./discord-roles";

async function currentUser(): Promise<DiscordSessionUser | null> {
  const s = await useSession<SessionData>(sessionConfig);
  return (s.data.user ?? null) as DiscordSessionUser | null;
}

export type MailSummary = {
  id: string;
  from: string;
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

/** Boîte de réception filtrée sur l'adresse de l'employé connecté uniquement. */
export const listMyInbox = createServerFn({ method: "GET" }).handler(async () => {
  const user = await currentUser();
  if (!user) return { ok: false as const, reason: "not_logged_in" as const };
  try {
    const { getEmployeeByDiscordId } = await import("./employees.server");
    const employee = await getEmployeeByDiscordId(user.discordId);
    if (!employee) return { ok: false as const, reason: "not_registered" as const };

    const { listInboxEmails, extractAddress } = await import("./deomail.server");
    const all = await listInboxEmails(200);
    const mine: MailSummary[] = all
      .filter((m) => extractAddress(m.to) === employee.email)
      .map((m) => ({
        id: String(m.id),
        from: extractAddress(m.from) || String(m.from ?? ""),
        subject: (m.subject as string) || "(sans objet)",
        createdAt: (m.created_at as string) ?? null,
        isRead: Boolean(m.is_read),
        preview: typeof m.text === "string" ? m.text.slice(0, 140) : null,
      }));

    return { ok: true as const, email: employee.email, mails: mine };
  } catch (e) {
    console.error("[listMyInbox]", e);
    return { ok: false as const, reason: "read_failed" as const };
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
      if (extractAddress(full.to) !== employee.email) {
        return { ok: false as const, reason: "forbidden" as const };
      }
      if (!full.is_read) {
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
          subject: (full.subject as string) || "(sans objet)",
          createdAt: (full.created_at as string) ?? null,
          text: (full.text as string) ?? "",
          html: (full.html as string) ?? "",
        },
      };
    } catch (e) {
      console.error("[getMyMail]", e);
      return { ok: false as const, reason: "read_failed" as const };
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
      return { ok: false as const, reason: "send_failed" as const };
    }
  });
