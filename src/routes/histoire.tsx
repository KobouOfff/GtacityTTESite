import { createFileRoute } from "@tanstack/react-router";
import HistoirePage from "@/pages-html/Histoire";
import { langFromHeadCtx } from "@/lib/i18n/detect-lang.server";

export const Route = createFileRoute("/histoire")({
  head: (ctx) => {
    const lang = langFromHeadCtx(ctx);
    const title = lang === "en" ? "Our History — Townsend Transit Express" : "Notre histoire — Townsend Transit Express";
    const description =
      lang === "en"
        ? "Discover the history of Townsend Transit Express, a family-owned railway company founded by Robert Turner in Townsend in 1983."
        : "Découvrez l’histoire de Townsend Transit Express, société ferroviaire familiale fondée par Robert Turner à Townsend en 1983.";
    const ogDescription =
      lang === "en"
        ? "Since 1983, TTE has been building a safe, reliable and modern regional rail network serving Tennessee."
        : "Depuis 1983, TTE développe un réseau ferroviaire régional sûr, fiable et moderne au service du Tennessee.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: ogDescription },
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
    };
  },
  component: HistoirePage,
});
