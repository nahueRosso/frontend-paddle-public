import type { Metadata } from "next";

import { LandingPage } from "@/components/landing/landing-page";

export const metadata: Metadata = {
  title: "Mi Club Padel — Tu club de pádel, en piloto automático",
  description:
    "Automatizá reservas, cobros y atención por WhatsApp con IA. Plataforma argentina para clubes de pádel con gestión de turnos, torneos, clases y cobros por Mercado Pago.",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Mi Club Padel — Tu club de pádel, en piloto automático",
    description:
      "Reservas, torneos, canchas, clases y cobros — todo desde una sola web. Bot de WhatsApp con IA que reserva y cobra la seña por Mercado Pago, solo, las 24 horas.",
    url: "/",
    siteName: "Mi Club Padel",
    locale: "es_AR",
    type: "website",
    images: [
      {
        url: "/mi-padel-club-icon-circulo-negro.svg",
        alt: "Mi Club Padel — Plataforma de gestión para clubes de pádel",
      },
    ],
  },
};

export default function HomePage() {
  return <LandingPage />;
}
