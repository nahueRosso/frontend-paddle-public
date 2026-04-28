"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type AppTheme = "light" | "dark";

type AppThemeContextValue = {
  theme: AppTheme;
  mounted: boolean;
  setTheme: (theme: AppTheme) => void;
};

const APP_THEME_STORAGE_KEY = "app-shell-theme";

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

export function AppThemeProvider({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const [theme, setThemeState] = useState<AppTheme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const storedTheme =
      typeof window !== "undefined"
        ? (window.localStorage.getItem(APP_THEME_STORAGE_KEY) as AppTheme | null)
        : null;

    if (storedTheme === "dark" || storedTheme === "light") {
      setThemeState(storedTheme);
    }

    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    const root = document.documentElement;
    const body = document.body;
    const isDark = theme === "dark";

    root.classList.toggle("dark", isDark);
    body.classList.toggle("dark", isDark);

    return () => {
      root.classList.remove("dark");
      body.classList.remove("dark");
    };
  }, [mounted, theme]);

  const setTheme = (nextTheme: AppTheme) => {
    setThemeState(nextTheme);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(APP_THEME_STORAGE_KEY, nextTheme);
    }
  };

  const value = useMemo(
    () => ({
      theme,
      mounted,
      setTheme,
    }),
    [mounted, theme],
  );

  return (
    <AppThemeContext.Provider value={value}>
      <div
        className={[
          "min-h-screen transition-colors duration-300",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </div>
    </AppThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(AppThemeContext);

  if (!context) {
    throw new Error("useAppTheme must be used within AppThemeProvider");
  }

  return context;
}
