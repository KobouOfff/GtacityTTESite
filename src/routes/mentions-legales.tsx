import { createFileRoute } from "@tanstack/react-router";
import MentionsLegalesPage from "@/pages-html/MentionsLegales";
import { langFromHeadCtx } from "@/lib/i18n/detect-lang.server";

export const Route = createFileRoute("/mentions-legales")({
  head: (ctx) => {
    const lang = langFromHeadCtx(ctx);
    const title = lang === "en" ? "Legal Notice — Townsend Transit Express" : "Mentions légales — Townsend Transit Express";
    const description =
      lang === "en"
        ? "Read the legal notice for the official Townsend Transit Express website."
        : "Consultez les mentions légales du site officiel de Townsend Transit Express.";
    const ogDescription =
      lang === "en"
        ? "Information about the publisher and terms of use of the Townsend Transit Express website."
        : "Informations relatives à l’éditeur et aux conditions d’utilisation du site Townsend Transit Express.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: ogDescription },
        { property: "og:type", content: "website" },
        {
          property: "og:url",
          content: "https://www.townsendtransitexpress.com/mentions-legales",
        },
      ],
      links: [
        {
          rel: "canonical",
          href: "https://www.townsendtransitexpress.com/mentions-legales",
        },
      ],
    };
  },
  component: MentionsLegalesPage,
});
