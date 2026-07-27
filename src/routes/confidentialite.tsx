import { createFileRoute } from "@tanstack/react-router";
import ConfidentialitePage from "@/pages-html/Confidentialite";

export const Route = createFileRoute("/confidentialite")({
  head: () => ({
    meta: [
      { title: "Politique de confidentialité — Townsend Transit Express" },
      {
        name: "description",
        content:
          "Découvrez comment Townsend Transit Express collecte, utilise et protège les données personnelles.",
      },
      {
        property: "og:title",
        content: "Politique de confidentialité — Townsend Transit Express",
      },
      {
        property: "og:description",
        content:
          "Données collectées, finalités, cookies, prestataires et droits des utilisateurs du site TTE.",
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
