import type { Metadata } from "next";

import { company } from "@/config/company";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";

export const metadata: Metadata = {
  title: `Privacidad y Términos para Jugadores | Mi Club Pádel`,
  description:
    "Política de privacidad y términos y condiciones para jugadores que usan la app Mi Club Pádel.",
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

export default function PrivacidadJugadorPage() {
  return (
    <LegalPageLayout>
      <header className="space-y-4">
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100 md:text-4xl">
          Privacidad y Términos para Jugadores
        </h1>
        <p>
          Este documento aplica a los jugadores que usan la app{" "}
          {company.brandName} para reservar turnos, participar en torneos y
          gestionar su perfil deportivo. Describe qué datos recopilamos, para
          qué los usamos y bajo qué condiciones usás la app.
        </p>
      </header>

      {/* ═══════════════ Política de Privacidad ═══════════════ */}

      <section id="privacidad" className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Política de Privacidad
        </h2>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          1. Quiénes somos
        </h3>
        <p>
          {company.brandName} (&ldquo;la App&rdquo;) es una plataforma para
          gestionar reservas, torneos y ranking en clubes de pádel. Contacto:{" "}
          <a
            href={`mailto:${company.email}`}
            className="font-semibold text-slate-900 underline underline-offset-4 dark:text-slate-100"
          >
            {company.email}
          </a>
          .
        </p>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          2. Datos que recolectamos
        </h3>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>Datos de identidad:</strong> nombre, apellido, DNI, fecha
            de nacimiento, género.
          </li>
          <li>
            <strong>Datos de contacto:</strong> email, número de teléfono.
          </li>
          <li>
            <strong>Verificación por WhatsApp:</strong> para confirmar que el
            teléfono es tuyo, te pedimos que nos escribas desde tu WhatsApp;
            ese mensaje (tu número y el texto que enviás) pasa por la
            plataforma de Meta / WhatsApp Business antes de llegar a
            nosotros.
          </li>
          <li>
            <strong>Datos de cuenta:</strong> si iniciás sesión con Google o
            Apple, recibimos tu nombre y email asociados a esa cuenta (no
            accedemos a tu contraseña).
          </li>
          <li>
            <strong>Identificador del dispositivo:</strong> generamos un
            identificador aleatorio en tu teléfono para mantener tu sesión
            iniciada de forma segura. No identifica a otras personas ni se
            usa para publicidad.
          </li>
          <li>
            <strong>Datos deportivos:</strong> categoría, puntos de ranking,
            historial de reservas y participación en torneos.
          </li>
          <li>
            <strong>Foto de perfil:</strong> si elegís subir una, accedemos a
            tu cámara o galería solo en ese momento. Antes de publicarse, la
            foto pasa por un filtro automático que detecta contenido
            inapropiado (ver sección 4).
          </li>
          <li>
            <strong>Ubicación:</strong> con tu permiso, usamos tu ubicación
            para mostrarte los clubes más cercanos. No se almacena un
            historial de ubicaciones.
          </li>
          <li>
            <strong>Datos de pago:</strong> los pagos se procesan a través de
            Mercado Pago. No almacenamos números de tarjeta ni datos
            financieros sensibles.
          </li>
          <li>
            <strong>Denuncias:</strong> si denunciás a otro jugador (o te
            denuncian a vos), guardamos el motivo y el resultado de la
            revisión que hace el club.
          </li>
        </ul>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          3. Para qué usamos tus datos
        </h3>
        <ul className="list-disc space-y-2 pl-6">
          <li>Gestionar tu cuenta, reservas y participación en torneos.</li>
          <li>Verificar tu identidad dentro del club al que te sumás.</li>
          <li>Mostrarte clubes cercanos a tu ubicación.</li>
          <li>Procesar pagos a través de nuestros proveedores.</li>
          <li>Brindarte soporte cuando nos escribís.</li>
          <li>
            Detectar automáticamente fotos de perfil con contenido
            inapropiado antes de que se publiquen.
          </li>
          <li>
            Revisar las denuncias entre jugadores y, si corresponde, tomar
            medidas sobre la cuenta denunciada.
          </li>
        </ul>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          4. Con quién compartimos datos
        </h3>
        <p>
          No vendemos tus datos a terceros. Los compartimos únicamente con
          los proveedores que necesitamos para operar la app:
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Google / Apple (autenticación).</li>
          <li>Mercado Pago (procesamiento de pagos).</li>
          <li>Google Maps (ubicación de clubes).</li>
          <li>
            Meta / WhatsApp Business (verificación de tu teléfono y avisos
            sobre tus partidos).
          </li>
          <li>
            Cloudflare (almacenamiento de las fotos de perfil que subís).
          </li>
          <li>
            fal.ai (analiza automáticamente tu foto de perfil para detectar
            contenido inapropiado antes de publicarla; no la usa para nada
            más).
          </li>
          <li>
            OpenAI (cuando escribís por WhatsApp, ayuda a identificar a qué
            club te referís).
          </li>
          <li>Resend (envío de emails, por ejemplo de soporte).</li>
          <li>El club al que pertenecés, para gestionar tu participación.</li>
        </ul>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          5. Visibilidad dentro del club
        </h3>
        <p>
          Tu nombre, foto de perfil y categoría son visibles para otros
          jugadores verificados del mismo club: en el ranking, al buscar
          pareja para un torneo y en los partidos de Match que jugás. Podés
          bloquear a otro jugador para dejar de verlo y que no te contacte, y
          podés denunciarlo si su conducta o su foto te parecen
          inapropiadas — ver{" "}
          <a
            href="#terminos"
            className="font-semibold text-slate-900 underline underline-offset-4 dark:text-slate-100"
          >
            Contenido y conducta
          </a>{" "}
          en los Términos.
        </p>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          6. Cuánto tiempo conservamos tus datos
        </h3>
        <p>
          Mientras tu cuenta esté activa. Si solicitás la eliminación de tu
          cuenta, tus datos se eliminan según se detalla en{" "}
          <a
            href="/eliminar-mi-cuenta"
            className="font-semibold text-slate-900 underline underline-offset-4 dark:text-slate-100"
          >
            Cómo eliminar tu cuenta
          </a>
          , salvo registros que debamos conservar por obligación legal (ej.
          facturación).
        </p>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          7. Tus derechos
        </h3>
        <p>
          Podés acceder, corregir o eliminar tus datos en cualquier momento
          desde la app (Perfil) o escribiéndonos a{" "}
          <a
            href={`mailto:${company.email}`}
            className="font-semibold text-slate-900 underline underline-offset-4 dark:text-slate-100"
          >
            {company.email}
          </a>
          .
        </p>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          8. Seguridad
        </h3>
        <p>
          Aplicamos medidas técnicas y organizativas razonables para proteger
          tus datos contra accesos no autorizados.
        </p>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          9. Menores de edad
        </h3>
        <p>
          La app no está dirigida a menores de 13 años. Si sos menor de edad,
          necesitás el consentimiento de un padre/madre/tutor para usarla.
        </p>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          10. Cambios a esta política
        </h3>
        <p>
          Podemos actualizar esta política. Si hay cambios importantes, te
          avisaremos dentro de la app.
        </p>
      </section>

      {/* ═══════════════ Términos y Condiciones ═══════════════ */}

      <section id="terminos" className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Términos y Condiciones
        </h2>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          1. Aceptación
        </h3>
        <p>
          Al usar la app, aceptás estos términos y la{" "}
          <a
            href="#privacidad"
            className="font-semibold text-slate-900 underline underline-offset-4 dark:text-slate-100"
          >
            Política de Privacidad
          </a>
          .
        </p>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          2. Uso de la cuenta
        </h3>
        <p>
          Sos responsable de la veracidad de los datos que cargás (nombre,
          categoría, género, DNI) y del uso que se le da a tu cuenta.
        </p>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          3. Conducta
        </h3>
        <p>
          No está permitido: suplantar identidad, usar la app para fines
          fraudulentos, ni interferir con el funcionamiento del servicio o de
          otros usuarios.
        </p>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          4. Contenido y conducta con otros jugadores
        </h3>
        <p>
          Tenemos <strong>tolerancia cero</strong> con el contenido ofensivo y
          el acoso entre jugadores. Al subir una foto de perfil o interactuar
          con otros jugadores, aceptás que:
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            No está permitido subir fotos con contenido sexual, violento,
            discriminatorio o que de cualquier forma resulte ofensivo. Las
            fotos pasan por un filtro automático antes de publicarse, y
            pueden ser eliminadas y tu cuenta suspendida si igual se detecta
            contenido inapropiado.
          </li>
          <li>
            No está permitido acosar, amenazar o discriminar a otro jugador
            dentro de la app, en Match, en torneos o al coordinar un partido.
          </li>
          <li>
            Podés <strong>bloquear</strong> a cualquier jugador desde su
            perfil: dejás de verlo y de recibir solicitudes suyas, sin que él
            se entere. Es una decisión personal e inmediata, no requiere
            revisión de nuestra parte.
          </li>
          <li>
            Podés <strong>denunciar</strong> a un jugador si su foto o su
            conducta te parecen inapropiadas. El club revisa cada denuncia y
            puede suspender la cuenta denunciada si corresponde. Denunciar no
            suspende una cuenta automáticamente.
          </li>
          <li>
            Si tenés que reportarnos algo urgente sobre contenido o
            comportamiento de otro jugador, también podés escribirnos a{" "}
            <a
              href={`mailto:${company.email}`}
              className="font-semibold text-slate-900 underline underline-offset-4 dark:text-slate-100"
            >
              {company.email}
            </a>
            .
          </li>
        </ul>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          5. Pagos
        </h3>
        <p>
          Los pagos de reservas/torneos se procesan mediante Mercado Pago
          según sus propios términos. {company.brandName} no gestiona ni
          almacena datos financieros.
        </p>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          6. Disponibilidad del servicio
        </h3>
        <p>
          El servicio se ofrece &ldquo;tal cual&rdquo;. Podemos modificar,
          suspender o discontinuar funcionalidades sin previo aviso,
          intentando minimizar el impacto a usuarios.
        </p>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          7. Limitación de responsabilidad
        </h3>
        <p>
          {company.brandName} no se responsabiliza por disputas entre
          jugadores, clubes o terceros, ni por el uso indebido de la
          plataforma por parte de otros usuarios.
        </p>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          8. Ley aplicable
        </h3>
        <p>
          Estos términos se rigen por las leyes de la República Argentina.
        </p>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          9. Contacto
        </h3>
        <p>
          <a
            href={`mailto:${company.email}`}
            className="font-semibold text-slate-900 underline underline-offset-4 dark:text-slate-100"
          >
            {company.email}
          </a>
        </p>
      </section>

      <footer className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-400">
        Última actualización: Septiembre de 2026 — {company.brandName}.
      </footer>
    </LegalPageLayout>
  );
}
