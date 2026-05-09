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
      <span className="hidden md:inline-flex rounded-full bg-emerald-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700 dark:bg-emerald-500/12 dark:text-emerald-300">
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
