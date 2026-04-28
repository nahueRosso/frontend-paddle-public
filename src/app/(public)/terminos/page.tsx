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
          El presente documento regula el uso de la plataforma provista por{" "}
          {company.legalName} (CUIT {company.cuit}), con domicilio en{" "}
          {company.address}. Al utilizar nuestros servicios, aceptás estos
          términos en representación propia o de la organización que representás.
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
          un modelo de suscripción y se limita a los módulos y volúmenes
          previstos en la propuesta comercial.
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
          suscripción. Los datos generados por el cliente se mantienen como de su
          exclusiva propiedad.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          4. Limitación de responsabilidad
        </h2>
        <p>
          Hacemos nuestros mejores esfuerzos para garantizar disponibilidad y
          seguridad. Sin embargo, no nos responsabilizamos por interrupciones
          derivadas de terceros (ej. proveedores de internet, APIs externas) ni
          por usos indebidos de la plataforma. La responsabilidad total de{" "}
          {company.brandName} se limita al monto efectivamente abonado por el
          cliente durante los últimos 12 meses.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          5. Suspensión y terminación
        </h2>
        <p>
          Podemos suspender o terminar el servicio ante incumplimientos de
          pagos, violaciones a estas condiciones o al detectar usos contrarios a
          la ley o a las políticas de Meta. El cliente puede solicitar la baja
          enviando un aviso con 30 días corridos de anticipación.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          6. Modificaciones
        </h2>
        <p>
          Podemos actualizar estos términos para reflejar cambios legales o de
          servicio. Las modificaciones se notificarán a través de email o dentro
          de la plataforma y regirán a los 10 días de comunicadas.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">7. Contacto</h2>
        <p>
          Para consultas legales o solicitudes relacionadas con este documento,
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
        Última actualización: {currentYear} — {company.brandName}. Cualquier
        controversia se someterá a los tribunales de la Ciudad Autónoma de
        Buenos Aires.
      </footer>
    </LegalPageLayout>
  );
}
