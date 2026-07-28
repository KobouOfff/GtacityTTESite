import { createFileRoute } from "@tanstack/react-router";
import EspaceEmployesPage from "@/pages-html/EspaceEmployes";
import { DiscordAccessGate } from "@/components/DiscordAuth";

function GatedEspaceEmployes() {
  return (
    <DiscordAccessGate path="/espace-employes">
      <EspaceEmployesPage />
    </DiscordAccessGate>
  );
}

export const Route = createFileRoute("/espace-employes")({
  head: () => ({
    meta: [
      { title: "Espace employ\u00e9s \u2014 Townsend Transit Express" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Portail interne r\u00e9serv\u00e9 au personnel de Townsend Transit Express." },
      { property: "og:title", content: "Espace employ\u00e9s \u2014 Townsend Transit Express" },
      { property: "og:description", content: "Portail interne r\u00e9serv\u00e9 au personnel de Townsend Transit Express." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Libre+Franklin:ital,wght@0,400;0,500;0,600;0,700;0,800;1,800&family=Source+Sans+3:ital,wght@0,400;0,500;0,600;0,700&display=swap" },
    ],
  }),
  component: GatedEspaceEmployes,
});
