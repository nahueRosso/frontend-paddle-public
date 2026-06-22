"use client";

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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useClub } from "@/context/club-context";

export function ClubHome() {
  const { config } = useClub();

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

  return (
    <div className="space-y-5 sm:space-y-6 lg:space-y-8">
      <section className="overflow-hidden rounded-[1.65rem] border border-emerald-100 bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-800 text-white shadow-xl shadow-emerald-950/10 sm:rounded-[2rem]">
        <div className="grid gap-4 px-4 py-5 sm:gap-6 sm:px-6 sm:py-7 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] lg:gap-8 lg:px-8 lg:py-10">
          <div className="space-y-4 sm:space-y-5">
            <span className="hidden md:inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-100 sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.24em]">
              Espacio del club
            </span>
            <div className="space-y-2 sm:space-y-3">
              <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl md:text-4xl">
                {config.clubName}
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-emerald-50/85 sm:text-base">
                {config.slogan ||
                  "Reserva tu cancha, consulta horarios y encontrá toda la información del club en un solo lugar."}
              </p>
            </div>
          </div>

          <div className="hidden md:grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1">
            <HighlightItem
              label="Ubicacion"
              value={fullAddress || "A confirmar"}
            />
            <HighlightItem
              label="Contacto"
              value={config.contactPhone || config.contactEmail || "Sin contacto publicado"}
            />
          </div>
        </div>
      </section>

      <div
        className={`grid grid-cols-3 md:grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 ${
          showCourtPrice ? "lg:grid-cols-3" : "lg:grid-cols-2"
        }`}
      >
        <StatCard
          icon={LayoutGrid}
          label="Canchas activas"
          value={activeCourts.toString()}
        />
        <StatCard
          icon={Timer}
          label="Duracion de turno"
          value={`${config.turnDuration} min`}
        />
        {showCourtPrice ? (
          <StatCard
            icon={DollarSign}
            label="Precio base"
            value={`$${publicBasePrice.toLocaleString()}`}
          />
        ) : null}
      </div>

      <div className="grid gap-4 sm:gap-5 lg:grid-cols-2 lg:gap-6">
        <Card className="rounded-[1.45rem] border-emerald-100 bg-white/90 shadow-lg shadow-emerald-100/60 dark:border-emerald-900/60 dark:bg-slate-950/80 dark:shadow-emerald-950/20 sm:rounded-[1.75rem]">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base text-slate-900 dark:text-slate-100 sm:text-lg">
              Informacion del club
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3.5 sm:space-y-4">
            <InfoRow icon={MapPin} label="Direccion" value={fullAddress} />
            <InfoRow
              icon={Phone}
              label="Telefono"
              value={config.contactPhone ?? ""}
            />
            <InfoRow icon={Mail} label="Email" value={config.contactEmail ?? ""} />
            <InfoRow
              icon={Clock}
              label="Horarios"
              value={`${config.openingMorning} - ${config.closingMorning}`}
            />
            <OpenDaysBadges openDays={config.openDays} />
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-[1.45rem] border-emerald-100 bg-white/90 shadow-lg shadow-emerald-100/60 dark:border-emerald-900/60 dark:bg-slate-950/80 dark:shadow-emerald-950/20 sm:rounded-[1.75rem]">
          <CardHeader className="flex flex-row items-center justify-between pb-3 sm:pb-4">
            <CardTitle className="text-base text-slate-900 dark:text-slate-100 sm:text-lg">
              Ubicacion
            </CardTitle>
            <a
              href={directionsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-800 shadow-sm transition-colors hover:bg-emerald-100 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-200 dark:hover:bg-emerald-900/50"
            >
              <Navigation className="h-3.5 w-3.5" />
              Cómo llegar
            </a>
          </CardHeader>
          <CardContent className="p-0">
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
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[1.45rem] border-emerald-100 bg-white/90 shadow-lg shadow-emerald-100/60 dark:border-emerald-900/60 dark:bg-slate-950/80 dark:shadow-emerald-950/20 sm:rounded-[1.75rem]">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base text-slate-900 dark:text-slate-100 sm:text-lg">
            Canchas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
            {(config.courts ?? []).map((court, i) => (
              <div
                key={court.id ?? court.number ?? i}
                className="flex items-start gap-3 rounded-[1.2rem] border border-emerald-100 bg-emerald-50/60 p-3.5 dark:border-emerald-900/60 dark:bg-slate-900/70 sm:items-center sm:rounded-2xl sm:p-4"
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-bold sm:h-11 sm:w-11 ${
                    court.active
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {court.number}
                </div>
                <div className="min-w-0 flex flex-col">
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {court.name || `Cancha ${court.number}`}
                  </span>
                  <span className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    {[court.environment, court.structure, court.surface]
                      .filter(Boolean)
                      .join(" / ")}
                    {!court.active && " / Inactiva"}
                  </span>
                  {showCourtPrice && court.price ? (
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                      ${court.price.toLocaleString()}
                    </span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
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
    <Card className="rounded-[1.2rem] border-emerald-100 bg-white/85 shadow-lg shadow-emerald-100/60 dark:border-emerald-900/60 dark:bg-slate-950/75 dark:shadow-emerald-950/20 sm:rounded-[1.5rem]">
      <CardContent className="flex h-5 md:h-18 items-center gap-3 p-4 sm:gap-4 sm:p-5">
        <div className="hidden md:flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 sm:h-12 sm:w-12">
          <Icon className="h-4 w-4 text-emerald-700 sm:h-5 sm:w-5" />
        </div>
        <div>
          <p className="text-xl text-center md:text-start font-bold text-slate-900 dark:text-slate-100 sm:text-2xl">
            {value}
          </p>
          <p className="text-xs text-center md:text-start text-slate-500 dark:text-slate-400 sm:text-sm">
            {label}
          </p>
        </div>
      </CardContent>
    </Card>
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
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500 sm:text-xs sm:tracking-[0.2em]">
          {label}
        </p>
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">
          {value || "No disponible"}
        </p>
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
      <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
      <div className="min-w-0 space-y-1.5">
        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500 sm:text-xs sm:tracking-[0.2em]">
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
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
                    : "bg-slate-100 text-slate-400 line-through dark:bg-slate-800 dark:text-slate-500"
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

function HighlightItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.2rem] border border-white/10 bg-white/10 p-3.5 backdrop-blur sm:rounded-[1.5rem] sm:p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-100/80 sm:text-xs sm:tracking-[0.24em]">
        {label}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-white">{value}</p>
    </div>
  );
}
