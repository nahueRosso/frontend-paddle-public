"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Sparkles,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { useCancelPlanMutation } from "@/hooks/mutations/plan";
import {
  usePaymentsPlansQuery,
  useSubscriptionStatusQuery,
} from "@/hooks/queries/plan";
import { useMyCalenderBookingQuery } from "@/hooks/queries/calender";
import { useAuth } from "@/hooks/use-auth";
import { cancelCalenderBooking } from "@/lib/api/calender";
import { calenderKeys } from "@/lib/queryKeys/calender";
import { planKeys } from "@/lib/queryKeys/plan";
import { company } from "@/config/company";
import { phoneToWaLink } from "@/lib/phone";
import { cn } from "@/lib/utils";
import { PublicVideoCallBookingDialog } from "@/components/public-video-call-booking-dialog";
import { SubscriptionBadge } from "@/components/public-mp-suscription";
import { SignupDialog } from "@/components/landing/signup-dialog";

const ADMIN_URL = "https://admin.miclubpadel.com";

function formatBookingDateLong(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, (month ?? 1) - 1, day ?? 1);
  return new Intl.DateTimeFormat("es-AR", { weekday: "long", day: "2-digit", month: "long" }).format(date);
}

function formatBookingDateShort(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, (month ?? 1) - 1, day ?? 1);
  return {
    month: new Intl.DateTimeFormat("es-AR", { month: "short" }).format(date).replace(".", "").toUpperCase(),
    day: new Intl.DateTimeFormat("es-AR", { day: "2-digit" }).format(date),
  };
}

function formatPlanPrice(plan: Plan | null) {
  if (!plan) return null;
  if (plan.arsPrice) {
    return `${new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: plan.arsCurrency ?? "ARS",
      maximumFractionDigits: 0,
    }).format(plan.arsPrice)}/mes`;
  }
  return `US$ ${plan.price}/mes`;
}

export type Plan = {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  price: number;
  currency: string;
  arsPrice?: number | null;
  arsCurrency?: string | null;
  maxCourts?: number | null;
  frequency: string;
  features: string[];
};

// Metadata de referencia para los planes ya asignados por el equipo comercial
// (el precio real vive en la tabla de planes del backend, no acá).
const basePlans: Plan[] = [
  {
    id: "plan-1",
    title: "Esencial",
    description:
      "Ideal para clubes de 1 cancha. Incluye pagos online con Mercado Pago, automatización por WhatsApp e IA, más la gestión completa de reservas, jugadores, partidos y torneos.",
    shortDescription: "Para clubes de 1 cancha: pagos online, WhatsApp automatizado e IA incluidos.",
    price: 50,
    currency: "USD",
    maxCourts: 1,
    frequency: "mes",
    features: [
      "1 cancha",
      "20 tokens de IA por mes",
      "Pagos online con Mercado Pago",
      "Automatización por WhatsApp",
      "Reservas, jugadores, partidos y torneos",
    ],
  },
  {
    id: "plan-2",
    title: "Cobros",
    description:
      "Para clubes de hasta 3 canchas. Incluye todo lo del plan Esencial con más capacidad de canchas y de tokens de IA por mes.",
    shortDescription: "Hasta 3 canchas, con todo lo de Esencial y más tokens de IA por mes.",
    price: 70,
    currency: "USD",
    maxCourts: 3,
    frequency: "mes",
    features: [
      "Hasta 3 canchas",
      "50 tokens de IA por mes",
      "Todo lo del plan Esencial",
    ],
  },
  {
    id: "plan-3",
    title: "Automatizado",
    description:
      "Para clubes de hasta 8 canchas. Incluye todo lo del plan Cobros con más capacidad de canchas y de tokens de IA por mes.",
    shortDescription: "Hasta 8 canchas, con todo lo de Cobros y más tokens de IA por mes.",
    price: 85,
    currency: "USD",
    maxCourts: 8,
    frequency: "mes",
    features: [
      "Hasta 8 canchas",
      "100 tokens de IA por mes",
      "Todo lo del plan Cobros",
    ],
  },
  {
    id: "plan-4",
    title: "Premium",
    description:
      "Para clubes de más de 8 canchas. Cantidad de canchas y tokens de IA a medida, con número propio del club y una operación dedicada.",
    shortDescription: "Más de 8 canchas, canchas y tokens de IA a medida — a consultar.",
    price: 100,
    currency: "USD",
    maxCourts: null,
    frequency: "mes",
    features: [
      "Más de 8 canchas — a consultar",
      "Tokens de IA a medida",
      "Todo lo del plan Automatizado",
      "Número de WhatsApp propio del club",
      "Operación dedicada",
    ],
  },
];

