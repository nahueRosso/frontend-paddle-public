"use client";

import { X, Check } from "lucide-react";

const WITHOUT = [
  "Contestás cada mensaje de WhatsApp a mano",
  "Turnos pisados y cancha doble reservada",
  "Señas que no llegan y plantones",
  "Torneos armados en planillas de Excel",
  "Cierre de caja sumando papelitos",
];

const WITH = [
  "El bot de WhatsApp contesta y reserva solo",
  "Agenda en tiempo real, imposible pisar un turno",
  "Seña cobrada por Mercado Pago antes de jugar",
  "Torneos con fixture y resultados automáticos",
  "Libro diario con la caja cerrada sola",
];

export function AntesDepuesSection() {
  return (
    <section className="border-t border-white/[0.05] py-24">
      <div className="mx-auto max-w-[1180px] px-6">
        <h2 className="text-center font-heading text-3xl font-bold text-[#F2F3F5] sm:text-4xl">
          El antes y el después de tu operación
        </h2>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {/* Sin sistema */}
          <div className="rounded-2xl border border-rose-500/20 bg-rose-950/10 p-6">
            <h3 className="mb-6 text-lg font-semibold text-rose-400">Sin sistema</h3>
            <ul className="space-y-4">
              {WITHOUT.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-rose-500/15">
                    <X className="h-3.5 w-3.5 text-rose-400" />
                  </span>
                  <span className="text-sm text-[#9CA3AF]">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Con Mi Club Padel */}
          <div className="rounded-2xl border border-[#D6FF3D]/20 bg-[#D6FF3D]/[0.03] p-6">
            <h3 className="mb-6 text-lg font-semibold text-[#D6FF3D]">Con Mi Club Padel</h3>
            <ul className="space-y-4">
              {WITH.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#D6FF3D]/15">
                    <Check className="h-3.5 w-3.5 text-[#D6FF3D]" />
                  </span>
                  <span className="text-sm text-[#E4E5E7]">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
