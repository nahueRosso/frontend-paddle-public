"use client";

import { useEffect, useMemo, useState } from "react";
import { useTenantConfigsQuery } from "@/hooks/queries/tenant-config";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// export const metadata: Metadata = {
//   title: `Complejos | ${company.brandName}`,
//   description:
//     "Buscá clubes de pádel que usan Mi Club Pádel y reservá fácilmente.",
// };

export default function ComplejosPage() {
  const { data: complexes = [] } = useTenantConfigsQuery();
  const [filters, setFilters] = useState({
    province: "",
    hasWebBooking: false,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;
  const router = useRouter();

  const availableProvinces = useMemo(() => {
    return Array.from(
      new Set(
        complexes
          .map((complex) => complex.province?.trim())
          .filter((province): province is string => Boolean(province)),
      ),
    ).sort((a, b) => a.localeCompare(b, "es"));
  }, [complexes]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const filtered = complexes.filter((c) => {
    const matchProvince = !filters.province || c.province === filters.province;
    const matchWeb = !filters.hasWebBooking || c.hasWebBooking === true;
    return matchProvince && matchWeb;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = filtered.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );
  return (
    <section className="flex h-[100vh] flex-1 flex-col bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_transparent_34%),linear-gradient(180deg,_#f8fafc_0%,_#ecfdf5_48%,_#f8fafc_100%)] dark:bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.2),_transparent_26%),linear-gradient(180deg,_#020617_0%,_#052e2b_38%,_#020617_100%)]">
      <div className="mx-auto mt-10 grid w-full max-w-5xl flex-1 gap-12 px-4 py-16 text-[#4B5563] dark:text-slate-300 sm:px-6 md:grid-cols-[minmax(0,1fr)_320px]">
        {/* === LISTADO === */}
        <div className="space-y-8">
          <header className="space-y-4 rounded-[2rem] border border-emerald-100 bg-white/75 p-6 shadow-lg shadow-emerald-100/60 backdrop-blur dark:border-emerald-900/60 dark:bg-slate-900/80 dark:shadow-emerald-950/30">
            <span className="inline-flex rounded-full bg-emerald-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700 dark:bg-emerald-500/12 dark:text-emerald-300">
              Clubes adheridos
            </span>
            <h1 className="text-3xl font-semibold tracking-tight text-[#111827] md:text-4xl dark:text-slate-100">
              Complejos
            </h1>
            <p className="text-sm text-[#6B7280] dark:text-slate-400">
              Encontrá clubes que utilizan Mi Club Pádel para sus reservas.
            </p>
          </header>

          {/* Resultados */}
          <div className="grid gap-4 sm:grid-cols-2">
            {paginatedItems.map((complex) => (
              <article
                key={complex.id}
                className="cursor-pointer rounded-[1.5rem] border border-emerald-100 bg-white/80 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-emerald-900/70 dark:bg-slate-900/80 dark:shadow-emerald-950/30"
                onClick={() => router.push(`/clubes/${complex.slug}`)}
              >
                <div className="flex min-h-[7rem] items-center justify-center rounded-2xl bg-slate-50/80 px-4 dark:bg-slate-950/70">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={complex.iconUrl || "/canon.webp"}
                    alt={complex.clubName}
                    className="mx-auto block max-h-16 w-auto rounded-lg object-contain"
                  />
                </div>
                <ul className="mt-4 space-y-1 text-sm">
                  <li className="font-medium text-slate-900 dark:text-slate-100">
                    {complex.clubName}
                  </li>
                  <li className="text-slate-500 dark:text-slate-400">
                    {complex.city ? complex.city : ""}
                    {complex.province ? ", " + complex.province : ""}
                  </li>
                </ul>
              </article>
            ))}

            {paginatedItems.length === 0 && (
              <p className="col-span-full rounded-[1.5rem] border border-emerald-100 bg-white/70 px-6 py-10 text-center text-sm text-slate-500 dark:border-emerald-900/60 dark:bg-slate-900/70 dark:text-slate-400">
                No se encontraron complejos con esos filtros.
              </p>
            )}
          </div>

          {/* === PAGINACIÓN === */}
          {totalPages > 1 && (
            <nav
              className="flex items-center justify-center gap-2 pt-2"
              aria-label="Paginación"
            >
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-[#111827] transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:bg-emerald-500/10"
                aria-label="Página anterior"
              >
                ← Anterior
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`h-9 w-9 rounded-xl text-sm font-medium transition ${
                        currentPage === page
                          ? "bg-emerald-600 text-white shadow-sm dark:bg-emerald-500 dark:text-slate-950"
                          : "border border-slate-200 text-[#111827] hover:bg-emerald-50 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:bg-emerald-500/10"
                      }`}
                      aria-label={`Ir a página ${page}`}
                      aria-current={currentPage === page ? "page" : undefined}
                    >
                      {page}
                    </button>
                  ),
                )}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-[#111827] transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:bg-emerald-500/10"
                aria-label="Página siguiente"
              >
                Siguiente →
              </button>
            </nav>
          )}

          {/* Info de resultados */}
          {filtered.length > 0 && (
            <p className="text-center text-xs text-[#9CA3AF] dark:text-slate-500">
              Mostrando {startIndex + 1}–
              {Math.min(startIndex + ITEMS_PER_PAGE, filtered.length)} de{" "}
              {filtered.length} complejos
            </p>
          )}
        </div>

        {/* === FILTROS === */}
        <aside className="h-fit space-y-6 rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-lg shadow-emerald-50 backdrop-blur-sm md:p-8 dark:border-emerald-900/70 dark:bg-slate-900/80 dark:shadow-emerald-950/30">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
            Filtros
          </h2>

          {/* Provincia */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#111827] dark:text-slate-100">
              Provincia
            </label>

            <Select
              value={filters.province || "all"}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  province: value === "all" ? "" : value,
                }))
              }
            >
              <SelectTrigger className="w-full rounded-xl border border-slate-300 bg-white text-sm text-[#111827] shadow-sm focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>

              <SelectContent className="dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100">
                <SelectItem value="all">Todas</SelectItem>

                {availableProvinces.map((prov) => (
                  <SelectItem key={prov} value={prov}>
                    {prov}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Opciones booleanas */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm dark:text-slate-300">
              <input
                type="checkbox"
                checked={filters.hasWebBooking}
                onChange={(e) =>
                  setFilters((p) => ({
                    ...p,
                    hasWebBooking: e.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-slate-300 bg-white text-emerald-600 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-emerald-400"
              />
              Solo con reservas web
            </label>
          </div>

          <button
            onClick={() =>
              setFilters({
                province: "",
                hasWebBooking: false,
              })
            }
            className="w-full rounded-xl border border-emerald-400 px-3 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50 dark:border-emerald-500/60 dark:text-emerald-300 dark:hover:bg-emerald-500/10"
          >
            Limpiar filtros
          </button>
        </aside>
      </div>
    </section>
  );
}
