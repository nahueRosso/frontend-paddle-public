import type { Metadata } from "next";
import { Download, ShieldCheck, Smartphone } from "lucide-react";

import { company } from "@/config/company";

export const metadata: Metadata = {
  title: "Descargar app para Android | Mi Club Pádel",
  description:
    "Descargá la app de Mi Club Pádel para Android. Todavía no está en Google Play: instalala directo desde acá.",
  icons: {
    icon: "/logo-square.ico",
    shortcut: "/logo-square.ico",
    apple: "/logo-square.ico",
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Mientras ANDROID_APP_URL (api/.env) no apunte a Google Play, este es el
// destino al que redirige /app-redirect en Android. Cuando la app se publique
// en Play Store, cambiar esa variable ahí y esta página deja de estar en el
// camino del QR (puede quedar viva igual como fallback manual).
//
// El .apk se sube directo al bucket R2 (tenants-padel-assets), no al VPS:
// así actualizar la app es solo reemplazar el archivo ahí, sin rebuild.
const APK_DOWNLOAD_URL =
  "https://pub-aac77313f3984f3b91993c60f68dd68c.r2.dev/app-releases/android/mi-club-padel-v1.apk";

const STEPS = [
  {
    title: "Descargá el archivo",
    description: "Tocá el botón de arriba. El navegador va a bajar un archivo .apk.",
  },
  {
    title: `Si Chrome muestra una advertencia, elegí "Descargar de todos modos"`,
    description:
      "Es normal: como la app todavía no está en Google Play, Chrome no la reconoce. El archivo es seguro.",
  },
  {
    title: "Abrí el archivo descargado",
    description:
      'Si te pide permiso para "instalar apps desconocidas", activalo solo para esta descarga y continuá.',
  },
  {
    title: "Instalá y abrí la app",
    description: "Listo, ya podés entrar con tu cuenta del club.",
  },
];

export default function DownloadAndroidPage() {
  const whatsappHref = `https://wa.me/${company.phone.replace(/[^\d]/g, "")}`;

  return (
    <div className="mx-auto max-w-[720px] px-4 py-16 sm:px-6">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D6FF3D]/10">
          <Smartphone className="h-7 w-7 text-[#D6FF3D]" />
        </div>

        <h1 className="mt-6 font-heading text-3xl font-bold text-[#F2F3F5] sm:text-4xl">
          Descargá la app para Android
        </h1>
        <p className="mt-4 max-w-md text-lg text-[#9CA3AF]">
          Todavía estamos esperando la aprobación de Google Play. Mientras
          tanto, instalá la app directo desde acá — funciona igual.
        </p>

        <a
          href={APK_DOWNLOAD_URL}
          download
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#D6FF3D] px-8 py-3.5 text-base font-bold text-[#0A0B0D] no-underline transition-transform hover:scale-[1.02]"
        >
          <Download className="h-5 w-5" />
          Descargar APK
        </a>

        <div className="mt-4 flex items-center gap-2 text-sm text-[#9CA3AF]">
          <ShieldCheck className="h-4 w-4 text-[#D6FF3D]" />
          Distribuido directamente por Mi Club Pádel.
        </div>
      </div>

      <div className="mt-16 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 sm:p-8">
        <h2 className="font-heading text-xl font-semibold text-[#F2F3F5]">
          Cómo instalarla
        </h2>
        <ol className="mt-6 space-y-5">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex gap-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#D6FF3D]/10 text-sm font-bold text-[#D6FF3D]">
                {index + 1}
              </span>
              <div>
                <p className="font-medium text-[#E4E5E7]">{step.title}</p>
                <p className="mt-1 text-sm text-[#9CA3AF]">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <p className="mt-8 text-center text-sm text-[#9CA3AF]">
        ¿Tenés problemas para instalarla?{" "}
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-[#D6FF3D] underline underline-offset-4"
        >
          Escribinos por WhatsApp
        </a>
        .
      </p>
    </div>
  );
}
