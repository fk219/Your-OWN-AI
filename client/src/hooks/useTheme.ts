import { useEffect, useState } from "react";

export type Theme = "dark" | "light";

const KEY = "vectordb_theme";

export function useTheme(defaultTheme: Theme = "light") {
  const [theme, setTheme] = useState<Theme>(() => {
    const v = localStorage.getItem(KEY);
    const t = v === "dark" || v === "light" ? v : defaultTheme;
    document.documentElement.dataset.theme = t;
    return t;
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(KEY, theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return { theme, setTheme, toggleTheme };
}
