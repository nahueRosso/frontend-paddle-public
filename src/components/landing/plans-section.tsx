"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  Lock,
  Octagon,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  useCancelPlanMutation,
  useChangePlanMutation,
} from "@/hooks/mutations/plan";
import { usePaymentsPlansQuery } from "@/hooks/queries/plan";
import { useAuth } from "@/hooks/use-auth";
import { planKeys } from "@/lib/queryKeys/plan";
import { cn } from "@/lib/utils";
import { PublicVideoCallBookingDialog } from "@/components/public-video-call-booking-dialog";
import { SubscriptionBadge } from "@/components/public-mp-suscription";
import { PlanConfigDialog } from "@/components/landing/plan-config-dialog";

export type Plan = {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  price: number;
  currency: string;
  arsPrice?: number | null;
  arsCurrency?: string | null;
  frequency: string;
  features: string[];
  highlight?: boolean;
  locked?: boolean;
  buttonLabel: string;
};

const basePlans: Plan[] = [
  {
    id: "plan-1",
    title: "Esencial",
    description:
      "La base operativa para digitalizar el club. Incluye gestión de reservas, canchas, jugadores, partidos y torneos, sin pagos online ni automatización por WhatsApp.",
    shortDescription: "La base para digitalizar el club: reservas, canchas, jugadores, partidos y torneos.",
    price: 50,
    currency: "USD",
    frequency: "mes",
    buttonLabel: "Empezar",
    features: [
      "Panel administrativo completo",
      "Reservas, canchas y horarios",
      "Jugadores, partidos y torneos",
      "Precios y disponibilidad",
      "Reservas visibles desde la web",
    ],
  },
  {
    id: "plan-2",
    title: "Cobros",
    description:
      "Incluye todo lo del plan Esencial y suma Mercado Pago para cobrar reservas, partidos y torneos de forma más simple y automática.",
    shortDescription: "Todo lo de Esencial y suma Mercado Pago para cobrar reservas, partidos y torneos automático.",
    price: 70,
    currency: "USD",
    frequency: "mes",
    buttonLabel: "Probar gratis",
    features: [
      "Todo lo del plan Esencial",
      "Integración con Mercado Pago",
      "Cobro de reservas online",
      "Cobro de partidos y torneos",
      "Confirmación automática de pagos",
    ],
    highlight: true,
  },
  {
    id: "plan-3",
    title: "Automatizado",
    description:
      "Incluye todo lo del plan Cobros y agrega atención automatizada por WhatsApp para consultas, reservas y coordinación con jugadores.",
    shortDescription: "Todo lo de Cobros y agrega atención automatizada por WhatsApp con IA.",
    price: 85,
    currency: "USD",
    frequency: "mes",
    buttonLabel: "Elegir plan",
    features: [
      "Todo lo del plan Cobros",
      "Automatización por WhatsApp",
      "Reservas desde WhatsApp",
      "Atención automatizada a jugadores",
      "Funcionalidad Match",
    ],
  },
  {
    id: "plan-4",
    title: "Premium",
    description:
      "Incluye todo lo del plan Automatizado y suma una operación más dedicada, con número propio para el club y una experiencia exclusiva de atención y gestión.",
    shortDescription: "Todo lo de Automatizado y suma número propio del club y una operación dedicada.",
    price: 100,
    currency: "USD",
    frequency: "mes",
    buttonLabel: "Hablar con ventas",
    features: [
      "Todo lo del plan Automatizado",
      "Número de WhatsApp propio del club",
      "Canal de atención exclusivo",
      "Operación premium para el admin",
      "Gestión dedicada",
    ],
  },
];

