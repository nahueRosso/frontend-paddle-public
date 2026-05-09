import type { Metadata } from "next";

import HeroSection from "@/components/HeroSection";

export const metadata: Metadata = {
  title: "Mi Club Pádel — Reservas y gestión para clubes",
  description:
    "Automatizá tus reservas, pagos y operación diaria con Mi Club Pádel. Plataforma argentina para clubes con gestión de turnos y cobros online.",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Mi Club Pádel — Reservas y gestión para clubes",
    description:
      "Automatizá tus reservas, pagos y operación diaria con Mi Club Pádel. Plataforma argentina para clubes con gestión de turnos y cobros online.",
    url: "/",
    siteName: "Mi Club Pádel",
    locale: "es_AR",
    type: "website",
    images: [
      {
        url: "/mi-padel-club-icon-circulo-negro.svg",
        alt: "Mi Club Pádel - Reservas y gestión para clubes",
      },
    ],
  },
};

export default function HomePage() {
  return <HeroSection />;
}
