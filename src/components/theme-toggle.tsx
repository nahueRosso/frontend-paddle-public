"use client";

import { Moon, SunMedium } from "lucide-react";

import { useAppTheme } from "@/components/app-theme-provider";
import { cn } from "@/lib/utils";

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { mounted, theme, setTheme } = useAppTheme();

  const isDark = mounted && theme === "dark";
  const nextThemeLabel = isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro";

  if (!mounted) {
    return (
      <span
        aria-hidden="true"
        className={cn(
          "inline-flex h-10 w-10 rounded-full border border-transparent",
          className,
        )}
      />
    );
  }

  return (
    <button
      type="button"
      aria-label={nextThemeLabel}
      title={nextThemeLabel}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors",
        "border-slate-200 bg-white/80 text-slate-700 hover:bg-slate-100",
        "dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:bg-slate-800",
        className,
      )}
    >
      {isDark ? <SunMedium className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
