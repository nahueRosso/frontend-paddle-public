"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  Check,
  CreditCard,
  Loader2,
  Lock,
  NotebookPen,
  Settings,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  useCancelPlanMutation,
  useChangePlanMutation,
} from "@/hooks/mutations/plan";
import { usePaymentsPlansQuery } from "@/hooks/queries/plan";
import { useCreateTenantConfigWithAssetsMutation } from "@/hooks/mutations/tenant-config";
import { useAuth } from "@/hooks/use-auth";
import { planKeys } from "@/lib/queryKeys/plan";
import { cn } from "@/lib/utils";
import { ImageUploader } from "@/components/PageImageUploader";
import { ARG_PROVINCES } from "@/const/province";
import { normalizeImageFile } from "@/lib/image-normalizer";

type Plan = {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  frequency: string;
  features: string[];
  highlight?: boolean;
  locked?: boolean;
};

const basePlans: Plan[] = [
  {
    id: "Administrador",
    title: "Administrador",
    description:
      "Cuenta principal para el club. Permite definir horarios, cantidad de canchas y registrar manualmente pagos y reservas.",
    price: 22000,
    currency: "ARS",
    frequency: "mensuales",
    features: [
      "Panel administrativo completo",
      "Gestión manual de reservas y pagos",
      "Configuración de horarios y precios",
      "Visualización de turnos disponibles en la web",
    ],
  },
  {
    id: "Web",
    title: "Web",
    description:
      "Incluye todo lo del plan Administrador y habilita las reservas desde la web con pagos automáticos por Mercado Pago.",
    price: 50000,
    currency: "ARS",
    frequency: "mensuales",
    features: [
      "Todo lo del plan Administrador",
      "Reservas automáticas desde la web",
      "Integración con Mercado Pago",
      "Confirmación automática por correo o WhatsApp",
    ],
    highlight: true,
  },
  {
    id: "WhatsApp",
    title: "WhatsApp",
    description:
      "Incluye todo lo del plan Web y suma un chatbot automatizado para gestionar reservas, pagos y consultas desde WhatsApp.",
    price: 80000,
    currency: "ARS",
    frequency: "mensuales",
    features: [
      "Todo lo del plan Web",
      "Chatbot automatizado en WhatsApp",
      "Gestión de reservas y pagos desde WhatsApp",
      "Funcionalidad Match",
    ],
  },
  {
    id: "IA",
    title: "IA",
    description:
      "Incluye todo lo del plan WhatsApp y agrega automatización avanzada con inteligencia artificial para optimizar la gestión del club.",
    price: 122000,
    currency: "ARS",
    frequency: "mensuales",
    features: [
      "Todo lo del plan WhatsApp",
      "Automatización completa con IA",
      "Optimización operativa del club",
      "Atención y gestión avanzada automatizada",
    ],
  },
];


type ConfigFormState = {
  clubName: string;
  address: string;
  contactPhone: string;
  contactEmail: string;
  city: string;
  province: string;
  turnDuration: number;
  isDiscontinuous: boolean;
  openingMorning: string;
  closingMorning: string;
  openingEvening: string;
  closingEvening: string;
  priceMode: "uniform" | "byCourt" | "byHour";
  basePrice: number;
  courtCount: number;
};

const defaultConfig: ConfigFormState = {
  clubName: "",
  address: "",
  contactPhone: "",
  contactEmail: "",
  city: "",
  province: "",
  turnDuration: 90,
  isDiscontinuous: false,
  openingMorning: "09:00",
  closingMorning: "12:00",
  openingEvening: "16:00",
  closingEvening: "22:00",
  priceMode: "uniform",
  basePrice: 0,
  courtCount: 2,
};

