"use client";

import { MessageCircle, CheckCircle2 } from "lucide-react";

const STEPS = [
  {
    num: "1",
    title: "El jugador escribe por WhatsApp",
    description: 'En lenguaje natural: "quiero cancha mañana a la tarde".',
  },
  {
    num: "2",
    title: "La IA ofrece horarios reales",
    description: "Lee tu agenda en vivo. Nunca ofrece una cancha ocupada.",
  },
  {
    num: "3",
    title: "Cobra la seña por Mercado Pago",
    description: "Link de pago automático. Sin seña, no hay turno: se acabaron los plantones.",
  },
  {
    num: "4",
    title: "Confirma y bloquea la cancha",
    description: "El turno aparece solo en tu panel y en la caja del día.",
  },
];

export function WhatsAppSpotlightSection() {
  return (
    <section id="whatsapp" className="scroll-mt-20 border-t border-white/[0.05] py-24">
      <div className="mx-auto max-w-[1180px] px-6">
        <div className="grid items-start gap-14 lg:grid-cols-2">
          {/* Left: badge + title + steps */}
          <div>
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#D6FF3D]/20 bg-[#D6FF3D]/5 px-4 py-2">
              <MessageCircle className="h-4 w-4 text-[#D6FF3D]" />
              <span className="text-sm font-medium text-[#D6FF3D]">El diferenciador</span>
            </div>

            <h2 className="font-heading text-3xl font-bold leading-tight text-[#F2F3F5] sm:text-4xl">
              El bot que atiende, reserva y cobra por vos.
            </h2>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-[#9CA3AF]">
              No es un menú con botones. Es una IA que entiende lo que pide el jugador, encuentra el
              horario libre, cobra la seña por Mercado Pago y deja la cancha bloqueada en tu agenda. De
              punta a punta.
            </p>

            {/* Steps - vertical list */}
            <div className="mt-10 space-y-6">
              {STEPS.map((step) => (
                <div key={step.num} className="flex items-start gap-4">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#D6FF3D] text-sm font-bold text-[#0A0B0D]">
                    {step.num}
                  </span>
                  <div>
                    <h3 className="text-base font-semibold text-[#F2F3F5]">{step.title}</h3>
                    <p className="mt-1 text-sm text-[#6B7280]">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Chat mock */}
          <div className="rounded-3xl border border-white/[0.07] bg-[#111417] p-1 shadow-2xl shadow-black/40 lg:mt-8">
            {/* Chat header */}
            <div className="flex items-center gap-3 rounded-t-2xl bg-[#1A1D21] px-5 py-3.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#128C7E]">
                <MessageCircle className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-[#F2F3F5]">Asistente · Mi Club Padel</div>
                <div className="text-xs text-[#34D399]">responde en segundos</div>
              </div>
            </div>

            {/* Chat messages */}
            <div className="flex flex-col gap-3 px-4 py-5">
              {/* User message */}
              <div className="max-w-[80%] self-end">
                <div className="rounded-2xl bg-[#D6FF3D]/15 px-4 py-2.5 text-[13px] leading-relaxed text-[#D6FF3D]">
                  Buenas, somos 4. Hay para jugar el sábado?
                </div>
              </div>

              {/* Bot message - horarios */}
              <div className="max-w-[80%] self-start">
                <div className="rounded-2xl bg-[#1A1D21] px-4 py-3 text-[13px] leading-relaxed text-[#E4E5E7]">
                  ¡Hola! El sábado tengo:
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      <span><strong className="text-[#F2F3F5]">16:00</strong> Cancha 3</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      <span><strong className="text-[#F2F3F5]">17:30</strong> Cancha 1</span>
                    </div>
                  </div>
                  <div className="mt-2 text-[#9CA3AF]">¿Cuál te reservo?</div>
                </div>
              </div>

              {/* User reply */}
              <div className="max-w-[60%] self-end">
                <div className="rounded-2xl bg-[#D6FF3D]/15 px-4 py-2.5 text-[13px] text-[#D6FF3D]">
                  16hs&nbsp;👊
                </div>
              </div>

              {/* Payment card */}
              <div className="max-w-[85%] self-start">
                <div className="rounded-2xl border border-white/10 bg-[#1A1D21] p-4">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
                    Confirmá con la seña
                  </div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-[#F2F3F5]">$4.500</span>
                    <span className="text-xs text-[#6B7280]">Sáb · 16:00 · Cancha 3</span>
                  </div>
                  <div className="mt-3 rounded-lg bg-[#00B1EA] py-2.5 text-center text-xs font-bold text-white">
                    Pagar con Mercado Pago
                  </div>
                </div>
              </div>

              {/* Confirmation */}
              <div className="max-w-[85%] self-start">
                <div className="flex items-start gap-2 rounded-2xl bg-[#1A1D21] px-4 py-2.5 text-[13px] leading-relaxed text-[#E4E5E7]">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
                  <span>Confirmado 🗓 Sábado 16:00, Cancha 3. ¡A jugar!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
