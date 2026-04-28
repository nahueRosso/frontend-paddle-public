// "use client"

// import { useState, useEffect, useCallback } from "react"
// import { GraduationCap, Clock, User, Users } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Skeleton } from "@/components/ui/skeleton"
// import { Progress } from "@/components/ui/progress"
// import type {  ClubClass } from "@/types/club"
// import type { ClubConfig } from "@/types/tenant-config"
// import { cn } from "@/lib/utils"
// import { useClub } from "@/context/club-context"

// const DAYS = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"]
// const LEVELS = ["Todas", "Iniciacion", "Intermedio", "Avanzado"] as const

// export function ClubClases() {
//   const { config } = useClub()
//   const [classes, setClasses] = useState<ClubClass[]>([])
//   const [loading, setLoading] = useState(true)
//   const [selectedDay, setSelectedDay] = useState(() => {
//     const today = new Date().getDay()
//     // Convert JS day (0=Sun) to our index (0=Mon)
//     return today === 0 ? 6 : today - 1
//   })
//   const [selectedLevel, setSelectedLevel] = useState<string>("Todas")

//   const loadClasses = useCallback(async () => {
//     setLoading(true)
//     try {
//     } catch {
//       setClasses([])
//     } finally {
//       setLoading(false)
//     }
//   }, [config.tenantId])

//   useEffect(() => {
//     loadClasses()
//   }, [loadClasses])

//   const filteredClasses = classes
//     .filter((c) => c.dayOfWeek === selectedDay)
//     .filter((c) => selectedLevel === "Todas" || c.level === selectedLevel)
//     .sort((a, b) => a.startTime.localeCompare(b.startTime))

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div>
//         <h2 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
//           Clases de Padel
//         </h2>
//         <p className="mt-1 text-muted-foreground">
//           Consulta el cronograma semanal de clases grupales.
//         </p>
//       </div>

//       {/* Day Tabs */}
//       <div className="flex flex-wrap items-center gap-1.5">
//         {DAYS.map((day, index) => (
//           <Button
//             key={day}
//             variant={selectedDay === index ? "default" : "outline"}
//             size="sm"
//             onClick={() => setSelectedDay(index)}
//             className="min-w-[3.25rem] rounded-full"
//           >
//             {day}
//           </Button>
//         ))}
//       </div>

//       {/* Level Filter */}
//       <div className="flex flex-wrap items-center gap-2">
//         <span className="text-sm font-medium text-muted-foreground">Nivel:</span>
//         {LEVELS.map((level) => (
//           <Button
//             key={level}
//             variant={selectedLevel === level ? "secondary" : "ghost"}
//             size="sm"
//             onClick={() => setSelectedLevel(level)}
//             className="h-8"
//           >
//             {level}
//           </Button>
//         ))}
//       </div>

//       {/* Classes Grid */}
//       {loading ? (
//         <ClasesSkeleton />
//       ) : filteredClasses.length === 0 ? (
//         <ClasesEmpty day={DAYS[selectedDay]} />
//       ) : (
//         <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
//           {filteredClasses.map((cls) => (
//             <ClassCard key={cls.id} cls={cls} />
//           ))}
//         </div>
//       )}
//     </div>
//   )
// }

// function ClassCard({ cls }: { cls: ClubClass }) {
//   const spotsLeft = cls.capacity - cls.enrolled
//   const fillPercent = Math.round((cls.enrolled / cls.capacity) * 100)
//   const isFull = spotsLeft <= 0

//   const levelColor: Record<string, string> = {
//     Iniciacion: "bg-emerald-100 text-emerald-700",
//     Intermedio: "bg-sky-100 text-sky-700",
//     Avanzado: "bg-rose-100 text-rose-700",
//   }

