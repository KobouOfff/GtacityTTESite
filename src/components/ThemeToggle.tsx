import { useEffect, useState } from "react";

const STORAGE_KEY = "tte-color-theme";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggleTheme() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    document.documentElement.style.colorScheme = next ? "dark" : "light";
    localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
    setDark(next);
  }

  return (
    <button
      type="button"
      className="tte-theme-toggle"
      onClick={toggleTheme}
      aria-label={dark ? "Activer le thème clair" : "Activer le thème sombre"}
      title={dark ? "Thème clair" : "Thème sombre"}
    >
      {dark ? (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20.5 14.2A8.4 8.4 0 0 1 9.8 3.5 8.5 8.5 0 1 0 20.5 14.2Z" />
        </svg>
      )}
      <span>{dark ? "Clair" : "Sombre"}</span>
    </button>
  );
}
