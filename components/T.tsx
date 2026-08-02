import type { ReactNode } from "react";

/**
 * Bilingual text helper.
 *
 * Renders BOTH the French and English versions into the DOM (identically on
 * the server and on the client, so there is no hydration mismatch), and lets
 * CSS show only the one matching `html[data-lang]` — set by the boot script
 * in __root.tsx before the page paints, and updated instantly by the
 * language toggle. This means visitors never see a flash of the wrong
 * language, and the correct language is already present for anyone reading
 * the raw server-rendered HTML (e.g. crawlers with no JS).
 *
 * Use for any inline/body copy: <T fr="Bonjour" en="Hello" />
 * For attributes (title, alt, aria-label, placeholder…) use `useLanguage().t()` instead.
 */
export function T({ fr, en }: { fr: ReactNode; en: ReactNode }) {
  return (
    <>
      <span className="i18n-fr">{fr}</span>
      <span className="i18n-en">{en}</span>
    </>
  );
}
