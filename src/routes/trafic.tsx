import { createFileRoute } from "@tanstack/react-router";
import TraficPage from "@/pages-html/Trafic";

export const Route = createFileRoute("/trafic")({
  head: () => ({
    meta: [
      { title: "Info trafic en direct — Townsend Transit Express" },
      { name: "description", content: "Consultez l’état du trafic TTE, les incidents en cours, les retards, changements de voie et suppressions de trains." },
      { property: "og:title", content: "Info trafic en direct — Townsend Transit Express" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://www.townsendtransitexpress.com/trafic" }],
  }),
  component: TraficPage,
});
