"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  CreditCard,
  Loader2,
  Lock,
  NotebookPen,
  Settings,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
import { useCreateTenantConfigWithAssetsMutation } from "@/hooks/mutations/tenant-config";
import { useAuth } from "@/hooks/use-auth";
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

const plans: Plan[] = [
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
  const { session, planStatus } = useAuth();
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
  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId) ?? null;
  const activePlan = useMemo(() => {
    if (!planStatus?.active) {
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
  }, [planStatus]);

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
      
      router.push("/contacto");
    } catch (err) {
      console.error(err);
      setError("No pudimos guardar la configuración inicial.");
      setRedirecting(false);
    }
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
        {planStatus?.active && activePlan && !isChangingPlan ? (
          <div className="rounded-3xl border border-emerald-100 bg-white/70 p-8 text-center shadow-sm dark:border-emerald-900/60 dark:bg-slate-950/80 dark:shadow-emerald-950/20 sm:p-10">
            <span className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-500">
              Plan activo
            </span>
            <h1 className="mt-4 text-3xl font-bold text-[#111827] dark:text-slate-100">
              {activePlan.title}
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {planStatus.status === "pending"
                ? "Tu suscripción está en verificación. Te avisaremos cuando se confirme el pago."
                : "Actualmente estás disfrutando de todas las funciones de este plan."}
            </p>

            <div className="mt-6 grid gap-6 rounded-2xl border border-emerald-50 bg-emerald-50/50 p-6 text-left dark:border-emerald-900/50 dark:bg-emerald-950/20 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-emerald-600">
                  Vigencia
                </p>
                <p className="text-base font-semibold text-[#111827] dark:text-slate-100">
                  {formatDate(planStatus.validUntil)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-emerald-600">
                  Identificador
                </p>
                <p className="text-sm font-mono text-[#111827] dark:text-slate-100">
                  {planStatus.planId ?? "N/D"}
                </p>
              </div>
            </div>

            {activePlan.features.length ? (
              <div className="mt-6 rounded-2xl border border-emerald-100 bg-white p-6 text-left dark:border-emerald-900/60 dark:bg-slate-900/70">
                <p className="text-sm font-semibold text-[#111827] dark:text-slate-100">
                  Beneficios incluidos
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
                <Button
                  variant="outline"
                  className="rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/60 dark:text-rose-300 dark:hover:bg-rose-950/30"
                onClick={handleCancelPlan}
              >
                Cancelar suscripción
              </Button>
                <Button
                className="rounded-xl bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
                onClick={triggerPlanChangeFlow}
              >
                Cambiar plan
              </Button>
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

        {(planStatus?.active && isChangingPlan) || !planStatus?.active ? (
          <>
            {planStatus?.active && (
              <div className="rounded-3xl border border-emerald-100 bg-white/70 p-6 text-center text-sm text-[#4B5563] dark:border-emerald-900/60 dark:bg-slate-950/80 dark:text-slate-400">
                "Seleccioná el nuevo plan que querés activar."
              </div>
            )}

            <div
              ref={planGridRef}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2"
            >
              {plans.map((plan) => {
                const isSelected = selectedPlanId === plan.id;
                const isChangeFlow = Boolean(
                  planStatus?.active && isChangingPlan,
                );
                return (
                  <article
                    key={plan.id}
                    className={cn(
                      "flex flex-col gap-6 rounded-3xl border border-emerald-100 bg-white/80 p-6 shadow-sm shadow-emerald-50 transition hover:shadow-md dark:border-emerald-900/60 dark:bg-slate-950/80 dark:shadow-emerald-950/20",
                      plan.highlight &&
                        "border-emerald-200 ring-1 ring-emerald-200 dark:border-emerald-700/60 dark:ring-emerald-800/60",
                      plan.locked && "opacity-70",
                      isSelected &&
                        !isChangeFlow &&
                        "border-emerald-500 ring-2 dark:border-emerald-400",
                    )}
                  >
                    <div>
                      <h2 className="text-2xl font-semibold text-[#111827] dark:text-slate-100">
                        {plan.title}
                      </h2>
                      <p className="mt-2 text-sm text-[#4B5563] dark:text-slate-400">
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

                    <div>
                      <span className="text-4xl font-bold text-[#111827] dark:text-slate-100">
                        {plan.currency} {plan.price}
                      </span>
                      <span className="ml-1 text-sm text-[#4B5563]/80 dark:text-slate-500">
                        / {plan.frequency}
                      </span>
                    </div>

                    <div className="mt-auto pt-2">
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
                );
              })}
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
