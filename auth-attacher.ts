import { createFileRoute } from "@tanstack/react-router";
import CentreRegulationPage from "@/pages-html/CentreRegulation";
import { DiscordAccessGate } from "@/components/DiscordAuth";

function GatedCentreRegulation() {
  return (
    <DiscordAccessGate path="/centre-regulation">
      <CentreRegulationPage />
    </DiscordAccessGate>
  );
}

export const Route = createFileRoute("/centre-regulation")({
  head: () => ({
    meta: [
      { title: "Centre de R\u00e9gulation \u2014 Townsend Transit Express" },
      { name: "description", content: "Centre de R\u00e9gulation du trafic \u2014 poste de commandement op\u00e9rationnel TTE." },
      { property: "og:title", content: "Centre de R\u00e9gulation \u2014 Townsend Transit Express" },
      { property: "og:description", content: "Centre de R\u00e9gulation du trafic \u2014 poste de commandement op\u00e9rationnel TTE." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@400;500;600;700;800&family=Source+Sans+3:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap" },
    ],
  }),
  component: GatedCentreRegulation,
});
