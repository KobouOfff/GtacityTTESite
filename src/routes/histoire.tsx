import { createFileRoute } from "@tanstack/react-router";
import HistoirePage from "@/pages-html/Histoire";

export const Route = createFileRoute("/histoire")({
  head: () => ({
    meta: [
      { title: "Notre histoire — Townsend Transit Express" },
      {
        name: "description",
        content:
          "Découvrez l’histoire de Townsend Transit Express, de la Ligne T créée à Townsend en 1921 au réseau ferroviaire régional actuel.",
      },
      { property: "og:title", content: "Notre histoire — Townsend Transit Express" },
      {
        property: "og:description",
        content:
          "De la première ligne urbaine de Townsend au réseau régional TTE : plus d’un siècle d’histoire ferroviaire.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: "https://www.townsendtransitexpress.com/histoire" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Libre+Franklin:ital,wght@0,400;0,500;0,600;0,700;0,800;1,700;1,800&family=Source+Sans+3:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap",
      },
    ],
  }),
  component: HistoirePage,
});
