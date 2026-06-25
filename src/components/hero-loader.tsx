"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Baloo_2 } from "next/font/google";

const balooFont = Baloo_2({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

type HeroLoaderProps = {
  visible: boolean;
  title?: string;
  message?: string;
};

export function HeroLoader({
  visible,
  title = "Mi Club Pádel",
  message = "Configurando tu plataforma…",
}: HeroLoaderProps) {
  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="hero-loader"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0A0B0D] text-[#F2F3F5]"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: 0.5, ease: "easeOut" },
          }}
        >
          <motion.div
            className={`mb-6 text-3xl font-bold tracking-wide text-[#D6FF3D] ${balooFont.className}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
          >
            {title}
          </motion.div>

          <motion.span
            className="mb-4 h-16 w-16 rounded-full border-4 border-[#2a3036] border-t-[#D6FF3D]"
            animate={{ rotate: 360 }}
            transition={{
              repeat: Infinity,
              duration: 1.4,
              ease: "linear",
            }}
          />

          <motion.p
            className="text-lg font-medium text-[#9CA3AF]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.3,
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1] as const,
            }}
          >
            {message}
          </motion.p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
