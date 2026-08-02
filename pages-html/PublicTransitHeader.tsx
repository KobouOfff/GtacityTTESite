import { TTELogo } from "@/components/TTELogo";
import { T } from "@/components/T";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function PublicTransitHeader({ active }: { active?: string }) {
  const { t } = useLanguage();
  return (
    <header className="transit-header">
      <div className="transit-header-in">
        <a className="transit-brand" href="/">
          <TTELogo className="logo" />
          <span>Townsend Transit Express</span>
        </a>
        <nav className="transit-nav" aria-label={t("Navigation voyageurs", "Traveller navigation")}>
          <a href="/"><T fr="Accueil" en="Home" /></a>
          <a href="/#finder"><T fr="Horaires" en="Timetables" /></a>
          <a className={active === "gares" ? "active" : ""} href="/gares/townsend"><T fr="Gares" en="Stations" /></a>
          <a className={active === "trafic" ? "active" : ""} href="/trafic"><T fr="Info trafic" en="Service status" /></a>
          <a href="/contact"><T fr="Aide" en="Help" /></a>
        </nav>
      </div>
    </header>
  );
}
