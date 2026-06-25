import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { AlertTriangle, ArrowLeft, Home, Search } from "lucide-react";

import { company } from "@/config/company";
import { Button } from "@/components/ui/button";

interface BrandedStatusPageProps {
  badge?: string;
  code: string;
  title: string;
  description: string;
  detail?: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  extraAction?: ReactNode;
}

export function BrandedStatusPage({
  badge = "Mi Club Padel",
  code,
  title,
  description,
  detail,
  primaryHref = "/",
  primaryLabel = "Volver al inicio",
  secondaryHref = "/clubes",
  secondaryLabel = "Ver clubes",
  extraAction,
}: BrandedStatusPageProps) {
  return (
    <section className="relative flex min-h-screen overflow-hidden bg-[#041411] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.28),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(56,189,248,0.22),_transparent_24%),linear-gradient(135deg,_#02110f_0%,_#05211b_46%,_#031815_100%)]" />
      <div className="absolute left-[-8rem] top-24 h-56 w-56 rounded-full bg-emerald-400/10 blur-3xl" />
      <div className="absolute bottom-0 right-[-6rem] h-72 w-72 rounded-full bg-sky-400/10 blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center gap-10 px-6 py-16 lg:flex-row lg:items-center lg:gap-16 lg:px-10">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#101216]/5 px-4 py-2 text-sm font-medium text-[#D6FF3D]">
            <span className="h-2 w-2 rounded-full bg-emerald-300" />
            {badge}
          </div>

          <div className="mt-6 space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-emerald-200/80">
              Error {code}
            </p>
            <h1 className="max-w-xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
              {title}
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-200">
              {description}
            </p>
            {detail ? (
              <p className="max-w-2xl text-sm leading-7 text-slate-300">
                {detail}
              </p>
            ) : null}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              className="rounded-full bg-emerald-400 px-6 text-sm font-semibold text-emerald-950 hover:bg-emerald-300"
            >
              <Link href={primaryHref}>
                <Home className="mr-2 h-4 w-4" />
                {primaryLabel}
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="rounded-full border-white/15 bg-[#101216]/5 px-6 text-sm font-semibold text-white hover:bg-[#101216]/10 hover:text-white"
            >
              <Link href={secondaryHref}>
                <Search className="mr-2 h-4 w-4" />
                {secondaryLabel}
              </Link>
            </Button>

            {extraAction}
          </div>
        </div>

        <div className="w-full max-w-xl">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#101216]/6 p-6 shadow-2xl shadow-black/30-xl">
            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/70 to-transparent" />

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#101216]/10 ring-1 ring-white/10">
                  <Image
                    src="/mi-padel-club-icon.svg"
                    alt={company.brandName}
                    width={28}
                    height={32}
                    priority
                  />
                </div>
                <div>
                  <p className="text-lg font-semibold text-white">
                    {company.brandName}
                  </p>
                  <p className="text-sm text-[#D6FF3D]/75">
                    Reservas, turnos y operación digital
                  </p>
                </div>
              </div>

              <div className="rounded-full border border-amber-900/60/20 bg-amber-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-amber-100">
                {code}
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/8 bg-black/15 p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-emerald-400/10 p-3 text-emerald-200">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Ruta no disponible
                    </p>
                    <p className="mt-1 text-sm text-slate-300">
                      El enlace puede estar mal escrito o ya no existir.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/8 bg-black/15 p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-sky-400/10 p-3 text-sky-200">
                    <ArrowLeft className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Salida rápida
                    </p>
                    <p className="mt-1 text-sm text-slate-300">
                      Volvé al inicio o entrá al listado de clubes.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-emerald-300/10 bg-emerald-400/8 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#D6FF3D]/70">
                Soporte
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-200">
                Si esperabas ver contenido acá y seguís teniendo problemas,
                escribinos a {company.email}.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
