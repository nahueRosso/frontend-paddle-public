"use client";

import {
  Home,
  CalendarDays,
  Trophy,
  GraduationCap,
  Handshake,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { SectionId } from "@/types/club";

interface ClubSidebarProps {
  clubName: string;
  activeSection: SectionId;
  onSectionChange: (section: SectionId) => void;
  icon?: string;
  visibleSections: SectionId[];
}

const navItems = [
  { id: "home" as const, label: "Inicio", icon: Home, disabled: false },
  {
    id: "turnos" as const,
    label: "Turnos",
    icon: CalendarDays,
    disabled: false,
  },
  {
    id: "clases" as const,
    label: "Clases",
    icon: GraduationCap,
    disabled: false,
  },
  {
    id: "match" as const,
    label: "Buscar partido",
    icon: Handshake,
    disabled: false,
  },
  { id: "torneos" as const, label: "Torneos", icon: Trophy, disabled: false },
];

// export function ClubSidebar({ clubName, icon }: { clubName: string; icon?: string }) {
//   const router = useRouter();
//   const pathname = usePathname();

//   const slug = pathname.split("/")[2];

//   return (
//     <Sidebar collapsible="icon">
//       <SidebarHeader className="border-b border-sidebar-border">
//         <div
//           className="
//   flex items-center gap-3 px-2 py-3
//   group-data-[collapsible=icon]:justify-center
//   group-data-[collapsible=icon]:px-0
// "
//         >
//           <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">

//             <img src={icon || "/images.png"} className="h-4 w-4" />
//           </div>
//           <div className="flex flex-col gap-0.5 overflow-hidden group-data-[collapsible=icon]:hidden">
//             <span className="truncate text-sm font-semibold text-sidebar-foreground">
//               {clubName}
//             </span>
//             <span className="truncate text-xs text-sidebar-foreground/60">
//               Club de Padel
//             </span>
//           </div>
//         </div>
//       </SidebarHeader>

//       <SidebarContent>
//         <SidebarGroup>
//           <SidebarGroupLabel>Menu</SidebarGroupLabel>
//           <SidebarMenu>
//             {navItems.map((item) => {
//               const href =
//                 item.id === "home"
//                   ? `/clubes/${slug}`
//                   : `/clubes/${slug}/${item.id}`;

//               const isActive = pathname === href;

//               return (
//                 <SidebarMenuItem key={item.id}>
//                   <SidebarMenuButton
//                     isActive={isActive}
//                     onClick={() => router.push(href)}
//                   >
//                     <item.icon className="h-4 w-4" />
//                     <span>{item.label}</span>
//                   </SidebarMenuButton>
//                 </SidebarMenuItem>
//               );
//             })}
//           </SidebarMenu>
//         </SidebarGroup>
//       </SidebarContent>

//       <SidebarFooter className="border-t border-sidebar-border group-data-[collapsible=icon]:hidden">
//         <div className="px-2 py-3">
//           <p className="text-xs text-sidebar-foreground/50">
//             Powered by MiClub Pádel
//           </p>
//         </div>
//       </SidebarFooter>
//     </Sidebar>
//   );
// }

export function ClubSidebar({
  clubName,
  activeSection,
  onSectionChange,
  icon,
  visibleSections,
}: ClubSidebarProps) {
  const handleSectionChange = (sectionId: SectionId) => {
    onSectionChange(sectionId);

    const url = new URL(window.location.href);
    url.searchParams.set("section", sectionId);

    window.history.replaceState(null, "", url.toString());
  };

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-emerald-100 bg-white dark:border-emerald-950 dark:bg-slate-950"
    >
      <SidebarHeader className="border-b border-emerald-100 bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-800 p-0 text-white dark:border-emerald-900/70 dark:from-slate-950 dark:via-emerald-950 dark:to-slate-900">
        <div
          className="
  flex min-h-[92px] items-center gap-3 px-4 py-4
  group-data-[collapsible=icon]:justify-center
          group-data-[collapsible=icon]:px-0
"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/15 backdrop-blur">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={icon || "/images.png"}
              alt={clubName}
              className="h-7 w-7 rounded-xl object-cover"
            />
          </div>
          <div className="flex flex-col gap-0.5 overflow-hidden group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-semibold text-white">
              {clubName}
            </span>
            <span className="truncate text-xs text-emerald-100/75">
              Club de Padel
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-white py-4 dark:bg-slate-950">
        <SidebarGroup className="px-3 py-0 group-data-[collapsible=icon]:px-2">
          <SidebarGroupLabel className="px-2 pb-2 text-[11px] uppercase tracking-[0.24em] text-emerald-600 dark:text-emerald-400">
            Navegacion
          </SidebarGroupLabel>
          <SidebarMenu>
            {navItems
              .filter((item) => visibleSections.includes(item.id))
              .map((item) => {
                const isActive = !item.disabled && activeSection === item.id;

                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => {
                        if (!item.disabled) {
                          handleSectionChange(item.id);
                        }
                      }}
                      className={
                        item.disabled
                          ? "h-11 rounded-xl px-3 text-slate-700 cursor-not-allowed opacity-40 pointer-events-auto hover:bg-transparent dark:text-slate-400 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:justify-center"
                          : "h-11 rounded-xl px-3 text-slate-700 data-[active=true]:bg-emerald-50 data-[active=true]:text-emerald-700 hover:bg-emerald-50/80 hover:text-emerald-700 dark:text-slate-300 dark:data-[active=true]:bg-emerald-500/12 dark:data-[active=true]:text-emerald-300 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-300 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:justify-center"
                      }
                      tooltip={item.disabled ? "Proximamente" : item.label}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                      {item.disabled && (
                        <span className="ml-auto text-[10px] uppercase tracking-wider font-medium text-sidebar-foreground/40">
                          Pronto
                        </span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="mt-auto border-t border-emerald-100 bg-white p-3 dark:border-emerald-900/70 dark:bg-slate-950">
        <ThemeToggle
          className="mx-auto h-10 w-10 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900/70 dark:bg-slate-900 dark:text-emerald-300 dark:hover:bg-slate-800"
        />
        <div className="px-1 py-1 group-data-[collapsible=icon]:hidden">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Powered by Miclub Padel
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
