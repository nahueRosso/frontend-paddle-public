"use client";

import { useState } from "react";
import { isValidPhoneNumber } from "libphonenumber-js";
import { Check, Loader2, NotebookPen, Settings, Pencil } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateTenantConfigWithAssetsMutation } from "@/hooks/mutations/tenant-config";
import { ImageUploader } from "@/components/PageImageUploader";
import { ARG_PROVINCES } from "@/const/province";
import { CityCombobox } from "@/components/ui/city-combobox";
import type { Plan } from "@/components/landing/plans-section";
import type { Session } from "next-auth";

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
  closingMorning: "23:00",
  openingEvening: "16:00",
  closingEvening: "22:00",
  priceMode: "uniform",
  basePrice: 0,
  courtCount: 2,
};

const TIME_PATTERN = /^\d{2}:\d{2}$/;

function validateInitialConfig(configForm: ConfigFormState, contactEmail: string) {
  const trimmedClubName = configForm.clubName.trim();
  if (trimmedClubName.length < 2 || trimmedClubName.length > 50) return "El nombre del club debe tener entre 2 y 50 caracteres.";
  const trimmedAddress = configForm.address.trim();
  if (trimmedAddress.length < 2 || trimmedAddress.length > 100) return "La dirección debe tener entre 2 y 100 caracteres.";
  const trimmedCity = configForm.city.trim();
  if (trimmedCity.length < 2 || trimmedCity.length > 50) return "La ciudad debe tener entre 2 y 50 caracteres.";
  const trimmedProvince = configForm.province.trim();
  if (trimmedProvince.length < 2 || trimmedProvince.length > 50) return "La provincia debe tener entre 2 y 50 caracteres.";
  const trimmedPhone = configForm.contactPhone.trim();
  if (!trimmedPhone || !isValidPhoneNumber(trimmedPhone)) return "Ingresá un teléfono de contacto válido con código de país (ej: +5491122334455).";
  const trimmedEmail = contactEmail.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) return "Ingresá un email de contacto válido.";
  if (!Number.isInteger(configForm.courtCount) || configForm.courtCount < 1) return "Ingresá una cantidad válida de canchas.";
  if (!TIME_PATTERN.test(configForm.openingMorning)) return "La apertura debe tener formato HH:mm.";
  if (!TIME_PATTERN.test(configForm.closingMorning)) return "El cierre debe tener formato HH:mm.";
  return null;
}

interface PlanConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPlan: Plan;
  session: Session | null;
  onSuccess: () => Promise<void>;
}

