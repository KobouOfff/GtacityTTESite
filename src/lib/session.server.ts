import type { DiscordSessionUser } from "./discord-roles";

export type SessionData = {
  user?: DiscordSessionUser;
  oauthState?: string;
  postLoginRedirect?: string;
};

export const sessionConfig = {
  password: process.env.SESSION_SECRET ?? "dev-only-fallback-secret-please-set-SESSION_SECRET-000",
  name: "tte_session",
  maxAge: 60 * 60 * 24 * 30, // 30 jours
  cookie: {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: true,
    path: "/",
  },
};
