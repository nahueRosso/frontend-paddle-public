import type { Metadata } from "next";

import { company } from "@/config/company";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";

export const metadata: Metadata = {
  title: `Política de Privacidad  | Mi Club Pádel`,
  description:
    "Política de privacidad y tratamiento de datos personales para usuarios y clientes de la plataforma.",
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


export default function PrivacyPage() {
  return (
    <LegalPageLayout>
      <header className="space-y-4">
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100 md:text-4xl">
          Política de Privacidad
        </h1>
        <p>
          En {company.brandName} valoramos la confianza que depositás en
          nosotros. Esta política resume de forma general cómo recopilamos,
          usamos y cuidamos la información que nos comparten clientes y
          potenciales clientes.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          1. Datos que recopilamos
        </h2>
        <p>
          Recopilamos la información mínima y necesaria para proveer nuestros
          servicios:
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            Datos de identificación y contacto: nombre, apellido, email,
            teléfono, cargo y organización.
          </li>
          <li>
            Datos operativos para la gestión de reservas y comunicación de
            clubes, incluyendo agendas, preferencias y métodos de pago.
          </li>
          <li>
            Información técnica básica de uso, necesaria para operar la
            plataforma y resolver problemas.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          2. Finalidad y uso de datos
        </h2>
        <p>Utilizamos los datos personales para:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Prestar, operar y mantener la plataforma SaaS contratada.</li>
          <li>
            Configurar automatizaciones de WhatsApp Business, recordatorios y
            campañas solicitadas por el cliente.
          </li>
          <li>
            Responder consultas comerciales o de soporte y enviar información
            relevante sobre el servicio.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          3. Conservación y seguridad
        </h2>
        <p>
          Buscamos limitar el acceso a la información y utilizar herramientas
          razonables para protegerla. A medida que el servicio crezca,
          actualizaremos procesos, políticas y controles de seguridad.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          4. Actualización o eliminación de datos
        </h2>
        <p>
          Si querés corregir o eliminar información compartida con nosotros,
          podés escribirnos y revisaremos el pedido a la brevedad.
        </p>
        <p>
          Para hacerlo, escribinos a{" "}
          <a
            href={`mailto:${company.email}`}
            className="font-semibold text-slate-900 underline underline-offset-4 dark:text-slate-100"
          >
            {company.email}
          </a>.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          5. Cookies y tecnologías similares
        </h2>
        <p>
          Utilizamos cookies propias y de terceros con fines operativos,
          estadísticos y de experiencia de usuario. Podés configurar tu navegador
          para rechazar cookies, aunque esto puede afectar funcionalidades.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          6. Transferencias y encargados
        </h2>
        <p>
          En caso de compartir datos con proveedores (ej. infraestructura en la
          nube, herramientas de soporte o comunicaciones), lo haremos bajo
          criterios operativos razonables para prestar el servicio.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          7. Cambios y contacto
        </h2>
        <p>
          Podemos actualizar esta política a medida que evolucione el servicio.
          La versión vigente estará disponible en https://{company.domain}. Ante
          dudas, escribinos a {company.email}.
        </p>
      </section>

      <footer className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-400">
        Última actualización: {new Date().getFullYear()} — {company.brandName}.
      </footer>
    </LegalPageLayout>
  );
}
