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
          nosotros. Esta política describe cómo recopilamos, usamos y protegemos
          la información de clientes y potenciales clientes, en cumplimiento de
          la Ley N.° 25.326 de Protección de Datos Personales de la República
          Argentina.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          1. Responsable del tratamiento
        </h2>
        <p>
          El responsable del tratamiento de los datos personales es{" "}
          {company.brandName}, con domicilio en la Ciudad Autónoma de Buenos
          Aires, República Argentina. Podés contactarnos en{" "}
          <a
            href={`mailto:${company.email}`}
            className="font-semibold text-slate-900 underline underline-offset-4 dark:text-slate-100"
          >
            {company.email}
          </a>
          .
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          2. Datos que recopilamos
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
          <li>
            De forma permanente y exclusivamente para prevenir el abuso del
            período de prueba: el nombre del tenant y el correo electrónico de
            registro. Estos datos no se usan con fines comerciales ni se ceden a
            terceros.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          3. Base legal y finalidad del tratamiento
        </h2>
        <p>Tratamos los datos personales sobre las siguientes bases legales:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>Ejecución del contrato:</strong> para prestar, operar y
            mantener la plataforma SaaS contratada.
          </li>
          <li>
            <strong>Interés legítimo:</strong> para configurar automatizaciones
            de WhatsApp Business, recordatorios y campañas solicitadas por el
            cliente, y para responder consultas de soporte.
          </li>
          <li>
            <strong>Interés legítimo:</strong> para conservar de forma mínima el
            nombre del tenant y correo electrónico de registro, con el único fin
            de evitar el uso fraudulento del período de prueba gratuito.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          4. Plazo de conservación
        </h2>
        <p>
          Conservamos los datos personales durante el tiempo en que la relación
          contractual esté vigente y por el plazo que resulte necesario para
          cumplir obligaciones legales o resolver posibles reclamaciones. Una vez
          finalizada la relación y vencidos esos plazos, los datos son eliminados
          o anonimizados, salvo los datos mínimos indicados en la sección 2.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          5. Conservación y seguridad
        </h2>
        <p>
          Aplicamos medidas técnicas y organizativas razonables para proteger la
          información frente a accesos no autorizados, pérdida o alteración,
          incluyendo cifrado en tránsito (HTTPS/TLS) y acceso restringido al
          personal autorizado. A medida que el servicio crezca, actualizaremos
          estos controles.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          6. Derechos del titular
        </h2>
        <p>
          De acuerdo con la Ley N.° 25.326, tenés derecho a acceder, rectificar,
          suprimir y oponerte al tratamiento de tus datos personales. Para
          ejercer cualquiera de estos derechos, escribinos a{" "}
          <a
            href={`mailto:${company.email}`}
            className="font-semibold text-slate-900 underline underline-offset-4 dark:text-slate-100"
          >
            {company.email}
          </a>{" "}
          indicando tu solicitud. Respondemos en menos de 24 horas hábiles.
        </p>
        <p>
          También podés consultar el procedimiento detallado en nuestra página{" "}
          <a
            href="/como-eliminar-datos"
            className="font-semibold text-slate-900 underline underline-offset-4 dark:text-slate-100"
          >
            Cómo eliminar datos
          </a>
          .
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          7. Cookies y tecnologías similares
        </h2>
        <p>
          Utilizamos cookies propias y de terceros con fines operativos,
          estadísticos y de experiencia de usuario. Podés configurar tu navegador
          para rechazar cookies, aunque esto puede afectar algunas
          funcionalidades de la plataforma.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          8. Transferencias y encargados
        </h2>
        <p>
          En caso de compartir datos con proveedores de infraestructura,
          comunicaciones o soporte, lo hacemos exclusivamente bajo criterios
          operativos necesarios para prestar el servicio, exigiendo a dichos
          proveedores niveles de protección equivalentes a los de esta política.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          9. Cambios y contacto
        </h2>
        <p>
          Podemos actualizar esta política a medida que evolucione el servicio.
          La versión vigente estará siempre disponible en https://
          {company.domain}/privacidad. Ante cualquier duda, escribinos a{" "}
          {company.email}.
        </p>
      </section>

      <footer className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-400">
        Última actualización: Junio de 2026 — {company.brandName}.
      </footer>
    </LegalPageLayout>
  );
}
