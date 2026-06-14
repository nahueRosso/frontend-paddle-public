import type { Metadata } from "next";

import { company } from "@/config/company";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";

export const metadata: Metadata = {
  title: "Cómo eliminar datos | Mi Club Pádel",
  description:
    "Instrucciones para eliminar los datos personales almacenados en Mi Club Pádel.",
};

export default function DataDeletionPage() {
  return (
    <LegalPageLayout>
      <header className="space-y-4">
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100 md:text-4xl">
          Eliminación de datos personales
        </h1>
        <p>
          Podés solicitar la eliminación de tus datos personales en cualquier
          momento. El proceso es simple: envianos un correo y nos encargamos de
          todo en menos de 24 horas hábiles.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          ¿Cómo solicitar la eliminación?
        </h2>
        <ol className="list-decimal space-y-2 pl-6">
          <li>
            Enviá un correo a{" "}
            <a
              href={`mailto:${company.email}`}
              className="font-semibold text-slate-900 underline underline-offset-4 dark:text-slate-100"
            >
              {company.email}
            </a>{" "}
            con el asunto <strong>Solicitud de eliminación de datos</strong>.
          </li>
          <li>
            Indicá el nombre de tu club o cuenta y el correo electrónico
            asociado, para que podamos identificar tu información correctamente.
          </li>
          <li>
            En menos de <strong>24 horas hábiles</strong> te confirmamos por
            correo que los datos fueron eliminados y te enviamos la confirmación
            correspondiente.
          </li>
        </ol>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          ¿Qué datos se eliminan?
        </h2>
        <p>
          Al procesar tu solicitud eliminamos de nuestros servidores toda la
          información personal y operativa asociada a tu cuenta: datos de
          contacto, registros de reservas, configuraciones, integraciones y
          cualquier otro dato vinculado a tu perfil o club.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Datos que conservamos de forma mínima
        </h2>
        <p>
          Con el único fin de prevenir el abuso del período de prueba gratuito
          (trial), conservamos de forma permanente únicamente dos datos
          anonimizados:
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>El nombre del tenant (identificador del club).</li>
          <li>La dirección de correo electrónico utilizada para el registro.</li>
        </ul>
        <p>
          Estos datos no se usan con fines comerciales ni se comparten con
          terceros. Su único propósito es identificar si una cuenta ya accedió
          anteriormente al período de prueba.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          ¿Tenés dudas?
        </h2>
        <p>
          Si tenés alguna consulta sobre este proceso, escribinos a{" "}
          <a
            href={`mailto:${company.email}`}
            className="font-semibold text-slate-900 underline underline-offset-4 dark:text-slate-100"
          >
            {company.email}
          </a>{" "}
          o llamanos al {company.phone}. Con gusto te ayudamos.
        </p>
      </section>

      <footer className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-400">
        Última actualización: Junio de 2026 — {company.brandName}.
      </footer>
    </LegalPageLayout>
  );
}
