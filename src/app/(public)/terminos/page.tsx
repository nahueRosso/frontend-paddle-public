import type { Metadata } from "next";

import { company } from "@/config/company";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";

export const metadata: Metadata = {
  title: `Términos y Condiciones | ${company.brandName}`,
  description:
    "Condiciones de uso, alcance del servicio y responsabilidades de la plataforma Mi Club Pádel.",
};

const currentYear = new Date().getFullYear();

export default function TermsPage() {
  return (
    <LegalPageLayout>
      <header className="space-y-4">
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100 md:text-4xl">
          Términos y Condiciones
        </h1>
        <p>
          Este documento describe de forma general las condiciones de uso de
          {` ${company.brandName}`}. Al utilizar nuestros servicios, aceptás
          estas condiciones básicas.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          1. Alcance del servicio
        </h2>
        <p>
          Proveemos una plataforma SaaS para la gestión operativa y comunicación
          automatizada de clubes y complejos deportivos, incluyendo integraciones
          con WhatsApp Business y proveedores de pago. El acceso se brinda bajo
          un modelo de suscripción, según el alcance definido en cada propuesta
          comercial.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          2. Obligaciones del cliente
        </h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            Brindar información veraz para la configuración y garantizar que
            cuenta con los permisos para utilizar los datos cargados.
          </li>
          <li>
            Cumplir con las políticas de uso de Meta y los proveedores
            seleccionados (ej. Mercado Pago, Stripe).
          </li>
          <li>
            Proteger las credenciales de acceso y notificar incidentes de
            seguridad.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          3. Propiedad intelectual
        </h2>
        <p>
          {company.brandName} mantiene la titularidad sobre el software, marcas y
          desarrollos. El cliente obtiene una licencia limitada, no exclusiva e
          intransferible para utilizar la plataforma mientras dure la
          suscripción. Los datos cargados por cada cliente siguen siendo de ese
          cliente.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          4. Limitación de responsabilidad
        </h2>
        <p>
          Buscamos ofrecer un servicio estable, pero puede haber interrupciones
          o limitaciones derivadas de terceros o integraciones externas. Cada
          implementación también depende del uso correcto por parte del cliente.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          5. Suspensión y terminación
        </h2>
        <p>
          Podemos suspender o terminar el servicio ante incumplimientos de
          pagos, violaciones a estas condiciones o al detectar usos contrarios a
          las políticas de los proveedores integrados. El cliente también puede
          solicitar la baja según lo acordado comercialmente.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          6. Modificaciones
        </h2>
        <p>
          Podemos actualizar estos términos a medida que evolucione el servicio.
          La versión vigente será la publicada en el sitio.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">7. Contacto</h2>
        <p>
          Para consultas sobre este documento o sobre el servicio,
          comunicate al correo{" "}
          <a
            href={`mailto:${company.email}`}
            className="font-semibold text-slate-900 underline underline-offset-4 dark:text-slate-100"
          >
            {company.email}
          </a>{" "}
          o al teléfono {company.phone}.
        </p>
      </section>

      <footer className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-400">
        Última actualización: {currentYear} — {company.brandName}.
      </footer>
    </LegalPageLayout>
  );
}
