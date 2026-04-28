"use client";

import type { ComponentType } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  CalendarClock,
  CreditCard,
  Crown,
  Megaphone,
  ShieldCheck,
  Sparkles,
  Swords,
  Trophy,
  Users,
} from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const PRIMARY_BENEFITS = [
  {
    title: "Más canchas ocupadas",
    text: "Reservas más claras, partidos mejor armados y menos huecos en la agenda.",
  },
  {
    title: "Menos caos operativo",
    text: "Menos mensajes manuales, menos cruces y menos tiempo resolviendo urgencias.",
  },
  {
    title: "Cobrá mejor",
    text: "Links de pago, Mercado Pago y confirmaciones más rápidas desde web y WhatsApp.",
  },
] as const;

const SHOWCASE_SECTIONS = [
  {
    icon: CalendarClock,
    eyebrow: "Operación diaria",
    title: "La agenda del club deja de ser un problema.",
    lead: "Reservas, validaciones y disponibilidad real para trabajar con menos fricción.",
    points: [
      "Disponibilidad en tiempo real para cada cancha.",
      "Validaciones para evitar dobles reservas y errores evitables.",
      "Reglas, precios y branding configurados para cada club.",
    ],
    accent: "Menos idas y vueltas en el mostrador",
    featured: true,
  },
  {
    icon: Swords,
    eyebrow: "Jugadores y partidos",
    title: "Encontrá jugadores compatibles sin perseguir gente.",
    lead: "El sistema ayuda a completar partidos por nivel, género y horario.",
    points: [
      "Matching automático para mover partidos más rápido.",
      "Confirmaciones y reemplazos cuando alguien no responde o se baja.",
      "Mejor experiencia para el jugador y menos trabajo manual para el club.",
    ],
    accent: "Más ocupación con menos esfuerzo",
    featured: true,
  },
  {
    icon: Trophy,
    eyebrow: "Torneos",
    title: "Torneos ordenados, visibles y fáciles de seguir.",
    lead: "Dejá atrás la planilla eterna y organizá todo en un mismo lugar.",
    points: [
      "Inscripción de equipos, parejas y búsqueda de compañero.",
      "Grupos, playoffs, ranking, resultados y avance de llaves.",
      "Asignación de canchas para que el torneo se vea serio y prolijo.",
    ],
    accent: "Torneos mejor organizados",
    featured: false,
  },
  {
    icon: CreditCard,
    eyebrow: "Cobros",
    title: "Cobrá reservas, partidos y torneos sin frenar la venta.",
    lead: "El pago deja de ser un cuello de botella y pasa a empujar la confirmación.",
    points: [
      "Links de pago integrados al flujo del club.",
      "Mercado Pago para acelerar decisiones y cobrar mejor.",
      "Menos seguimiento manual y menos cobros que quedan colgados.",
    ],
    accent: "Más caja y más claridad",
    featured: false,
  },
  {
    icon: Bot,
    eyebrow: "WhatsApp",
    title: "Tu canal más usado también puede ordenar la operación.",
    lead: "WhatsApp pasa de consumir tiempo a ayudar a vender, responder y mover jugadores.",
    points: [
      "Automatizaciones para reservas y pedidos de partido.",
      "Respuestas más rápidas con menos intervención del staff.",
      "Más servicio para el jugador sin sumar más caos operativo.",
    ],
    accent: "Menos mensajes manuales",
    featured: false,
  },
  {
    icon: Users,
    eyebrow: "Clases y difusión",
    title: "Clases más claras y marketing listo para publicar.",
    lead: "La plataforma también ayuda a vender mejor lo que pasa dentro del club.",
    points: [
      "Profesores, horarios y clases mejor organizados.",
      "Stories y piezas visuales para turnos, torneos y avances.",
      "Más visibilidad del club sin depender siempre de trabajo manual.",
    ],
    accent: "Más orden para el club, mejor experiencia para el jugador",
    featured: false,
  },
] as const;

const PROOF_POINTS = [
  "Reservas claras",
  "Partidos mejor armados",
  "Torneos más prolijos",
  "Cobros más rápidos",
] as const;

