"use client";

import {
  Trophy,
  CalendarDays,
  CreditCard,
  BookOpen,
  GraduationCap,
  Swords,
} from "lucide-react";

const FEATURES = [
  {
    icon: Trophy,
    title: "Torneos automáticos",
    description:
      "Inscripciones, parejas, zonas, playoffs y resultados. Generá el fixture y el cuadro solo, sin planillas.",
  },
  {
    icon: CalendarDays,
    title: "Canchas & horarios",
    description:
      "Agenda en tiempo real, turnos fijos, bloqueos y precios por franja. Cero cruces, cero doble reserva.",
  },
  {
    icon: CreditCard,
    title: "Cobros con Mercado Pago",
    description:
      "Señas, saldos e inscripciones cobradas online. La plata entra a tu cuenta y queda registrada sola.",
  },
  {
    icon: BookOpen,
    title: "Libro diario",
    description:
      "Ingresos, egresos y cierre de caja al día, sin Excel. Mirá las ganancias del club cuando quieras.",
  },
  {
    icon: GraduationCap,
    title: "Clases & profes",
    description:
      "Agenda de clases, cupos y profesores. Tus alumnos reservan y pagan igual que un turno.",
  },
  {
    icon: Swords,
    title: "Ranking & matches",
    description:
      "Los jugadores arman partidos por nivel, suman puntos y vuelven al club. Más comunidad, más cancha ocupada.",
  },
];

export function FeaturesSection() {
  return (
    <section id="gestion" className="scroll-mt-20 border-t border-white/[0.05] py-24">
      <div className="mx-auto max-w-[1180px] px-6">
        <div className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#D6FF3D]">
          Para el admin
        </div>
        <h2 className="font-heading text-3xl font-bold text-[#F2F3F5] sm:text-4xl">
          Todo el club, en un solo panel.
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-[#9CA3AF]">
          Dejá las planillas y los grupos de WhatsApp. Gestioná la operación completa desde un
          lugar, automatizada de punta a punta.
        </p>

        <div className="mt-14 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-white/[0.07] bg-[#101216] p-4 transition-colors hover:border-[#D6FF3D]/20 sm:p-6"
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[#D6FF3D]/10 transition-colors group-hover:bg-[#D6FF3D]/20 sm:mb-4 sm:h-11 sm:w-11">
                <f.icon className="h-4 w-4 text-[#D6FF3D] sm:h-5 sm:w-5" />
              </div>
              <h3 className="text-sm font-semibold text-[#F2F3F5] sm:text-lg">{f.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-[#6B7280] sm:text-sm">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
