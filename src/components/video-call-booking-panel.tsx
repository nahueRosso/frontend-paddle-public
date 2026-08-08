"use client";

import { useEffect, useMemo, useState } from "react";
import type { Session } from "next-auth";
import { AlertCircle, CalendarDays, CheckCircle2, Clock3, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  CalenderApiError,
  type CalenderAvailability,
  type CalenderAvailabilitySlot,
  type CalenderBooking,
  cancelCalenderBooking,
  createCalenderBooking,
  getCalenderAvailability,
  getMyCalenderBooking,
} from "@/lib/api/calender";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";

type SessionWithProfile = Session & {
  profile?: { sub?: unknown };
  user?: Session["user"] & { id?: string };
};

type VideoCallBookingPanelProps = {
  session: Session | null;
  onBooked?: () => void;
  defaultPhone?: string;
};

function getGoogleId(session: Session | null): string | undefined {
  const ext = session as SessionWithProfile | null;
  return typeof ext?.profile?.sub === "string" ? ext.profile.sub : undefined;
}

function formatDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, (month ?? 1) - 1, day ?? 1);
  return new Intl.DateTimeFormat("es-AR", { weekday: "short", day: "2-digit", month: "short" }).format(date);
}

function formatDateLong(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, (month ?? 1) - 1, day ?? 1);
  return new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "long", year: "numeric" }).format(date);
}

