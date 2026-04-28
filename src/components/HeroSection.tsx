"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import NextImage from "next/image";
import { Baloo_2 } from "next/font/google";

import { useAppTheme } from "@/components/app-theme-provider";
import { FeatureShowcaseDialog } from "@/components/feature-showcase-dialog";

const balooFont = Baloo_2({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const HERO_BACKGROUND_SRC = "/cancha-de-paddle.png";
const HERO_BACKGROUND_DARK_SRC = "/cancha-de-paddle-dark-2.png";

const FADE_IN_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.25 + custom * 0.15,
      duration: 0.65,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  }),
};

function useHeroBackgroundLoader(src: string) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const image = new Image();

    const handleDone = () => setIsLoaded(true);
    image.addEventListener("load", handleDone);
    image.addEventListener("error", handleDone);
    image.src = src;

    return () => {
      image.removeEventListener("load", handleDone);
      image.removeEventListener("error", handleDone);
    };
  }, [src]);

  return isLoaded;
}

export function HeroSection() {
  const { mounted, theme } = useAppTheme();
  const isDark = mounted && theme === "dark";
  const heroBackgroundSrc =
    isDark ? HERO_BACKGROUND_DARK_SRC : HERO_BACKGROUND_SRC;
  const isBackgroundReady = useHeroBackgroundLoader(heroBackgroundSrc);

  return (
    <div className="relative flex min-h-screen w-full flex-col justify-center overflow-hidden bg-slate-950">
      <AnimatePresence>
        {!isBackgroundReady ? (
          <motion.div
            key="hero-loader"
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-emerald-900 via-emerald-300 to-teal-500 text-slate-700"
            initial={{ opacity: 1 }}
            exit={{
              opacity: 0,
              transition: { duration: 0.5, ease: "easeOut" },
            }}
          >
            <motion.div
              className={`mb-6 text-3xl font-bold tracking-wide ${balooFont.className}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
            >
              Mi Club Pádel
            </motion.div>

            <motion.span
              className="mb-4 h-16 w-16 rounded-full border-4 border-slate-400/40 border-t-slate-700"
              animate={{ rotate: 360 }}
              transition={{
                repeat: Infinity,
                duration: 1.4,
                ease: "linear",
              }}
            />

            <motion.p
              className="text-lg font-medium"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.3,
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1] as const,
              }}
            >
              Configurando tu plataforma…
            </motion.p>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="absolute inset-0 overflow-hidden">
        <NextImage
          src={heroBackgroundSrc}
          alt=""
          fill
          priority
          sizes="100vw"
          className={
            isDark
              ? "scale-105 object-cover blur-[2px] brightness-[0.6] contrast-110 saturate-[0.85]"
              : "scale-105 object-cover blur-[3px] brightness-110"
          }
        />
        <div
          className={
            isDark
              ? "absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_28%),linear-gradient(180deg,_rgba(2,6,23,0.42)_0%,_rgba(3,7,18,0.68)_18%,_rgba(6,78,59,0.34)_56%,_rgba(2,6,23,0.78)_100%)]"
              : "absolute inset-0 bg-gradient-to-br from-emerald-900/50 via-emerald-800/40 to-sky-700/43"
          }
        />
        {isDark ? (
          <div className="absolute inset-0 bg-[linear-gradient(90deg,_rgba(2,6,23,0.58)_0%,_rgba(2,6,23,0.18)_38%,_rgba(2,6,23,0.12)_100%)]" />
        ) : null}
      </div>

      <div className="h-10 w-full" />
      <div className="relative mx-auto flex w-full max-w-6xl flex-1 items-center px-6 py-16 sm:px-10 lg:px-16">
        <div className="flex w-full flex-col items-center gap-8 text-center lg:items-start lg:text-left">
          <motion.div
            className={
              isDark
                ? "rounded-full border border-emerald-300/20 bg-slate-950/35 px-4 py-2 text-sm font-medium text-emerald-200 shadow-lg backdrop-blur"
                : "rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-emerald-200 shadow-lg backdrop-blur"
            }
            initial="hidden"
            animate="visible"
            custom={0}
            variants={FADE_IN_VARIANTS}
          >
            La plataforma que hace crecer tu club
          </motion.div>

          <motion.h1
            className="text-balance text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl"
            initial="hidden"
            animate="visible"
            custom={1}
            variants={FADE_IN_VARIANTS}
          >
            Reservas, torneos y cobros en un solo lugar
          </motion.h1>

          <motion.p
            className={
              isDark
                ? "max-w-2xl text-lg text-slate-200/95 sm:text-xl"
                : "max-w-2xl text-lg text-slate-200 sm:text-xl"
            }
            initial="hidden"
            animate="visible"
            custom={2}
            variants={FADE_IN_VARIANTS}
          >
            Centralizá la operación de tu club de pádel con reservas online,
            armado de partidos, gestión de torneos, clases y cobros
            automatizados por WhatsApp y Mercado Pago.
          </motion.p>

          <motion.div
            className="flex w-full flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start"
            initial="hidden"
            animate="visible"
            custom={3}
            variants={FADE_IN_VARIANTS}
          >
            <a
              className="inline-flex w-full items-center justify-center rounded-full bg-emerald-500 px-8 py-3 text-base font-semibold text-emerald-950 shadow-xl shadow-emerald-500/30 transition hover:translate-y-0.5 hover:bg-emerald-400 hover:shadow-emerald-400/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 sm:w-auto"
              href="#comenzar"
            >
              Probar gratis
            </a>
            <FeatureShowcaseDialog isDark={isDark} />
          </motion.div>

          <motion.dl
            className="grid w-full grid-cols-1 gap-6 text-left text-sm text-slate-100 sm:grid-cols-3 lg:max-w-full"
            initial="hidden"
            animate="visible"
            custom={4}
            variants={FADE_IN_VARIANTS}
          >
            <div className={isDark ? "rounded-2xl border border-emerald-300/12 bg-slate-950/28 p-4 backdrop-blur-md" : "rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"}>
              <dt className="font-semibold text-white">Turnos sin vueltas</dt>
              <dd className="mt-2 text-slate-200">
                Mostrá disponibilidad real, evitá cruces de reservas y confirmá
                turnos más rápido desde web o WhatsApp.
              </dd>
            </div>

            <div className={isDark ? "rounded-2xl border border-emerald-300/12 bg-slate-950/28 p-4 backdrop-blur-md" : "rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"}>
              <dt className="font-semibold text-white">
                Torneos que se administran solos
              </dt>
              <dd className="mt-2 text-slate-200">
                Gestioná inscripciones, parejas, grupos, playoffs y resultados
                desde un solo sistema, sin planillas ni caos.
              </dd>
            </div>

            <div className={isDark ? "rounded-2xl border border-emerald-300/12 bg-slate-950/28 p-4 backdrop-blur-md" : "rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"}>
              <dt className="font-semibold text-white">
                Cobros y automatización
              </dt>
              <dd className="mt-2 text-slate-200">
                Generá links de pago, acelerá confirmaciones y reducí trabajo
                manual con procesos conectados al club.
              </dd>
            </div>
          </motion.dl>
        </div>
      </div>
    </div>
  );
}

export default HeroSection;
