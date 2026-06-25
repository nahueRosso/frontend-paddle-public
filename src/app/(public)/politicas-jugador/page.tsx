import type { Metadata } from "next";

import { company } from "@/config/company";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";

export const metadata: Metadata = {
  title: `Políticas para el Jugador | Mi Club Pádel`,
  description:
    "Términos, condiciones y políticas de reserva, pago, cancelación y match de partido para jugadores de Mi Club Pádel.",
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

export default function PoliticasJugadorPage() {
  return (
    <LegalPageLayout>
      <header className="space-y-4">
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100 md:text-4xl">
          Políticas para el Jugador
        </h1>
        <p>
          Este documento describe las condiciones, reglas y políticas que aplican
          a los jugadores que utilizan la plataforma {company.brandName} para
          reservar turnos, participar en partidos organizados mediante el sistema
          de match y realizar pagos. Al usar cualquiera de estos servicios,
          aceptás estas condiciones.
        </p>
      </header>

      {/* ── 1. Reserva de turnos ─────────────────────────────────────────── */}

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          1. Reserva de turnos
        </h2>
        <p>
          Los turnos de cancha se reservan a través de la plataforma{" "}
          {company.brandName}, ya sea desde la web pública del club, la app
          móvil o el chatbot de WhatsApp. Cada turno tiene una duración
          configurada por el club (habitualmente 90 minutos) y se asigna en
          franjas horarias fijas que van desde la apertura hasta el cierre del
          establecimiento.
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>Disponibilidad en tiempo real:</strong> al momento de
            reservar, el sistema muestra únicamente los turnos con canchas
            disponibles. Si otra persona reserva antes que vos, ese turno deja
            de estar disponible.
          </li>
          <li>
            <strong>Reserva por jugador:</strong> cada jugador puede tener como
            máximo una reserva activa por día en el mismo club. No se permiten
            reservas duplicadas.
          </li>
          <li>
            <strong>Tiempo de espera del pago:</strong> al confirmar una
            reserva, el turno queda retenido temporalmente mientras se completa
            el pago. Si el pago no se realiza dentro del plazo establecido, el
            turno se libera automáticamente para otros jugadores.
          </li>
        </ul>
      </section>

      {/* ── 2. Precios y pagos ───────────────────────────────────────────── */}

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          2. Precios y pagos
        </h2>
        <p>
          Los precios de los turnos y de la participación en partidos de match
          son definidos exclusivamente por cada club. {company.brandName} actúa
          como intermediario tecnológico y no determina, modifica ni controla los
          valores cobrados por los establecimientos.
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>Precio del turno:</strong> lo establece el club según su
            política comercial. Puede variar por día, horario o tipo de cancha.
          </li>
          <li>
            <strong>Precio del match:</strong> cada club configura el precio
            total del partido y el porcentaje de seña requerido para confirmar la
            participación (puede ser del 50% o del 100% del precio total).
          </li>
          <li>
            <strong>Métodos de pago:</strong> los pagos se procesan a través de
            proveedores habilitados por el club (como Mercado Pago o Stripe).{" "}
            {company.brandName} no almacena datos de tarjetas ni información
            financiera sensible.
          </li>
          <li>
            <strong>Comprobantes:</strong> el comprobante de pago es emitido por
            el proveedor de pagos correspondiente. Ante cualquier consulta sobre
            facturación, debés comunicarte directamente con el club.
          </li>
        </ul>
      </section>

      {/* ── 3. Sistema de match de partido ───────────────────────────────── */}

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          3. Sistema de match de partido
        </h2>
        <p>
          El servicio de match conecta jugadores de nivel similar para organizar
          partidos de forma automática. Al inscribirte en la fila de match,
          aceptás las siguientes condiciones:
        </p>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          3.1. Cómo funciona
        </h3>
        <ol className="list-decimal space-y-2 pl-6">
          <li>
            Indicás tu categoría (nivel de juego del 1 al 8), género y
            disponibilidad horaria.
          </li>
          <li>
            El sistema busca otros jugadores compatibles en categoría, género y
            horario.
          </li>
          <li>
            Cuando se encuentran al menos 4 jugadores compatibles y hay una
            cancha libre en un turno que coincida con la disponibilidad de todos,
            se forma un grupo y se envía una propuesta a cada jugador.
          </li>
          <li>
            Cada jugador tiene <strong>10 minutos</strong> para aceptar o
            rechazar la propuesta.
          </li>
          <li>
            Si aceptás y el partido tiene costo, se genera un link de pago con
            un plazo de <strong>20 minutos</strong> para completar la
            transacción.
          </li>
          <li>
            Cuando los 4 jugadores confirman (y pagan, si corresponde), se
            reserva la cancha automáticamente y se notifica a todos los
            participantes.
          </li>
        </ol>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          3.2. Horarios válidos
        </h3>
        <p>
          Los horarios ofrecidos por el sistema de match son los mismos turnos
          del sistema de reservas del club. Solo se consideran turnos que
          comiencen al menos <strong>1 hora después</strong> de la hora actual y
          que tengan al menos una cancha disponible. Si no hay turnos que
          cumplan estas condiciones, la solicitud queda en espera hasta que se
          libere uno.
        </p>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          3.3. Vencimiento de la propuesta
        </h3>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            Si no respondés dentro de los 10 minutos, la propuesta vence
            automáticamente y se invita a otro jugador de la lista de espera.
          </li>
          <li>
            Si aceptás pero no completás el pago dentro de los 20 minutos, se
            anula tu lugar y se busca un reemplazo. Recibirás un mensaje
            preguntándote si querés volver a anotarte en la fila.
          </li>
        </ul>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          3.4. Grupo incompleto
        </h3>
        <p>
          Si el grupo no logra completar los 4 jugadores confirmados antes de
          los <strong>15 minutos previos</strong> al inicio del turno, el
          partido se cancela automáticamente. En ese caso, todos los jugadores
          que habían confirmado y pagado reciben un{" "}
          <strong>reembolso del 100%</strong> en forma de crédito dentro de la
          plataforma.
        </p>
      </section>

      {/* ── 4. Cancelaciones y reembolsos ────────────────────────────────── */}

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          4. Cancelaciones y reembolsos
        </h2>
        <p>
          La política de cancelación busca proteger tanto al jugador como al
          resto de los participantes del partido. Los reembolsos se otorgan en
          forma de <strong>crédito dentro de la plataforma</strong>, utilizable
          en futuras reservas o partidos de match en el mismo club.
        </p>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          4.1. Si vos cancelás
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="py-2 pr-4 font-semibold text-slate-900 dark:text-slate-100">
                  Momento de la cancelación
                </th>
                <th className="py-2 font-semibold text-slate-900 dark:text-slate-100">
                  Reembolso
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-2 pr-4">
                  Más de 30 minutos antes del turno
                </td>
                <td className="py-2">
                  Se retiene el <strong>50%</strong> del precio total. El resto
                  se devuelve como crédito.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-2 pr-4">
                  30 minutos o menos antes del turno
                </td>
                <td className="py-2">
                  Se retiene el <strong>100%</strong>. No hay reembolso.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm italic">
          Ejemplo: si el precio total del partido es $10.000 y pagaste una seña
          del 100% ($10.000), al cancelar con más de 30 minutos de anticipación
          se te retienen $5.000 y recibís $5.000 en crédito. Si cancelás con
          menos de 30 minutos, no recibís reembolso.
        </p>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          4.2. Si otro jugador cancela y el grupo no se completa
        </h3>
        <p>
          Si un participante cancela su lugar y no se encuentra un reemplazo
          antes de los 15 minutos previos al turno, el partido se cancela y{" "}
          <strong>
            todos los jugadores que no cancelaron reciben el 100% de lo que
            pagaron en forma de crédito
          </strong>
          . La penalización recae únicamente sobre quien canceló, según la tabla
          anterior.
        </p>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          4.3. Si no se completó el pago
        </h3>
        <p>
          Si un jugador aceptó la propuesta de match pero no completó el pago
          dentro del plazo de 20 minutos, se lo retira del grupo y se busca un
          reemplazo. Al jugador que no pagó no se le cobra nada (no llegó a
          pagar). Si por esta situación el grupo no se completa, los demás
          jugadores reciben el <strong>reembolso del 100%</strong> como crédito.
        </p>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          4.4. Formato del reembolso
        </h3>
        <p>
          Todos los reembolsos se acreditan como{" "}
          <strong>crédito en la plataforma</strong>, vinculado a tu número de
          teléfono y al club correspondiente. Este crédito se aplica
          automáticamente en tu próxima reserva o partido de match en el mismo
          club. No se realizan devoluciones en efectivo ni transferencias
          bancarias a través de la plataforma.
        </p>
      </section>

      {/* ── 5. Crédito en la plataforma ──────────────────────────────────── */}

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          5. Crédito en la plataforma
        </h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            El crédito está asociado a tu número de teléfono y al club donde se
            generó.
          </li>
          <li>
            Se aplica automáticamente al monto de tu próxima reserva o partido
            de match en el mismo club.
          </li>
          <li>
            El crédito no es transferible entre clubes ni entre jugadores.
          </li>
          <li>
            El crédito no tiene fecha de vencimiento mientras el club permanezca
            activo en la plataforma.
          </li>
        </ul>
      </section>

      {/* ── 6. Limpieza diaria ───────────────────────────────────────────── */}

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          6. Limpieza diaria de datos
        </h2>
        <p>
          Cada noche, el sistema realiza una limpieza automática de los
          registros del día anterior:
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            Las solicitudes de match que no fueron emparejadas se marcan como
            expiradas.
          </li>
          <li>
            Los grupos incompletos se cancelan. Si algún jugador había pagado,
            se le reintegra el <strong>100%</strong> como crédito antes de
            eliminar el registro.
          </li>
          <li>
            Las reservas de turnos de fechas pasadas se eliminan del sistema.
          </li>
        </ul>
        <p>
          Esta limpieza garantiza que no queden datos obsoletos y que ningún
          jugador pierda dinero por un partido que no se concretó.
        </p>
      </section>

      {/* ── 7. Responsabilidades ─────────────────────────────────────────── */}

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          7. Responsabilidades del jugador
        </h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            Brindar información veraz al registrarte (nombre, categoría, género).
          </li>
          <li>
            Respetar los horarios de los turnos reservados y llegar puntualmente
            al club.
          </li>
          <li>
            Responder a las propuestas de match dentro del tiempo estipulado.
          </li>
          <li>
            Completar el pago dentro de los plazos establecidos si aceptás una
            propuesta de partido.
          </li>
          <li>
            Cancelar con la mayor anticipación posible si no podés asistir, para
            permitir que otro jugador ocupe tu lugar.
          </li>
        </ul>
      </section>

      {/* ── 8. Limitación de responsabilidad ─────────────────────────────── */}

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          8. Limitación de responsabilidad
        </h2>
        <p>
          {company.brandName} facilita la conexión entre jugadores y clubes
          mediante tecnología. No somos responsables por:
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            Las condiciones físicas de las canchas o instalaciones del club.
          </li>
          <li>
            Lesiones o incidentes ocurridos durante la práctica deportiva.
          </li>
          <li>
            La conducta de otros jugadores dentro o fuera de la cancha.
          </li>
          <li>
            Decisiones comerciales de los clubes respecto a precios, horarios o
            disponibilidad.
          </li>
        </ul>
      </section>

      {/* ── 9. Modificaciones ────────────────────────────────────────────── */}

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          9. Modificaciones a estas políticas
        </h2>
        <p>
          Podemos actualizar este documento a medida que evolucione el servicio.
          Los cambios relevantes serán notificados con anticipación. La versión
          vigente será siempre la publicada en https://{company.domain}
          /politicas-jugador.
        </p>
      </section>

      {/* ── 10. Contacto ─────────────────────────────────────────────────── */}

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          10. Contacto
        </h2>
        <p>
          Si tenés dudas sobre estas políticas, sobre tu crédito o sobre
          cualquier situación relacionada con reservas o partidos, comunicate
          con nosotros:
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            Correo:{" "}
            <a
              href={`mailto:${company.email}`}
              className="font-semibold text-slate-900 underline underline-offset-4 dark:text-slate-100"
            >
              {company.email}
            </a>
          </li>
          <li>Teléfono: {company.phone}</li>
        </ul>
      </section>

      <footer className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-400">
        Última actualización: Junio de 2026 — {company.brandName}.
      </footer>
    </LegalPageLayout>
  );
}
