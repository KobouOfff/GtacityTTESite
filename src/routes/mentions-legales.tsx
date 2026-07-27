import { createFileRoute } from "@tanstack/react-router";
import MentionsLegalesPage from "@/pages-html/MentionsLegales";

export const Route = createFileRoute("/mentions-legales")({
  head: () => ({
    meta: [
      { title: "Mentions légales — Townsend Transit Express" },
      {
        name: "description",
        content:
          "Consultez les mentions légales du site officiel de Townsend Transit Express.",
      },
      { property: "og:title", content: "Mentions légales — Townsend Transit Express" },
      {
        property: "og:description",
        content:
          "Informations relatives à l’éditeur et aux conditions d’utilisation du site Townsend Transit Express.",
      },
      { property: "og:type", content: "website" },
      {
        property: "og:url",
        content: "https://www.townsendtransitexpress.com/mentions-legales",
      },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://www.townsendtransitexpress.com/mentions-legales",
      },
    ],
  }),
  component: MentionsLegalesPage,
});
