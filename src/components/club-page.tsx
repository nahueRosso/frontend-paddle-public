"use client";

import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  SidebarProvider,
  SidebarInset,
  useSidebar,
} from "@/components/ui/sidebar";
import { Menu, PanelLeft } from "lucide-react";
import { ClubSidebar } from "@/components/club-sidebar";
import { ClubHome } from "@/components/club-home";
import { ClubTurnos } from "@/components/club-turnos";
import { ClubLoading } from "@/components/club-loading";
import { ClubNotFound } from "@/components/club-not-found";
import { useTenantConfigBySlugQuery } from "@/hooks/queries/tenant-config";
import type { ClubConfig } from "@/types/tenant-config";
import { SectionId } from "@/types/club";
import { ClubTorneos } from "@/components/club-ranking";
import { ClubProfessors } from "@/components/club-clases";
import { ClubMatch } from "@/components/club-match";
import { ClubPerfil } from "@/components/club-perfil";
import { ClubRankingStandalone } from "@/components/club-ranking-standalone";
import { ClubProvider } from "@/context/club-context";
import { ClubPartnerRequestsDialog } from "@/components/club-partner-requests-dialog";
import { fetchBillingBookingStatus } from "@/lib/api/booking";
import { clearPendingBookingPayments } from "@/lib/pending-booking-payment";
import type { BillingBookingStatusResponse } from "@/types/booking";

