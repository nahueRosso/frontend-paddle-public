import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AppThemeProvider } from "@/components/app-theme-provider";

export const metadata: Metadata = {
  title: "Login MiClubPadel",
  icons: {
    icon: "/logo-square.ico",
    shortcut: "/logo-square.ico",
    apple: "/logo-square.ico",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <AppThemeProvider>
      <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        {children}
      </div>
    </AppThemeProvider>
  );
}