//   return (
//     <Card className={cn(isFull && "opacity-60")}>
//       <CardHeader className="pb-3">
//         <div className="flex items-start justify-between gap-2">
//           <CardTitle className="text-base leading-snug">{cls.title}</CardTitle>
//           <Badge
//             variant="secondary"
//             className={cn("shrink-0 text-xs font-normal", levelColor[cls.level])}
//           >
//             {cls.level}
//           </Badge>
//         </div>
//       </CardHeader>
//       <CardContent className="space-y-3">
//         <div className="flex flex-col gap-2 text-sm text-muted-foreground">
//           <div className="flex items-center gap-2">
//             <Clock className="h-3.5 w-3.5 shrink-0" />
//             <span>
//               {cls.startTime} - {cls.endTime}
//             </span>
//           </div>
//           <div className="flex items-center gap-2">
//             <User className="h-3.5 w-3.5 shrink-0" />
//             <span>{cls.instructor}</span>
//           </div>
//         </div>

//         {/* Capacity Bar */}
//         <div className="space-y-1.5">
//           <div className="flex items-center justify-between text-xs">
//             <span className="flex items-center gap-1 text-muted-foreground">
//               <Users className="h-3 w-3" />
//               {cls.enrolled}/{cls.capacity} alumnos
//             </span>
//             {isFull ? (
//               <span className="font-medium text-destructive">Completo</span>
//             ) : (
//               <span className="text-muted-foreground">
//                 {spotsLeft} {spotsLeft === 1 ? "lugar" : "lugares"}
//               </span>
//             )}
//           </div>
//           <Progress value={fillPercent} className="h-1.5" />
//         </div>
//       </CardContent>
//     </Card>
//   )
// }

// function ClasesEmpty({ day }: { day: string }) {
//   return (
//     <Card>
//       <CardContent className="flex flex-col items-center gap-3 py-16">
//         <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
//           <GraduationCap className="h-6 w-6 text-muted-foreground" />
//         </div>
//         <div className="text-center">
//           <p className="font-medium text-foreground">
//             Sin clases el {day}
//           </p>
//           <p className="text-sm text-muted-foreground">
//             No hay clases programadas para este dia con el filtro seleccionado.
//           </p>
//         </div>
//       </CardContent>
//     </Card>
//   )
// }

// function ClasesSkeleton() {
//   return (
//     <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
//       {Array.from({ length: 3 }).map((_, i) => (
//         <Card key={i}>
//           <CardHeader className="pb-3">
//             <div className="flex items-start justify-between">
//               <Skeleton className="h-5 w-32" />
//               <Skeleton className="h-5 w-20 rounded-full" />
//             </div>
//           </CardHeader>
//           <CardContent className="space-y-3">
//             <div className="space-y-2">
//               <Skeleton className="h-4 w-28" />
//               <Skeleton className="h-4 w-36" />
//             </div>
//             <div className="space-y-1.5">
//               <Skeleton className="h-3 w-full" />
//               <Skeleton className="h-1.5 w-full rounded-full" />
//             </div>
//           </CardContent>
//         </Card>
//       ))}
//     </div>
//   )
// }

"use client";

import { useClub } from "@/context/club-context";
import { useProfessorsQuery } from "@/hooks/queries/professor";
import { ProfessorsSkeleton } from "./professors-skeleton";
import { ProfessorsEmpty } from "./professors-empty";
import { ProfessorCard } from "./professor-card";

export function ClubProfessors() {
  const { config } = useClub();
  const { data: professors = [], isLoading } = useProfessorsQuery(config.tenantId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SectionHeader />
        <ProfessorsSkeleton />
      </div>
    );
  }

  if (professors.length === 0) {
    return (
      <div className="space-y-6">
        <SectionHeader />
        <ProfessorsEmpty />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {professors.map((prof) => (
          <ProfessorCard key={prof.id} prof={prof} />
        ))}
      </div>
    </div>
  );
}

function SectionHeader() {
  return (
    <section className="rounded-[2rem] border border-emerald-100 bg-white/75 p-6 shadow-lg shadow-emerald-100/60 backdrop-blur dark:border-emerald-900/60 dark:bg-slate-950/75 dark:shadow-emerald-950/20">
      <span className="inline-flex rounded-full bg-emerald-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700 dark:bg-emerald-500/12 dark:text-emerald-300">
        Entrenamiento
      </span>
      <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 lg:text-3xl">
        Clases y profesores
      </h2>
      <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-400">
        Elegí el profe ideal para tu nivel y consultá la disponibilidad de
        clases en el club.
      </p>
    </section>
  );
}
