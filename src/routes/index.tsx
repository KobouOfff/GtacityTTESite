import { createFileRoute } from "@tanstack/react-router";
import AccueilPage from "@/pages-html/Accueil";
import { langFromHeadCtx } from "@/lib/i18n/detect-lang.server";

export const Route = createFileRoute("/")({
  head: (ctx) => {
    const lang = langFromHeadCtx(ctx);
    const title =
      lang === "en"
        ? "Townsend Transit Express \u2014 Tennessee Rail Network"
        : "Townsend Transit Express \u2014 R\u00e9seau ferroviaire du Tennessee";
    const description =
      lang === "en"
        ? "Townsend Transit Express (TTE): regional, InterCity and local trains serving Townsend. Timetables, network map, stations and fares. Tickets sold in stations."
        : "Townsend Transit Express (TTE) : trains r\u00e9gionaux, InterCit\u00e9 et desserte locale de Townsend. Horaires, plan du r\u00e9seau, gares et tarifs. Billets en vente en gare.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [
        { rel: "canonical", href: "https://townsendtransitexpress.com/" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
        { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Libre+Franklin:ital,wght@0,400;0,500;0,600;0,700;0,800;1,700;1,800&family=Source+Sans+3:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" },
      ],
    };
  },
  component: AccueilPage,
});
