import type { ReactNode } from "react";

import { AppThemeProvider } from "@/components/app-theme-provider";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <AppThemeProvider>
      <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        {children}
      </div>
    </AppThemeProvider>
  );
}
