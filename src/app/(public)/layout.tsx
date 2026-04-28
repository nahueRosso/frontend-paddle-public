import type { ReactNode } from "react";

import { Footer } from "@/components/footer";
import FloatingWhatsappButton from "@/components/floating-whatsapp-button";
import { Header } from "@/components/header";
import { AppThemeProvider } from "@/components/app-theme-provider";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <AppThemeProvider>
      <div className="relative flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <Header />
        <main className="flex flex-1 flex-col bg-slate-50 dark:bg-slate-950">
          {children}
        </main>
        <Footer />
        <FloatingWhatsappButton />
      </div>
    </AppThemeProvider>
  );
}
