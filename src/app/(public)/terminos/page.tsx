import type { Metadata } from "next";

import { company } from "@/config/company";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";

export const metadata: Metadata = {
  title: `Términos y Condiciones | Mi Club Pádel`,
  description:
    "Condiciones de uso, alcance del servicio y responsabilidades de la plataforma Mi Club Pádel.",
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

export default function TermsPage() {
  return (
    <LegalPageLayout>
      <header className="space-y-4">
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100 md:text-4xl">
          Términos y Condiciones
        </h1>
        <p>
          Este documento describe las condiciones de uso de{" "}
          {company.brandName}. Al utilizar nuestros servicios, aceptás estas
          condiciones. Si tenés dudas, podés consultarnos antes de contratar.
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
          2. Suscripción y pagos
        </h2>
        <p>
          El acceso a la plataforma está sujeto al pago de la suscripción
          acordada en la propuesta comercial. Ante mora o falta de pago,{" "}
          {company.brandName} puede suspender el acceso hasta regularizar la
          situación. No se aplican reembolsos por períodos ya facturados, salvo
          acuerdo expreso por escrito.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          3. Obligaciones del cliente
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
            Proteger las credenciales de acceso y notificar a{" "}
            {company.brandName} ante cualquier incidente de seguridad detectado.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          4. Propiedad intelectual
        </h2>
        <p>
          {company.brandName} mantiene la titularidad sobre el software, marcas
          y desarrollos. El cliente obtiene una licencia limitada, no exclusiva
          e intransferible para utilizar la plataforma mientras dure la
          suscripción. Los datos cargados por cada cliente siguen siendo
          propiedad de ese cliente.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          5. Limitación de responsabilidad
        </h2>
        <p>
          Buscamos ofrecer un servicio estable, pero no garantizamos
          disponibilidad ininterrumpida. No somos responsables por daños
          indirectos, pérdida de datos o lucro cesante derivados de
          interrupciones causadas por terceros, integraciones externas o uso
          incorrecto por parte del cliente. La responsabilidad máxima de{" "}
          {company.brandName} ante cualquier reclamo queda limitada al importe
          abonado por el cliente en el mes en que ocurrió el incidente.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          6. Suspensión y terminación
        </h2>
        <p>
          Podemos suspender o terminar el servicio ante incumplimientos de pago,
          violaciones a estas condiciones o al detectar usos contrarios a las
          políticas de los proveedores integrados. El cliente también puede
          solicitar la baja según lo acordado comercialmente. Ante la baja, los
          datos del cliente pueden ser solicitados dentro de los 30 días
          siguientes; transcurrido ese plazo podrán ser eliminados.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          7. Modificaciones
        </h2>
        <p>
          Podemos actualizar estos términos a medida que evolucione el servicio.
          Notificaremos cambios relevantes con al menos 15 días de anticipación.
          La versión vigente será siempre la publicada en https://
          {company.domain}/terminos.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          8. Ley aplicable y jurisdicción
        </h2>
        <p>
          Estos términos se rigen por las leyes de la República Argentina. Ante
          cualquier controversia, las partes se someten a la jurisdicción de los
          tribunales ordinarios de la Ciudad Autónoma de Buenos Aires, con
          renuncia expresa a cualquier otro fuero que pudiera corresponder.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          9. Contacto
        </h2>
        <p>
          Para consultas sobre este documento o sobre el servicio, comunicate al
          correo{" "}
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
        Última actualización: Junio de 2026 — {company.brandName}.
      </footer>
    </LegalPageLayout>
  );
}
