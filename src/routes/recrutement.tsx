import { createFileRoute } from "@tanstack/react-router";
import RecrutementPage from "@/pages-html/Recrutement";
import { langFromHeadCtx } from "@/lib/i18n/detect-lang.server";

export const Route = createFileRoute("/recrutement")({
  head: (ctx) => {
    const lang = langFromHeadCtx(ctx);
    const title = lang === "en" ? "Careers — Townsend Transit Express" : "Recrutement — Townsend Transit Express";
    const description =
      lang === "en"
        ? "Join Townsend Transit Express: maintenance technician, transit safety officer, conductor, train operator, bus operator, dispatcher, administrative assistant and more."
        : "Rejoignez Townsend Transit Express : agent de maintenance, agent de sûreté ferroviaire, contrôleur, conducteur de train, conducteur de bus, régulateur, secrétaire et plus.";
    const ogDescription =
      lang === "en"
        ? "TTE is always hiring across Tennessee. Competitive pay, benefits and paid training."
        : "TTE recrute en permanence dans tout le Tennessee. Salaire compétitif, avantages et formation payée.";
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
        { rel: "canonical", href: "https://www.townsendtransitexpress.com/recrutement" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Libre+Franklin:ital,wght@0,400;0,500;0,600;0,700;0,800;1,700;1,800&family=Source+Sans+3:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap",
        },
      ],
    };
  },
  component: RecrutementPage,
});