export function PlanConfigDialog({
  open,
  onOpenChange,
  selectedPlan,
  session,
  onSuccess,
}: PlanConfigDialogProps) {
  const [configForm, setConfigForm] = useState<ConfigFormState>(defaultConfig);
  const [error, setError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [showLegalDialog, setShowLegalDialog] = useState(false);

  const createTenantConfigMutation = useCreateTenantConfigWithAssetsMutation();

  const handleConfigChange = <Field extends keyof ConfigFormState>(
    field: Field,
    value: ConfigFormState[Field],
  ) => {
    setConfigForm((prev) => ({ ...prev, [field]: value }));
  };

  const buildCourts = () =>
    Array.from({ length: Math.max(1, configForm.courtCount) }).map((_, i) => ({
      number: i + 1,
      active: true,
    }));

  const handleCompleteSetup = async () => {
    if (!session?.user?.id || !selectedPlan) {
      setError("Necesitás elegir un plan e iniciar sesión.");
      return;
    }
    const contactEmail = session.user.email || configForm.contactEmail;
    const validationError = validateInitialConfig(configForm, contactEmail);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setRedirecting(true);
    try {
      const formData = new FormData();
      if (logoFile) formData.append("logo", logoFile);
      if (iconFile) formData.append("icon", iconFile);
      formData.append("planName", selectedPlan.id);
      formData.append("email", session.user.email || "");
      formData.append("tenantId", session.user.id);
      formData.append("clubName", configForm.clubName.trim());
      formData.append("address", configForm.address.trim());
      formData.append("province", configForm.province.trim());
      formData.append("city", configForm.city.trim());
      formData.append("contactPhone", configForm.contactPhone.trim());
      formData.append("contactEmail", (contactEmail as string).trim());
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

      await createTenantConfigMutation.mutateAsync({
        tenantId: session.user.id,
        formData,
      });
      await onSuccess();
    } catch {
      setError("No pudimos guardar la configuración inicial.");
    } finally {
      setRedirecting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[96vw] sm:!max-w-5xl border-white/[0.07] bg-[#0A0B0D] p-0 text-[#E4E5E7]">
          {/* Header */}
          <DialogHeader className="border-b border-white/[0.07] px-6 pt-6 pb-5 sm:px-8">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#D6FF3D]/10">
                <Pencil className="h-5 w-5 text-[#D6FF3D]" />
              </div>
              <div>
                <DialogTitle className="font-heading text-xl text-[#F2F3F5]">
                  Configurá tu club
                </DialogTitle>
                <p className="mt-1 text-sm text-[#6B7280]">
                  Completá los datos para crear el club y activar la prueba gratis.
                </p>
              </div>
            </div>
          </DialogHeader>

          {/* Body - 2 columns */}
          <div className="grid gap-5 px-6 py-5 sm:px-8 md:grid-cols-2">
            {/* Left: Club data */}
            <div className="rounded-2xl border border-white/[0.07] bg-[#101216] p-5">
              <div className="mb-4 flex items-center gap-2 text-[#F2F3F5]">
                <NotebookPen className="h-5 w-5" />
                <h3 className="text-base font-semibold">Datos del club</h3>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-sm text-[#9CA3AF]">Nombre del club</Label>
                  <Input
                    value={configForm.clubName}
                    minLength={2}
                    maxLength={50}
                    onChange={(e) => handleConfigChange("clubName", e.target.value)}
                    placeholder="Ej. RIR Pádel"
                    className="border-white/10 bg-[#0A0B0D] text-[#E4E5E7]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm text-[#9CA3AF]">Dirección</Label>
                  <Input
                    value={configForm.address}
                    minLength={2}
                    maxLength={100}
                    onChange={(e) => handleConfigChange("address", e.target.value)}
                    placeholder="Av. Libertad 123"
                    className="border-white/10 bg-[#0A0B0D] text-[#E4E5E7]"
                  />
                </div>

                <div className="grid gap-3 grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-sm text-[#9CA3AF]">Provincia</Label>
                    <Select
                      value={configForm.province ?? ""}
                      onValueChange={(v) => {
                        handleConfigChange("province", v);
                        handleConfigChange("city", "");
                      }}
                    >
                      <SelectTrigger className="border-white/10 bg-[#0A0B0D] text-[#E4E5E7]">
                        <SelectValue placeholder="Seleccionar provincia" />
                      </SelectTrigger>
                      <SelectContent>
                        {ARG_PROVINCES.map((p) => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm text-[#9CA3AF]">Ciudad</Label>
                    <CityCombobox
                      province={configForm.province}
                      value={configForm.city}
                      onChange={(val) => handleConfigChange("city", val)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm text-[#9CA3AF]">Teléfono de contacto</Label>
                  <PhoneInput
                    value={configForm.contactPhone}
                    onChange={(val) => handleConfigChange("contactPhone", val)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm text-[#9CA3AF]">Email de contacto</Label>
                  <Input
                    type="email"
                    maxLength={254}
                    value={session?.user?.email ?? configForm.contactEmail}
                    onChange={(e) => handleConfigChange("contactEmail", e.target.value)}
                    placeholder="contacto@club.com"
                    className="border-white/10 bg-[#0A0B0D] text-[#E4E5E7]"
                  />
                </div>
              </div>
            </div>

            {/* Right: Schedule + images */}
            <div className="space-y-6">
              {/* Horarios */}
              <div className="rounded-2xl border border-white/[0.07] bg-[#101216] p-5">
                <div className="mb-4 flex items-center gap-2 text-[#F2F3F5]">
                  <Settings className="h-5 w-5" />
                  <h3 className="text-base font-semibold">Horarios & canchas</h3>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-sm text-[#9CA3AF]">Número de canchas</Label>
                    <Input
                      type="number"
                      min={1}
                      max={12}
                      step={1}
                      value={configForm.courtCount}
                      onChange={(e) => handleConfigChange("courtCount", Math.max(1, Number(e.target.value) || 1))}
                      className="border-white/10 bg-[#0A0B0D] text-[#E4E5E7]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-sm text-[#9CA3AF]">Apertura</Label>
                      <Input
                        type="time"
                        value={configForm.openingMorning}
                        onChange={(e) => handleConfigChange("openingMorning", e.target.value)}
                        className="border-white/10 bg-[#0A0B0D] text-[#E4E5E7]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm text-[#9CA3AF]">Cierre</Label>
                      <Input
                        type="time"
                        value={configForm.closingMorning}
                        onChange={(e) => handleConfigChange("closingMorning", e.target.value)}
                        className="border-white/10 bg-[#0A0B0D] text-[#E4E5E7]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Images side by side */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-dashed border-[#D6FF3D]/20 bg-[#101216] p-3">
                  <ImageUploader
                    id="dlg-logo"
                    label="Logo"
                    preview={logoPreview}
                    aspectRatio={3 / 2}
                    exportWidth={1500}
                    exportHeight={1000}
                    onFileSelect={(f, url) => { setLogoPreview(url); setLogoFile(f); }}
                    onClear={() => { setLogoPreview(null); setLogoFile(null); }}
                  />
                </div>
                <div className="rounded-xl border border-dashed border-[#D6FF3D]/20 bg-[#101216] p-3">
                  <ImageUploader
                    id="dlg-icon"
                    label="Icono"
                    preview={iconPreview}
                    aspectRatio={1}
                    exportWidth={1000}
                    exportHeight={1000}
                    onFileSelect={(f, url) => { setIconPreview(url); setIconFile(f); }}
                    onClear={() => { setIconPreview(null); setIconFile(null); }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-white/[0.07] px-6 py-4 sm:px-8">
            <p className="text-sm text-[#6B7280]">Podés editar todo después desde el panel.</p>

            {error ? (
              <div className="mx-4 flex-1 rounded-lg border border-rose-800 bg-rose-950/30 px-3 py-2 text-xs text-rose-200">
                {error}
              </div>
            ) : null}

            <Button
              type="button"
              className="rounded-xl bg-[#D6FF3D] px-6 py-3 font-semibold text-[#0A0B0D] transition-all hover:bg-[#e4ff6a]"
              disabled={redirecting || createTenantConfigMutation.isPending}
              onClick={() => { if (!redirecting) setShowLegalDialog(true); }}
            >
              {redirecting || createTenantConfigMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Crear club y empezar"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showLegalDialog} onOpenChange={setShowLegalDialog}>
        <AlertDialogContent className="max-w-lg border-white/[0.07] bg-[#0A0B0D] p-8">
          <AlertDialogHeader className="gap-3">
            <AlertDialogTitle className="text-xl font-semibold text-[#F2F3F5]">
              Antes de continuar
            </AlertDialogTitle>
            <AlertDialogDescription className="sr-only">
              Revisá nuestros documentos legales antes de confirmar tu plan.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-5 text-sm text-[#9CA3AF]">
            <p className="leading-relaxed">
              Nuestra plataforma cumple con la{" "}
              <strong className="text-[#F2F3F5]">Ley N.° 25.326</strong> de Protección de Datos
              Personales de la República Argentina. Te recomendamos leer los siguientes documentos:
            </p>

            <div className="rounded-xl border border-white/10 bg-[#111417] p-4">
              <ul className="space-y-3">
                {[
                  { href: "/terminos", label: "Términos y Condiciones" },
                  { href: "/privacidad", label: "Política de Privacidad" },
                  { href: "/como-eliminar-datos", label: "Cómo eliminar mis datos" },
                ].map((doc) => (
                  <li key={doc.href} className="flex items-center gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#D6FF3D]/10">
                      <Check className="h-3 w-3 text-[#D6FF3D]" />
                    </span>
                    <a
                      href={doc.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-[#D6FF3D] underline underline-offset-4 hover:text-[#e4ff6a]"
                    >
                      {doc.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-xs text-[#6B7280]">
              Al hacer clic en <strong className="text-[#9CA3AF]">Confirmar y continuar</strong>{" "}
              aceptás haber leído estos documentos y que procesemos tu información de acuerdo con
              nuestra Política de Privacidad.
            </p>
          </div>

          <AlertDialogFooter className="mt-2 gap-2">
            <AlertDialogCancel className="rounded-xl border-white/10 bg-[#111417] text-[#9CA3AF] hover:bg-[#1A1D21]">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-[#D6FF3D] font-medium text-[#0A0B0D] hover:bg-[#e4ff6a]"
              onClick={() => void handleCompleteSetup()}
            >
              Confirmar y continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
