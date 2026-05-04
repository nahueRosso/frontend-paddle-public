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
  url: siteUrl,
  email: company.email,
  telephone: company.phone,
  foundingDate: company.foundingDate,
  sameAs: company.sameAs,
};

export const metadata: Metadata = {
  metadataBase: sanitizedDomain ? new URL(siteUrl) : undefined,
  icons: {
    icon: [
      { url: "/logo-square.ico", type: "image/x-icon" },
      {
        url: "/mi-padel-club-icon-circulo-negro.svg",
        type: "image/svg+xml",
      },
    ],
    shortcut: "/logo-square.ico",
    apple: "/logo-square.ico",
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
