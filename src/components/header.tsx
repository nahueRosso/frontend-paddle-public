"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { Baloo_2 } from "next/font/google";
import { ChevronDown, Menu, X } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/use-auth";

const balooFont = Baloo_2({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

type SingleNavItem = {
  href: string;
  label: string;
};

type GroupNavItem = {
  label: string;
  items: SingleNavItem[];
};

const navigation: Array<SingleNavItem | GroupNavItem> = [
  { href: "/", label: "Inicio" },
  { href: "/planes", label: "Planes" },
  { href: "/contacto", label: "Contacto" },
  {
    label: "Seguridad",
    items: [
      { href: "/privacidad", label: "Privacidad" },
      { href: "/terminos", label: "Términos" },
      { href: "/como-eliminar-datos", label: "Eliminar datos" },
    ],
  },
];

export function Header() {
  const { signOut, session } = useAuth();
  const userEmail = session?.user?.email ?? "Sin email";
  const userImage = session?.user?.image;
  const userName = session?.user?.name ?? "Usuario";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {}
  );
  const menuRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((value) => !value);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
    setExpandedGroups({});
  }, []);

  const toggleGroup = useCallback((label: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  }, []);

  useEffect(() => {
    if (!isMenuOpen) {
      return undefined;
    }

    function handleOutside(event: MouseEvent) {
      const target = event.target as Node | null;
      const menuEl = menuRef.current;
      const triggerEl = triggerRef.current;

      if (
        target &&
        menuEl &&
        !menuEl.contains(target) &&
        triggerEl &&
        !triggerEl.contains(target)
      ) {
        closeMenu();
      }
    }

    function handleScroll() {
      closeMenu();
    }

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("scroll", handleScroll);
    };
  }, [isMenuOpen, closeMenu]);

  const navItems = useMemo(() => navigation, []);

  return (
    <header className="fixed z-[100] w-full border-b border-slate-200/70 bg-white/55 backdrop-blur dark:border-emerald-400/10 dark:bg-slate-950/30">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 md:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-slate-900 transition hover:text-slate-700/80 dark:text-slate-100 dark:hover:text-slate-300"
          aria-label="Ir al inicio de Mi Club Pádel"
          onClick={closeMenu}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white dark:bg-emerald-500/15 dark:text-emerald-200">
            <Image
              src="/mi-padel-club-icon.svg"
              alt="Mi Club Pádel Logo"
              width={15}
              height={18}
              className="rounded-full"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span
              className={`text-base font-semibold tracking-tight ${balooFont.className}`}
            >
              Mi Club Pádel
            </span>
            <span className="text-sm text-slate-900 dark:text-slate-300">
              Gestión & WhatsApp Business
            </span>
          </div>
        </Link>

        <nav
          aria-label="Navegación principal"
          className="hidden flex-1 lg:block"
        >
          <ul className="flex flex-wrap items-center justify-end gap-2 text-sm font-medium text-slate-700 dark:text-slate-100">
            {navItems.map((item) => (
              <li key={"href" in item ? item.href : item.label}>
                {"items" in item ? (
                  <div className="group relative">
                    <button
                      type="button"
                      aria-haspopup="true"
                      className="flex items-center gap-1 rounded-full px-3 py-2 text-slate-700 transition hover:bg-slate-100/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:text-slate-100 dark:hover:bg-slate-800/70 dark:hover:text-white dark:focus-visible:ring-slate-600 dark:focus-visible:ring-offset-slate-950"
                    >
                      {item.label}
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    <div className="pointer-events-none invisible absolute right-0 top-full z-20 w-48 translate-y-2 rounded-xl border border-slate-200 bg-white/85 p-2 text-sm shadow-lg opacity-0 ring-1 ring-slate-900/5 transition-all duration-150 group-hover:pointer-events-auto group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 dark:border-slate-800 dark:bg-slate-950/95 dark:ring-white/5">
                      {item.items.map((subItem) => (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className="block rounded-lg px-3 py-2 text-left text-slate-700 transition hover:bg-slate-100/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:text-slate-200 dark:hover:bg-slate-800/80 dark:focus-visible:ring-slate-600 dark:focus-visible:ring-offset-slate-950"
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className="rounded-full px-3 py-2 text-slate-700 transition hover:bg-slate-100/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:text-slate-100 dark:hover:bg-slate-800/70 dark:hover:text-white dark:focus-visible:ring-slate-600 dark:focus-visible:ring-offset-slate-950"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}

            <li>
              <Link
                href="/clubes"
                className="rounded-full border border-emerald-400 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 dark:border-emerald-500/60 dark:text-emerald-300 dark:hover:bg-emerald-500/10 dark:focus-visible:ring-offset-slate-950"
              >
                Canchas
              </Link>
            </li>
            <li>
              <ThemeToggle />
            </li>

            <li>
              {session?.user ? (
                <div className="group relative">
                  <button
                    type="button"
                    aria-haspopup="true"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/70 text-sm font-semibold text-slate-900 transition hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:border-slate-600 dark:focus-visible:ring-slate-600 dark:focus-visible:ring-offset-slate-950"
                  >
                    {userImage ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={userImage}
                        alt={userName}
                        className="h-full w-full rounded-full object-cover"
                      />
                      </>
                    ) : (
                      <span className="text-xs uppercase">
                        {userName.slice(0, 2)}
                      </span>
                    )}
                  </button>
                  <div className="pointer-events-none invisible absolute right-0 top-full z-30 w-60 translate-y-2 rounded-2xl border border-slate-200 bg-white/90 p-4 text-sm shadow-xl ring-1 ring-slate-900/5 opacity-0 transition-all duration-150 group-hover:pointer-events-auto group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 dark:border-slate-800 dark:bg-slate-950/95 dark:ring-white/5">
                    <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      {userName}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{userEmail}</p>
                    <div className="mt-4 flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          void signOut();
                        }}
                        className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-900 transition hover:bg-slate-50/50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
                      >
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="rounded-full border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800/70 dark:focus-visible:ring-slate-600 dark:focus-visible:ring-offset-slate-950"
                >
                  Iniciar sesión
                </Link>
              )}
            </li>
          </ul>
        </nav>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/85 text-slate-900 shadow-[0_10px_24px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:bg-white dark:border-slate-700/80 dark:bg-slate-900/90 dark:text-slate-100 dark:hover:bg-slate-800 lg:hidden"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
          onClick={toggleMenu}
          ref={triggerRef}
        >
          {isMenuOpen ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>

      {isMenuOpen ? (
        <div
          ref={menuRef}
          id="mobile-menu"
          className="border-t border-slate-200/70 bg-white/82 shadow-[0_24px_60px_rgba(15,23,42,0.14)] backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/92 lg:hidden"
        >
          <nav className="mx-auto max-w-5xl px-4 py-5 text-sm font-medium text-slate-800 dark:text-slate-200">
            <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/72 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.08)] dark:border-slate-800/80 dark:bg-slate-900/72">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-300">
                    Navegación
                  </p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    Elegí una sección y seguí explorando la plataforma.
                  </p>
                </div>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <Menu className="h-5 w-5" />
                </div>
              </div>

              <ul className="mt-5 space-y-3">
              {navItems.map((item) => {
                if ("items" in item) {
                  const isGroupOpen = Boolean(expandedGroups[item.label]);
                  return (
                    <li key={item.label} className="space-y-3">
                      <button
                        type="button"
                        className="flex w-full items-center justify-between rounded-2xl border border-slate-200/90 bg-white/80 px-4 py-3 text-left text-slate-900 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-100 dark:hover:bg-slate-900"
                        onClick={() => toggleGroup(item.label)}
                        aria-expanded={isGroupOpen}
                      >
                        <span className="text-sm font-semibold">
                          {item.label}
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${
                            isGroupOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {isGroupOpen ? (
                        <ul className="space-y-2 pl-4">
                          {item.items.map((subItem) => (
                            <li key={subItem.href}>
                              <Link
                                href={subItem.href}
                                className="block rounded-xl bg-white/75 px-3 py-3 text-slate-700 shadow-sm transition hover:bg-slate-100/70 dark:bg-slate-950/70 dark:text-slate-200 dark:hover:bg-slate-900"
                                onClick={closeMenu}
                              >
                                {subItem.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </li>
                  );
                }

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="block rounded-2xl border border-slate-200/90 bg-white/80 px-4 py-3 text-slate-900 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-100 dark:hover:bg-slate-900"
                      onClick={closeMenu}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
              </ul>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <Link
                  href="/clubes"
                  className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
                  onClick={closeMenu}
                >
                  Canchas
                </Link>
                <div className="flex items-center justify-center rounded-2xl border border-slate-200/90 bg-white/80 dark:border-slate-800 dark:bg-slate-950/70">
                  <ThemeToggle className="h-11 w-full rounded-2xl border-0 bg-transparent shadow-none hover:bg-transparent dark:bg-transparent dark:hover:bg-transparent" />
                </div>
              </div>

              <div className="mt-5 rounded-[1.5rem] border border-slate-200/80 bg-slate-50/75 p-4 dark:border-slate-800 dark:bg-slate-950/55">
                {session?.user ? (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
                        {userImage ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={userImage}
                              alt={userName}
                              className="h-full w-full object-cover"
                            />
                          </>
                        ) : (
                          <span className="text-xs font-semibold uppercase text-slate-900 dark:text-slate-100">
                            {userName.slice(0, 2)}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {userName}
                        </p>
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                          {userEmail}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        closeMenu();
                        void signOut();
                      }}
                      className="mt-4 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                    >
                      Cerrar sesión
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="block rounded-2xl border border-slate-300 bg-white px-4 py-3 text-center text-sm font-medium text-slate-900 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                    onClick={closeMenu}
                  >
                    Iniciar sesión
                  </Link>
                )}
              </div>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
