"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { company } from "@/config/company";
import { ContactDialog } from "@/components/contact-dialog";

const currentYear = new Date().getFullYear();

const productLinks = [
  { href: "#plataforma", label: "Plataforma" },
  { href: "#whatsapp", label: "WhatsApp IA" },
  { href: "#gestion", label: "Gestión" },
  { href: "#planes", label: "Planes" },
];

const accessLinks = [
  { href: "https://admin.miclubpadel.com", label: "admin.miclubpadel.com" },
  { href: "https://app.miclubpadel.com", label: "app.miclubpadel.com" },
];

const legalLinks = [
  { href: "/terminos", label: "Términos y condiciones" },
  { href: "/privacidad", label: "Política de privacidad" },
  { href: "/politicas-jugador", label: "Políticas de jugadores" },
  { href: "/como-eliminar-datos", label: "Eliminar mis datos" },
];

export function Footer() {
  const [contactOpen, setContactOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <footer className="border-t border-white/[0.07] bg-[#0A0B0D]">
        <div className="mx-auto grid max-w-[1180px] gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3">
              <span className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-[11px] bg-[#D6FF3D]">
                <span className="block h-[15px] w-[15px] rounded-full bg-[#0A0B0D]" />
              </span>
              <span className="font-heading text-base font-bold text-[#F2F3F5]">
                {company.brandName}
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-[#6B7280]">
              La plataforma argentina para gestionar tu club de pádel: reservas,
              torneos, cobros y WhatsApp con IA en un solo lugar.
            </p>
          </div>

          {/* Producto */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-[#F2F3F5]">
              Producto
            </h4>
            <ul className="flex flex-col gap-2.5">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={pathname === "/" ? link.href : `/${link.href}`}
                    className="text-sm text-[#6B7280] no-underline transition-colors hover:text-[#D6FF3D]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Accesos */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-[#F2F3F5]">
              Accesos
            </h4>
            <ul className="flex flex-col gap-2.5">
              {accessLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#6B7280] no-underline transition-colors hover:text-[#D6FF3D]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-[#F2F3F5]">
              Contacto
            </h4>
            <ul className="flex flex-col gap-2.5">
              <li>
                <a
                  href={`mailto:${company.email}`}
                  className="text-sm text-[#6B7280] no-underline transition-colors hover:text-[#D6FF3D]"
                >
                  {company.email}
                </a>
              </li>
              <li>
                <button
                  onClick={() => setContactOpen(true)}
                  className="text-sm text-[#6B7280] transition-colors hover:text-[#D6FF3D]"
                >
                  Enviar mensaje
                </button>
              </li>
            </ul>
          </div>

          {/* Seguridad / Legal */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-[#F2F3F5]">
              Seguridad
            </h4>
            <ul className="flex flex-col gap-2.5">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#6B7280] no-underline transition-colors hover:text-[#D6FF3D]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.07]">
          <div className="mx-auto flex max-w-[1180px] flex-col items-center justify-between gap-3 px-6 py-5 sm:flex-row">
            <p className="text-xs text-[#6B7280]">
              &copy; {currentYear} {company.brandName}. Hecho en Argentina
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="/privacidad"
                className="text-xs text-[#6B7280] no-underline transition-colors hover:text-[#D6FF3D]"
              >
                Privacidad
              </Link>
              <Link
                href="/terminos"
                className="text-xs text-[#6B7280] no-underline transition-colors hover:text-[#D6FF3D]"
              >
                Términos
              </Link>
            </div>
          </div>
        </div>
      </footer>

      <ContactDialog open={contactOpen} onOpenChange={setContactOpen} />
    </>
  );
}
