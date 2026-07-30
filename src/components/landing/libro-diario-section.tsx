"use client";

import { CheckCircle2 } from "lucide-react";

const ENTRIES = [
  { label: "Seña · Cancha 1 (WhatsApp)", amount: "+ $4.500", type: "income" as const },
  { label: "Inscripción torneo · 4 parejas", amount: "+ $36.000", type: "income" as const },
  { label: "Mantenimiento red Cancha 2", amount: "− $8.000", type: "expense" as const },
];

const BARS = [0.35, 0.5, 0.65, 0.85, 1, 0.7, 0.45];

export function LibroDiarioSection() {
  return (
    <section className="border-t border-white/[0.05] py-24">
      <div className="mx-auto max-w-[1180px] px-6">
        <div className="overflow-hidden rounded-3xl border border-white/[0.07] bg-[#101216]">
          <div className="grid items-center gap-10 p-8 sm:p-10 lg:grid-cols-2 lg:gap-14">
            {/* Copy */}
            <div>
              <div className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#D6FF3D]">
                Libro diario
              </div>
              <h2 className="font-heading text-3xl font-bold text-[#F2F3F5] sm:text-4xl">
                Mirá la caja sin abrir una planilla.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-[#9CA3AF]">
                Cada turno, seña, clase e inscripción queda registrada sola. Ingresos, egresos y
                ganancia del club, al día y en tiempo real. Sabés cuánto facturaste hoy sin sumar nada
                a mano.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Cierre de caja automático por día",
                  "Ingresos por canchas, torneos y clases",
                  "Egresos y gastos cargados a mano cuando hace falta",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-[#E4E5E7]">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Dashboard mock - hidden on phone, visible from sm: up */}
            <div className="hidden rounded-2xl border border-white/[0.07] bg-[#0A0B0D] sm:block">
              {/* Title bar */}
              <div className="flex items-center gap-2 border-b border-white/[0.07] px-5 py-3">
                <div className="flex gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-white/10" />
                  <span className="h-2 w-2 rounded-full bg-white/10" />
                  <span className="h-2 w-2 rounded-full bg-white/10" />
                </div>
                <span className="text-xs text-[#6B7280]">admin.miclubpadel.com · Libro diario</span>
              </div>

              <div className="p-5">
                {/* Top summary */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs text-[#6B7280]">Ingresos de hoy</div>
                    <div className="mt-1 text-3xl font-bold text-[#F2F3F5]">$184.500</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-emerald-400">▲ 12% vs ayer</div>
                    <div className="mt-0.5 text-xs text-[#6B7280]">Cierre 22:00</div>
                  </div>
                </div>

                {/* Bar chart */}
                <div className="mt-5 flex items-end gap-2">
                  {BARS.map((h, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-sm ${i === 4 ? "bg-[#D6FF3D]" : "bg-white/[0.06]"}`}
                      style={{ height: `${h * 56}px` }}
                    />
                  ))}
                </div>

                {/* Entries */}
                <div className="mt-5 space-y-0 divide-y divide-white/[0.05]">
                  {ENTRIES.map((entry) => (
                    <div
                      key={entry.label}
                      className="flex items-center justify-between py-3"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            entry.type === "income" ? "bg-emerald-400" : "bg-rose-400"
                          }`}
                        />
                        <span className="text-sm text-[#9CA3AF]">{entry.label}</span>
                      </div>
                      <span
                        className={`text-sm font-semibold ${
                          entry.type === "income" ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {entry.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
