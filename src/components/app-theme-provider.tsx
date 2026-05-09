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
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const storedTheme = window.localStorage.getItem(APP_THEME_STORAGE_KEY);
    const rootHasDarkClass = document.documentElement.classList.contains("dark");

    if (storedTheme === "dark" || storedTheme === "light") {
      setThemeState(storedTheme);
    } else if (rootHasDarkClass) {
      setThemeState("dark");
    } else {
      setThemeState(mediaQuery.matches ? "dark" : "light");
    }

    const handleSystemThemeChange = (event: MediaQueryListEvent) => {
      const persistedTheme = window.localStorage.getItem(APP_THEME_STORAGE_KEY);

      if (persistedTheme === "dark" || persistedTheme === "light") {
        return;
      }

      setThemeState(event.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);

    setMounted(true);

    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
    };
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
    root.style.colorScheme = isDark ? "dark" : "light";

    return () => {
      root.classList.remove("dark");
      body.classList.remove("dark");
      root.style.colorScheme = "";
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