export default function PlansPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { session, planStatus } = useAuth();
  const {
    data: paymentsPlans,
    error: paymentsPlansError,
  } = usePaymentsPlansQuery();
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentPlanIndex, setCurrentPlanIndex] = useState(0);
  const [carouselSnapCount, setCarouselSnapCount] = useState(0);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const [configForm, setConfigForm] = useState<ConfigFormState>(defaultConfig);
  const configSectionRef = useRef<HTMLDivElement | null>(null);
  const planGridRef = useRef<HTMLDivElement | null>(null);
  const [isChangingPlan, setIsChangingPlan] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);

  const handleLogoSelect = async (file: File, previewUrl: string) => {
    URL.revokeObjectURL(previewUrl);

    try {
      const normalizedLogo = await normalizeImageFile(file, {
        width: 1500,
        height: 1000,
        fileName: "club-logo",
      });
      const normalizedPreviewUrl = URL.createObjectURL(normalizedLogo);

      setLogoPreview(normalizedPreviewUrl);
      setLogoFile(normalizedLogo);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo preparar el logo.",
      );
    }
  };
  
  const handleIconSelect = async (file: File, previewUrl: string) => {
    URL.revokeObjectURL(previewUrl);

    try {
      const normalizedIcon = await normalizeImageFile(file, {
        width: 1000,
        height: 1000,
        fileName: "club-icon",
      });
      const normalizedPreviewUrl = URL.createObjectURL(normalizedIcon);

      setIconPreview(normalizedPreviewUrl);
      setIconFile(normalizedIcon);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo preparar el icono.",
      );
    }
  };
  const createTenantConfigMutation = useCreateTenantConfigWithAssetsMutation();
  const changePlanMutation = useChangePlanMutation();
  const cancelPlanMutation = useCancelPlanMutation();
  const currentPlanStatus = planStatus?.status ?? null;
  const isApprovedPlan = currentPlanStatus === "approved";
  const isPendingPlan = currentPlanStatus === "pending";
  const isRejectedPlan = currentPlanStatus === "rejected";
  const shouldShowStatusCard =
    (isApprovedPlan || isPendingPlan || isRejectedPlan) &&
    !isChangingPlan;
  const plans = useMemo(() => {
    const backendPlansById = new Map(
      (paymentsPlans ?? []).map((plan) => [plan.id, plan]),
    );

    return basePlans.map((plan) => {
      const backendPlan =
        backendPlansById.get(plan.id) ?? backendPlansById.get(plan.title);

      if (!backendPlan) {
        return plan;
      }

      return {
        ...plan,
        price: backendPlan.price,
        currency: backendPlan.currency,
      };
    });
  }, [paymentsPlans]);
  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId) ?? null;
  const activePlan = useMemo(() => {
    if (!planStatus?.planId && !planStatus?.planName) {
      return null;
    }

    return (
      plans.find(
        (plan) =>
          plan.id === planStatus.planId ||
          plan.title === planStatus.planName ||
          plan.id === planStatus.planName,
      ) ?? {
        id: planStatus.planId ?? "custom-plan",
        title: planStatus.planName ?? "Plan activo",
        description: "",
        price: 0,
        currency: "ARS",
        frequency: "",
        features: [],
      }
    );
  }, [planStatus, plans]);

  useEffect(() => {
    if (!paymentsPlansError) {
      return;
    }

    setError((current) =>
      current ?? "No pudimos actualizar los precios de los planes.",
    );
  }, [paymentsPlansError]);

  useEffect(() => {
    if (!carouselApi) {
      return;
    }

    const updateCurrentPlan = () => {
      setCurrentPlanIndex(carouselApi.selectedScrollSnap());
      setCarouselSnapCount(carouselApi.scrollSnapList().length);
    };

    updateCurrentPlan();
    carouselApi.on("select", updateCurrentPlan);
    carouselApi.on("reInit", updateCurrentPlan);

    return () => {
      carouselApi.off("select", updateCurrentPlan);
      carouselApi.off("reInit", updateCurrentPlan);
    };
  }, [carouselApi]);

  // async function uploadLogo(file: File) {
  //   const formData = new FormData();
  //   formData.append("file", file);

  //   const res = await fetch("/api/upload-logo", {
  //     method: "POST",
  //     body: formData,
  //   });

  //   if (!res.ok) {
  //     throw new Error("Error subiendo logo");
  //   }

  //   const data = await res.json();

  //   console.log("URL del logo:", data.url);

  // }

  const formatDate = (value?: string | null) => {
    if (!value) {
      return "Sin fecha de vencimiento";
    }
    const date = new Date(value);
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const formatPlanPrice = (currency: string, price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const scheduleVideoCall = () => {
    window.open(
      "https://calendly.com/enzonahuelrojo000/30min",
      "_blank",
      "noopener,noreferrer",
    );
  };

  const handlePlanSelection = (plan: Plan) => {
    if (plan.locked) {
      return;
    }
    if (!session?.user?.id) {
      router.push("/login?redirect=/planes");
      return;
    }
    if (planStatus?.active && isChangingPlan) {
      void submitPlanChange(plan.id);
      return;
    }
    setSelectedPlanId(plan.id);
    setError(null);
  };

  useEffect(() => {
    if (selectedPlan && configSectionRef.current && !isChangingPlan) {
      configSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [selectedPlan, isChangingPlan]);

  const handleConfigChange = <Field extends keyof ConfigFormState>(
    field: Field,
    value: ConfigFormState[Field],
  ) => {
    setConfigForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const buildCourts = () => {
    return Array.from({ length: Math.max(1, configForm.courtCount) }).map(
      (_, index) => ({
        number: index + 1,
        active: true,
      }),
    );
  };

  // const handleCompleteSetup = async () => {
  //   if (!session?.user?.id || !selectedPlan) {
  //     setError("Necesitás elegir un plan e iniciar sesión.");
  //     return;
  //   }

  //   setError(null);
  //   setRedirecting(true);

  //   try {
  //     const response = await fetchWithTenantAdmin("/config", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         planName: selectedPlan.id,
  //         email: session.user.email,

  //         tenantId: session.user.id,

  //         clubName: configForm.clubName,
  //         address: configForm.address,
  //         province: configForm.province,
  //         city: configForm.city,
  //         contactPhone: configForm.contactPhone,
  //         contactEmail: session.user.email,

  //         turnDuration: configForm.turnDuration,
  //         isDiscontinuous: configForm.isDiscontinuous,

  //         openingMorning: configForm.openingMorning,
  //         closingMorning: configForm.closingMorning,

  //         openingEvening: configForm.isDiscontinuous
  //           ? configForm.openingEvening
  //           : null,

  //         closingEvening: configForm.isDiscontinuous
  //           ? configForm.closingEvening
  //           : null,

  //         courts: buildCourts(),

  //         priceMode: configForm.priceMode,
  //         basePrice: configForm.basePrice,

  //         paymentPlanId: selectedPlan.id,
  //       }),
  //     });

  //     const data = await response.json();
  //     // window.location.href = data.init_point;
  //     router.push("/contacto");
  //   } catch (err) {
  //     console.error("Error preparando suscripción:", err);
  //     setError(
  //       err instanceof Error
  //         ? err.message
  //         : "No pudimos guardar la configuración inicial.",
  //     );
  //     setRedirecting(false);
  //   }
  // };
  const handleCompleteSetup = async () => {
    if (!session?.user?.id || !selectedPlan) {
      setError("Necesitás elegir un plan e iniciar sesión.");
      return;
    }

    setError(null);
    setRedirecting(true);

    try {
      const formData = new FormData();

      // archivos
      if (logoFile) {
        formData.append("logo", logoFile);
      }

      if (iconFile) {
        formData.append("icon", iconFile);
      }

      // campos normales
      formData.append("planName", selectedPlan.id);
      formData.append("email", session.user.email || "");
      formData.append("tenantId", session.user.id);
      formData.append("clubName", configForm.clubName);
      formData.append("address", configForm.address);
      formData.append("province", configForm.province);
      formData.append("city", configForm.city);
      formData.append("contactPhone", configForm.contactPhone);
      formData.append("contactEmail", session.user.email || "");
      formData.append("turnDuration", String(configForm.turnDuration));
      formData.append("isDiscontinuous", String(configForm.isDiscontinuous));
      formData.append("openingMorning", configForm.openingMorning);
      formData.append("closingMorning", configForm.closingMorning);

      if (configForm.isDiscontinuous) {
        formData.append("openingEvening", configForm.openingEvening);
        formData.append("closingEvening", configForm.closingEvening);
      }

      formData.append("courts", JSON.stringify(buildCourts()));

      formData.append("priceMode", configForm.priceMode);
      formData.append("basePrice", String(configForm.basePrice));
      formData.append("paymentPlanId", selectedPlan.id);

console.log("---- FORM DATA ----");

for (const pair of formData.entries()) {
  console.log(pair[0], pair[1]);
}

console.log("-------------------");
      
      await createTenantConfigMutation.mutateAsync({
        tenantId: session.user.id,
        formData,
      });

      await queryClient.invalidateQueries({
        queryKey: planKeys.statusByTenant(session.user.id),
      });
      toast.success(
        "Configuración enviada. Revisá el estado de tu plan desde esta misma pantalla.",
      );
      setSelectedPlanId(null);
      setError(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      setError("No pudimos guardar la configuración inicial.");
      setRedirecting(false);
      return;
    }
    setRedirecting(false);
  };

  
  const scrollToPlanGrid = () => {
    if (planGridRef.current) {
      planGridRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } else {
      window?.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const triggerPlanChangeFlow = () => {
    setIsChangingPlan(true);
    setSelectedPlanId(null);
    setError(null);
    setRedirecting(false);
    requestAnimationFrame(scrollToPlanGrid);
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
        window.location.href = data.init_point; // redirige al nuevo checkout
      } else {
        toast.success("El plan fue actualizado correctamente.");
      }
    } catch (err) {
      console.error("Error cambiando plan:", err);
      setError(
        err instanceof Error
          ? err.message
          : "No pudimos cambiar el plan. Intentá nuevamente.",
      );
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
      await cancelPlanMutation.mutateAsync({
        tenantId: session.user.id,
      });
      toast.success("Tu suscripción fue cancelada correctamente.");
      router.push("/");
    } catch (err) {
      console.error("Error cancelando suscripción:", err);
      setError(
        err instanceof Error
          ? err.message
          : "No pudimos cancelar la suscripción. Intentá nuevamente.",
      );
    } finally {
      setRedirecting(false);
    }
  };

  return (
    <main className="px-4 pb-16 pt-28 text-[#4B5563] dark:text-slate-300 sm:px-6 sm:pt-32">
      <section className="mx-auto flex max-w-5xl flex-col gap-12">
        {shouldShowStatusCard && activePlan ? (
          <div
            className={cn(
              "rounded-3xl p-8 text-center shadow-sm sm:p-10",
              isApprovedPlan &&
                "border border-emerald-100 bg-white/70 dark:border-emerald-900/60 dark:bg-slate-950/80 dark:shadow-emerald-950/20",
              isPendingPlan &&
                "border border-amber-200 bg-amber-50/80 dark:border-amber-900/60 dark:bg-amber-950/20",
              isRejectedPlan &&
                "border border-rose-200 bg-rose-50/80 dark:border-rose-900/60 dark:bg-rose-950/20",
            )}
          >
            <span
              className={cn(
                "text-sm font-semibold uppercase tracking-[0.3em]",
                isApprovedPlan && "text-emerald-500",
                isPendingPlan && "text-amber-600 dark:text-amber-300",
                isRejectedPlan && "text-rose-600 dark:text-rose-300",
              )}
            >
              {isApprovedPlan
                ? "Plan aprobado"
                : isPendingPlan
                  ? "Plan pendiente"
                  : "Plan rechazado"}
            </span>
            <h1 className="mt-4 text-3xl font-bold text-[#111827] dark:text-slate-100">
              {activePlan.title}
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {isApprovedPlan
                ? "Tu plan ya fue aprobado. Desde acá podés coordinar la videollamada y gestionar tu suscripción."
                : isPendingPlan
                  ? "Tu compra está pendiente de aprobación. El siguiente paso es agendar la videollamada para terminar la activación."
                  : "Tu solicitud no fue aprobada. Podés volver a elegir un plan y reintentar la configuración."}
            </p>

            <div
              className={cn(
                "mt-6 grid gap-6 rounded-2xl p-6 text-left sm:grid-cols-2",
                isApprovedPlan &&
                  "border border-emerald-50 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20",
                isPendingPlan &&
                  "border border-amber-200 bg-white/70 dark:border-amber-900/60 dark:bg-slate-900/60",
                isRejectedPlan &&
                  "border border-rose-200 bg-white/70 dark:border-rose-900/60 dark:bg-slate-900/60",
              )}
            >
              <div>
                <p className="text-xs uppercase tracking-wide text-emerald-600">
                  Vigencia
                </p>
                <p className="text-base font-semibold text-[#111827] dark:text-slate-100">
                  {formatDate(planStatus?.validUntil)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-emerald-600">
                  Identificador
                </p>
                <p className="text-sm font-mono text-[#111827] dark:text-slate-100">
                  {planStatus?.planId ?? "N/D"}
                </p>
              </div>
            </div>

            {activePlan.features.length ? (
              <div className="mt-6 rounded-2xl border border-emerald-100 bg-white p-6 text-left dark:border-emerald-900/60 dark:bg-slate-900/70">
                <p className="text-sm font-semibold text-[#111827] dark:text-slate-100">
                  {isRejectedPlan ? "Plan solicitado" : "Beneficios incluidos"}
                </p>
                <ul className="mt-3 space-y-2 text-sm text-[#4B5563] dark:text-slate-300">
                  {activePlan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              {(isApprovedPlan || isPendingPlan) ? (
                <Button
                  className={cn(
                    "rounded-xl",
                    isApprovedPlan
                      ? "bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
                      : "bg-amber-500 text-white hover:bg-amber-600 dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-400",
                  )}
                  onClick={scheduleVideoCall}
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  Agendar videollamada
                </Button>
              ) : null}
              {isApprovedPlan ? (
                <Button
                  variant="outline"
                  className="rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/60 dark:text-rose-300 dark:hover:bg-rose-950/30"
                  onClick={handleCancelPlan}
                >
                  Cancelar suscripción
                </Button>
              ) : null}
              {isApprovedPlan ? (
                <Button
                  className="rounded-xl bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
                  onClick={triggerPlanChangeFlow}
                >
                  Cambiar plan
                </Button>
              ) : null}
              {isRejectedPlan ? (
                <Button
                  className="rounded-xl bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-500 dark:text-slate-950 dark:hover:bg-rose-400"
                  onClick={triggerPlanChangeFlow}
                >
                  Elegir otro plan
                </Button>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="px-4 py-8 text-center sm:px-8 sm:py-10">
            <span className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-500">
              Planes
            </span>
            <h1 className="mt-3 text-3xl font-bold text-[#111827] dark:text-slate-100 md:text-4xl">
              Elegí el plan que mejor se adapta a tu club
            </h1>
            <p className="mt-3 text-base text-[#4B5563] dark:text-slate-400 md:text-lg">
              Todas las opciones incluyen actualizaciones constantes y acceso a
              la experiencia mejorada de reservas.
            </p>
            {!session?.user?.id ? (
              <p className="mt-4 text-sm text-[#4B5563]/80 dark:text-slate-500">
                Iniciá sesión para contratar un plan o recibir más información.
              </p>
            ) : null}
          </div>
        )}

        {isChangingPlan || !currentPlanStatus || isRejectedPlan ? (
          <>
            {isChangingPlan && (
              <div className="rounded-3xl border border-emerald-100 bg-white/70 p-6 text-center text-sm text-[#4B5563] dark:border-emerald-900/60 dark:bg-slate-950/80 dark:text-slate-400">
                &quot;Seleccioná el nuevo plan que querés activar.&quot;
              </div>
            )}

            <div ref={planGridRef} className="space-y-5">
              <Carousel
                setApi={setCarouselApi}
                opts={{
                  align: "start",
                  containScroll: "trimSnaps",
                }}
                className="mx-auto w-full max-w-6xl"
              >
                <CarouselContent className="items-stretch">
                  {plans.map((plan) => {
                    const isSelected = selectedPlanId === plan.id;
                    const isChangeFlow = Boolean(isApprovedPlan && isChangingPlan);

                    return (
                      <CarouselItem
                        key={plan.id}
                        className="md:basis-1/2"
                      >
                        <article
                          className={cn(
                            "flex h-full flex-col gap-6 rounded-3xl border border-emerald-100 bg-white/80 p-6 shadow-sm shadow-emerald-50 transition hover:shadow-md dark:border-emerald-900/60 dark:bg-slate-950/80 dark:shadow-emerald-950/20",
                            plan.highlight &&
                              "border-emerald-200 ring-1 ring-emerald-200 dark:border-emerald-700/60 dark:ring-emerald-800/60",
                            plan.locked && "opacity-70",
                            isSelected &&
                              !isChangeFlow &&
                              "border-emerald-500 ring-2 dark:border-emerald-400",
                          )}
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between gap-3">
                              <h2 className="text-2xl font-semibold text-[#111827] dark:text-slate-100">
                                {plan.title}
                              </h2>
                              {plan.highlight ? (
                                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                                  Recomendado
                                </span>
                              ) : null}
                            </div>
                            <p className="text-sm text-[#4B5563] dark:text-slate-400">
                              {plan.description}
                            </p>
                          </div>

                          <ul className="space-y-2 text-sm text-[#4B5563] dark:text-slate-300">
                            {plan.features.map((feature) => (
                              <li key={feature} className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-emerald-500" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>

                          <div className="mt-auto">
                            <span className="text-4xl font-bold text-[#111827] dark:text-slate-100">
                              {formatPlanPrice(plan.currency, plan.price)}
                            </span>
                            <span className="ml-1 text-sm text-[#4B5563]/80 dark:text-slate-500">
                              / {plan.frequency}
                            </span>
                          </div>

                          <div className="pt-2">
                            <Button
                              type="button"
                              disabled={plan.locked || redirecting}
                              className={cn(
                                "w-full justify-center rounded-xl px-4 py-3 font-medium transition-all",
                                plan.highlight
                                  ? "bg-emerald-500 text-white shadow-md hover:bg-emerald-600 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
                                  : "border border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-500/60 dark:text-emerald-300 dark:hover:bg-emerald-500/10",
                              )}
                              onClick={() => {
                                if (plan.locked) {
                                  return;
                                }
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
                                  Disponible próximamente
                                </>
                              ) : isChangeFlow ? (
                                "Cambiar a este plan"
                              ) : isSelected ? (
                                "Plan seleccionado"
                              ) : (
                                "Elegir este plan"
                              )}
                            </Button>
                          </div>
                        </article>
                      </CarouselItem>
                    );
                  })}
                </CarouselContent>

                <CarouselPrevious className="left-3 top-auto bottom-3 hidden h-10 w-10 -translate-y-0 border-emerald-200 bg-white/90 text-emerald-700 shadow-sm hover:bg-white disabled:opacity-40 md:flex" />
                <CarouselNext className="right-3 top-auto bottom-3 hidden h-10 w-10 -translate-y-0 border-emerald-200 bg-white/90 text-emerald-700 shadow-sm hover:bg-white disabled:opacity-40 md:flex" />
              </Carousel>

              <div className="flex items-center justify-center gap-2">
                {Array.from({ length: carouselSnapCount || 1 }, (_, index) => (
                  <button
                    key={index}
                    type="button"
                    aria-label={`Ir a la página ${index + 1} del carrusel`}
                    aria-current={currentPlanIndex === index}
                    className={cn(
                      "h-2.5 rounded-full transition-all",
                      currentPlanIndex === index
                        ? "w-8 bg-emerald-500"
                        : "w-2.5 bg-emerald-200 hover:bg-emerald-300 dark:bg-emerald-900/70 dark:hover:bg-emerald-800",
                    )}
                    onClick={() => carouselApi?.scrollTo(index)}
                  />
                ))}
              </div>
            </div>
          </>
        ) : null}

        {selectedPlan && !isChangingPlan ? (
          <div ref={configSectionRef} className="space-y-6">
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200">
              <strong>{selectedPlan.title}</strong> seleccionado. Completa los
              siguientes datos para crear tu club y pasar a Mercado Pago.
            </div>

            

            <section className="grid gap-6 lg:grid-cols-2">
              <article className="rounded-3xl border border-emerald-100 bg-white/80 p-6 shadow-sm dark:border-emerald-900/60 dark:bg-slate-950/80 dark:shadow-emerald-950/20">
                <div className="mb-4 flex items-center gap-2 text-[#111827] dark:text-slate-100">
                  <NotebookPen className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Datos del club</h3>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="clubName">Nombre del club</Label>
                    <Input
                      id="clubName"
                      value={configForm.clubName}
                      onChange={(e) =>
                        handleConfigChange("clubName", e.target.value)
                      }
                      placeholder="Ej. RIR Pádel"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Dirección</Label>
                    <Input
                      id="address"
                      value={configForm.address}
                      onChange={(e) =>
                        handleConfigChange("address", e.target.value)
                      }
                      placeholder="Av. Libertad 123"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="city">Ciudad</Label>
                      <Input
                        id="city"
                        value={configForm.city ?? ""}
                        onChange={(e) =>
                          handleConfigChange("city", e.target.value)
                        }
                        placeholder="Rosario"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="province">Provincia</Label>

                      <Select
                        value={configForm.province ?? ""}
                        onValueChange={(value) =>
                          handleConfigChange("province", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar provincia" />
                        </SelectTrigger>

                        <SelectContent>
                          {ARG_PROVINCES.map((province) => (
                            <SelectItem key={province} value={province}>
                              {province}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Teléfono de contacto</Label>
                    <Input
                      id="contactPhone"
                      value={configForm.contactPhone}
                      onChange={(e) =>
                        handleConfigChange("contactPhone", e.target.value)
                      }
                      placeholder="+5491122334455"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Email de contacto</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={session?.user?.email ?? configForm.contactEmail}
                      onChange={(e) =>
                        handleConfigChange("contactEmail", e.target.value)
                      }
                      placeholder="contacto@club.com"
                    />
                  </div>
                </div>
              </article>

              <article className="rounded-3xl border border-emerald-100 bg-white/80 p-6 shadow-sm dark:border-emerald-900/60 dark:bg-slate-950/80 dark:shadow-emerald-950/20">
                <div className="mb-4 flex items-center gap-2 text-[#111827] dark:text-slate-100">
                  <Settings className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Horarios & tarifas</h3>
                </div>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Duración del turno (min)</Label>
                      <Input
                        type="number"
                        min={30}
                        max={180}
                        step={30}
                        value={configForm.turnDuration}
                        onChange={(event) =>
                          handleConfigChange(
                            "turnDuration",
                            Number(event.target.value) || 0,
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Número de canchas</Label>
                      <Input
                        type="number"
                        min={1}
                        max={12}
                        value={configForm.courtCount}
                        onChange={(event) =>
                          handleConfigChange(
                            "courtCount",
                            Math.max(1, Number(event.target.value) || 1),
                          )
                        }
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-emerald-100 p-4 dark:border-emerald-900/60 dark:bg-slate-900/50">
                    <div>
                      <p className="text-sm font-semibold text-[#111827] dark:text-slate-100">
                        Horario cortado
                      </p>
                      <p className="text-xs text-[#4B5563]/80 dark:text-slate-400">
                        Activá si abrís en dos franjas.
                      </p>
                    </div>
                    <Switch
                      checked={configForm.isDiscontinuous}
                      onCheckedChange={(value) =>
                        handleConfigChange("isDiscontinuous", value)
                      }
                    />
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Apertura (mañana)</Label>
                      <Input
                        type="time"
                        value={configForm.openingMorning}
                        onChange={(event) =>
                          handleConfigChange(
                            "openingMorning",
                            event.target.value,
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Cierre (mañana)</Label>
                      <Input
                        type="time"
                        value={configForm.closingMorning}
                        onChange={(event) =>
                          handleConfigChange(
                            "closingMorning",
                            event.target.value,
                          )
                        }
                      />
                    </div>
                    {configForm.isDiscontinuous ? (
                      <>
                        <div className="space-y-2">
                          <Label>Apertura (tarde)</Label>
                          <Input
                            type="time"
                            value={configForm.openingEvening}
                            onChange={(event) =>
                              handleConfigChange(
                                "openingEvening",
                                event.target.value,
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Cierre (tarde)</Label>
                          <Input
                            type="time"
                            value={configForm.closingEvening}
                            onChange={(event) =>
                              handleConfigChange(
                                "closingEvening",
                                event.target.value,
                              )
                            }
                          />
                        </div>
                      </>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label>Modo de precio</Label>
                    <Select
                      value={configForm.priceMode}
                      onValueChange={(value) =>
                        handleConfigChange(
                          "priceMode",
                          value as ConfigFormState["priceMode"],
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="uniform">Uniforme</SelectItem>
                        <SelectItem value="byCourt">Por cancha</SelectItem>
                        <SelectItem value="byHour">Por hora</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Precio base (USD)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={configForm.basePrice}
                      onChange={(event) =>
                        handleConfigChange(
                          "basePrice",
                          Number(event.target.value) || 0,
                        )
                      }
                    />
                  </div>
                </div>
              </article>

            <ImageUploader
              id="logo"
              label="Logo"
              preview={logoPreview}
              onFileSelect={handleLogoSelect}
              onClear={() => {
                setLogoPreview(null);
                setLogoFile(null);
              }}
            />
            
            <ImageUploader
              id="logo"
              label="Icono"
              preview={iconPreview}
              requireSquare
              onFileSelect={handleIconSelect}
              onClear={() => {
                setIconPreview(null);
                setIconFile(null);
              }}
            />

              <article className="rounded-3xl border border-emerald-100 bg-white/80 p-6 shadow-sm dark:border-emerald-900/60 dark:bg-slate-950/80 dark:shadow-emerald-950/20 lg:col-span-2">
                <div className="mb-4 flex items-center gap-2 text-[#111827] dark:text-slate-100">
                  <CreditCard className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Medios de pago</h3>
                </div>
                <p className="text-sm text-[#4B5563] dark:text-slate-400">
                  Vamos a vincular tu Mercado Pago en el siguiente paso.
                  Próximamente vas a poder guardar múltiples tarjetas y ajustar
                  cobros desde acá.
                </p>
                <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-[#4B5563]/80 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
                  Configuración de tarjetas y preferencias llegará pronto. Por
                  ahora sólo necesitás confirmar los datos anteriores para abrir
                  el checkout seguro.
                </div>
              </article>
            </section>

           

            <div className="border-t border-emerald-100 pt-6 dark:border-emerald-900/60">
              <Button
                type="button"
                className="w-full justify-center rounded-xl bg-emerald-500 px-6 py-3 font-medium text-white shadow-md transition-all hover:bg-emerald-600 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400 md:w-auto"
                disabled={redirecting || createTenantConfigMutation.isPending || !selectedPlan}
                onClick={() => {
                  if (!redirecting) {
                    void handleCompleteSetup();
                  }
                }}
              >
                {redirecting || createTenantConfigMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando datos...
                  </>
                ) : (
                  `Confirmar y pagar ${selectedPlan.title}`
                )}
              </Button>
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200">
            {error}
          </div>
        ) : null}
      </section>
    </main>
  );
}