const pitchFeatures = [
  "Reservas, jugadores, partidos y torneos",
  "Pagos online con Mercado Pago",
  "Automatización por WhatsApp e IA",
  "Configuración a medida de tu club",
];

const SUPPORT_WHATSAPP_LINK = `${phoneToWaLink(company.phone)}?text=${encodeURIComponent(
  "Hola, necesito ayuda con la suscripción de mi club.",
)}`;

export function PlansSection() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { session, planStatus, status, publicSessionStatus, isPlanStatusLoading } = useAuth();
  const { data: paymentsPlans } = usePaymentsPlansQuery();
  const [error, setError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const [cancellingBooking, setCancellingBooking] = useState(false);
  const [signupDialogOpen, setSignupDialogOpen] = useState(false);

  const cancelPlanMutation = useCancelPlanMutation();
  const currentPlanStatus = planStatus?.status ?? null;
  const isApprovedPlan = currentPlanStatus === "approved" && planStatus?.active !== false;
  const isSuspendedPlan = currentPlanStatus === "approved" && planStatus?.active === false;
  const isPendingPlan = currentPlanStatus === "pending";
  const isRejectedApplication = currentPlanStatus === "rejected";

  // Antes de saber si hay tenant, session/planStatus todavía están resolviendo
  // (NextAuth -> refresh de la cookie pública -> query de plan): sin este chequeo
  // se ve primero el CTA de alta ("no hay tenant") y después, cuando llega la
  // respuesta, se reemplaza por la card real — un flash visible en cada carga.
  const isResolvingStatusCard =
    status === "loading" ||
    (status === "authenticated" &&
      (publicSessionStatus === "loading" || (Boolean(session?.user?.id) && isPlanStatusLoading)));

  const shouldShowStatusCard =
    !isResolvingStatusCard &&
    (isApprovedPlan || isSuspendedPlan || isPendingPlan || isRejectedApplication);
  const shouldShowPitch = !isResolvingStatusCard && !shouldShowStatusCard;

  const { data: myBooking, isLoading: isLoadingBooking } = useMyCalenderBookingQuery(
    session?.user?.email ?? undefined,
    isPendingPlan,
  );
  const hasScheduledCall = Boolean(myBooking?.hasActiveBooking && myBooking.booking);

  const { data: subscriptionStatus } = useSubscriptionStatusQuery(
    session?.user?.id ?? undefined,
    isSuspendedPlan,
  );

  const plans = useMemo(() => {
    const backendPlansById = new Map(
      (paymentsPlans ?? []).map((plan) => [plan.id, plan]),
    );
    return basePlans.map((plan) => {
      const backendPlan = backendPlansById.get(plan.id) ?? backendPlansById.get(plan.title);
      if (!backendPlan) return plan;
      return {
        ...plan,
        arsPrice: backendPlan.price,
        arsCurrency: backendPlan.currency,
        maxCourts: backendPlan.maxCourts ?? plan.maxCourts,
      };
    });
  }, [paymentsPlans]);

  const activePlan = useMemo(() => {
    if (!planStatus?.planId && !planStatus?.planName) return null;
    return (
      plans.find(
        (p) => p.id === planStatus.planId || p.title === planStatus.planName || p.id === planStatus.planName,
      ) ?? {
        id: planStatus.planId ?? "custom-plan",
        title: planStatus.planName ?? "Plan activo",
        description: "",
        shortDescription: "",
        price: 0,
        currency: "ARS",
        frequency: "",
        features: [],
      }
    );
  }, [planStatus, plans]);

  const formatDate = (value?: string | null) => {
    if (!value) return "Sin fecha de vencimiento";
    return new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(value));
  };

  const handleStartSignup = () => {
    if (!session?.user?.id) {
      router.push("/login?redirect=/");
      return;
    }
    setError(null);
    setSignupDialogOpen(true);
  };

  const handleCancelPlan = async () => {
    if (!session?.user?.id) {
      setError("Necesitás iniciar sesión para cancelar tu suscripción.");
      return;
    }
    setError(null);
    setRedirecting(true);
    try {
      await cancelPlanMutation.mutateAsync({ tenantId: session.user.id });
      toast.success("Tu suscripción fue cancelada correctamente.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos cancelar la suscripción. Intentá nuevamente.");
    } finally {
      setRedirecting(false);
    }
  };

  const handleCancelApplicationCall = async () => {
    if (!myBooking?.booking) return;
    setError(null);
    setCancellingBooking(true);
    try {
      await cancelCalenderBooking(myBooking.booking.id);
      toast.success("Cancelamos tu videollamada.");
      await queryClient.invalidateQueries({
        queryKey: calenderKeys.myBookingByEmail(session?.user?.email ?? undefined),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos cancelar la solicitud. Intentá nuevamente.");
    } finally {
      setCancellingBooking(false);
    }
  };

  const handleSignupSuccess = async () => {
    if (session?.user?.id) {
      await queryClient.invalidateQueries({ queryKey: planKeys.statusByTenant(session.user.id) });
    }
    toast.success("¡Registro enviado! Ya podés seguir el estado de tu club desde esta misma pantalla.");
    setSignupDialogOpen(false);
    setError(null);
  };

  const cardTone = isApprovedPlan
    ? "emerald"
    : isPendingPlan
      ? "amber"
      : "rose";

  const badgeLabel = isApprovedPlan
    ? "Plan aprobado"
    : isPendingPlan
      ? "En revisión"
      : isSuspendedPlan
        ? "Pago rechazado"
        : "Solicitud rechazada";

  const statusIndicatorLabel = isApprovedPlan
    ? "Activo"
    : isPendingPlan
      ? "Pendiente"
      : isSuspendedPlan
        ? "Suspendido"
        : "Rechazado";

  const heading = isApprovedPlan
    ? activePlan?.title ?? "Tu plan"
    : isPendingPlan
      ? "Solicitud en curso"
      : isSuspendedPlan
        ? "Suscripción rechazada"
        : "Solicitud rechazada";

  const subtitle = isApprovedPlan
    ? "Tu club está habilitado. Ya podés gestionar canchas, torneos y cobros desde el panel."
    : isPendingPlan
      ? hasScheduledCall
        ? "Recibimos los datos de tu club. Falta la videollamada para conocer tu operación y dejar el plan a medida."
        : "Recibimos los datos de tu club. Agendá una videollamada para conocer tu operación y dejar el plan a medida."
      : isSuspendedPlan
        ? "No se concretó el pago, así que el club quedó sin acceso al panel. Para normalizarlo, abonás desde el link o te conectás con soporte."
        : "Tu solicitud no fue aprobada. Si creés que se trata de un error, escribinos y lo revisamos.";

  const bookingShortDate = myBooking?.booking ? formatBookingDateShort(myBooking.booking.bookingDate) : null;
  const planPriceLabel = formatPlanPrice(activePlan);
  // El backend todavía no registra el intento de pago fallido (fecha/motivo de MercadoPago),
  // así que estos quedan sin dato real hasta que se agregue esa data — no se inventan.
  const lastPaymentAttempt: string | null = null;
  const paymentFailureReason: string | null = null;

  return (
    <section id="planes" className="scroll-mt-20 border-t border-white/[0.05] py-24">
      <div className="mx-auto max-w-[1180px] px-6">
        <div className="mb-4 text-center text-sm font-semibold uppercase tracking-wider text-[#D6FF3D]">
          Sumá tu club
        </div>
        <h2 className="text-center font-heading text-3xl font-bold text-[#F2F3F5] sm:text-4xl">
          Automatizá tu club a tu medida.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-[#9CA3AF]">
          Registrá tu club y coordinamos una videollamada para conocer tu operación y armar el plan que mejor se adapte.
        </p>

        {/* Resolviendo sesión/plan: evita el flash del CTA de alta antes de saber si hay tenant */}
        {isResolvingStatusCard ? (
          <div
            aria-hidden
            className="mx-auto mt-10 max-w-lg animate-pulse rounded-2xl border border-white/[0.07] bg-[#101216] p-6"
          >
            <div className="flex items-center justify-between">
              <div className="h-6 w-32 rounded-full bg-white/[0.06]" />
              <div className="h-4 w-16 rounded-full bg-white/[0.06]" />
            </div>
            <div className="mt-5 h-6 w-40 rounded bg-white/[0.06]" />
            <div className="mt-2.5 h-4 w-full rounded bg-white/[0.06]" />
            <div className="mt-1.5 h-4 w-2/3 rounded bg-white/[0.06]" />
            <div className="mt-5 h-16 rounded-xl bg-white/[0.05]" />
            <div className="mt-5 h-11 rounded-xl bg-white/[0.06]" />
          </div>
        ) : null}

        {/* Status card */}
        {shouldShowStatusCard ? (
          <div className={cn(
            "mx-auto mt-10 max-w-lg rounded-2xl border p-6",
            cardTone === "emerald" &&
              "border-[rgba(216,255,71,0.28)] bg-[linear-gradient(180deg,rgba(216,255,71,0.055),rgba(216,255,71,0.012)_55%,rgba(6,8,6,0))] shadow-[0_24px_60px_-32px_rgba(216,255,71,0.28)]",
            cardTone === "amber" &&
              "border-[rgba(250,204,21,0.26)] bg-[linear-gradient(180deg,rgba(250,204,21,0.05),rgba(250,204,21,0.01)_55%,rgba(6,8,6,0))] shadow-[0_24px_60px_-34px_rgba(250,204,21,0.22)]",
            cardTone === "rose" &&
              "border-[rgba(248,113,113,0.28)] bg-[linear-gradient(180deg,rgba(248,113,113,0.055),rgba(248,113,113,0.012)_55%,rgba(6,8,6,0))] shadow-[0_24px_60px_-34px_rgba(248,113,113,0.24)]",
          )}>
            {/* Top badges */}
            <div className="flex items-center justify-between">
              <span className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider",
                cardTone === "emerald" && "border-[rgba(216,255,71,0.3)] bg-[rgba(216,255,71,0.12)] text-[#d8ff47]",
                cardTone === "amber" && "border-[rgba(250,204,21,0.3)] bg-[rgba(250,204,21,0.12)] text-[#facc15]",
                cardTone === "rose" && "border-[rgba(248,113,113,0.32)] bg-[rgba(248,113,113,0.12)] text-[#f87171]",
              )}>
                {cardTone === "rose" ? (
                  <XCircle className="h-3.5 w-3.5" />
                ) : cardTone === "amber" ? (
                  <Clock3 className="h-3.5 w-3.5" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                )}
                {badgeLabel}
              </span>
              <span className={cn(
                "flex items-center gap-1.5 text-xs",
                cardTone === "emerald" && "text-[#9aa494]",
                cardTone === "amber" && "text-[#9aa494]",
                cardTone === "rose" && "text-[#9aa494]",
              )}>
                <span className={cn(
                  "h-2 w-2 rounded-full",
                  cardTone === "emerald" && "bg-[#4ade80] shadow-[0_0_0_4px_rgba(74,222,128,0.16)]",
                  cardTone === "amber" && "bg-[#facc15] shadow-[0_0_0_4px_rgba(250,204,21,0.16)]",
                  cardTone === "rose" && "bg-[#f87171] shadow-[0_0_0_4px_rgba(248,113,113,0.16)]",
                )} />
                {statusIndicatorLabel}
              </span>
            </div>

            {/* Heading */}
            <h3 className="mt-4 text-xl font-bold text-[#f4f6f0]">{heading}</h3>
            <p className="mt-1.5 text-sm text-[#8d938a]">{subtitle}</p>

            {/* Videollamada programada (solo mientras está pendiente) */}
            {isPendingPlan && !isLoadingBooking && hasScheduledCall && myBooking?.booking && bookingShortDate ? (
              <div className="mt-4 border-t border-white/[0.07] pt-4">
                <div className="rounded-xl border border-[rgba(250,204,21,0.18)] bg-[rgba(250,204,21,0.06)] p-3.5">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-[#c8b464]">
                    Videollamada programada
                  </p>
                  <div className="mt-2.5 flex items-center gap-3">
                    <div className="flex h-11 w-11 flex-shrink-0 flex-col items-center justify-center rounded-lg border border-[rgba(250,204,21,0.22)] bg-[rgba(250,204,21,0.12)] text-[#c8b464]">
                      <span className="text-[9px] font-bold uppercase leading-none">{bookingShortDate.month}</span>
                      <span className="mt-0.5 text-base font-bold leading-none text-[#fff8dd]">{bookingShortDate.day}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold capitalize text-[#f2f4ec]">
                        {formatBookingDateLong(myBooking.booking.bookingDate)}
                      </p>
                      <p className="text-xs text-[#9aa494]">
                        {myBooking.booking.startTime}hs · {myBooking.booking.durationMinutes} min · Google Meet
                      </p>
                    </div>
                  </div>
                  <p className="mt-2.5 flex items-center gap-1.5 border-t border-[rgba(250,204,21,0.14)] pt-2.5 text-xs text-[#8d938a]">
                    <Clock3 className="h-3 w-3" />
                    Te enviaremos el link por WhatsApp 15 minutos antes.
                  </p>
                </div>
              </div>
            ) : null}

            {/* Saldo pendiente (solo suspendido por pago) */}
            {isSuspendedPlan ? (
              <div className="mt-4 border-t border-white/[0.07] pt-4">
                <div className="rounded-xl border border-[rgba(248,113,113,0.18)] bg-[rgba(248,113,113,0.06)] p-3.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wider text-[#c98d8d]">Saldo pendiente</p>
                      <p className="mt-1 text-xl font-bold text-[#fdeeee]">
                        {planPriceLabel ?? "Consultá el monto con soporte"}
                      </p>
                    </div>
                    {lastPaymentAttempt ? (
                      <div className="text-right">
                        <p className="text-[10px] font-medium uppercase tracking-wider text-[#9aa494]">Último intento</p>
                        <p className="mt-1 text-sm font-semibold text-[#dfe4d8]">{lastPaymentAttempt}</p>
                      </div>
                    ) : null}
                  </div>
                  {paymentFailureReason ? (
                    <p className="mt-3 flex items-center gap-1.5 border-t border-[rgba(248,113,113,0.16)] pt-2.5 text-xs text-[#8d938a]">
                      <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 text-[#f87171]" />
                      Motivo: {paymentFailureReason}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}

            {/* Features (solo plan aprobado y activo) */}
            {isApprovedPlan && activePlan && activePlan.features.length > 0 ? (
              <ul className="mt-5 space-y-2 border-t border-white/[0.07] pt-5 text-sm text-[#dfe4d8]">
                {activePlan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <Check className="h-3.5 w-3.5 flex-shrink-0 text-[#d8ff47]" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            ) : null}

            {/* Vigencia card (solo plan aprobado y activo) */}
            {isApprovedPlan ? (
              <div className="mt-5 flex items-center justify-between rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.035)] px-3.5 py-3">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-[#77806f]">Vigencia</p>
                  <p className="mt-0.5 text-sm font-semibold text-[#eef1e9]">{formatDate(planStatus?.validUntil)}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs text-[#8d938a]">Renueva solo</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.05]">
                    <Sparkles className="h-3.5 w-3.5 text-[#d8ff47]" />
                  </div>
                </div>
              </div>
            ) : null}

            {/* Action buttons */}
            <div className="mt-5 flex flex-col gap-2.5">
              {isPendingPlan ? (
                <>
                  <PublicVideoCallBookingDialog
                    session={session}
                    className="w-full justify-center rounded-xl bg-[#facc15] py-2.5 text-sm font-semibold text-[#1a1400] hover:bg-[#ffdb52]"
                    triggerLabel={hasScheduledCall ? "Reagendar videollamada" : "Agendar videollamada"}
                    icon={<CalendarDays className="h-4 w-4" />}
                  />
                  {hasScheduledCall ? (
                    <Button
                      variant="outline"
                      className="w-full rounded-xl border-[rgba(255,255,255,0.1)] bg-transparent py-2.5 text-sm text-[#8d938a] hover:border-[rgba(255,139,139,0.4)] hover:bg-transparent hover:text-[#ff8b8b]"
                      onClick={handleCancelApplicationCall}
                      disabled={cancellingBooking}
                    >
                      Cancelar solicitud
                    </Button>
                  ) : null}
                </>
              ) : null}
              {isApprovedPlan ? (
                <>
                  <a
                    href={ADMIN_URL}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#d8ff47] py-2.5 text-sm font-semibold text-[#0b0f04] no-underline transition-all hover:bg-[#e6ff7d]"
                  >
                    Ir al panel de administración
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                  <Button
                    variant="outline"
                    className="w-full rounded-xl border-[rgba(255,255,255,0.1)] bg-transparent py-2.5 text-sm text-[#8d938a] hover:border-[rgba(255,139,139,0.4)] hover:bg-transparent hover:text-[#ff8b8b]"
                    onClick={handleCancelPlan}
                    disabled={redirecting}
                  >
                    Cancelar suscripción
                  </Button>
                </>
              ) : null}
              {isSuspendedPlan ? (
                <>
                  <SubscriptionBadge
                    tenantId={session?.user?.id ?? ""}
                    subscriptionStatus={subscriptionStatus ?? null}
                    className="w-full justify-center rounded-xl bg-[#d8ff47] py-2.5 text-sm font-semibold text-[#0b0f04] hover:bg-[#e6ff7d]"
                    icon={<Sparkles className="h-4 w-4" />}
                  />
                  <a
                    href={SUPPORT_WHATSAPP_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-[rgba(255,255,255,0.12)] py-2.5 text-sm font-semibold text-[#dfe4d8] no-underline transition-colors hover:border-[rgba(216,255,71,0.4)] hover:text-[#d8ff47]"
                  >
                    Hablar con soporte
                  </a>
                </>
              ) : null}
              {isRejectedApplication ? (
                <a
                  href={SUPPORT_WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-[rgba(255,255,255,0.12)] py-2.5 text-sm font-semibold text-[#dfe4d8] no-underline transition-colors hover:border-[rgba(216,255,71,0.4)] hover:text-[#d8ff47]"
                >
                  Hablar con soporte
                </a>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* Simple pitch + CTA (no pricing exposed) */}
        {shouldShowPitch ? (
          <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-white/[0.07] bg-[#101216] p-8 text-center">
            <ul className="mx-auto grid max-w-lg gap-3 text-left text-sm text-[#E4E5E7] sm:grid-cols-2">
              {pitchFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#D6FF3D]" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <Button
              type="button"
              className="mt-8 w-full justify-center rounded-xl bg-[#D6FF3D] px-6 py-3 font-semibold text-[#0A0B0D] shadow-md transition-all hover:bg-[#e4ff6a] sm:w-auto"
              onClick={handleStartSignup}
            >
              Probar gratis
            </Button>

            <p className="mt-4 text-sm text-[#6B7280]">
              Coordinamos una videollamada para conocer tu club y definir el plan que mejor se ajuste.
            </p>

            {!session?.user?.id ? (
              <p className="mt-3 text-sm text-[#6B7280]">
                Iniciá sesión para registrar tu club.
              </p>
            ) : null}
          </div>
        ) : null}

        {error ? (
          <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-rose-800 bg-rose-950/30 px-4 py-3 text-center text-sm text-rose-200">
            {error}
          </div>
        ) : null}
      </div>

      <SignupDialog
        open={signupDialogOpen}
        onOpenChange={setSignupDialogOpen}
        session={session}
        onSuccess={handleSignupSuccess}
      />
    </section>
  );
}
