"use client";

import { useEffect, useMemo, useState } from "react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
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
import { ClubProvider } from "@/context/club-context";
import { ClubPartnerRequestsDialog } from "@/components/club-partner-requests-dialog";

interface ClubPageProps {
  slug: string;
  children?: React.ReactNode;
}

export function ClubPage({ slug }: ClubPageProps) {
  const [activeSection, setActiveSection] = useState<SectionId>("home");
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
      ...(features.clases ? (["clases"] as const) : []),
      ...(features.match ? (["match"] as const) : []),
      ...(features.torneos ? (["torneos"] as const) : []),
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
    if (!visibleSections.includes(activeSection)) {
      setActiveSection("home");
    }
  }, [activeSection, visibleSections]);

  if (isError) return <ClubNotFound />;

  if (isLoading || !config) {
    return (
      <SidebarProvider>
        <SidebarInset>
          <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_38%),linear-gradient(180deg,_#f8fafc_0%,_#ecfdf5_48%,_#f8fafc_100%)] dark:bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_28%),linear-gradient(180deg,_#020617_0%,_#062f2b_40%,_#020617_100%)]">
            <header className="relative flex items-center justify-between border-b border-emerald-100/80 bg-white/75 px-4 py-5 backdrop-blur dark:border-emerald-900/60 dark:bg-slate-950/65 lg:px-6">
              <div className="absolute left-4 lg:left-6">
                <SidebarTrigger />
              </div>

              <div className="mx-auto flex min-h-[4.5rem] items-center">
                <div className="h-20 w-[12rem] rounded-2xl border border-emerald-100/80 bg-white/70 dark:border-emerald-900/60 dark:bg-slate-950/70 sm:h-24" />
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
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          icon={config?.iconUrl}
          visibleSections={visibleSections}
        />
        <SidebarInset>
          <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_38%),linear-gradient(180deg,_#f8fafc_0%,_#ecfdf5_48%,_#f8fafc_100%)] dark:bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_28%),linear-gradient(180deg,_#020617_0%,_#062f2b_40%,_#020617_100%)]">
            <header className="relative flex items-center justify-between border-b border-emerald-100/80 bg-white/75 px-4 py-5 backdrop-blur dark:border-emerald-900/60 dark:bg-slate-950/65 lg:px-6">
              <div className="absolute left-4 lg:left-6">
              <SidebarTrigger />
              </div>

              <div className="mx-auto flex min-h-[4.5rem] items-center">
                <img
                  src={config?.logoUrl || "/canon.webp"}
                  alt={config.clubName}
                  className="h-20 w-auto object-contain sm:h-24"
                />
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
              </div>
            </main>
          </div>
        </SidebarInset>
      </ClubProvider>
    </SidebarProvider>
  );
}
