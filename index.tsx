import { createFileRoute } from "@tanstack/react-router";
import { useSession, getRequestHost, getResponseHeader } from "@tanstack/react-start/server";
import { sessionConfig, type SessionData } from "@/lib/session.server";

function randomState() {
  return crypto.randomUUID().replace(/-/g, "");
}

export const Route = createFileRoute("/api/public/discord/login")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const clientId = process.env.DISCORD_CLIENT_ID;
        if (!clientId) {
          return new Response("DISCORD_CLIENT_ID non configuré", { status: 500 });
        }
        const url = new URL(request.url);
        const origin = `${url.protocol}//${getRequestHost() ?? url.host}`;
        const redirectUri = `${origin}/api/public/discord/callback`;

        const state = randomState();
        // Same-origin redirect only (path starting with "/" but not "//")
        const rawRedirect = url.searchParams.get("redirect");
        const postLoginRedirect =
          rawRedirect && /^\/(?!\/)/.test(rawRedirect) ? rawRedirect : undefined;
        const session = await useSession<SessionData>(sessionConfig);
        await session.update({ ...session.data, oauthState: state, postLoginRedirect });

        const authorize = new URL("https://discord.com/api/oauth2/authorize");
        authorize.searchParams.set("client_id", clientId);
        authorize.searchParams.set("redirect_uri", redirectUri);
        authorize.searchParams.set("response_type", "code");
        authorize.searchParams.set("scope", "identify");
        authorize.searchParams.set("state", state);
        authorize.searchParams.set("prompt", "consent");

        const setCookieHeader = getResponseHeader("set-cookie");
        const headers: Record<string, string | string[]> = { Location: authorize.toString() };
        if (setCookieHeader) headers["Set-Cookie"] = setCookieHeader as string | string[];
        return new Response(null, { status: 302, headers: headers as HeadersInit });
      },
    },
  },
});
