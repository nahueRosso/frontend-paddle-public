"use client";

import {
  MapPin,
  Phone,
  Mail,
  Clock,
  LayoutGrid,
  Timer,
  DollarSign,
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

  const mapQuery = encodeURIComponent(fullAddress);

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-800 text-white shadow-xl shadow-emerald-950/10">
        <div className="grid gap-8 px-6 py-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] lg:px-8 lg:py-10">
          <div className="space-y-5">
            <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-100">
              Espacio del club
            </span>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
                {config.clubName}
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-emerald-50/85">
                {config.slogan ||
                  "Reserva tu cancha, consulta horarios y encontrá toda la información del club en un solo lugar."}
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <HighlightItem label="Ubicacion" value={fullAddress || "A confirmar"} />
            <HighlightItem
              label="Contacto"
              value={config.contactPhone || config.contactEmail || "Sin contacto publicado"}
            />
          </div>
        </div>
      </section>

      <div
        className={`grid gap-4 sm:grid-cols-2 ${
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

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-[1.75rem] border-emerald-100 bg-white/90 shadow-lg shadow-emerald-100/60 dark:border-emerald-900/60 dark:bg-slate-950/80 dark:shadow-emerald-950/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-slate-900 dark:text-slate-100">Informacion del club</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-[1.75rem] border-emerald-100 bg-white/90 shadow-lg shadow-emerald-100/60 dark:border-emerald-900/60 dark:bg-slate-950/80 dark:shadow-emerald-950/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-slate-900 dark:text-slate-100">Ubicacion</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="aspect-video w-full">
              <iframe
                title={`Mapa de ${config.clubName}`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${mapQuery}`}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[1.75rem] border-emerald-100 bg-white/90 shadow-lg shadow-emerald-100/60 dark:border-emerald-900/60 dark:bg-slate-950/80 dark:shadow-emerald-950/20">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-slate-900 dark:text-slate-100">Canchas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(config.courts ?? []).map((court, i) => (
              <div
                key={court.id ?? court.number ?? i}
                className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 dark:border-emerald-900/60 dark:bg-slate-900/70"
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-bold ${
                    court.active
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {court.number}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {court.name || `Cancha ${court.number}`}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {court.environment} / {court.structure} / {court.surface}
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
    <Card className="rounded-[1.5rem] border-emerald-100 bg-white/85 shadow-lg shadow-emerald-100/60 dark:border-emerald-900/60 dark:bg-slate-950/75 dark:shadow-emerald-950/20">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100">
          <Icon className="h-5 w-5 text-emerald-700" />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
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
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
          {label}
        </p>
        <p className="text-sm text-slate-700 dark:text-slate-200">{value || "No disponible"}</p>
      </div>
    </div>
  );
}

function HighlightItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-100/80">
        {label}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-white">{value}</p>
    </div>
  );
}
