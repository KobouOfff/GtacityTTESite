import { createFileRoute } from "@tanstack/react-router";
import AccueilPage from "@/pages-html/Accueil";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Townsend Transit Express \u2014 R\u00e9seau ferroviaire du Tennessee" },
      { name: "description", content: "Townsend Transit Express (TTE) : trains r\u00e9gionaux, InterCit\u00e9 et desserte locale de Townsend. Horaires, plan du r\u00e9seau, gares et tarifs. Billets en vente en gare." },
      { property: "og:title", content: "Townsend Transit Express \u2014 R\u00e9seau ferroviaire du Tennessee" },
      { property: "og:description", content: "Townsend Transit Express (TTE) : trains r\u00e9gionaux, InterCit\u00e9 et desserte locale de Townsend. Horaires, plan du r\u00e9seau, gares et tarifs. Billets en vente en gare." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: "https://www.townsendtransitexpress.com/" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Libre+Franklin:ital,wght@0,400;0,500;0,600;0,700;0,800;1,700;1,800&family=Source+Sans+3:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" },
    ],
  }),
  component: AccueilPage,
});
