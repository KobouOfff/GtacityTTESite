import { createFileRoute } from "@tanstack/react-router";
import BusPage from "@/pages-html/Bus";
import { langFromHeadCtx } from "@/lib/i18n/detect-lang.server";

export const Route = createFileRoute("/bus")({
  head: (ctx) => {
    const lang = langFromHeadCtx(ctx);
    const title = lang === "en" ? "Bus lines — Townsend Transit Express" : "Lignes de bus — Townsend Transit Express";
    const description =
      lang === "en"
        ? "Discover TTE's two new bus lines: the Downtown loop (Line 1) and the Rural sector shuttle (Line 2), connecting with the train network."
        : "Découvrez les deux nouvelles lignes de bus de TTE : la boucle Centre-Ville (Ligne 1) et la navette Secteur Rural (Ligne 2), en correspondance avec le réseau ferroviaire.";
    const ogDescription =
      lang === "en"
        ? "New bus lines rolling out next month, connecting with Townsend Transit Express's existing train network."
        : "Nouvelles lignes de bus en circulation dès le mois prochain, en correspondance avec le réseau ferroviaire de Townsend Transit Express.";
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
        { rel: "canonical", href: "https://townsendtransitexpress.com/bus" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Libre+Franklin:ital,wght@0,400;0,500;0,600;0,700;0,800;1,700;1,800&family=Source+Sans+3:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap",
        },
      ],
    };
  },
  component: BusPage,
});
