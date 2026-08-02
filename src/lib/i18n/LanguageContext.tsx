import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "fr" | "en";

const STORAGE_KEY = "tte-lang";

type LanguageContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  /** Pick a string depending on the current language. */
  t: (fr: string, en: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readAttrLang(): Lang | null {
  if (typeof document === "undefined") return null;
  const value = document.documentElement.getAttribute("data-lang");
  return value === "en" || value === "fr" ? value : null;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Server (and first client render, to avoid a hydration mismatch) always
  // assumes French. The inline boot script in __root.tsx sets the
  // `data-lang` attribute on <html> before hydration runs, and this effect
  // simply syncs React state to it right after mount.
  const [lang, setLangState] = useState<Lang>("fr");

  useEffect(() => {
    const detected = readAttrLang();
    if (detected) setLangState(detected);
  }, []);

  function setLang(next: Lang) {
    setLangState(next);
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-lang", next);
      document.documentElement.lang = next;
    }
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore (private browsing, storage disabled, etc.)
    }
  }

  function toggleLang() {
    setLang(lang === "fr" ? "en" : "fr");
  }

  function t(fr: string, en: string) {
    return lang === "en" ? en : fr;
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
