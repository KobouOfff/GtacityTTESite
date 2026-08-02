import { createFileRoute } from "@tanstack/react-router";
import ConfidentialitePage from "@/pages-html/Confidentialite";
import { langFromHeadCtx } from "@/lib/i18n/detect-lang.server";

export const Route = createFileRoute("/confidentialite")({
  head: (ctx) => {
    const lang = langFromHeadCtx(ctx);
    const title = lang === "en" ? "Privacy Policy — Townsend Transit Express" : "Politique de confidentialité — Townsend Transit Express";
    const description =
      lang === "en"
        ? "Read the Townsend Transit Express privacy policy for travelers and TTE staff."
        : "Consultez la charte de confidentialité de Townsend Transit Express pour les voyageurs et le personnel TTE.";
    const ogDescription =
      lang === "en"
        ? "Privacy commitments, internal access and protection of traveler and staff information at TTE."
        : "Engagements de confidentialité, accès internes et protection des informations des voyageurs et agents TTE.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: ogDescription },
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
    };
  },
  component: ConfidentialitePage,
});
