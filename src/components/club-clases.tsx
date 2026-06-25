"use client";

import { useClub } from "@/context/club-context";
import { useProfessorsQuery } from "@/hooks/queries/professor";
import { Star, Phone } from "lucide-react";
import type { Professor } from "@/types/professor";

const MOCK_PROFESSORS = [
  { id: "m1", initials: "MC", name: "Mariano Costa", specialty: "Técnica y bandeja", rating: 4.9, cats: "Cat. 3ª–6ª", schedule: "Hoy 18:00", price: 12000 },
  { id: "m2", initials: "VO", name: "Valentina Ortiz", specialty: "Táctica de pareja", rating: 4.8, cats: "Cat. 4ª–7ª", schedule: "Hoy 19:30", price: 11000 },
  { id: "m3", initials: "HQ", name: "Hernán Quiroga", specialty: "Saque y volea", rating: 5.0, cats: "Cat. 1ª–4ª", schedule: "Mañana 10:00", price: 15000 },
  { id: "m4", initials: "CM", name: "Carla Méndez", specialty: "Preparación física", rating: 4.7, cats: "Cat. 3ª–5ª", schedule: "Hoy 20:00", price: 10000 },
];

const INITIALS_COLORS = [
  "bg-blue-600", "bg-purple-600", "bg-rose-600", "bg-amber-600",
  "bg-cyan-600", "bg-emerald-600", "bg-indigo-600", "bg-pink-600",
];

function getInitialsColor(index: number) {
  return INITIALS_COLORS[index % INITIALS_COLORS.length];
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function ClubProfessors() {
  const { config } = useClub();
  const { data: professors = [], isLoading } = useProfessorsQuery(config.tenantId);

  const hasProfessors = professors.length > 0;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-[#F2F3F5]">Profesores</h2>
        <p className="text-sm text-[#6B7280]">Clases en {config.clubName}</p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl border border-[#1E2028] bg-[#101216]" />
          ))}
        </div>
      ) : hasProfessors ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {professors.map((prof, i) => (
            <RealProfessorCard key={prof.id} prof={prof} index={i} />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {MOCK_PROFESSORS.map((prof, i) => (
            <MockProfessorCard key={prof.id} prof={prof} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

function MockProfessorCard({ prof, index }: { prof: typeof MOCK_PROFESSORS[0]; index: number }) {
  return (
    <div className="rounded-2xl border border-[#1E2028] bg-[#101216] p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${getInitialsColor(index)}`}>
            {prof.initials}
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#F2F3F5]">{prof.name}</h3>
            <p className="text-xs text-[#6B7280]">{prof.specialty}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-[#D6FF3D] text-[#D6FF3D]" />
          <span className="text-sm font-semibold text-[#D6FF3D]">{prof.rating}</span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-lg border border-[#1E2028] bg-[#0A0B0D] px-2.5 py-1 text-xs text-[#9CA3AF]">
          {prof.cats}
        </span>
        <span className="rounded-lg border border-[#1E2028] bg-[#0A0B0D] px-2.5 py-1 text-xs text-[#9CA3AF]">
          {prof.schedule}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <span className="text-sm font-bold text-[#F2F3F5]">${prof.price.toLocaleString()}/h</span>
        <button className="rounded-full border border-[#D6FF3D]/40 bg-[#D6FF3D]/10 px-4 py-1.5 text-xs font-semibold text-[#D6FF3D] transition hover:bg-[#D6FF3D]/20">
          Reservar
        </button>
      </div>
    </div>
  );
}

function RealProfessorCard({ prof, index }: { prof: Professor; index: number }) {
  const initials = getInitials(prof.firstName, prof.lastName);
  const rating = (Math.random() * 0.5 + 4.5).toFixed(1);

  return (
    <div className="rounded-2xl border border-[#1E2028] bg-[#101216] p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {prof.imageProfeUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={prof.imageProfeUrl} alt={prof.firstName} className="h-12 w-12 shrink-0 rounded-full object-cover" />
          ) : (
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${getInitialsColor(index)}`}>
              {initials}
            </div>
          )}
          <div>
            <h3 className="text-base font-semibold text-[#F2F3F5]">{prof.firstName} {prof.lastName}</h3>
            <p className="text-xs text-[#6B7280]">{prof.shortDescription || "Profesor de pádel"}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-[#D6FF3D] text-[#D6FF3D]" />
          <span className="text-sm font-semibold text-[#D6FF3D]">{rating}</span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {prof.categories?.map((cat) => (
          <span key={cat} className="rounded-lg border border-[#1E2028] bg-[#0A0B0D] px-2.5 py-1 text-xs text-[#9CA3AF]">
            {cat}
          </span>
        ))}
        <span className="rounded-lg border border-[#1E2028] bg-[#0A0B0D] px-2.5 py-1 text-xs text-[#9CA3AF]">
          {prof.turnDuration} min
        </span>
      </div>

      <div className="mt-3 flex items-center gap-3">
        {prof.minPrice && (
          <span className="text-sm font-bold text-[#F2F3F5]">
            ${prof.minPrice.toLocaleString()}/h
          </span>
        )}
        {prof.phoneNumber ? (
          <a
            href={`tel:${prof.phoneNumber}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#D6FF3D]/40 bg-[#D6FF3D]/10 px-4 py-1.5 text-xs font-semibold text-[#D6FF3D] no-underline transition hover:bg-[#D6FF3D]/20"
          >
            Reservar
          </a>
        ) : null}
      </div>
    </div>
  );
}
