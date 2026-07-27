import { createFileRoute } from "@tanstack/react-router";
import { useSession, getResponseHeader } from "@tanstack/react-start/server";
import { sessionConfig, type SessionData } from "@/lib/session.server";

async function handleLogout() {
  const session = await useSession<SessionData>(sessionConfig);
  await session.clear();
  const setCookieHeader = getResponseHeader("set-cookie");
  const headers: Record<string, string | string[]> = { Location: "/" };
  if (setCookieHeader) headers["Set-Cookie"] = setCookieHeader as string | string[];
  return new Response(null, { status: 302, headers: headers as HeadersInit });
}

export const Route = createFileRoute("/api/public/discord/logout")({
  server: {
    handlers: {
      GET: handleLogout,
      POST: handleLogout,
    },
  },
});