export function PlansSection() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { session, planStatus } = useAuth();
  const {
    data: paymentsPlans,
    error: paymentsPlansError,
  } = usePaymentsPlansQuery();
  const [priceDisplayCurrency, setPriceDisplayCurrency] = useState<"ARS" | "USD">("ARS");
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const [isChangingPlan, setIsChangingPlan] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);

  const changePlanMutation = useChangePlanMutation();
  const cancelPlanMutation = useCancelPlanMutation();
  const currentPlanStatus = planStatus?.status ?? null;
  const isApprovedPlan = currentPlanStatus === "approved";
  const isPendingPlan = currentPlanStatus === "pending";
  const isRejectedPlan = currentPlanStatus === "rejected";
  const shouldShowStatusCard = (isApprovedPlan || isPendingPlan) && !isChangingPlan;

  const plans = useMemo(() => {
    const backendPlansById = new Map(
      (paymentsPlans ?? []).map((plan) => [plan.id, plan]),
    );
    return basePlans.map((plan) => {
      const backendPlan = backendPlansById.get(plan.id) ?? backendPlansById.get(plan.title);
      if (!backendPlan) return plan;
      return { ...plan, arsPrice: backendPlan.price, arsCurrency: backendPlan.currency };
    });
  }, [paymentsPlans]);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) ?? null;

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
        buttonLabel: "",
      }
    );
  }, [planStatus, plans]);

  useEffect(() => {
    if (paymentsPlansError) {
      setError((c) => c ?? "No pudimos actualizar los precios de los planes.");
    }
  }, [paymentsPlansError]);

  const formatDate = (value?: string | null) => {
    if (!value) return "Sin fecha de vencimiento";
    return new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(value));
  };

  const formatPlanPrice = (price: number) =>
    new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }).format(price);

  const getPlanDisplayPrice = (plan: Plan) => {
    if (priceDisplayCurrency === "ARS" && typeof plan.arsPrice === "number" && plan.arsCurrency) {
      return { price: plan.arsPrice, currency: plan.arsCurrency, usesFallback: false };
    }
    return { price: plan.price, currency: plan.currency, usesFallback: priceDisplayCurrency === "ARS" };
  };

  const handlePlanSelection = (plan: Plan) => {
    if (plan.locked) return;
    if (!session?.user?.id) {
      router.push("/login?redirect=/");
      return;
    }
    if (planStatus?.active && isChangingPlan) {
      void submitPlanChange(plan.id);
      return;
    }
    setSelectedPlanId(plan.id);
    setError(null);
    setConfigDialogOpen(true);
  };

  const submitPlanChange = async (newPlanId: string) => {
    if (!session?.user?.id) {
      setError("Necesitás iniciar sesión para cambiar tu plan.");
      return;
    }
    setError(null);
    setRedirecting(true);
    try {
      const data = await changePlanMutation.mutateAsync({
        tenantId: session.user.id,
        newPlanName: newPlanId,
        email: session.user.email,
      });
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        toast.success("El plan fue actualizado correctamente.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos cambiar el plan. Intentá nuevamente.");
    } finally {
      setRedirecting(false);
    }
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
      setIsChangingPlan(false);
      setSelectedPlanId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos cancelar la suscripción. Intentá nuevamente.");
    } finally {
      setRedirecting(false);
    }
  };

  const handleConfigSuccess = async () => {
    if (session?.user?.id) {
      await queryClient.invalidateQueries({ queryKey: planKeys.statusByTenant(session.user.id) });
    }
    toast.success("Configuración enviada. Revisá el estado de tu plan desde esta misma pantalla.");
    setSelectedPlanId(null);
    setConfigDialogOpen(false);
    setError(null);
  };

  return (
    <section id="planes" className="scroll-mt-20 border-t border-white/[0.05] py-24">
      <div className="mx-auto max-w-[1180px] px-6">
        <div className="mb-4 text-center text-sm font-semibold uppercase tracking-wider text-[#D6FF3D]">
          Planes
        </div>
        <h2 className="text-center font-heading text-3xl font-bold text-[#F2F3F5] sm:text-4xl">
          Elegí cuánto querés automatizar.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-[#9CA3AF]">
          Cuatro planes que crecen con tu club. Cada uno incluye todo lo del anterior.
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
                : "Tu compra está pendiente de aprobación. El siguiente paso es agendar la videollamada para terminar la activación."}
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
                    icon={<Octagon className="h-4 w-4" />}
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
                  >
                    Cancelar suscripción
                  </Button>
                </>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* Plans grid */}
        {isChangingPlan || !currentPlanStatus || isRejectedPlan ? (
          <div className="mt-10">
            {/* Currency toggle */}
            <div className="mb-8 flex justify-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#111417] px-3 py-1.5">
                <button
                  type="button"
                  onClick={() => setPriceDisplayCurrency("ARS")}
                  className={cn(
                    "text-xs font-medium transition-colors",
                    priceDisplayCurrency === "ARS" ? "text-[#F2F3F5]" : "text-[#6B7280]",
                  )}
                >
                  ARS
                </button>
                <Switch
                  checked={priceDisplayCurrency === "USD"}
                  onCheckedChange={(checked) => setPriceDisplayCurrency(checked ? "USD" : "ARS")}
                  className="scale-90 cursor-pointer"
                  aria-label="Cambiar entre ARS y USD"
                />
                <button
                  type="button"
                  onClick={() => setPriceDisplayCurrency("USD")}
                  className={cn(
                    "text-xs font-medium transition-colors",
                    priceDisplayCurrency === "USD" ? "text-[#F2F3F5]" : "text-[#6B7280]",
                  )}
                >
                  USD
                </button>
              </div>
            </div>

            {isChangingPlan ? (
              <div className="mb-6 rounded-2xl border border-white/10 bg-[#111417] p-4 text-center text-sm text-[#9CA3AF]">
                Seleccioná el nuevo plan que querés activar.
              </div>
            ) : null}

            {/* 4-column grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {plans.map((plan) => {
                const isSelected = selectedPlanId === plan.id;
                const isChangeFlow = Boolean(isApprovedPlan && isChangingPlan);
                const isContactPlan = plan.id === "plan-4";
                const displayPrice = getPlanDisplayPrice(plan);

                return (
                  <article
                    key={plan.id}
                    className={cn(
                      "relative flex flex-col rounded-2xl border border-white/[0.07] bg-[#101216] p-6 transition hover:border-[#D6FF3D]/20",
                      plan.highlight && "border-[#D6FF3D]/40 ring-1 ring-[#D6FF3D]/20",
                      plan.locked && "opacity-70",
                      isSelected && !isChangeFlow && "border-[#D6FF3D] ring-2 ring-[#D6FF3D]/40",
                    )}
                  >
                    {/* Floating badge */}
                    {plan.highlight ? (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#D6FF3D] px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-[#0A0B0D] whitespace-nowrap">
                        Más elegido
                      </span>
                    ) : null}

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-[#F2F3F5]">{plan.title}</h3>

                    {/* Price */}
                    <div className="mt-3">
                      <span className="text-sm text-[#6B7280]">{displayPrice.currency} </span>
                      <span className="text-4xl font-bold text-[#F2F3F5]">
                        {formatPlanPrice(displayPrice.price)}
                      </span>
                      <span className="text-sm text-[#6B7280]"> /{plan.frequency}</span>
                    </div>

                    {/* Short description */}
                    <p className="mt-3 text-sm leading-relaxed text-[#6B7280]">{plan.shortDescription}</p>

                    {/* CTA button */}
                    <div className="mt-5">
                      {isContactPlan && !plan.locked && !isChangeFlow ? (
                        session?.user?.email ? (
                          <PublicVideoCallBookingDialog
                            session={session}
                            triggerLabel={plan.buttonLabel}
                            className="w-full justify-center rounded-xl border border-white/[0.14] px-4 py-3 font-medium text-[#E4E5E7] transition-all hover:border-white/30"
                            icon={<CalendarDays className="h-4 w-4" />}
                          />
                        ) : (
                          <Button
                            type="button"
                            disabled={redirecting}
                            className="w-full justify-center rounded-xl border border-white/[0.14] px-4 py-3 font-medium text-[#E4E5E7] transition-all hover:border-white/30"
                            onClick={() => router.push("/login?redirect=/")}
                          >
                            {plan.buttonLabel}
                          </Button>
                        )
                      ) : (
                        <Button
                          type="button"
                          disabled={plan.locked || redirecting}
                          className={cn(
                            "w-full justify-center rounded-xl px-4 py-3 font-medium transition-all",
                            plan.highlight
                              ? "bg-[#D6FF3D] text-[#0A0B0D] shadow-md hover:bg-[#e4ff6a]"
                              : "border border-white/[0.14] text-[#E4E5E7] hover:border-white/30",
                          )}
                          onClick={() => {
                            if (plan.locked) return;
                            if (isChangeFlow) {
                              void submitPlanChange(plan.id);
                              return;
                            }
                            handlePlanSelection(plan);
                          }}
                        >
                          {plan.locked ? (
                            <>
                              <Lock className="mr-2 h-4 w-4" />
                              Próximamente
                            </>
                          ) : isChangeFlow ? (
                            "Cambiar a este plan"
                          ) : (
                            plan.buttonLabel
                          )}
                        </Button>
                      )}
                    </div>

                    {/* Features */}
                    <div className="mt-5 border-t border-white/[0.07] pt-5">
                      <div className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
                        Incluye
                      </div>
                      <ul className="space-y-2.5 text-sm text-[#9CA3AF]">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-start gap-2">
                            <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#D6FF3D]" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Footer note */}
            <p className="mt-8 text-center text-sm text-[#6B7280]">
              Precios en ARS basados en el valor fijo en USD · sin costo de instalación · cancelás cuando quieras
            </p>

            {!session?.user?.id ? (
              <p className="mt-3 text-center text-sm text-[#6B7280]">
                Iniciá sesión para contratar un plan o recibir más información.
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

      {/* Config dialog */}
      {selectedPlan ? (
        <PlanConfigDialog
          open={configDialogOpen}
          onOpenChange={setConfigDialogOpen}
          selectedPlan={selectedPlan}
          session={session}
          onSuccess={handleConfigSuccess}
        />
      ) : null}
    </section>
  );
}
