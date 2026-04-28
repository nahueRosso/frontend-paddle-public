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
          Podés eliminar tus datos en cualquier momento cerrando sesión en la
          aplicación. Al hacerlo, toda la información local almacenada (token,
          preferencias y datos personales) se elimina automáticamente.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          ¿Cómo cerrar sesión?
        </h2>
        <ol className="list-decimal space-y-2 pl-6">
          <li>
            Ingresá a la aplicación Mi Club Pádel con tu cuenta habitual.
          </li>
          <li>
            En la barra superior, hacé clic en el botón{" "}
            <strong>Cerrar sesión</strong>.
          </li>
          <li>
            Ese proceso elimina el token de autenticación, las preferencias
            guardadas y cualquier dato almacenado en tu dispositivo.
          </li>
        </ol>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Datos que se eliminan
        </h2>
        <p>
          Al cerrar sesión se remueven todos los registros locales asociados a tu
          cuenta: token de acceso, identificadores de sesión, preferencias y
          datos guardados por Mi Club Pádel en el navegador. No conservamos
          copias locales una vez finalizado el proceso de cierre de sesión.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Necesitás ayuda adicional
        </h2>
        <p>
          Si experimentás algún inconveniente escribinos a{" "}
          <a
            href={`mailto:${company.email}`}
            className="font-semibold text-slate-900 underline underline-offset-4 dark:text-slate-100"
          >
            {company.email}
          </a>{" "}
          o llamanos al {company.phone}. Responderemos tu solicitud de
          eliminación de datos lo antes posible.
        </p>
      </section>
    </LegalPageLayout>
  );
}
