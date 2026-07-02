"use client";

import { motion, type Variants } from "framer-motion";
import { ArrowRight, Check, CheckCircle2, TrendingUp } from "lucide-react";

const FADE_UP: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.1 + i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  }),
};

const METRICS = [
  { value: "24/7", label: "reservando solo" },
  { value: "−70%", label: "mensajes manuales" },
  { value: "100%", label: "cobros registrados" },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_480px_at_78%_-8%,rgba(52,211,153,0.16),transparent_60%),radial-gradient(720px_420px_at_8%_8%,rgba(214,255,61,0.10),transparent_58%)]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(circle at 60% 30%, black, transparent 72%)",
        }}
      />

      <div className="relative mx-auto flex max-w-[1180px] flex-wrap items-center gap-14 px-6 py-[clamp(40px,7vw,84px)] pb-[clamp(50px,7vw,92px)]">
        {/* Copy */}
        <div className="min-w-[320px] flex-1">
          <motion.div
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#D6FF3D]/20 bg-[#D6FF3D]/5 px-4 py-2"
            initial="hidden"
            animate="visible"
            custom={0}
            variants={FADE_UP}
          >
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#D6FF3D]" />
            <span className="text-sm font-medium text-[#D6FF3D]">
              Reservá y cobrá por WhatsApp, automático
            </span>
          </motion.div>

          <motion.h1
            className="font-heading text-4xl font-bold leading-[1.1] tracking-tight text-[#F2F3F5] sm:text-5xl lg:text-[56px]"
            initial="hidden"
            animate="visible"
            custom={1}
            variants={FADE_UP}
          >
            Tu club de pádel,
            <br />
            <span className="text-[#D6FF3D]">en piloto automático.</span>
          </motion.h1>

          <motion.p
            className="mt-6 max-w-xl text-lg leading-relaxed text-[#9CA3AF]"
            initial="hidden"
            animate="visible"
            custom={2}
            variants={FADE_UP}
          >
            Reservas, torneos, canchas, clases y cobros — todo desde una sola web. Y un bot de WhatsApp
            con IA que{" "}
            <strong className="text-[#F2F3F5]">reserva el turno y cobra la seña por Mercado Pago</strong>
            , solo, las 24 horas.
          </motion.p>

          <motion.div
            className="mt-8 flex flex-wrap items-center gap-4"
            initial="hidden"
            animate="visible"
            custom={3}
            variants={FADE_UP}
          >
            <a
              href="#planes"
              className="rounded-full bg-[#D6FF3D] px-7 py-3.5 text-base font-bold text-[#0A0B0D] no-underline transition-transform hover:scale-[1.02]"
            >
              Probar gratis
            </a>
            <a
              href="#plataforma"
              className="inline-flex items-center gap-2 rounded-full border border-white/[0.14] px-7 py-3.5 text-base font-semibold text-[#E4E5E7] no-underline transition-colors hover:border-white/30"
            >
              Ver cómo funciona
              <ArrowRight className="h-4 w-4" />
            </a>
          </motion.div>

          <motion.p
            className="mt-4 flex items-center gap-2 text-sm text-[#6B7280]"
            initial="hidden"
            animate="visible"
            custom={4}
            variants={FADE_UP}
          >
            <CheckCircle2 className="h-4 w-4 text-[#D6FF3D]" />
            Sin tarjeta · Configurás tu club en 10 minutos
          </motion.p>
        </div>

        {/* WhatsApp chat mock + floating chips */}
       <motion.div
  className="relative w-full max-w-sm flex-shrink-0 lg:w-auto"
  initial={{ opacity: 0, x: 30 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
>
  {/* Floating chip: Seña acreditada */}
  <motion.div
    className="absolute -right-2 -top-3 z-10 rounded-xl bg-[#1A1D21] px-3.5 py-2 shadow-lg shadow-black/30 border border-[#D6FF3D]/[0.07]"
    animate={{ y: [0, -6, 0] }}
    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
  >
    <div className="text-[10px] text-[#8696A0]">Seña acreditada</div>
    <div className="text-sm font-bold text-[#D6FF3D]">+ $4.500</div>
  </motion.div>

  <div className="rounded-3xl border border-white/[0.05] bg-[#0B141A] p-1 shadow-2xl shadow-black/50">
    {/* Chat header */}
    <div className="flex items-center gap-3 rounded-t-2xl bg-[#1F2C34] px-5 py-3.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D6FF3D]">
        <span className="block h-3.5 w-3.5 rounded-full bg-[#0A0B0D]" />
      </div>
      <div>
        <div className="text-sm font-semibold text-[#E9EDEF]">Mi Club Pádel</div>
        <div className="flex items-center gap-1.5 text-xs text-[#25D366]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#25D366]" />
          en línea · responde al toque
        </div>
      </div>
    </div>

    {/* Chat messages */}
    <div className="flex flex-col gap-3 px-4 py-5">
      {/* User message 1 */}
      <motion.div
        className="max-w-[85%] self-end"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <div className="rounded-2xl bg-[#005C4B] px-4 py-2.5 text-[13px] leading-relaxed text-[#E9EDEF]">
          Hola! Quiero cancha mañana a la tarde&nbsp;🎾
        </div>
      </motion.div>

      {/* Bot message - slots */}
      <motion.div
        className="max-w-[85%] self-start"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
        <div className="rounded-2xl bg-[#1F2C34] px-4 py-2.5 text-[13px] leading-relaxed text-[#E9EDEF]">
          ¡Hola Mati! Para mañana tengo libre:
          <br />
          <strong className="text-[#D6FF3D]">18:00</strong> · Cancha 2
          <br />
          <strong className="text-[#D6FF3D]">19:30</strong> · Cancha 1 (techada)
        </div>
      </motion.div>

      {/* User message 2 */}
      <motion.div
        className="max-w-[85%] self-end"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8, duration: 0.5 }}
      >
        <div className="rounded-2xl bg-[#005C4B] px-4 py-2.5 text-[13px] leading-relaxed text-[#E9EDEF]">
          La de las 19:30 dale&nbsp;👍
        </div>
      </motion.div>

      {/* Payment card */}
      <motion.div
        className="max-w-[90%] self-start"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.2, duration: 0.5 }}
      >
        <div className="rounded-2xl border border-white/[0.08] bg-[#1F2C34] p-3.5">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[#8696A0]">Seña para confirmar</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#E9EDEF]">$4.500</span>
            <span className="text-xs text-[#8696A0]">de $9.000 · Cancha 1 · 19:30</span>
          </div>
          <div className="mt-3 rounded-lg bg-[#00B1EA] py-2.5 text-center text-xs font-bold text-white">
            Pagar con Mercado Pago
          </div>
        </div>
      </motion.div>

      {/* Confirmation message */}
      <motion.div
        className="max-w-[85%] self-start"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.8, duration: 0.5 }}
      >
        <div className="flex items-start gap-2 rounded-2xl bg-[#1F2C34] px-4 py-2.5 text-[13px] leading-relaxed text-[#E9EDEF]">
          <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#D6FF3D]" strokeWidth={3} />
          <span>¡Listo! Turno confirmado y cancha bloqueada. Te espero mañana 19:30&nbsp;💪</span>
        </div>
      </motion.div>
    </div>

    {/* Typing indicator */}
    <div className="px-4 pb-4">
      <div className="inline-flex items-center gap-1.5 rounded-2xl bg-[#1F2C34] px-4 py-2.5">
        {[0, 0.15, 0.3].map((delay, i) => (
          <motion.span
            key={i}
            className="h-2 w-2 rounded-full bg-[#8696A0]/60"
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 0.8, delay, ease: "easeInOut" }}
          />
        ))}
      </div>
    </div>
  </div>

  {/* Floating chip: Ocupación */}
  <motion.div
    className="absolute -bottom-4 right-4 z-10 flex items-center gap-2 rounded-xl border border-white/[0.07] bg-[#1F2C34] px-3.5 py-2 shadow-lg shadow-black/30"
    animate={{ y: [0, -6, 0] }}
    transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 0.5 }}
  >
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#111417]">
      <TrendingUp className="h-4 w-4 text-[#D6FF3D]" />
    </div>
    <div>
      <div className="text-[10px] text-[#8696A0]">Ocupación hoy</div>
      <div className="text-sm font-bold text-[#fafafa]">92%</div>
    </div>
  </motion.div>
</motion.div>
      </div>

      {/* Metrics strip - full width bottom */}
      <motion.div
        className="border-t border-white/[0.05]"
        initial="hidden"
        animate="visible"
        custom={6}
        variants={FADE_UP}
      >
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-6 px-6 py-6">
          <p className="text-sm text-[#6B7280]">
            Pensado para clubes que no quieren perder más tiempo en planillas
          </p>
          <div className="flex flex-wrap items-center gap-8">
            {METRICS.map((m) => (
              <div key={m.value} className="flex items-baseline gap-2">
                <span className="font-heading text-2xl font-bold text-[#D6FF3D]">
                  {m.value}
                </span>
                <span className="text-xs text-[#6B7280]">{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
