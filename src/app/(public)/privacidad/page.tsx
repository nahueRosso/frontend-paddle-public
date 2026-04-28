import type { Metadata } from "next";

import { company } from "@/config/company";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";

export const metadata: Metadata = {
  title: `Política de Privacidad | ${company.brandName}`,
  description:
    "Política de privacidad y tratamiento de datos personales para usuarios y clientes de la plataforma.",
};

export default function PrivacyPage() {
  return (
    <LegalPageLayout>
      <header className="space-y-4">
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100 md:text-4xl">
          Política de Privacidad
        </h1>
        <p>
          En {company.brandName} ({company.legalName}, CUIT {company.cuit})
          valoramos la confianza que depositás en nosotros. Esta política explica
          cómo recopilamos, usamos y protegemos los datos personales que nos
          brindan clientes, potenciales clientes y usuarios finales de nuestros
          servicios.
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
            Información técnica y analítica: dispositivo, navegador, direcciones
            IP y actividad dentro de nuestra plataforma para garantizar seguridad
            y mejorar la experiencia de uso.
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
          <li>
            Cumplir obligaciones legales y prevenir actividades ilícitas o no
            autorizadas.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          3. Conservación y seguridad
        </h2>
        <p>
          Almacenamos los datos durante la vigencia de la relación contractual y
          por los plazos necesarios para cumplir obligaciones legales. Aplicamos
          controles técnicos y organizativos para resguardar la confidencialidad,
          integridad y disponibilidad de la información.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          4. Derechos de los titulares (ARCO)
        </h2>
        <p>
          Las personas pueden ejercer sus derechos de acceso, rectificación,
          actualización y supresión (ARCO) conforme a la Ley 25.326 de Protección
          de Datos Personales. También pueden solicitar la revocación del
          consentimiento u oponerse al tratamiento.
        </p>
        <p>
          Para ejercerlos, escribinos a{" "}
          <a
            href={`mailto:${company.email}`}
            className="font-semibold text-slate-900 underline underline-offset-4 dark:text-slate-100"
          >
            {company.email}
          </a>{" "}
          o comunicate al {company.phone}. Deberás acreditar tu identidad y
          describir el pedido con la mayor precisión posible.
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
          acuerdos de confidencialidad y estándares de seguridad equivalentes a
          los nuestros.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          7. Cambios y contacto
        </h2>
        <p>
          Podemos actualizar esta política para reflejar cambios normativos o de
          operación. La versión vigente estará siempre disponible en
          https://{company.domain}. Ante dudas o reclamos, escribinos a{" "}
          {company.email}.
        </p>
      </section>

      <footer className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-400">
        Última actualización: {new Date().getFullYear()} —{" "}
        {company.brandName}, {company.address}.
      </footer>
    </LegalPageLayout>
  );
}
