import { createFileRoute } from "@tanstack/react-router";
import { useSession, getRequestHost, getResponseHeader } from "@tanstack/react-start/server";
import { sessionConfig, type SessionData } from "@/lib/session.server";
import type { DiscordSessionUser } from "@/lib/discord-roles";

function errorPage(message: string) {
  const safe = message.replace(/</g, "&lt;");
  return new Response(
    `<!doctype html><html><head><meta charset="utf-8"><title>Connexion Discord</title></head>
    <body style="font-family:system-ui;background:#0f172a;color:#f1f5f9;display:grid;place-items:center;min-height:100vh;margin:0">
    <div style="max-width:520px;padding:2rem;text-align:center">
      <h1 style="color:#f87171">Connexion Discord échouée</h1>
      <p>${safe}</p>
      <p><a href="/" style="color:#60a5fa">Retour à l'accueil</a></p>
    </div></body></html>`,
    { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}

export const Route = createFileRoute("/api/public/discord/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const errorParam = url.searchParams.get("error");
        if (errorParam) return errorPage(`Discord a refusé la connexion : ${errorParam}`);
        if (!code || !state) return errorPage("Paramètres manquants (code / state).");

        const session = await useSession<SessionData>(sessionConfig);
        if (!session.data.oauthState || session.data.oauthState !== state) {
          return errorPage("Session OAuth invalide ou expirée. Réessaie.");
        }

        const clientId = process.env.DISCORD_CLIENT_ID;
        const clientSecret = process.env.DISCORD_CLIENT_SECRET;
        const botToken = process.env.DISCORD_BOT_TOKEN;
        const guildId = process.env.DISCORD_GUILD_ID;
        if (!clientId || !clientSecret || !botToken || !guildId) {
          return errorPage("Configuration Discord incomplète côté serveur.");
        }

        const origin = `${url.protocol}//${getRequestHost() ?? url.host}`;
        const redirectUri = `${origin}/api/public/discord/callback`;

        // 1. Échange code → access_token
        const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: "authorization_code",
            code,
            redirect_uri: redirectUri,
          }),
        });
        if (!tokenRes.ok) {
          const t = await tokenRes.text();
          return errorPage(`Échange du token Discord échoué : ${tokenRes.status} ${t}`);
        }
        const tokenJson = (await tokenRes.json()) as { access_token: string };

        // 2. Récupère l'identité Discord
        const meRes = await fetch("https://discord.com/api/users/@me", {
          headers: { Authorization: `Bearer ${tokenJson.access_token}` },
        });
        if (!meRes.ok) return errorPage("Impossible de lire ton profil Discord.");
        const me = (await meRes.json()) as {
          id: string;
          username: string;
          global_name?: string | null;
          avatar?: string | null;
        };

        // 3. Récupère les rôles dans le serveur via bot token
        const memberRes = await fetch(
          `https://discord.com/api/guilds/${guildId}/members/${me.id}`,
          { headers: { Authorization: `Bot ${botToken}` } },
        );
        if (memberRes.status === 404) {
          return errorPage(
            "Tu n'es pas membre du serveur Discord TTE. Rejoins le serveur puis réessaie.",
          );
        }
        if (!memberRes.ok) {
          const t = await memberRes.text();
          return errorPage(`Impossible de lire tes rôles Discord : ${memberRes.status} ${t}`);
        }
        const member = (await memberRes.json()) as { roles: string[]; nick?: string | null };

        const user: DiscordSessionUser = {
          discordId: me.id,
          username: me.username,
          displayName: member.nick ?? me.global_name ?? null,
          avatar: me.avatar
            ? `https://cdn.discordapp.com/avatars/${me.id}/${me.avatar}.png`
            : null,
          roleIds: member.roles ?? [],
        };

        const postLoginRedirect = session.data.postLoginRedirect;
        await session.update({ user });

        // Seed presence pour "Effectifs en service"
        try {
          const { saveDiscordPresence } = await import("@/lib/presence.server");
          await saveDiscordPresence(user);
        } catch (error) {
          console.error("[discord-callback] présence non enregistrée", error);
        }

        const destination =
          postLoginRedirect && /^\/(?!\/)/.test(postLoginRedirect) ? postLoginRedirect : "/";
        const setCookieHeader = getResponseHeader("set-cookie");
        const headers: Record<string, string | string[]> = { Location: destination };
        if (setCookieHeader) headers["Set-Cookie"] = setCookieHeader as string | string[];
        return new Response(null, { status: 302, headers: headers as HeadersInit });
      },
    },
  },
});
