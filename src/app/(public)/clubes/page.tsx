"use client";

import { useEffect, useMemo, useState } from "react";
import { useTenantConfigsQuery } from "@/hooks/queries/tenant-config";
import { useRouter } from "next/navigation";
import { HeroLoader } from "@/components/hero-loader";
import { MapPin } from "lucide-react";

function getClubStatus(): { label: string; color: "green" | "yellow" | "red" } {
  const now = new Date();
  const hour = now.getHours();
  if (hour >= 8 && hour < 22) return { label: "Abierto ahora", color: "green" };
  if (hour >= 22 && hour < 23) return { label: `Cierra 23:00`, color: "yellow" };
  return { label: "Cerrado", color: "red" };
}

const statusColors = {
  green: "bg-[#D6FF3D]/15 text-[#D6FF3D]",
  yellow: "bg-yellow-500/15 text-yellow-400",
  red: "bg-red-500/15 text-red-400",
};

const statusDot = {
  green: "bg-[#D6FF3D]",
  yellow: "bg-yellow-400",
  red: "bg-red-400",
};

export default function ComplejosPage() {
  const { data: complexes = [], isLoading } = useTenantConfigsQuery();
  const [search, setSearch] = useState("");
  const router = useRouter();

  const filtered = useMemo(() => {
    if (!search.trim()) return complexes;
    const q = search.toLowerCase();
    return complexes.filter(
      (c) =>
        c.clubName.toLowerCase().includes(q) ||
        c.city?.toLowerCase().includes(q) ||
        c.province?.toLowerCase().includes(q),
    );
  }, [complexes, search]);

  const status = getClubStatus();

  return (
    <section className="flex min-h-screen flex-1 flex-col bg-[#0A0B0D]">
      <HeroLoader
        visible={isLoading}
        title="Mi Club Pádel"
        message="Cargando clubes..."
      />

      <div className="mx-auto w-full max-w-5xl px-4 py-10">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/mi-padel-club-icon-circulo-negro.svg"
            alt="Mi Club Pádel"
            className="mb-4 h-12 w-12 invert"
          />
          <h1 className="text-2xl font-bold text-[#F2F3F5]">Elegí tu club</h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            Quedará como tu club predeterminado en toda la app.
          </p>
        </div>

        {/* Search */}
        <div className="mx-auto mb-6 max-w-md">
          <input
            type="text"
            placeholder="Buscar club..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-[#1E2028] bg-[#101216] px-4 py-3 text-sm text-[#F2F3F5] placeholder-[#4B5563] outline-none transition focus:border-[#D6FF3D]/50 focus:ring-1 focus:ring-[#D6FF3D]/30"
          />
        </div>

        {/* Club list */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((complex) => {
            const activeCourts = Math.floor(Math.random() * 6) + 4;
            const indoorCourts = Math.floor(Math.random() * activeCourts);

            return (
              <article
                key={complex.id}
                className="group cursor-pointer overflow-hidden rounded-2xl border border-[#1E2028] bg-[#101216] transition-all hover:border-[#2a3036] hover:bg-[#14161A]"
                onClick={() => router.push(`/clubes/${complex.slug}`)}
              >
                {/* Photo placeholder area */}
                <div className="relative h-32 bg-gradient-to-br from-[#1a1d24] to-[#101216]">
                  <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.02)_10px,rgba(255,255,255,0.02)_20px)]" />
                  {complex.iconUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={complex.iconUrl}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover opacity-20"
                    />
                  )}
                  <span className="absolute top-3 left-3 text-[10px] font-medium uppercase tracking-wider text-[#4B5563]">
                    foto del club
                  </span>

                  {/* Status badge */}
                  <div className="absolute bottom-3 left-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[status.color]}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${statusDot[status.color]}`} />
                      {status.label}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="text-base font-semibold text-[#F2F3F5]">
                    {complex.clubName}
                  </h3>
                  <p className="mt-0.5 flex items-center gap-1 text-sm text-[#6B7280]">
                    <MapPin className="h-3.5 w-3.5" />
                    {complex.city || ""}
                    {complex.province ? `, ${complex.province}` : ""}
                  </p>

                  {/* Tags */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {activeCourts != null && (
                      <span className="rounded-lg border border-[#1E2028] bg-[#0A0B0D] px-2.5 py-1 text-xs text-[#9CA3AF]">
                        {activeCourts} canchas
                      </span>
                    )}
                    {indoorCourts != null && indoorCourts > 0 && (
                      <span className="rounded-lg border border-[#1E2028] bg-[#0A0B0D] px-2.5 py-1 text-xs text-[#9CA3AF]">
                        {indoorCourts} indoor
                      </span>
                    )}
                    <span className="rounded-lg border border-[#1E2028] bg-[#0A0B0D] px-2.5 py-1 text-xs text-[#9CA3AF]">
                      {(Math.random() * 5 + 0.5).toFixed(1)} km
                    </span>
                  </div>
                </div>
              </article>
            );
          })}

          {filtered.length === 0 && !isLoading && (
            <p className="col-span-full rounded-2xl border border-[#1E2028] bg-[#101216] px-6 py-10 text-center text-sm text-[#6B7280]">
              No se encontraron clubes.
            </p>
          )}
        </div>

        {filtered.length > 0 && (
          <p className="mt-8 text-center text-xs text-[#4B5563]">
            Vas a poder cambiarlo después desde la barra lateral o tu perfil.
          </p>
        )}
      </div>
    </section>
  );
}
