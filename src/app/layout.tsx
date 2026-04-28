import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Inter } from "next/font/google";

import { company } from "@/config/company";
import { cn } from "@/lib/utils";

import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const sanitizedDomain = company.domain.replace(/[{}]/g, "").trim();
const siteUrl = sanitizedDomain
  ? `https://${sanitizedDomain}`
  : "https://example.com";

const fbDomainVerification = process.env.FB_DOMAIN_VERIFICATION;

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: company.brandName,
  legalName: company.legalName,
  url: "https://miclubpadel.com",
  email: company.email,
  telephone: company.phone,
  address: {
    "@type": "PostalAddress",
    addressLocality: company.locality,
    addressRegion: company.province,
    addressCountry: "AR",
  },
  identifier: `CUIT ${company.cuit}`,
  foundingDate: company.foundingDate,
  sameAs: company.sameAs,
};

export const metadata: Metadata = {
  metadataBase: sanitizedDomain ? new URL(siteUrl) : undefined,
  title: "MiClub Pádel — Reservas y gestión para clubes",
  description:
    "Automatizá tus reservas, pagos y operación diaria con MiClub Pádel. Plataforma argentina para clubes con gestión de turnos y cobros online.",
  openGraph: {
    title: "MiClub Pádel — Reservas y gestión para clubes",
    description:
      "Automatizá tus reservas, pagos y operación diaria con MiClub Pádel. Plataforma argentina para clubes con gestión de turnos y cobros online.",
    url: siteUrl,
    siteName: company.brandName,
    locale: "es_AR",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: `${company.brandName} - Reservas y gestión para clubes`,
      },
    ],
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={cn("scroll-smooth", inter.variable)}>
      <head>
        {fbDomainVerification ? (
          <meta
            name="facebook-domain-verification"
            content={fbDomainVerification}
          />
        ) : null}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
      </head>
      <body
        className={cn(
          "min-h-screen bg-[#F9FAFB] text-[#111827] antialiased",
          inter.className,
        )}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