export function FeatureShowcaseDialog({ isDark }: { isDark: boolean }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="group inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/28 bg-white/10 px-8 py-3 text-base font-semibold text-white shadow-[0_14px_36px_rgba(15,23,42,0.18)] backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-white hover:bg-white/16 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto"
        >
          Ver características
          <Sparkles className="h-4 w-4 transition group-hover:rotate-12" />
        </button>
      </DialogTrigger>

      <DialogContent
        showCloseButton={false}
        className="top-[5.25rem] left-1/2 h-[calc(100vh-6rem)] w-[min(1180px,calc(100vw-1rem))] max-w-[min(1180px,calc(100vw-1rem))] -translate-x-1/2 translate-y-0 overflow-hidden border-0 bg-transparent p-0 shadow-none sm:top-24 sm:h-[min(86vh,860px)] sm:w-[min(1180px,calc(100vw-2rem))] sm:max-w-[min(1180px,calc(100vw-2rem))]"
      >
        <div
          className={`relative h-full overflow-hidden rounded-[2rem] border shadow-[0_32px_100px_rgba(2,6,23,0.22)] ${
            isDark
              ? "border-white/10 bg-[linear-gradient(180deg,rgba(2,6,23,0.97)_0%,rgba(7,20,35,0.99)_100%)] text-white"
              : "border-slate-200/90 bg-[linear-gradient(180deg,rgba(248,250,252,0.98)_0%,rgba(240,253,250,0.96)_55%,rgba(248,250,252,0.98)_100%)] text-slate-950"
          }`}
        >
          <div
            className={`pointer-events-none absolute inset-0 ${
              isDark
                ? "bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.12),transparent_22%)]"
                : "bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.10),transparent_22%)]"
            }`}
          />

          <div className="relative h-full overflow-y-auto">
            <div
              className={`sticky top-0 z-30 flex items-center justify-between border-b px-4 py-3 backdrop-blur-xl sm:px-6 ${
                isDark
                  ? "border-white/8 bg-slate-950/82"
                  : "border-slate-200/80 bg-white/85"
              }`}
            >
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border ${
                    isDark
                      ? "border-emerald-300/20 bg-emerald-400/15 text-emerald-200"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700"
                  }`}
                >
                  <Crown className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p
                    className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${
                      isDark ? "text-emerald-200/80" : "text-emerald-700/80"
                    }`}
                  >
                    Showcase del producto
                  </p>
                  <DialogTitle
                    className={`truncate text-sm font-semibold sm:text-base ${
                      isDark ? "text-white" : "text-slate-950"
                    }`}
                  >
                    Lo que esta plataforma puede resolver en tu club
                  </DialogTitle>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <DialogClose asChild>
                  <a
                    href="#comenzar"
                    className="hidden items-center gap-2 rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-300 md:inline-flex"
                  >
                    Probar gratis
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </DialogClose>

                <DialogClose asChild>
                  <button
                    type="button"
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl border transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                      isDark
                        ? "border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white focus-visible:outline-white"
                        : "border-slate-200 bg-white/80 text-slate-600 hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-emerald-500"
                    }`}
                    aria-label="Cerrar"
                  >
                    <span className="text-xl leading-none">×</span>
                  </button>
                </DialogClose>
              </div>
            </div>

            <div className="px-4 pb-24 pt-5 sm:px-6 sm:pt-6 lg:px-8">
              <section
                className={`rounded-[1.8rem] border p-5 sm:p-7 ${
                  isDark
                    ? "border-white/10 bg-white/[0.045]"
                    : "border-white/80 bg-white/78"
                }`}
              >
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-3xl">
                    <div
                      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] ${
                        isDark
                          ? "border-emerald-300/18 bg-emerald-400/10 text-emerald-200"
                          : "border-emerald-200 bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Más que una app de turnos
                    </div>

                    <h2
                      className={`mt-4 max-w-4xl text-3xl font-semibold leading-tight sm:text-4xl lg:text-[2.65rem] ${
                        isDark ? "text-white" : "text-slate-950"
                      }`}
                    >
                      Menos tiempo resolviendo caos. Más tiempo haciendo crecer el club.
                    </h2>

                    <DialogDescription
                      className={`mt-4 max-w-2xl text-base leading-relaxed sm:text-lg ${
                        isDark ? "text-slate-300" : "text-slate-600"
                      }`}
                    >
                      Reservas, partidos, torneos, cobros, clases y difusión en
                      una sola plataforma pensada para ordenar la operación y
                      profesionalizar la experiencia del jugador.
                    </DialogDescription>

                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                      <DialogClose asChild>
                        <a
                          href="#comenzar"
                          className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200"
                        >
                          Probar gratis
                          <ArrowRight className="h-4 w-4" />
                        </a>
                      </DialogClose>
                      <p
                        className={`text-sm leading-relaxed ${
                          isDark ? "text-slate-400" : "text-slate-600"
                        }`}
                      >
                        Probalo para ver cómo se siente un club más ordenado y más vendible.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-2.5 sm:grid-cols-2 lg:w-[320px] lg:grid-cols-2">
                    {PROOF_POINTS.map((point) => (
                      <div
                        key={point}
                        className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
                          isDark
                            ? "border-white/8 bg-slate-950/28 text-slate-100"
                            : "border-slate-200 bg-slate-50/90 text-slate-800"
                        }`}
                      >
                        {point}
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="mt-4 grid gap-3 md:grid-cols-3">
                {PRIMARY_BENEFITS.map((item) => (
                  <PrimaryBenefitCard
                    key={item.title}
                    title={item.title}
                    text={item.text}
                    isDark={isDark}
                  />
                ))}
              </section>

              <section className="mt-6">
                <div className="mb-4 flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                      isDark
                        ? "bg-sky-400/10 text-sky-200"
                        : "bg-sky-50 text-sky-700"
                    }`}
                  >
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p
                      className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${
                        isDark ? "text-sky-100/75" : "text-sky-700/80"
                      }`}
                    >
                      Qué resuelve
                    </p>
                    <h3
                      className={`text-xl font-semibold ${
                        isDark ? "text-white" : "text-slate-950"
                      }`}
                    >
                      Todo lo importante, sin hacerte pensar de más.
                    </h3>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {SHOWCASE_SECTIONS.map((section, index) => (
                    <ShowcaseSectionCard
                      key={section.title}
                      index={index}
                      isDark={isDark}
                      {...section}
                    />
                  ))}
                </div>
              </section>
            </div>

            <div
              className={`sticky bottom-0 z-30 border-t px-4 py-3 backdrop-blur-xl sm:px-6 ${
                isDark
                  ? "border-white/8 bg-slate-950/86"
                  : "border-slate-200/80 bg-white/88"
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p
                    className={`text-sm font-semibold ${
                      isDark ? "text-white" : "text-slate-950"
                    }`}
                  >
                    Más orden para el club. Mejor experiencia para el jugador.
                  </p>
                  <p
                    className={`text-sm ${
                      isDark ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    Si querés vender mejor y operar con menos fricción, este es el siguiente paso.
                  </p>
                </div>

                <DialogClose asChild>
                  <a
                    href="#comenzar"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200 sm:min-w-[180px]"
                  >
                    Probar gratis
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </DialogClose>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PrimaryBenefitCard({
  title,
  text,
  isDark,
}: {
  title: string;
  text: string;
  isDark: boolean;
}) {
  return (
    <div
      className={`rounded-[1.4rem] border p-4 ${
        isDark
          ? "border-white/10 bg-white/[0.045]"
          : "border-white/80 bg-white/78"
      }`}
    >
      <p
        className={`text-lg font-semibold ${
          isDark ? "text-white" : "text-slate-950"
        }`}
      >
        {title}
      </p>
      <p
        className={`mt-2 text-sm leading-relaxed ${
          isDark ? "text-slate-300" : "text-slate-600"
        }`}
      >
        {text}
      </p>
    </div>
  );
}

function ShowcaseSectionCard({
  icon: Icon,
  eyebrow,
  title,
  lead,
  points,
  accent,
  featured,
  index,
  isDark,
}: {
  icon: ComponentType<{ className?: string }>;
  eyebrow: string;
  title: string;
  lead: string;
  points: readonly string[];
  accent: string;
  featured: boolean;
  index: number;
  isDark: boolean;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        delay: index * 0.04,
        duration: 0.35,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={`rounded-[1.55rem] border p-5 transition sm:p-6 ${
        featured
          ? isDark
            ? "border-emerald-300/16 bg-[linear-gradient(180deg,rgba(16,185,129,0.08),rgba(255,255,255,0.04))]"
            : "border-emerald-200 bg-[linear-gradient(180deg,rgba(236,253,245,0.95),rgba(255,255,255,0.9))]"
          : isDark
            ? "border-white/10 bg-white/[0.045]"
            : "border-white/80 bg-white/78"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p
            className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${
              isDark ? "text-emerald-100/72" : "text-emerald-700/80"
            }`}
          >
            {eyebrow}
          </p>
          <h4
            className={`mt-2 text-xl font-semibold leading-tight ${
              isDark ? "text-white" : "text-slate-950"
            }`}
          >
            {title}
          </h4>
        </div>
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${
            isDark
              ? "border-white/10 bg-slate-950/28 text-emerald-200"
              : "border-slate-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <p
        className={`mt-3 text-sm leading-relaxed ${
          isDark ? "text-slate-300" : "text-slate-600"
        }`}
      >
        {lead}
      </p>

      <div className="mt-4 space-y-2">
        {points.map((point) => (
          <div
            key={point}
            className={`flex items-start gap-3 rounded-2xl px-3 py-2.5 ${
              isDark ? "bg-slate-950/22" : "bg-slate-50/92"
            }`}
          >
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-300" />
            <p
              className={`text-sm leading-relaxed ${
                isDark ? "text-slate-100/92" : "text-slate-700"
              }`}
            >
              {point}
            </p>
          </div>
        ))}
      </div>

      <div
        className={`mt-4 inline-flex rounded-full border px-3 py-1.5 text-xs font-medium ${
          isDark
            ? "border-emerald-300/14 bg-emerald-400/8 text-emerald-100"
            : "border-emerald-200 bg-emerald-50 text-emerald-700"
        }`}
      >
        {accent}
      </div>
    </motion.article>
  );
}
