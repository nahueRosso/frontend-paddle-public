import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AppThemeProvider } from "@/components/app-theme-provider";

export const metadata: Metadata = {
  title: "Login | Mi Club Pádel",
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
  return <AppThemeProvider>{children}</AppThemeProvider>;
}
