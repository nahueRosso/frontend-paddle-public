"use client";

import { useClub } from "@/context/club-context";

const MOCK_STATS = [
  { label: "Partidos", value: 48 },
  { label: "Victorias", value: 31 },
  { label: "Torneos", value: 5 },
];

export function ClubPerfil() {
  const { config } = useClub();

  const clubCity = [config.city, config.province].filter(Boolean).join(", ");

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h2 className="text-xl font-bold text-[#F2F3F5]">Perfil</h2>

      {/* User info */}
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#D6FF3D] text-lg font-bold text-[#0A0B0D]">
          V
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#F2F3F5]">Vos</h3>
          <div className="flex gap-2">
            <span className="rounded-md bg-[#D6FF3D]/15 px-2 py-0.5 text-xs font-semibold text-[#D6FF3D]">Cat. 4ª</span>
            <span className="rounded-md border border-[#1E2028] bg-[#101216] px-2 py-0.5 text-xs text-[#9CA3AF]">Masculino</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {MOCK_STATS.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-[#1E2028] bg-[#101216] p-4 text-center">
            <p className="text-2xl font-bold text-[#F2F3F5]">{stat.value}</p>
            <p className="text-xs text-[#6B7280]">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Club card */}
      <div className="rounded-2xl border border-[#1E2028] bg-[#101216] p-5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-medium uppercase tracking-widest text-[#6B7280]">Tu club</span>
          <span className="rounded-md bg-[#D6FF3D]/15 px-2 py-0.5 text-[10px] font-semibold text-[#D6FF3D]">
            Predeterminado
          </span>
        </div>
        <div className="mt-3 flex items-center gap-3">
          {config.iconUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={config.iconUrl} alt={config.clubName} className="h-10 w-10 rounded-xl object-contain" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#1E2028] bg-[#0A0B0D]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/mi-padel-club-icon-circulo-negro.svg" alt="" className="h-5 w-5 invert opacity-60" />
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-[#F2F3F5]">{config.clubName}</p>
            {clubCity && <p className="text-xs text-[#6B7280]">{clubCity}</p>}
          </div>
        </div>
        <button className="mt-3 w-full rounded-lg border border-[#2a3036] bg-[#14161A] px-3 py-2 text-xs font-medium text-[#9CA3AF] transition hover:border-[#3a3f48] hover:text-[#F2F3F5]">
          Cambiar de club
        </button>
      </div>

      {/* Logout */}
      <button className="w-full rounded-2xl border border-[#1E2028] bg-[#101216] px-4 py-3 text-sm font-medium text-rose-400 transition hover:bg-rose-950/20">
        Cerrar sesión
      </button>
    </div>
  );
}
