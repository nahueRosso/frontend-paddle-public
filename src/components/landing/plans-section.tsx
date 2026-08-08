"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Check, CheckCircle2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { useCancelPlanMutation } from "@/hooks/mutations/plan";
import { usePaymentsPlansQuery } from "@/hooks/queries/plan";
import { useAuth } from "@/hooks/use-auth";
import { planKeys } from "@/lib/queryKeys/plan";
import { cn } from "@/lib/utils";
import { PublicVideoCallBookingDialog } from "@/components/public-video-call-booking-dialog";
import { SubscriptionBadge } from "@/components/public-mp-suscription";
import { SignupDialog } from "@/components/landing/signup-dialog";

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

export function PlansSection() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { session, planStatus } = useAuth();
  const { data: paymentsPlans } = usePaymentsPlansQuery();
  const [error, setError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const [signupDialogOpen, setSignupDialogOpen] = useState(false);

  const cancelPlanMutation = useCancelPlanMutation();
  const currentPlanStatus = planStatus?.status ?? null;
  const isApprovedPlan = currentPlanStatus === "approved";
  const isPendingPlan = currentPlanStatus === "pending";
  const shouldShowStatusCard = isApprovedPlan || isPendingPlan;
  const shouldShowPitch = !shouldShowStatusCard;

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

  const handleSignupSuccess = async () => {
    if (session?.user?.id) {
      await queryClient.invalidateQueries({ queryKey: planKeys.statusByTenant(session.user.id) });
    }
    toast.success("¡Registro enviado! Ya podés seguir el estado de tu club desde esta misma pantalla.");
    setSignupDialogOpen(false);
    setError(null);
  };

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

        {/* Status card */}
        {shouldShowStatusCard && activePlan ? (
          <div className={cn(
            "mx-auto mt-10 max-w-lg rounded-2xl border p-7",
            isApprovedPlan && "border-emerald-800 bg-emerald-950/20",
            isPendingPlan && "border-amber-800 bg-amber-950/20",
          )}>
            {/* Top badges */}
            <div className="flex items-center justify-between">
              <span className={cn(
                "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider",
                isApprovedPlan && "bg-emerald-500/15 text-emerald-400",
                isPendingPlan && "bg-amber-500/15 text-amber-400",
              )}>
                <CheckCircle2 className="h-3.5 w-3.5" />
                {isApprovedPlan ? "Plan aprobado" : "Plan pendiente"}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Activo
              </span>
            </div>

            {/* Plan name */}
            <h3 className="mt-5 text-2xl font-bold text-[#F2F3F5]">{activePlan.title}</h3>
            <p className="mt-2 text-sm text-[#9CA3AF]">
              {isApprovedPlan
                ? "Tu plan ya fue aprobado. Desde acá podés coordinar la videollamada de alta y gestionar tu suscripción."
                : "Tu registro está pendiente de aprobación. El siguiente paso es agendar la videollamada para terminar la activación."}
            </p>

            {/* Features */}
            {activePlan.features.length > 0 ? (
              <ul className="mt-6 space-y-3 border-t border-white/[0.07] pt-6 text-sm text-[#E4E5E7]">
                {activePlan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <Check className={cn("h-4 w-4 flex-shrink-0", isApprovedPlan ? "text-emerald-400" : "text-amber-400")} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            ) : null}

            {/* Vigencia card */}
            <div className="mt-6 flex items-center justify-between rounded-xl border border-white/[0.07] bg-[#0A0B0D] px-4 py-3.5">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-[#6B7280]">Vigencia</p>
                <p className="mt-0.5 text-sm font-semibold text-[#F2F3F5]">{formatDate(planStatus?.validUntil)}</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.05]">
                <Sparkles className="h-4 w-4 text-[#D6FF3D]" />
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex flex-col gap-3">
              {isPendingPlan ? (
                <>
                  <PublicVideoCallBookingDialog
                    session={session}
                    className="w-full justify-center rounded-xl bg-[#D6FF3D] py-3 text-[#0A0B0D] hover:bg-[#e4ff6a]"
                    triggerLabel="Agendar videollamada"
                    icon={<CalendarDays className="h-4 w-4" />}
                  />
                  <SubscriptionBadge
                    tenantId={session?.user?.id ?? ""}
                    subscriptionStatus={{
                      currentPhase: "trial",
                      daysRemaining: 0,
                      validUntil: "",
                      requiresPayment: true,
                      accessAllowed: true,
                      planName: "string | null",
                      paymentStatus: "SubscriptionPaymentStatus",
                      subscriptionStatus: "SubscriptionStatusValue",
                    }}
                    className="w-full justify-center rounded-xl bg-emerald-500 py-3 text-[#0A0B0D] hover:bg-emerald-400"
                    icon={<Sparkles className="h-4 w-4" />}
                  />
                </>
              ) : null}
              {isApprovedPlan ? (
                <>
                  <PublicVideoCallBookingDialog
                    session={session}
                    className="w-full justify-center rounded-xl bg-[#D6FF3D] py-3 font-semibold text-[#0A0B0D] hover:bg-[#e4ff6a]"
                    triggerLabel="Agendar videollamada"
                    icon={<CalendarDays className="h-4 w-4" />}
                  />
                  <Button
                    variant="outline"
                    className="w-full rounded-xl border-rose-800 py-3 text-rose-400 hover:bg-rose-950/30"
                    onClick={handleCancelPlan}
                    disabled={redirecting}
                  >
                    Cancelar suscripción
                  </Button>
                </>
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
