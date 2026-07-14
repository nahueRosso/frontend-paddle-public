"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare const google: any;

import { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";
import { isValidPhoneNumber } from "libphonenumber-js";
import { Check, CheckCircle2, Loader2, NotebookPen, Search, Settings, Pencil } from "lucide-react";

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
import { useCreateTenantConfigWithAssetsMutation } from "@/hooks/mutations/tenant-config";
import { ImageUploader } from "@/components/PageImageUploader";
import { ARG_PROVINCES } from "@/const/province";
import type { Plan } from "@/components/landing/plans-section";
import type { Session } from "next-auth";

const MAPS_API_KEY = "AIzaSyDBwO9a-mIRIUBairZ8wT-qMT6-yQjFKbI";

type AddressComponent = {
  long_name: string;
  short_name: string;
  types: string[];
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/á/g, "a")
    .replace(/é/g, "e")
    .replace(/í/g, "i")
    .replace(/ó/g, "o")
    .replace(/ú/g, "u")
    .replace(/ñ/g, "n")
    .replace(/ü/g, "u");
}

function stripProvincePrefix(value: string): string {
  return value.replace(/^(provincia de |provincia del |pcia\.? de |pcia\.? del )/, "").trim();
}

function matchProvince(adminAreaLevel1?: string): string {
  if (!adminAreaLevel1) return "";
  const normalized = stripProvincePrefix(normalize(adminAreaLevel1));
  if (normalized.includes("ciudad autonoma") || normalized === "caba") return "CABA";

  const exact = ARG_PROVINCES.find((option) => normalize(option) === normalized);
  if (exact) return exact;

  return (
    ARG_PROVINCES.find(
      (option) => normalized.includes(normalize(option)) || normalize(option).includes(normalized),
    ) ?? ""
  );
}

function parseAddressComponents(components: AddressComponent[]) {
  const get = (type: string) =>
    components.find((component) => component.types.includes(type))?.long_name;

  const route = get("route");
  const streetNumber = get("street_number");
  const streetAddress = [route, streetNumber].filter(Boolean).join(" ");

  const city =
    get("locality") ??
    get("sublocality_level_1") ??
    get("administrative_area_level_2") ??
    "";

  const province = matchProvince(get("administrative_area_level_1"));

  return { streetAddress, city, province };
}

type ConfigFormState = {
  clubName: string;
  address: string;
  contactPhone: string;
  contactEmail: string;
  city: string;
  province: string;
  latitude: number | null;
  longitude: number | null;
  placeId: string | null;
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
  latitude: null,
  longitude: null,
  placeId: null,
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
  const trimmedCity = configForm.city.trim();
  const trimmedProvince = configForm.province.trim();
  if (!trimmedAddress || !trimmedCity || !trimmedProvince || configForm.latitude == null || configForm.longitude == null) {
    return "Buscá la dirección del club arriba y elegí una sugerencia del mapa.";
  }
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

  const placeInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const [mapsReady, setMapsReady] = useState(false);
  const hasLocation = configForm.latitude != null && configForm.longitude != null;

  const initAutocomplete = useCallback(() => {
    if (!placeInputRef.current || autocompleteRef.current) return;

    const ac = new google.maps.places.Autocomplete(placeInputRef.current, {
      fields: ["place_id", "formatted_address", "geometry", "address_components"],
      componentRestrictions: { country: "ar" },
    });

    ac.addListener("place_changed", () => {
      const place = ac.getPlace();
      if (!place?.geometry?.location || !place.place_id) return;

      const parsed = parseAddressComponents(place.address_components ?? []);

      setConfigForm((prev) => ({
        ...prev,
        address: parsed.streetAddress || place.formatted_address || "",
        city: parsed.city || prev.city,
        province: parsed.province || prev.province,
        latitude: place.geometry.location.lat(),
        longitude: place.geometry.location.lng(),
        placeId: place.place_id,
      }));
    });

    autocompleteRef.current = ac;
  }, []);

  const handleMapsLoad = useCallback(() => {
    setMapsReady(true);
    initAutocomplete();
  }, [initAutocomplete]);

  useEffect(() => {
    if (typeof google !== "undefined" && google?.maps?.places) {
      setMapsReady(true);
      initAutocomplete();
    }
  }, [initAutocomplete]);

  useEffect(() => {
    if (mapsReady) initAutocomplete();
  }, [mapsReady, initAutocomplete]);

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
      if (configForm.latitude != null) formData.append("latitude", String(configForm.latitude));
      if (configForm.longitude != null) formData.append("longitude", String(configForm.longitude));
      if (configForm.placeId) formData.append("placeId", configForm.placeId);
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
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${MAPS_API_KEY}&libraries=places&language=es-AR&region=AR`}
        strategy="afterInteractive"
        onLoad={handleMapsLoad}
      />

      {/* Estilos para el dropdown de sugerencias de Google */}
      <style>{`
        .pac-container {
          z-index: 9999 !important;
          pointer-events: auto !important;
          border-radius: 0.75rem;
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 8px 30px rgba(0,0,0,0.4);
          font-family: inherit;
          margin-top: 4px;
          overflow: hidden;
          background: #0A0B0D;
        }
        .pac-item {
          padding: 10px 14px;
          font-size: 0.875rem;
          cursor: pointer;
          border-top: 1px solid rgba(255,255,255,0.06);
          background: #0A0B0D;
          color: #E4E5E7;
        }
        .pac-item:first-child { border-top: none; }
        .pac-item:hover, .pac-item-selected { background: #101216; }
        .pac-item-query { font-weight: 600; color: #F2F3F5; }
        .pac-matched { color: #D6FF3D; }
        .pac-icon { display: none; }
        .pac-logo::after { display: none; }
      `}</style>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="w-[96vw] sm:!max-w-5xl border-white/[0.07] bg-[#0A0B0D] p-0 text-[#E4E5E7]"
          onInteractOutside={(event) => {
            const target = event.target as HTMLElement;
            if (target.closest(".pac-container")) {
              event.preventDefault();
            }
          }}
        >
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
                  <Label className="text-sm text-[#9CA3AF]">Ubicación del club</Label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
                    <input
                      ref={placeInputRef}
                      type="text"
                      autoComplete="off"
                      placeholder={mapsReady ? "Buscá la dirección del club en Google Maps" : "Cargando mapa..."}
                      className="flex h-10 w-full rounded-md border border-white/10 bg-[#0A0B0D] pl-9 pr-9 py-2 text-sm text-[#E4E5E7] placeholder:text-[#6B7280] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D6FF3D]/40"
                    />
                    {!mapsReady && (
                      <Loader2 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[#6B7280]" />
                    )}
                  </div>

                  {hasLocation ? (
                    <div className="space-y-2 rounded-xl border border-[#D6FF3D]/20 bg-[#0A0B0D] p-3">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#D6FF3D]" />
                        <div className="min-w-0 text-xs text-[#9CA3AF]">
                          <p className="font-medium text-[#E4E5E7]">{configForm.address}</p>
                          <p>{[configForm.city, configForm.province].filter(Boolean).join(", ")}</p>
                        </div>
                      </div>
                      <div className="overflow-hidden rounded-lg border border-white/10">
                        <div className="aspect-video w-full">
                          <iframe
                            title="Vista previa del mapa"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            src={`https://www.google.com/maps/embed/v1/place?key=${MAPS_API_KEY}&q=${configForm.latitude},${configForm.longitude}`}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-[#6B7280]">
                      Buscá y elegí la dirección exacta del club en el mapa.
                    </p>
                  )}
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
