import { createFileRoute } from "@tanstack/react-router";
import ConfidentialitePage from "@/pages-html/Confidentialite";

export const Route = createFileRoute("/confidentialite")({
  head: () => ({
    meta: [
      { title: "Politique de confidentialité — Townsend Transit Express" },
      {
        name: "description",
        content:
          "Consultez la charte de confidentialité de Townsend Transit Express pour les voyageurs et le personnel TTE.",
      },
      {
        property: "og:title",
        content: "Politique de confidentialité — Townsend Transit Express",
      },
      {
        property: "og:description",
        content:
          "Engagements de confidentialité, accès internes et protection des informations des voyageurs et agents TTE.",
      },
      { property: "og:type", content: "website" },
      {
        property: "og:url",
        content: "https://www.townsendtransitexpress.com/confidentialite",
      },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://www.townsendtransitexpress.com/confidentialite",
      },
    ],
  }),
  component: ConfidentialitePage,
});
