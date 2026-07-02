"use client";

import { createContext, useContext, type ReactNode } from "react";

type AppTheme = "light" | "dark";

type AppThemeContextValue = {
  theme: AppTheme;
  mounted: boolean;
  setTheme: (theme: AppTheme) => void;
};

const AppThemeContext = createContext<AppThemeContextValue>({
  theme: "dark",
  mounted: true,
  setTheme: () => {},
});

export function AppThemeProvider({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <AppThemeContext.Provider
      value={{ theme: "dark", mounted: true, setTheme: () => {} }}
    >
      <div
        className={["min-h-screen", className].filter(Boolean).join(" ")}
      >
        {children}
      </div>
    </AppThemeContext.Provider>
  );
}

export function useAppTheme() {
  return useContext(AppThemeContext);
}
