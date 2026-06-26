"use client";

import {
  Home,
  CalendarDays,
  Trophy,
  GraduationCap,
  Handshake,
  BarChart3,
  User,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { SectionId } from "@/types/club";
import { useRouter } from "next/navigation";

interface ClubSidebarProps {
  clubName: string;
  clubCity?: string;
  activeSection: SectionId;
  onSectionChange: (section: SectionId) => void;
  icon?: string;
  visibleSections: SectionId[];
}

const navItems = [
  { id: "home" as const, label: "Inicio", icon: Home },
  { id: "turnos" as const, label: "Reservar turno", icon: CalendarDays },
  { id: "match" as const, label: "Match de partido", icon: Handshake },
  { id: "clases" as const, label: "Profesores", icon: GraduationCap },
  { id: "torneos" as const, label: "Torneos", icon: Trophy },
  { id: "ranking" as const, label: "Ranking", icon: BarChart3 },
  { id: "perfil" as const, label: "Perfil", icon: User },
];

export function ClubSidebar({
  clubName,
  clubCity,
  activeSection,
  onSectionChange,
  icon,
  visibleSections,
}: ClubSidebarProps) {
  const router = useRouter();

  const handleSectionChange = (sectionId: SectionId) => {
    onSectionChange(sectionId);
    const url = new URL(window.location.href);
    url.searchParams.set("section", sectionId);
    window.history.replaceState(null, "", url.toString());
  };

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-[#1E2028] bg-[#0A0B0D]"
    >
      <SidebarHeader className="border-b border-[#1E2028] bg-[#0A0B0D] p-0">
        {/* Brand */}
        <div className="flex min-h-[56px] items-center gap-3 px-4 py-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#1E2028] bg-[#101216]">
            <Avatar className="h-6 w-6 rounded-lg">
              <AvatarImage src={icon} alt={clubName} className="rounded-lg object-cover" />
              <AvatarFallback className="rounded-lg bg-[#101216]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/mi-padel-club-icon-circulo-negro.svg" alt="Mi Club Pádel" className="h-4 w-4 opacity-80 invert" />
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex flex-col gap-0 overflow-hidden group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-semibold text-[#F2F3F5]">Mi Club Pádel</span>
          </div>
        </div>

        {/* Club selector card */}
        <div className="border-t border-[#1E2028] px-3 py-3 group-data-[collapsible=icon]:hidden">
          <div className="rounded-xl border border-[#1E2028] bg-[#101216] p-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium uppercase tracking-widest text-[#6B7280]">Tu club</span>
              <span className="rounded-md bg-[#D6FF3D]/15 px-2 py-0.5 text-[10px] font-semibold text-[#D6FF3D]">
                Predeterminado
              </span>
            </div>
            <p className="mt-1 text-sm font-medium text-[#F2F3F5]">{clubName}</p>
            {clubCity && (
              <p className="text-xs text-[#6B7280]">{clubCity}</p>
            )}
            <button
              onClick={() => window.location.href = "https://app.miclubpadel.com"}
              className="mt-2 w-full rounded-lg border border-[#2a3036] bg-[#14161A] px-3 py-1.5 text-xs font-medium text-[#9CA3AF] transition hover:border-[#3a3f48] hover:text-[#F2F3F5]"
            >
              Cambiar de club
            </button>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-[#0A0B0D] py-2">
        <SidebarGroup className="px-3 py-0 group-data-[collapsible=icon]:px-2">
          <SidebarMenu>
            {navItems
              .filter((item) => visibleSections.includes(item.id))
              .map((item) => {
                const isActive = activeSection === item.id;

                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => handleSectionChange(item.id)}
                      className={`h-11 rounded-xl px-3 text-[#9CA3AF] hover:bg-[#14161A] hover:text-[#F2F3F5] ${
                        isActive
                          ? "bg-[#D6FF3D]/10 text-[#D6FF3D] hover:bg-[#D6FF3D]/15 hover:text-[#D6FF3D]"
                          : ""
                      } group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:justify-center`}
                      tooltip={item.label}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="mt-auto border-t border-[#1E2028] bg-[#0A0B0D] p-3">
        <div className="flex items-center gap-3 rounded-xl px-2 py-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#D6FF3D] text-xs font-bold text-[#0A0B0D]">
            V
          </div>
          <div className="flex flex-1 flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-medium text-[#F2F3F5]">Vos</span>
            <span className="truncate text-xs text-[#6B7280]">Cat. 4ª · Masculino</span>
          </div>
          <button className="text-[#6B7280] hover:text-[#F2F3F5] transition group-data-[collapsible=icon]:hidden">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
