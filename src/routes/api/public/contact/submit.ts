import { createFileRoute } from "@tanstack/react-router";
import { useSession } from "@tanstack/react-start/server";
import { sessionConfig, type SessionData } from "@/lib/session.server";
import type { DiscordSessionUser } from "@/lib/discord-roles";

const ALLOWED_CATEGORIES = new Set([
  "remboursement",
  "info",
  "presse",
  "objets",
  "accessibilite",
  "reclamation",
  "suggestion",
  "autre",
]);

export const Route = createFileRoute("/api/public/contact/submit")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const session = await useSession<SessionData>(sessionConfig);
        const user = session.data.user as DiscordSessionUser | undefined;
        if (!user) {
          return Response.json({ ok: false, reason: "not_logged_in" }, { status: 401 });
        }
        let body: unknown = null;
        try {
          body = await request.json();
        } catch {
          return Response.json({ ok: false, reason: "bad_json" }, { status: 400 });
        }
        const b = (body ?? {}) as Record<string, unknown>;
        const category = typeof b.category === "string" ? b.category : "";
        const subject = typeof b.subject === "string" ? b.subject.trim() : "";
        const message = typeof b.message === "string" ? b.message.trim() : "";
        const extra =
          b.extra && typeof b.extra === "object" && !Array.isArray(b.extra)
            ? (b.extra as Record<string, unknown>)
            : {};
        if (!ALLOWED_CATEGORIES.has(category)) {
          return Response.json({ ok: false, reason: "bad_category" }, { status: 400 });
        }
        if (!subject || !message) {
          return Response.json({ ok: false, reason: "missing_fields" }, { status: 400 });
        }
        try {
          const { createContactRequest } = await import("@/lib/contact.server");
          const row = await createContactRequest(user, {
            category,
            subject: subject.slice(0, 200),
            message: message.slice(0, 5000),
            extra,
          });
          return Response.json({ ok: true, ref: row.ref, id: row.id });
        } catch (e) {
          console.error("[contact/submit]", e);
          return Response.json({ ok: false, reason: "insert_failed" }, { status: 500 });
        }
      },
    },
  },
});
