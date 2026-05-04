import type { Metadata } from "next";

import HeroSection from "@/components/HeroSection";

export const metadata: Metadata = {
  title: "MiClub Pádel — Reservas y gestión para clubes",
  description:
    "Automatizá tus reservas, pagos y operación diaria con MiClub Pádel. Plataforma argentina para clubes con gestión de turnos y cobros online.",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "MiClub Pádel — Reservas y gestión para clubes",
    description:
      "Automatizá tus reservas, pagos y operación diaria con MiClub Pádel. Plataforma argentina para clubes con gestión de turnos y cobros online.",
    url: "/",
    siteName: "Mi Club Pádel",
    locale: "es_AR",
    type: "website",
    images: [
      {
        url: "/mi-padel-club-icon-circulo-negro.svg",
        alt: "MiClub Pádel - Reservas y gestión para clubes",
      },
    ],
  },
};

export default function HomePage() {
  return <HeroSection />;
}
