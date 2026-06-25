"use client";

import { useState } from "react";
import {
  CalendarDays,
  MapPin,
  Phone,
  Mail,
  Clock,
  LayoutGrid,
  Timer,
  DollarSign,
  Navigation,
  ArrowRight,
} from "lucide-react";
import { useClub } from "@/context/club-context";

const MOCK_MATCHES = [
  { id: 1, time: "19:00", players: ["LR", "MD", "JP"], cat: "4ª", sex: "Masculino", court: "Cancha 3", missing: 1 },
  { id: 2, time: "20:30", players: ["TS", "NV"], cat: "4ª", sex: "Masculino", court: "Cancha 1", missing: 2 },
  { id: 3, time: "21:00", players: ["SR", "PV"], cat: "4ª", sex: "Mixto", court: "Cancha 2", missing: 2 },
];

const quickActions = [
  { emoji: "📅", label: "Reservar", section: "turnos" },
  { emoji: "🤝", label: "Match", section: "match" },
  { emoji: "👨‍🏫", label: "Profes", section: "clases" },
  { emoji: "🏆", label: "Torneos", section: "torneos" },
  { emoji: "📊", label: "Ranking", section: "torneos" },
  { emoji: "👤", label: "Perfil", section: "home" },
];

export function ClubHome() {
  const { config } = useClub();
  const [view, setView] = useState<"rapido" | "datos">("rapido");

  if (!config) return null;

  const activeCourts = config.courts?.filter((c) => c.active).length ?? 0;
  const showCourtPrice = config.bookingRules?.showCourtPrice ?? true;
  const publicBasePrice = config.basePrice ?? 0;

  const fullAddress = [config.address, config.city, config.province]
    .filter(Boolean)
    .join(", ");

  const hasCoords = Boolean(config.latitude && config.longitude);

  const mapSrc = hasCoords
    ? `https://www.google.com/maps/embed/v1/place?key=AIzaSyDBwO9a-mIRIUBairZ8wT-qMT6-yQjFKbI&q=${config.latitude},${config.longitude}`
    : `https://www.google.com/maps/embed/v1/place?key=AIzaSyDBwO9a-mIRIUBairZ8wT-qMT6-yQjFKbI&q=${encodeURIComponent(fullAddress)}`;

  const directionsHref = hasCoords
    ? `https://www.google.com/maps/dir/?api=1&destination=${config.latitude},${config.longitude}${config.placeId ? `&destination_place_id=${config.placeId}` : ""}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddress)}`;

  const handleSectionChange = (section: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set("section", section);
    window.location.href = url.toString();
  };

  return (
    <div className="space-y-5">
      {/* Header row: greeting + toggle */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-[#6B7280]">Hola, jugador 👋</p>
          <h1 className="text-xl font-bold text-[#F2F3F5]">{config.clubName}</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wider text-[#4B5563]">Vista</span>
          <div className="flex rounded-xl border border-[#1E2028] bg-[#101216] p-1">
            <button
              onClick={() => setView("rapido")}
              className={`rounded-lg px-4 py-1.5 text-xs font-medium transition ${
                view === "rapido"
                  ? "bg-[#F2F3F5] text-[#0A0B0D]"
                  : "text-[#6B7280] hover:text-[#9CA3AF]"
              }`}
            >
              Rápido
            </button>
            <button
              onClick={() => setView("datos")}
              className={`rounded-lg px-4 py-1.5 text-xs font-medium transition ${
                view === "datos"
                  ? "bg-[#F2F3F5] text-[#0A0B0D]"
                  : "text-[#6B7280] hover:text-[#9CA3AF]"
              }`}
            >
              Datos del club
            </button>
          </div>
        </div>
      </div>

      {view === "rapido" ? (
        <div className="grid gap-5 lg:grid-cols-[1fr_minmax(320px,400px)]">
          {/* Left column: CTA + actions */}
          <div className="space-y-5">
            {/* CTA card */}
            <div
              className="cursor-pointer rounded-2xl border border-[#1E2028] bg-[#101216] p-5 transition hover:border-[#2a3036]"
              onClick={() => handleSectionChange("turnos")}
            >
              <h3 className="text-lg font-semibold text-[#F2F3F5]">Reservá tu primer turno</h3>
              <p className="mt-1 text-sm text-[#6B7280]">
                Mirá la disponibilidad de hoy en {config.clubName} →
              </p>
            </div>

            {/* Quick actions grid with emojis */}
            <div className="grid grid-cols-3 gap-3">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => handleSectionChange(action.section)}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-[#1E2028] bg-[#101216] p-4 transition hover:border-[#2a3036] hover:bg-[#14161A]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1a1d24]">
                    <span className="text-xl">{action.emoji}</span>
                  </div>
                  <span className="text-xs font-medium text-[#9CA3AF]">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right column: Open matches */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#F2F3F5]">Partidos abiertos</h2>
              <button
                onClick={() => handleSectionChange("match")}
                className="text-xs font-medium text-[#D6FF3D]"
              >
                Ver todos
              </button>
            </div>
            <div className="space-y-3">
              {MOCK_MATCHES.map((match) => (
                <div
                  key={match.id}
                  className="flex items-center justify-between rounded-2xl border border-[#1E2028] bg-[#101216] px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-1.5">
                      {match.players.map((p) => (
                        <div
                          key={p}
                          className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#101216] bg-[#1a1d24] text-[9px] font-bold text-[#9CA3AF]"
                        >
                          {p}
                        </div>
                      ))}
                      {match.missing > 0 && (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#101216] bg-[#1a1d24] text-[9px] text-[#4B5563]">
                          +
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#F2F3F5]">
                        Hoy · {match.time}
                      </p>
                      <p className="text-xs text-[#6B7280]">
                        {match.cat} · {match.sex} · {match.court}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full border border-[#D6FF3D]/30 px-3 py-1 text-xs font-semibold text-[#D6FF3D]">
                    Faltan {match.missing}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard icon={LayoutGrid} label="Canchas activas" value={activeCourts.toString()} />
            <StatCard icon={Timer} label="Duración turno" value={`${config.turnDuration} min`} />
            {showCourtPrice && (
              <StatCard icon={DollarSign} label="Precio base" value={`$${publicBasePrice.toLocaleString()}`} />
            )}
          </div>

          {/* Club info + Map */}
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-[#1E2028] bg-[#101216] p-5">
              <h3 className="mb-4 text-base font-semibold text-[#F2F3F5]">Información del club</h3>
              <div className="space-y-3.5">
                <InfoRow icon={MapPin} label="Dirección" value={fullAddress} />
                <InfoRow icon={Phone} label="Teléfono" value={config.contactPhone ?? ""} />
                <InfoRow icon={Mail} label="Email" value={config.contactEmail ?? ""} />
                <InfoRow
                  icon={Clock}
                  label="Horarios"
                  value={`${config.openingMorning} - ${config.closingMorning}`}
                />
                <OpenDaysBadges openDays={config.openDays} />
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#1E2028] bg-[#101216]">
              <div className="flex items-center justify-between p-5 pb-3">
                <h3 className="text-base font-semibold text-[#F2F3F5]">Ubicación</h3>
                <a
                  href={directionsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#2a3036] bg-[#14161A] px-3 py-1.5 text-xs font-medium text-[#D6FF3D] no-underline transition hover:bg-[#1a1d24]"
                >
                  <Navigation className="h-3.5 w-3.5" />
                  Cómo llegar
                </a>
              </div>
              <div className="aspect-[4/3] w-full sm:aspect-video">
                <iframe
                  title={`Mapa de ${config.clubName}`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={mapSrc}
                />
              </div>
            </div>
          </div>

          {/* Courts */}
          <div className="rounded-2xl border border-[#1E2028] bg-[#101216] p-5">
            <h3 className="mb-4 text-base font-semibold text-[#F2F3F5]">Canchas</h3>
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {(config.courts ?? []).map((court, i) => (
                <div
                  key={court.id ?? court.number ?? i}
                  className="flex items-center gap-3 rounded-xl border border-[#1E2028] bg-[#0A0B0D] p-3.5"
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                      court.active
                        ? "bg-[#D6FF3D] text-[#0A0B0D]"
                        : "bg-[#1a1d24] text-[#4B5563]"
                    }`}
                  >
                    {court.number}
                  </div>
                  <div className="min-w-0 flex flex-col">
                    <span className="text-sm font-medium text-[#F2F3F5]">
                      {court.name || `Cancha ${court.number}`}
                    </span>
                    <span className="text-xs text-[#6B7280]">
                      {[court.environment, court.structure, court.surface]
                        .filter(Boolean)
                        .join(" / ")}
                      {!court.active && " / Inactiva"}
                    </span>
                    {showCourtPrice && court.price ? (
                      <span className="text-xs font-semibold text-[#D6FF3D]">
                        ${court.price.toLocaleString()}
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[#1E2028] bg-[#101216] p-4">
      <div className="hidden md:flex h-10 w-10 items-center justify-center rounded-xl bg-[#1a1d24] mb-2">
        <Icon className="h-4 w-4 text-[#D6FF3D]" />
      </div>
      <p className="text-xl text-center md:text-start font-bold text-[#F2F3F5]">{value}</p>
      <p className="text-xs text-center md:text-start text-[#6B7280]">{label}</p>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#D6FF3D]" />
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-widest text-[#4B5563]">{label}</p>
        <p className="text-sm text-[#E4E5E7]">{value || "No disponible"}</p>
      </div>
    </div>
  );
}

const WEEKDAY_LABELS: Record<number, string> = {
  1: "Lun", 2: "Mar", 3: "Mié", 4: "Jue", 5: "Vie", 6: "Sáb", 0: "Dom",
};
const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

function OpenDaysBadges({ openDays }: { openDays?: number[] }) {
  const days = openDays ?? WEEKDAY_ORDER;
  return (
    <div className="flex items-start gap-3">
      <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-[#D6FF3D]" />
      <div className="min-w-0 space-y-1.5">
        <p className="text-[10px] font-medium uppercase tracking-widest text-[#4B5563]">
          Días de apertura
        </p>
        <div className="flex flex-wrap gap-1.5">
          {WEEKDAY_ORDER.map((day) => {
            const isOpen = days.includes(day);
            return (
              <span
                key={day}
                className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${
                  isOpen
                    ? "bg-[#D6FF3D]/10 text-[#D6FF3D]"
                    : "bg-[#1a1d24] text-[#4B5563] line-through"
                }`}
              >
                {WEEKDAY_LABELS[day]}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
