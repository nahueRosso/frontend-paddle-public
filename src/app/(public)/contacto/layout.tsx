import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Contacto | Mi Club Pádel",
  description:
    "Hablemos sobre cómo automatizar la operación de tu club de pádel con WhatsApp Business.",
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

export default function ContactoLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
