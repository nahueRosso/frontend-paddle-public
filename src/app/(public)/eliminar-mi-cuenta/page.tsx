import type { Metadata } from "next";

import { company } from "@/config/company";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";

export const metadata: Metadata = {
  title: `Eliminar mi cuenta | Mi Club Pádel`,
  description:
    "Cómo eliminar tu cuenta de jugador y tus datos personales de Mi Club Pádel.",
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

export default function EliminarMiCuentaPage() {
  return (
    <LegalPageLayout>
      <header className="space-y-4">
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100 md:text-4xl">
          Cómo eliminar tu cuenta y tus datos
        </h1>
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Desde la app (recomendado)
        </h2>
        <ol className="list-decimal space-y-2 pl-6">
          <li>Abrí la app Mi Club Pádel e iniciá sesión.</li>
          <li>
            Andá a la pestaña <strong>Perfil</strong>.
          </li>
          <li>
            Tocá <strong>&ldquo;Eliminar mi cuenta&rdquo;</strong> y confirmá.
          </li>
        </ol>
        <p>
          Tu cuenta y los datos asociados se eliminan de inmediato, sin
          necesidad de esperar confirmación de nuestro equipo.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Si ya no tenés la app instalada
        </h2>
        <p>
          Escribinos a{" "}
          <a
            href={`mailto:${company.email}`}
            className="font-semibold text-slate-900 underline underline-offset-4 dark:text-slate-100"
          >
            {company.email}
          </a>{" "}
          con el asunto <strong>&ldquo;Eliminación de cuenta&rdquo;</strong>{" "}
          indicando el email o teléfono con el que te registraste. Vamos a
          confirmar tu identidad y eliminar tu cuenta en un plazo máximo de{" "}
          <strong>5 días hábiles</strong>.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Qué se elimina
        </h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            Tu perfil (nombre, DNI, fecha de nacimiento, género, foto,
            teléfono, email).
          </li>
          <li>
            Tu historial de reservas y participación en torneos asociado a tu
            cuenta.
          </li>
          <li>Tu ranking y categoría dentro del club.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Qué podemos conservar
        </h2>
        <p>
          Por obligaciones legales/impositivas, podemos conservar registros de
          pagos (no datos de tarjeta, que nunca almacenamos — los procesa
          Mercado Pago/Stripe) durante el plazo que exige la normativa
          vigente, de forma disociada de tu perfil.
        </p>
      </section>

      <footer className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-400">
        Última actualización: Agosto de 2026 — {company.brandName}.
      </footer>
    </LegalPageLayout>
  );
}
