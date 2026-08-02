import { createFileRoute } from "@tanstack/react-router";
import ContactPage from "@/pages-html/Contact";
import { langFromHeadCtx } from "@/lib/i18n/detect-lang.server";

export const Route = createFileRoute("/contact")({
  head: (ctx) => {
    const lang = langFromHeadCtx(ctx);
    const title = lang === "en" ? "Help &amp; Contact \u2014 Townsend Transit Express" : "Aide &amp; contact \u2014 Townsend Transit Express";
    const description =
      lang === "en"
        ? "Open a request with Townsend Transit Express: refunds, traveler information, press, lost and found, accessibility, complaints."
        : "Ouvrez une demande aupr\u00e8s de Townsend Transit Express : remboursement, information voyageur, presse, objets trouv\u00e9s, accessibilit\u00e9, r\u00e9clamation.";
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
      { rel: "canonical", href: "https://townsendtransitexpress.com/contact" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Libre+Franklin:ital,wght@0,400;0,500;0,600;0,700;0,800;1,800&family=Source+Sans+3:ital,wght@0,400;0,500;0,600;0,700&display=swap" },
    ],
    };
  },
  component: ContactPage,
});
