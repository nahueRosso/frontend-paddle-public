"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { buildLoginRedirectUrl, buildRelativeUrl } from "@/lib/auth/navigation";
import { PlayerAccessDialog } from "@/components/player-access-dialog";

const NAV_LINKS = [
  { href: "#plataforma", label: "Plataforma" },
  { href: "#whatsapp", label: "WhatsApp IA" },
  { href: "#gestion", label: "Gestión" },
  { href: "#planes", label: "Planes" },
];

export function Header() {
  const { signOut, session } = useAuth();
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);
  const [playerDialogOpen, setPlayerDialogOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const closeNav = useCallback(() => setNavOpen(false), []);
  const toggleNav = useCallback(() => setNavOpen((v) => !v), []);

  const currentUrl = buildRelativeUrl(pathname ?? "/");
  const loginHref = buildLoginRedirectUrl(currentUrl);

  useEffect(() => {
    if (!navOpen) return;
    function handleOutside(e: MouseEvent) {
      const t = e.target as Node | null;
      if (
        t &&
        menuRef.current &&
        !menuRef.current.contains(t) &&
        triggerRef.current &&
        !triggerRef.current.contains(t)
      ) {
        closeNav();
      }
    }
    function handleScroll() {
      closeNav();
    }
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("scroll", handleScroll);
    };
  }, [navOpen, closeNav]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[rgba(10,11,13,0.72)] backdrop-blur-[14px]">
      <nav className="mx-auto flex max-w-[1180px] items-center justify-between gap-6 px-6 py-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 no-underline"
          onClick={closeNav}
        >
          <span className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-[11px] bg-[#D6FF3D]">
            <Image
              src="/mi-padel-club-icon-black.svg"
              alt="Mi Club Padel"
              width={15}
              height={18}
              priority
            />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-heading text-base font-bold tracking-[-0.01em] text-[#F2F3F5]">
              Mi Club Padel
            </span>
            <span className="text-[11px] font-medium text-[#6B7280]">
              Gestión + WhatsApp IA
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-[30px] md:flex">
          <div className="flex items-center gap-[26px]">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={pathname === "/" ? link.href : `/${link.href}`}
                className="text-sm font-medium text-[#9CA3AF] no-underline transition-colors hover:text-[#F2F3F5]"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3.5">
            {/* Toggle pill */}
            <div className="flex items-center gap-[3px] rounded-full border border-white/10 bg-[#111417] p-1">
              <a
                href="https://admin.miclubpadel.com"
                className="rounded-full bg-[#D6FF3D] px-3.5 py-[7px] text-[13px] font-bold text-[#0A0B0D] no-underline whitespace-nowrap"
              >
                Soy dueño
              </a>
              <button
                onClick={() => setPlayerDialogOpen(true)}
                className="rounded-full px-3.5 py-[7px] text-[13px] font-semibold text-[#9CA3AF] whitespace-nowrap transition-colors hover:text-[#F2F3F5]"
              >
                Soy jugador
              </button>
            </div>

            {session ? (
              <div className="flex items-center gap-2">
                {session.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name ?? ""}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : null}
                <button
                  onClick={() => signOut()}
                  className="rounded-full px-3.5 py-[9px] text-sm font-semibold text-[#E4E5E7] no-underline transition-colors hover:text-[#D6FF3D]"
                >
                  Salir
                </button>
              </div>
            ) : (
              <Link
                href={loginHref}
                className="px-3.5 py-[9px] text-sm font-semibold text-[#E4E5E7] no-underline transition-colors hover:text-[#D6FF3D]"
              >
                Ingresar
              </Link>
            )}
            <a
              href={pathname === "/" ? "#planes" : "/#planes"}
              className="rounded-full bg-[#D6FF3D] px-[18px] py-2.5 text-sm font-bold text-[#0A0B0D] no-underline whitespace-nowrap transition-transform hover:scale-[1.02]"
            >
              Probar gratis
            </a>
          </div>
        </div>

        {/* Mobile hamburger */}
        <button
          ref={triggerRef}
          onClick={toggleNav}
          aria-label="Menú"
          className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-[11px] border border-white/[0.12] bg-[#111417] md:hidden"
        >
          {navOpen ? (
            <X className="h-5 w-5 text-[#F2F3F5]" />
          ) : (
            <Menu className="h-5 w-5 text-[#F2F3F5]" />
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      {navOpen ? (
        <div
          ref={menuRef}
          className="flex flex-col gap-0.5 border-t border-white/[0.07] bg-[rgba(10,11,13,0.97)] px-5 pb-5 pt-3.5 md:hidden"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={pathname === "/" ? link.href : `/${link.href}`}
              onClick={closeNav}
              className="border-b border-white/[0.06] px-1.5 py-[13px] text-base font-semibold text-[#E4E5E7] no-underline"
            >
              {link.label}
            </a>
          ))}

          {/* Toggle pill mobile */}
          <div className="mx-0 my-3.5 flex items-center gap-[3px] rounded-full border border-white/10 bg-[#111417] p-1">
            <a
              href="https://admin.miclubpadel.com"
              className="flex-1 rounded-full bg-[#D6FF3D] py-[9px] text-center text-sm font-bold text-[#0A0B0D] no-underline"
            >
              Soy dueño
            </a>
            <button
              onClick={() => { closeNav(); setPlayerDialogOpen(true); }}
              className="flex-1 rounded-full py-[9px] text-center text-sm font-semibold text-[#9CA3AF]"
            >
              Soy jugador
            </button>
          </div>

          {session ? (
            <button
              onClick={() => {
                signOut();
                closeNav();
              }}
              className="mt-1.5 rounded-full border border-white/[0.14] py-[13px] text-center text-[15px] font-semibold text-[#E4E5E7]"
            >
              Salir
            </button>
          ) : (
            <Link
              href={loginHref}
              onClick={closeNav}
              className="mt-1.5 rounded-full border border-white/[0.14] py-[13px] text-center text-[15px] font-semibold text-[#E4E5E7] no-underline"
            >
              Ingresar
            </Link>
          )}
          <a
            href={pathname === "/" ? "#planes" : "/#planes"}
            onClick={closeNav}
            className="mt-2 rounded-full bg-[#D6FF3D] py-3.5 text-center text-[15px] font-bold text-[#0A0B0D] no-underline"
          >
            Probar gratis
          </a>
        </div>
      ) : null}

      <PlayerAccessDialog open={playerDialogOpen} onOpenChange={setPlayerDialogOpen} />
    </header>
  );
}
