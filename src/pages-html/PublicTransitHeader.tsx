import { TTELogo } from "@/components/TTELogo";

export function PublicTransitHeader({ active }: { active?: string }) {
  return (
    <header className="transit-header">
      <div className="transit-header-in">
        <a className="transit-brand" href="/">
          <TTELogo className="logo" />
          <span>Townsend Transit Express</span>
        </a>
        <nav className="transit-nav" aria-label="Navigation voyageurs">
          <a href="/">Accueil</a>
          <a href="/#finder">Horaires</a>
          <a className={active === "gares" ? "active" : ""} href="/gares/townsend">Gares</a>
          <a className={active === "trafic" ? "active" : ""} href="/trafic">Info trafic</a>
          <a href="/contact">Aide</a>
        </nav>
      </div>
    </header>
  );
}
