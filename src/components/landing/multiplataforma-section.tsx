"use client";

import { Monitor, Smartphone, MessageCircle } from "lucide-react";
import type { ReactNode } from "react";

type Channel = {
  icon: typeof Monitor;
  title: string;
  badge?: string;
  description: ReactNode;
  mockContent: ReactNode;
};

const CHANNELS: Channel[] = [
  {
    icon: Monitor,
    title: "Web del admin",
    description: (
      <>
        Tu centro de control: canchas, torneos, cobros y caja.{" "}
        <a
          href="https://admin.miclubpadel.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#6B7280] no-underline hover:text-[#D6FF3D]"
        >
          admin.miclubpadel.com
        </a>
      </>
    ),
    mockContent: (
      <div className="p-3">
        {/* Browser dots */}
        <div className="mb-3 flex gap-1.5">
          <span className="h-2 w-2 rounded-full bg-white/10" />
          <span className="h-2 w-2 rounded-full bg-white/10" />
          <span className="h-2 w-2 rounded-full bg-white/10" />
        </div>
        {/* Admin dashboard mock */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-6 w-8 rounded bg-white/[0.06]" />
            <div className="h-6 w-16 rounded bg-[#D6FF3D]/20" />
            <div className="h-6 w-14 rounded bg-white/[0.06]" />
            <div className="h-6 w-14 rounded bg-white/[0.06]" />
          </div>
          <div className="flex gap-2">
            <div className="h-12 flex-1 rounded-lg bg-white/[0.04]" />
            <div className="h-12 flex-1 rounded-lg bg-white/[0.04]" />
            <div className="h-12 w-14 rounded-lg bg-[#D6FF3D]/15" />
            <div className="h-12 flex-1 rounded-lg bg-white/[0.04]" />
            <div className="h-12 flex-1 rounded-lg bg-white/[0.04]" />
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: Smartphone,
    title: "App del jugador",
    description: (
      <>
        Reserva, busca pareja y se anota a torneos. App mobile o{" "}
        <a
          href="https://app.miclubpadel.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#6B7280] no-underline hover:text-[#D6FF3D]"
        >
          app.miclubpadel.com
        </a>
      </>
    ),
    mockContent: (
      <div className="flex flex-col items-center p-4">
        {/* Court selector mock */}
        <div className="w-full max-w-[180px] rounded-xl border border-white/[0.07] bg-[#0A0B0D] p-3">
          <div className="mb-2 text-center text-[10px] font-medium text-[#9CA3AF]">Cancha 1 · Hoy</div>
          <div className="grid grid-cols-3 gap-1.5">
            <div className="rounded-md bg-white/[0.06] px-1 py-1.5 text-center text-[10px] text-[#6B7280]">17:00</div>
            <div className="rounded-md bg-[#D6FF3D] px-1 py-1.5 text-center text-[10px] font-bold text-[#0A0B0D]">18:00</div>
            <div className="rounded-md bg-white/[0.06] px-1 py-1.5 text-center text-[10px] text-[#6B7280]">18:00</div>
            <div className="rounded-md bg-white/[0.06] px-1 py-1.5 text-center text-[10px] text-[#6B7280]">20:00</div>
          </div>
          <div className="mt-2 rounded-lg bg-[#D6FF3D] py-1.5 text-center text-[10px] font-bold text-[#0A0B0D]">
            Reservar 18:00
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: MessageCircle,
    title: "WhatsApp con IA",
    badge: "ESTRELLA",
    description: (
      <>
        El canal que ya usan tus socios. Reserva, cobra la seña y confirma sin que muevas un dedo.
      </>
    ),
    mockContent: (
      <div className="space-y-2 p-3">
        {/* Chat bubbles */}
        <div className="ml-auto w-fit max-w-[75%] rounded-xl bg-[#D6FF3D]/15 px-3 py-1.5 text-[10px] font-medium text-[#D6FF3D]">
          Hay cancha hoy?
        </div>
        <div className="w-fit max-w-[80%] rounded-xl bg-white/[0.06] px-3 py-1.5 text-[10px] text-[#E4E5E7]">
          Sí 🎾 18:00 o 20:00
        </div>
        <div className="w-fit max-w-[80%] rounded-xl bg-white/[0.06] px-3 py-1.5 text-[10px] font-medium text-[#D6FF3D]">
          Seña $4.500 → Mercado Pago
        </div>
      </div>
    ),
  },
];

export function MultiplataformaSection() {
  return (
    <section id="plataforma" className="scroll-mt-20 py-24">
      <div className="mx-auto max-w-[1180px] px-6">
        <div className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#D6FF3D]">
          Multiplataforma
        </div>
        <h2 className="font-heading text-3xl font-bold text-[#F2F3F5] sm:text-4xl">
          Una plataforma. Todos los canales.
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-[#9CA3AF]">
          Vos gestionás desde la web. Tus jugadores reservan desde la app, el navegador o WhatsApp.
          Todo sincronizado, en tiempo real, sin pisarse.
        </p>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {CHANNELS.map((ch) => (
            <div
              key={ch.title}
              className="group flex flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-[#101216] transition-colors hover:border-[#D6FF3D]/20"
            >
              {/* Info - top */}
              <div className="p-5">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D6FF3D]/10">
                    <ch.icon className="h-5 w-5 text-[#D6FF3D]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#F2F3F5]">{ch.title}</h3>
                  {ch.badge ? (
                    <span className="rounded-md bg-[#D6FF3D]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#D6FF3D]">
                      {ch.badge}
                    </span>
                  ) : null}
                </div>
                <p className="text-sm leading-relaxed text-[#6B7280]">{ch.description}</p>
              </div>

              {/* Mock - bottom */}
              <div className="mt-auto border-t border-white/[0.07] bg-[#0A0B0D]">
                <div className="min-h-[130px]">{ch.mockContent}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
