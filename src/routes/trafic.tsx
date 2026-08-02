import { createFileRoute } from "@tanstack/react-router";
import TraficPage from "@/pages-html/Trafic";
import { langFromHeadCtx } from "@/lib/i18n/detect-lang.server";

export const Route = createFileRoute("/trafic")({
  head: (ctx) => {
    const lang = langFromHeadCtx(ctx);
    const title = lang === "en" ? "Live Traffic Information — Townsend Transit Express" : "Info trafic en direct — Townsend Transit Express";
    const description =
      lang === "en"
        ? "Check TTE traffic status: ongoing incidents, delays, track changes and train cancellations."
        : "Consultez l’état du trafic TTE, les incidents en cours, les retards, changements de voie et suppressions de trains.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
      ],
      links: [{ rel: "canonical", href: "https://townsendtransitexpress.com/trafic" }],
    };
  },
  component: TraficPage,
});
