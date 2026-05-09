import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Planes | Mi Club Pádel",
  description: "Elegí el plan que mejor se adapta a tu club.",
  icons: {
    icon: "/logo-square.ico",
    shortcut: "/logo-square.ico",
    apple: "/logo-square.ico",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PlanesLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