function formatDateToIsoLocal(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getStatusLabel(status: string) {
  switch (status) {
    case "scheduled": return "Programada";
    case "pending": return "Pendiente";
    case "cancelled": return "Cancelada";
    case "completed": return "Completada";
    default: return status;
  }
}

function isConflictError(error: unknown) {
  if (!(error instanceof CalenderApiError)) return false;
  if (error.status === 409) return true;
  const msg = error.message.toLowerCase();
  return msg.includes("ya tiene") || msg.includes("reserva activa") || msg.includes("reunión pendiente") || msg.includes("reunion pendiente");
}

export function VideoCallBookingPanel({ session, onBooked, defaultPhone }: VideoCallBookingPanelProps) {
  const [booking, setBooking] = useState<CalenderBooking | null>(null);
  const [meetingStatus, setMeetingStatus] = useState<"scheduled" | "available" | "not_trial" | null>(null);
  const [availability, setAvailability] = useState<CalenderAvailability | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<CalenderAvailabilitySlot | null>(null);
  const [loadingBooking, setLoadingBooking] = useState(false);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phoneNumber] = useState(defaultPhone ?? "");

  const googleId = useMemo(() => getGoogleId(session), [session]);
  const sessionEmail = session?.user?.email?.trim() ?? "";
  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);
  const maxDate = useMemo(() => { const d = new Date(today); d.setDate(d.getDate() + 15); return d; }, [today]);

  const loadBooking = async (email: string) => {
    setLoadingBooking(true);
    setError(null);
    try {
      const response = await getMyCalenderBooking(email);
      setMeetingStatus(
        response.meetingStatus === "scheduled" || response.meetingStatus === "available" || response.meetingStatus === "not_trial"
          ? response.meetingStatus : null,
      );
      setBooking(response.hasActiveBooking ? response.booking : null);
      if (!response.hasActiveBooking) { setAvailability(null); setSelectedSlot(null); }
    } catch (e) {
      setBooking(null);
      setMeetingStatus(null);
      setError(e instanceof Error ? e.message : "No pudimos consultar tu reserva actual.");
    } finally {
      setLoadingBooking(false);
    }
  };

  useEffect(() => {
    if (sessionEmail) void loadBooking(sessionEmail);
    else setError("No pudimos identificar tu email de sesión.");
  }, [sessionEmail]);

  useEffect(() => {
    if (booking || meetingStatus !== "available" || !selectedDate) return;
    let cancelled = false;
    const load = async () => {
      setLoadingAvailability(true);
      setSelectedSlot(null);
      setAvailability(null);
      setError(null);
      try {
        const res = await getCalenderAvailability(formatDateToIsoLocal(selectedDate));
        if (!cancelled) setAvailability(res);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "No pudimos obtener la disponibilidad.");
      } finally {
        if (!cancelled) setLoadingAvailability(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [booking, meetingStatus, selectedDate]);

  const handleCancelBooking = async () => {
    if (!booking) return;
    setCancelling(true);
    setError(null);
    try {
      const res = await cancelCalenderBooking(booking.id);
      toast.success(res.message || "Reserva cancelada.");
      await loadBooking(sessionEmail);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos cancelar la reserva.");
    } finally {
      setCancelling(false);
    }
  };

  const handleReserve = async () => {
    if (!selectedDate || !selectedSlot || !availability) {
      setError("Elegí una fecha y un horario disponible antes de reservar.");
      return;
    }
    const name = session?.user?.name?.trim() || sessionEmail.split("@")[0] || "Usuario";
    const dateLabel = formatDateLong(formatDateToIsoLocal(selectedDate));
    if (!name || !sessionEmail) { setError("No pudimos obtener tus datos."); return; }
    setSubmitting(true);
    setError(null);
    try {
      await createCalenderBooking({
        name,
        email: sessionEmail,
        phoneNumber: phoneNumber.trim(),
        bookingDate: formatDateToIsoLocal(selectedDate),
        startTime: selectedSlot.startTime,
        durationMinutes: availability.durationMinutes,
        notes: `Reservó videollamada para el ${dateLabel}.`,
        ...(googleId ? { googleId } : {}),
      });
      toast.success("Videollamada reservada correctamente.");
      await loadBooking(sessionEmail);
      onBooked?.();
    } catch (e) {
      if (isConflictError(e)) {
        toast.error("Ya existe una reserva activa. Refrescamos tu estado.");
        await loadBooking(sessionEmail);
        return;
      }
      setError(e instanceof Error ? e.message : "No pudimos crear la reserva.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedDateStr = selectedDate ? formatDate(formatDateToIsoLocal(selectedDate)) : null;

  return (
    <div className="flex flex-col">
      <div className="px-8 py-6">
        {!sessionEmail ? (
          <div className="rounded-xl border border-amber-800 bg-amber-950/20 p-4 text-sm text-amber-200">
            Necesitamos un email válido en tu sesión para consultar y crear la reserva.
          </div>
        ) : null}

        {error ? (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-800 bg-rose-950/20 p-4 text-sm text-rose-200">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        {loadingBooking ? (
          <div className="flex items-center justify-center rounded-2xl border border-dashed border-white/10 p-10 text-sm text-[#6B7280]">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Consultando tu reserva actual...
          </div>
        ) : null}

        {/* Existing booking */}
        {!loadingBooking && booking ? (
          <div className="space-y-4 rounded-2xl border border-emerald-800 bg-emerald-950/20 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-emerald-400">Ya tenés una videollamada agendada</p>
                <p className="text-sm text-[#9CA3AF]">Si querés otra, primero tenés que cancelar la actual.</p>
              </div>
              <Badge variant="outline" className="border-emerald-800 text-emerald-400">
                {getStatusLabel(booking.status)}
              </Badge>
            </div>
            <div className="grid gap-3 rounded-xl border border-white/[0.07] bg-[#0A0B0D] p-4 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-[#6B7280]">Fecha</p>
                <p className="font-semibold text-[#F2F3F5]">{formatDateLong(booking.bookingDate)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-[#6B7280]">Horario</p>
                <p className="font-semibold text-[#F2F3F5]">{booking.startTime} a {booking.endTime}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-[#6B7280]">Duración</p>
                <p className="font-semibold text-[#F2F3F5]">{booking.durationMinutes} minutos</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-[#6B7280]">Estado</p>
                <p className="font-semibold text-[#F2F3F5]">{getStatusLabel(booking.status)}</p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              className="border-rose-800 text-rose-400 hover:bg-rose-950/30 sm:w-auto"
              onClick={handleCancelBooking}
              disabled={cancelling}
            >
              {cancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Cancelar reserva
            </Button>
          </div>
        ) : null}

        {/* Not trial */}
        {!loadingBooking && meetingStatus === "not_trial" && sessionEmail ? (
          <div className="flex items-start gap-2 rounded-xl border border-amber-800 bg-amber-950/20 p-4 text-sm text-amber-200">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <div>
              <p className="font-semibold">La prueba gratis ya no está disponible</p>
              <p className="mt-1 text-amber-300/70">Este email ya no está en período de trial.</p>
            </div>
          </div>
        ) : null}

        {/* Booking flow */}
        {!loadingBooking && !booking && meetingStatus === "available" && sessionEmail ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left: Calendar */}
            <div className="rounded-2xl border border-white/[0.07] bg-[#101216] p-5">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-[#D6FF3D]" />
                <p className="text-sm font-semibold text-[#F2F3F5]">Elegí una fecha</p>
              </div>

              <div className="mt-4 overflow-hidden rounded-xl border border-white/[0.07] bg-[#0A0B0D]">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => { setSelectedDate(date ?? undefined); setSelectedSlot(null); }}
                  disabled={(date) => date < today || date > maxDate}
                  className="w-full bg-[#0A0B0D] text-[#E4E5E7]"
                />
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-xs text-[#6B7280]">
                <Clock3 className="h-3 w-3" />
                Reservás desde hoy hasta los próximos 15 días.
              </p>

              {availability?.isBlockedDate ? (
                <div className="mt-4 rounded-lg border border-amber-800 bg-amber-950/20 px-3 py-2 text-xs text-amber-200">
                  {availability.reason || "Ese día no se pueden tomar videollamadas."}
                </div>
              ) : null}
            </div>

            {/* Right: Slots */}
            <div className="rounded-2xl border border-white/[0.07] bg-[#101216] p-5">
              <div className="flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-[#D6FF3D]" />
                <p className="text-sm font-semibold text-[#F2F3F5]">Horarios disponibles</p>
              </div>
              {selectedDate ? (
                <p className="mt-1 text-xs text-[#6B7280]">{selectedDateStr}</p>
              ) : null}

              {!selectedDate ? (
                <div className="mt-6 text-center text-sm text-[#6B7280]">
                  Seleccioná una fecha para ver los horarios.
                </div>
              ) : null}

              {selectedDate && loadingAvailability ? (
                <div className="mt-6 flex items-center justify-center text-sm text-[#6B7280]">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Buscando horarios...
                </div>
              ) : null}

              {selectedDate && !loadingAvailability && availability && !availability.isBlockedDate && availability.slots.length > 0 ? (
                <div className="mt-4 max-h-[340px] space-y-2 overflow-y-auto pr-1">
                  {availability.slots.map((slot) => {
                    const isSelected = selectedSlot?.startTime === slot.startTime;
                    return (
                      <button
                        key={`${slot.startTime}-${slot.endTime}`}
                        type="button"
                        className={cn(
                          "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition",
                          isSelected
                            ? "border-[#D6FF3D]/40 bg-[#D6FF3D]/10 text-[#D6FF3D]"
                            : "border-white/[0.07] bg-[#0A0B0D] text-[#E4E5E7] hover:border-white/20",
                        )}
                        onClick={() => setSelectedSlot(slot)}
                      >
                        <div className="flex items-center gap-3">
                          <Clock3 className="h-4 w-4 text-[#6B7280]" />
                          <div>
                            <p className="font-semibold">{slot.startTime} a {slot.endTime}</p>
                            <p className="text-xs text-[#6B7280]">{availability.durationMinutes} minutos</p>
                          </div>
                        </div>
                        <div className={cn(
                          "flex h-5 w-5 items-center justify-center rounded-full border",
                          isSelected ? "border-[#D6FF3D] bg-[#D6FF3D]" : "border-white/20",
                        )}>
                          {isSelected ? <CheckCircle2 className="h-3.5 w-3.5 text-[#0A0B0D]" /> : null}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : null}

              {selectedDate && !loadingAvailability && availability && !availability.isBlockedDate && availability.slots.length === 0 ? (
                <div className="mt-6 text-center text-sm text-[#6B7280]">
                  No hay horarios disponibles para este día.
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* Unknown state */}
        {!loadingBooking && !booking && !meetingStatus && sessionEmail ? (
          <div className="flex items-start gap-2 rounded-xl border border-white/10 bg-[#111417] p-4 text-sm text-[#9CA3AF]">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>No pudimos determinar el estado del trial. Intentá nuevamente.</span>
          </div>
        ) : null}
      </div>

      {/* Footer */}
      {selectedDate && selectedSlot && availability && !loadingBooking && !booking ? (
        <div className="flex items-center justify-between border-t border-white/[0.07] px-8 py-5">
          <div>
            <p className="text-xs text-[#6B7280]">Turno elegido</p>
            <p className="text-sm font-semibold text-[#F2F3F5]">
              {selectedDateStr} · {selectedSlot.startTime} hs
            </p>
          </div>
          <Button
            type="button"
            className="rounded-xl bg-[#D6FF3D] px-6 py-3 font-semibold text-[#0A0B0D] transition-all hover:bg-[#e4ff6a]"
            onClick={handleReserve}
            disabled={submitting}
          >
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Confirmar videollamada
          </Button>
        </div>
      ) : null}
    </div>
  );
}
