import { createFileRoute } from "@tanstack/react-router";
import ContactPage from "@/pages-html/Contact";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Aide &amp; contact \u2014 Townsend Transit Express" },
      { name: "description", content: "Ouvrez une demande aupr\u00e8s de Townsend Transit Express : remboursement, information voyageur, presse, objets trouv\u00e9s, accessibilit\u00e9, r\u00e9clamation." },
      { property: "og:title", content: "Aide &amp; contact \u2014 Townsend Transit Express" },
      { property: "og:description", content: "Ouvrez une demande aupr\u00e8s de Townsend Transit Express : remboursement, information voyageur, presse, objets trouv\u00e9s, accessibilit\u00e9, r\u00e9clamation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Libre+Franklin:ital,wght@0,400;0,500;0,600;0,700;0,800;1,800&family=Source+Sans+3:ital,wght@0,400;0,500;0,600;0,700&display=swap" },
    ],
  }),
  component: ContactPage,
});
