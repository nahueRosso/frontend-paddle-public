import type { ReactNode } from "react";

import { Footer } from "@/components/footer";
import FloatingWhatsappButton from "@/components/floating-whatsapp-button";
import { Header } from "@/components/header";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-[#0A0B0D] text-[#E4E5E7]">
      <Header />
      <main className="flex flex-1 flex-col">{children}</main>
      <Footer />
      <FloatingWhatsappButton />
    </div>
  );
}
