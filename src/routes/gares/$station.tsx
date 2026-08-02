import { createFileRoute } from "@tanstack/react-router";
import GarePage from "@/pages-html/Gare";
import { stationBySlug } from "@/lib/public-stations";

export const Route = createFileRoute("/gares/$station")({
  head: ({ params }) => {
    const station = stationBySlug(params.station);
    if (!station) return { meta: [{ title: "Gare introuvable — TTE" }, { name: "robots", content: "noindex" }] };
    const title = `Gare de ${station.shortName} — horaires et départs TTE`;
    const description = `${station.description} Consultez les horaires du jour, les lignes, services, retards et suppressions.`;
    return {
      meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:type", content: "website" }],
      links: [{ rel: "canonical", href: `https://townsendtransitexpress.com/gares/${station.slug}` }],
    };
  },
  component: StationRoute,
});

function StationRoute() {
  const { station: slug } = Route.useParams();
  const station = stationBySlug(slug);
  if (!station) return <main style={{padding:"60px",textAlign:"center"}}><h1>Gare introuvable</h1><a href="/">Retour à l’accueil</a></main>;
  return <GarePage station={station} />;
}