function CustomSidebarTrigger() {
  const { toggleSidebar } = useSidebar();
  return (
    <button
      onClick={toggleSidebar}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-[#9CA3AF] transition hover:bg-[#14161A] hover:text-[#F2F3F5]"
    >
      <Menu className="h-5 w-5 md:hidden" />
      <PanelLeft className="hidden h-5 w-5 md:block" />
    </button>
  );
}

interface ClubPageProps {
  slug: string;
  children?: React.ReactNode;
}

export function ClubPage({ slug }: ClubPageProps) {
  const [activeSection, setActiveSection] = useState<SectionId>("home");
  const { toast } = useToast();
  const { data, isLoading, isError } = useTenantConfigBySlugQuery(slug);
  const config = useMemo<ClubConfig | null>(() => {
    const tenantConfig = data?.data;
    if (!tenantConfig) {
      return null;
    }

    return {
      ...tenantConfig,
      id: Number(tenantConfig.id ?? 0),
      slug: tenantConfig.slug ?? slug,
      slogan: tenantConfig.slogan ?? null,
      courts: tenantConfig.courts as ClubConfig["courts"],
      iconUrl: tenantConfig.iconUrl ?? undefined,
      logoUrl: tenantConfig.logoUrl ?? undefined,
      city: tenantConfig.city ?? "",
      province: tenantConfig.province ?? "",
      latitude: tenantConfig.latitude ?? null,
      longitude: tenantConfig.longitude ?? null,
      placeId: tenantConfig.placeId ?? null,
      hasWebBooking: tenantConfig.hasWebBooking ?? false,
      openingMorning: tenantConfig.openingMorning ?? "",
      closingMorning: tenantConfig.closingMorning ?? "",
      openingEvening: tenantConfig.openingEvening ?? undefined,
      closingEvening: tenantConfig.closingEvening ?? undefined,
      peakPrice: tenantConfig.peakPrice ?? undefined,
      peakStart: tenantConfig.peakStart ?? undefined,
      peakEnd: tenantConfig.peakEnd ?? undefined,
    };
  }, [data, slug]);

  const visibleSections = useMemo<SectionId[]>(() => {
    if (!config) {
      return ["home"];
    }

    const features = {
      turnos: config.features?.turnos ?? config.isTurnsEnabled ?? true,
      clases: config.features?.clases ?? config.isClassesEnabled ?? true,
      match: config.features?.match ?? config.isMatchEnabled ?? true,
      torneos:
        config.features?.torneos ?? config.isTournamentsEnabled ?? true,
    };

    return [
      "home",
      ...(features.turnos ? (["turnos"] as const) : []),
      ...(features.match ? (["match"] as const) : []),
      ...(features.clases ? (["clases"] as const) : []),
      ...(features.torneos ? (["torneos"] as const) : []),
      "ranking" as const,
      "perfil" as const,
    ];
  }, [config]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedSection = params.get("section") as SectionId | null;

    if (!requestedSection || !visibleSections.includes(requestedSection)) {
      setActiveSection("home");
      return;
    }

    setActiveSection(requestedSection);
  }, [visibleSections]);

  useEffect(() => {
    const url = new URL(window.location.href);
    const externalReference = url.searchParams.get("external_reference");
    const paymentId = url.searchParams.get("payment_id");
    const paymentStatus = url.searchParams.get("status");
    const hasMercadoPagoReturn =
      Boolean(externalReference) ||
      Boolean(paymentId) ||
      Boolean(paymentStatus);

    if (!hasMercadoPagoReturn) {
      return;
    }

    const requestedSection = url.searchParams.get("section");
    if (requestedSection !== "turnos") {
      url.searchParams.set("section", "turnos");
      window.history.replaceState(null, "", url.toString());
      setActiveSection("turnos");
    }

    const clearMercadoPagoParams = () => {
      const nextUrl = new URL(window.location.href);
      [
        "collection_id",
        "collection_status",
        "payment_id",
        "status",
        "external_reference",
        "merchant_order_id",
        "preference_id",
        "site_id",
        "processing_mode",
        "merchant_account_id",
        "mp_result",
      ].forEach((param) => nextUrl.searchParams.delete(param));
      nextUrl.searchParams.set("section", "turnos");
      window.history.replaceState(null, "", nextUrl.toString());
    };

    const paymentToast = toast({
      title:
        paymentStatus === "approved"
          ? "Pago recibido, confirmando reserva..."
          : paymentStatus === "pending"
            ? "El pago quedo pendiente."
            : paymentStatus === "rejected"
              ? "El pago fue rechazado."
              : "Procesando resultado del pago...",
      duration: 6000,
    });

    if (!externalReference) {
      paymentToast.update({
        title: "No recibimos una referencia valida del pago.",
        variant: "destructive",
        duration: 7000,
      });
      return;
    }

    let cancelled = false;
    let attempts = 0;

    const finalize = (
      nextToast: Parameters<typeof toast>[0],
      response?: BillingBookingStatusResponse | null,
    ) => {
      if (cancelled) {
        return true;
      }

      clearPendingBookingPayments((pending) => {
        const matchesReference =
          pending.externalReference === externalReference;
        const matchesBookingId =
          Boolean(
            response?.bookingId ||
              response?.booking?.id,
          ) &&
          pending.bookingId ===
            (response?.bookingId ?? response?.booking?.id);

        return matchesReference || matchesBookingId;
      });

      paymentToast.update(nextToast);
      clearMercadoPagoParams();
      return true;
    };

    const pollStatus = async () => {
      while (!cancelled && attempts < 10) {
        attempts += 1;

        try {
          const response = await fetchBillingBookingStatus(externalReference);
          const resolvedPaymentStatus =
            String(
              response.paymentStatus ??
                response.billingPayment?.status ??
                response.status ??
                "",
            ).toLowerCase();
          const resolvedBookingStatus =
            String(
              response.bookingStatus ??
                response.booking?.status ??
                response.processedAction ??
                "",
            ).toLowerCase();

          if (
            resolvedBookingStatus === "confirmed" ||
            resolvedPaymentStatus === "approved_confirmed"
          ) {
            finalize(
              {
                title: "Reserva confirmada",
                description: "El backend confirmo el pago y tu turno ya quedo reservado.",
                duration: 7000,
              },
              response,
            );
            break;
          }

          if (
            resolvedBookingStatus === "expired" ||
            resolvedBookingStatus === "cancelled"
          ) {
            finalize(
              {
                title: "La reserva expiro antes de acreditarse el pago.",
                variant: "destructive",
                duration: 7000,
              },
              response,
            );
            break;
          }

          if (
            resolvedPaymentStatus === "rejected" ||
            resolvedPaymentStatus === "failure" ||
            resolvedPaymentStatus === "failed" ||
            resolvedPaymentStatus === "cancelled"
          ) {
            finalize(
              {
                title: "El pago fue rechazado.",
                variant: "destructive",
                duration: 7000,
              },
              response,
            );
            break;
          }

          if (
            resolvedPaymentStatus === "pending" ||
            resolvedPaymentStatus === "in_process"
          ) {
            paymentToast.update({
              title: "El pago quedo pendiente.",
              description: "Seguimos consultando el estado real con el backend.",
              duration: 5000,
            });
          } else {
            paymentToast.update({
              title: "Pago recibido, confirmando reserva...",
              description: "Estamos esperando que el backend termine de procesarlo.",
              duration: 5000,
            });
          }

          await new Promise((resolve) => window.setTimeout(resolve, 3000));
        } catch {
          paymentToast.update({
            title: "No pudimos verificar el estado final del pago.",
            description: "Reintenta en unos segundos desde la seccion de turnos.",
            variant: "destructive",
            duration: 7000,
          });
          clearMercadoPagoParams();
          break;
        }
      }

      if (!cancelled && attempts >= 10) {
        paymentToast.update({
          title: "Seguimos esperando la confirmacion final del pago.",
          description: "Podes revisar el estado desde turnos en unos segundos.",
          duration: 7000,
        });
        clearMercadoPagoParams();
      }
    };

    void pollStatus();

    return () => {
      cancelled = true;
    };
  }, [slug, toast]);

  useEffect(() => {
    if (!visibleSections.includes(activeSection)) {
      setActiveSection("home");
    }
  }, [activeSection, visibleSections]);

  if (isError) return <ClubNotFound />;

  if (isLoading || !config) {
    return (
      <SidebarProvider>
        <SidebarInset>
          <div className="min-h-screen bg-[#0A0B0D]">
            <header className="relative flex items-center justify-between border-b border-[#1E2028] bg-[#0A0B0D] px-4 py-3 lg:px-6">
              <div className="absolute left-4 lg:left-6">
                <CustomSidebarTrigger />
              </div>
              <div className="mx-auto flex min-h-[3rem] items-center">
                <div className="h-10 w-[8rem] rounded-xl border border-[#1E2028] bg-[#101216]" />
              </div>
            </header>
            <main className="flex-1 overflow-auto px-4 py-6 lg:px-6 lg:py-8">
              <div className="mx-auto w-full max-w-6xl">
                <ClubLoading />
              </div>
            </main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <ClubProvider config={config}>
        <ClubPartnerRequestsDialog />
        <ClubSidebar
          clubName={config?.clubName ?? "Cargando..."}
          clubCity={[config?.city, config?.province].filter(Boolean).join(", ") || undefined}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          icon={config?.iconUrl}
          visibleSections={visibleSections}
        />
        <SidebarInset>
          <div className="min-h-screen bg-[#0A0B0D]">
            <header className="relative flex items-center justify-between border-b border-[#1E2028] bg-[#0A0B0D] px-4 py-3 lg:px-6">
              <div className="absolute left-4 lg:left-6">
                <CustomSidebarTrigger />
              </div>

              <div className="mx-auto flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={config?.iconUrl || "/mi-padel-club-icon-circulo-negro.svg"}
                  alt={config.clubName}
                  className="h-7 w-7 rounded-lg object-contain"
                />
                <span className="text-sm font-semibold text-[#F2F3F5]">{config.clubName}</span>
              </div>

              <div className="absolute right-4 lg:right-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D6FF3D] text-xs font-bold text-[#0A0B0D]">
                  V
                </div>
              </div>
            </header>
            <main className="flex-1 overflow-auto px-4 py-6 lg:px-6 lg:py-8">
              <div className="mx-auto w-full max-w-6xl">
                {activeSection === "home" && <ClubHome />}
                {visibleSections.includes("turnos") &&
                  activeSection === "turnos" &&
                  <ClubTurnos />}
                {visibleSections.includes("torneos") &&
                  activeSection === "torneos" &&
                  <ClubTorneos />}
                {visibleSections.includes("clases") &&
                  activeSection === "clases" &&
                  <ClubProfessors />}
                {visibleSections.includes("match") &&
                  activeSection === "match" &&
                  <ClubMatch />}
                {activeSection === "ranking" && <ClubRankingStandalone />}
                {activeSection === "perfil" && <ClubPerfil />}
              </div>
            </main>
          </div>
        </SidebarInset>
      </ClubProvider>
    </SidebarProvider>
  );
}
