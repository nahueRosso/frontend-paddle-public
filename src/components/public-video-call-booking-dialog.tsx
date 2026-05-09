"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SessionWithProfile = Session & {
  profile?: {
    sub?: unknown;
  };
  user?: Session["user"] & {
    id?: string;
  };
};

type PublicVideoCallBookingDialogProps = {
  session: Session | null;
  className?: string;
  icon?: ReactNode;
  triggerLabel?: string;
};

type BookingFormState = {
  phoneNumber: string;
};

const DEFAULT_FORM: BookingFormState = {
  phoneNumber: "",
};

function getGoogleId(session: Session | null): string | undefined {
  const extendedSession = session as SessionWithProfile | null;

  return typeof extendedSession?.profile?.sub === "string"
    ? extendedSession.profile.sub
    : undefined;
}

function formatDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, (month ?? 1) - 1, day ?? 1));

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatDateToIsoLocal(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getStatusLabel(status: string) {
  switch (status) {
    case "scheduled":
      return "Programada";
    case "pending":
      return "Pendiente";
    case "cancelled":
      return "Cancelada";
    case "completed":
      return "Completada";
    default:
      return status;
  }
}

function isConflictError(error: unknown) {
  if (!(error instanceof CalenderApiError)) {
    return false;
  }

  if (error.status === 409) {
    return true;
  }

  const normalizedMessage = error.message.toLowerCase();
  return (
    normalizedMessage.includes("ya tiene") ||
    normalizedMessage.includes("reserva activa") ||
    normalizedMessage.includes("reunión pendiente") ||
    normalizedMessage.includes("reunion pendiente")
  );
}

export function PublicVideoCallBookingDialog({
  session,
  className,
  icon,
  triggerLabel = "Obtener prueba gratis",
}: PublicVideoCallBookingDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<BookingFormState>(DEFAULT_FORM);
  const [booking, setBooking] = useState<CalenderBooking | null>(null);
  const [meetingStatus, setMeetingStatus] = useState<
    "scheduled" | "available" | "not_trial" | null
  >(null);
  const [availability, setAvailability] = useState<CalenderAvailability | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<CalenderAvailabilitySlot | null>(null);
  const [loadingBooking, setLoadingBooking] = useState(false);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const googleId = useMemo(() => getGoogleId(session), [session]);
  const sessionEmail = session?.user?.email?.trim() ?? "";
  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);
  const maxDate = useMemo(() => {
    const date = new Date(today);
    date.setDate(date.getDate() + 15);
    return date;
  }, [today]);

  const resetBookingFlow = () => {
    setBooking(null);
    setMeetingStatus(null);
    setAvailability(null);
    setSelectedDate(undefined);
    setSelectedSlot(null);
    setError(null);
  };

  const loadBooking = async (email: string) => {
    setLoadingBooking(true);
    setError(null);

    try {
      const response = await getMyCalenderBooking(email);
      setMeetingStatus(
        response.meetingStatus === "scheduled" ||
          response.meetingStatus === "available" ||
          response.meetingStatus === "not_trial"
          ? response.meetingStatus
          : null,
      );
      setBooking(response.hasActiveBooking ? response.booking : null);

      if (!response.hasActiveBooking) {
        setAvailability(null);
        setSelectedSlot(null);
      }
    } catch (loadError) {
      setBooking(null);
      setMeetingStatus(null);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "No pudimos consultar tu reserva actual.",
      );
    } finally {
      setLoadingBooking(false);
    }
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm({
      ...DEFAULT_FORM,
    });
    resetBookingFlow();

    if (sessionEmail) {
      void loadBooking(sessionEmail);
    } else {
      setError("No pudimos identificar tu email de sesión para consultar la reserva.");
    }
  }, [open, session, sessionEmail]);

  useEffect(() => {
    if (!open || booking || meetingStatus !== "available" || !selectedDate) {
      return;
    }

    let cancelled = false;

    const loadAvailability = async () => {
      setLoadingAvailability(true);
      setSelectedSlot(null);
      setAvailability(null);
      setError(null);

      try {
        const response = await getCalenderAvailability(
          formatDateToIsoLocal(selectedDate),
        );

        if (!cancelled) {
          setAvailability(response);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "No pudimos obtener la disponibilidad.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingAvailability(false);
        }
      }
    };

    void loadAvailability();

    return () => {
      cancelled = true;
    };
  }, [booking, meetingStatus, open, selectedDate]);

  const handleCancelBooking = async () => {
    if (!booking) {
      return;
    }

    setCancelling(true);
    setError(null);

    try {
      const response = await cancelCalenderBooking(booking.id);
      toast.success(response.message || "Reserva cancelada.");
      await loadBooking(sessionEmail);
    } catch (cancelError) {
      setError(
        cancelError instanceof Error
          ? cancelError.message
          : "No pudimos cancelar la reserva.",
      );
    } finally {
      setCancelling(false);
    }
  };

  const handleReserve = async () => {
    if (!selectedDate || !selectedSlot || !availability) {
      setError("Elegí una fecha y un horario disponible antes de reservar.");
      return;
    }

    const normalizedName =
      session?.user?.name?.trim() || sessionEmail.split("@")[0] || "Usuario";
    const normalizedPhone = form.phoneNumber.trim();
    const bookingDateLabel = formatDate(formatDateToIsoLocal(selectedDate));

    if (!normalizedName || !sessionEmail) {
      setError("No pudimos obtener tus datos para reservar la videollamada.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await createCalenderBooking({
        name: normalizedName,
        email: sessionEmail,
        phoneNumber: normalizedPhone,
        bookingDate: formatDateToIsoLocal(selectedDate),
        startTime: selectedSlot.startTime,
        durationMinutes: availability.durationMinutes,
        notes: `Reservó videollamada para el ${bookingDateLabel}.`,
        ...(googleId ? { googleId } : {}),
      });

      toast.success("Videollamada reservada correctamente.");
      await loadBooking(sessionEmail);
    } catch (submitError) {
      if (isConflictError(submitError)) {
        toast.error("Ya existe una reserva activa. Refrescamos tu estado actual.");
        await loadBooking(sessionEmail);
        return;
      }

      setError(
        submitError instanceof Error
          ? submitError.message
          : "No pudimos crear la reserva.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const statusVariant = booking?.status === "scheduled" ? "default" : "outline";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button type="button" className={className} onClick={() => setOpen(true)}>
        {icon}
        {triggerLabel}
      </Button>

      <DialogContent className="max-h-[82vh] overflow-y-auto border border-emerald-100 bg-white p-0 shadow-2xl dark:border-emerald-900/50 dark:bg-slate-950 sm:max-w-xl">
        <DialogHeader>
          <div className="border-b border-emerald-100 bg-emerald-50/70 px-5 py-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
            <DialogTitle className="text-[#111827] dark:text-slate-100">
              Agendar videollamada
            </DialogTitle>
            <DialogDescription className="mt-1 text-slate-600 dark:text-slate-300">
              Conocé la plataforma en una videollamada y obtené 15 días gratis
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-4 px-5 py-4">
          {!sessionEmail ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-100">
              Necesitamos un email válido en tu sesión para consultar y crear la reserva pública.
            </div>
          ) : null}

          {/* {sessionEmail ? (
            <div className="rounded-3xl border border-emerald-100 bg-slate-50/90 p-5 shadow-sm dark:border-emerald-900/40 dark:bg-slate-900/70">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-[#111827] dark:text-slate-100">
                  Email asociado a la reserva
                </p>
                <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
                  {sessionEmail}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Consultamos tu reserva automáticamente con este email para evitar errores.
                </p>
              </div>
            </div>
          ) : null} */}

          {error ? (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertTitle>No pudimos completar la acción</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {loadingBooking ? (
            <div className="flex items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50/80 p-8 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Consultando tu reserva actual...
            </div>
          ) : null}

          {!loadingBooking && booking ? (
            <div className="space-y-4 rounded-3xl border border-emerald-100 bg-emerald-50/60 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                    Ya tenés una videollamada agendada
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Si querés otra, primero tenés que cancelar la actual.
                  </p>
                </div>
                <Badge
                  variant={statusVariant}
                  className="border-emerald-200 bg-white text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
                >
                  {getStatusLabel(booking.status)}
                </Badge>
              </div>

              <div className="grid gap-3 rounded-2xl border border-emerald-100 bg-white/90 p-4 text-sm dark:border-emerald-900/40 dark:bg-slate-950/70 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Fecha</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {formatDate(booking.bookingDate)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Horario</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {booking.startTime} a {booking.endTime}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Duración</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {booking.durationMinutes} minutos
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Estado</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {getStatusLabel(booking.status)}
                  </p>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/60 dark:text-rose-300 dark:hover:bg-rose-950/30 sm:w-auto"
                onClick={handleCancelBooking}
                disabled={cancelling}
              >
                {cancelling ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Cancelar reserva
              </Button>
            </div>
          ) : null}

          {!loadingBooking && meetingStatus === "not_trial" && sessionEmail ? (
            <Alert className="border-amber-200 bg-amber-50/70 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-100">
              <AlertCircle />
              <AlertTitle>La prueba gratis ya no está disponible</AlertTitle>
              <AlertDescription>
                Este email ya no está en período de trial, así que no puede agendar una nueva videollamada de prueba.
              </AlertDescription>
            </Alert>
          ) : null}

          {!loadingBooking && !booking && meetingStatus === "available" && sessionEmail ? (
            <div className="space-y-4">
              <div className="rounded-3xl border border-emerald-100 bg-slate-50/90 p-4 shadow-sm dark:border-emerald-900/40 dark:bg-slate-900/70">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-emerald-500" />
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Elegí una fecha
                  </p>
                </div>

                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date ?? undefined);
                      setSelectedSlot(null);
                    }}
                    disabled={(date) => date < today || date > maxDate}
                    className="w-full bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100"
                    
                  />
                </div>
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                  Podés reservar desde hoy hasta los próximos 15 días.
                </p>

                {availability?.isBlockedDate ? (
                  <Alert className="mt-4 border-amber-200 bg-amber-50/70 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-100">
                    <AlertCircle />
                    <AlertTitle>Fecha no disponible</AlertTitle>
                    <AlertDescription>
                      {availability.reason || "Ese día no se pueden tomar videollamadas."}
                    </AlertDescription>
                  </Alert>
                ) : null}

                {!availability?.isBlockedDate && availability?.reason ? (
                  <Alert className="mt-4">
                    <AlertCircle />
                    <AlertTitle>Información sobre la fecha</AlertTitle>
                    <AlertDescription>{availability.reason}</AlertDescription>
                  </Alert>
                ) : null}
              </div>

              {selectedDate ? (
                <div className="rounded-3xl border border-emerald-100 bg-slate-50/90 p-4 shadow-sm dark:border-emerald-900/40 dark:bg-slate-900/70">
                  <div className="flex items-center gap-2">
                    <Clock3 className="h-4 w-4 text-emerald-500" />
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Horarios disponibles
                    </p>
                  </div>

                  {loadingAvailability ? (
                    <div className="mt-4 flex items-center text-sm text-slate-500">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Buscando horarios...
                    </div>
                  ) : null}

                  {!loadingAvailability &&
                  availability &&
                  !availability.isBlockedDate &&
                  availability.slots.length > 0 ? (
                    <div className="mt-4 grid max-h-52 gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
                      {availability.slots.map((slot) => {
                        const isSelected = selectedSlot?.startTime === slot.startTime;

                        return (
                          <button
                            key={`${slot.startTime}-${slot.endTime}`}
                            type="button"
                            className={cn(
                              "rounded-2xl border px-4 py-3 text-left shadow-sm transition",
                              isSelected
                                ? "border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
                                : "border-slate-200 bg-white text-slate-900 hover:border-emerald-300 hover:bg-emerald-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:border-emerald-800 dark:hover:bg-slate-800",
                            )}
                            onClick={() => setSelectedSlot(slot)}
                          >
                            <p className="font-semibold">{slot.startTime} a {slot.endTime}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {availability.durationMinutes} minutos
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  ) : null}

                  {!loadingAvailability &&
                  availability &&
                  !availability.isBlockedDate &&
                  availability.slots.length === 0 ? (
                    <Empty className="mt-4 border border-dashed border-slate-200 dark:border-slate-800">
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <CalendarDays />
                        </EmptyMedia>
                        <EmptyTitle>Sin horarios para ese día</EmptyTitle>
                        <EmptyDescription>
                          No encontramos slots disponibles para {formatDate(formatDateToIsoLocal(selectedDate))}.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  ) : null}
                </div>
              ) : null}

              {selectedDate && selectedSlot && availability ? (
                <div className="rounded-3xl border border-emerald-100 bg-slate-50/90 p-4 shadow-sm dark:border-emerald-900/40 dark:bg-slate-900/70">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Confirmá tu reserva
                    </p>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="booking-phone" className="text-[#111827] dark:text-slate-100">
                        Teléfono de contacto (opcional)
                      </Label>
                      <Input
                        id="booking-phone"
                        value={form.phoneNumber}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            phoneNumber: event.target.value,
                          }))
                        }
                        placeholder="11 3344 5566"
                        className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[#111827] dark:text-slate-100">Horario elegido</Label>
                      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
                        {formatDate(formatDateToIsoLocal(selectedDate))} · {selectedSlot.startTime} a {selectedSlot.endTime}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Duración: {availability.durationMinutes} minutos
                    </p>
                    <Button type="button" onClick={handleReserve} disabled={submitting}>
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      Reservar videollamada
                    </Button>
                  </div>
                </div>
              ) : null}

              {!selectedDate && !loadingAvailability ? (
                <Empty className="border border-dashed border-slate-200 dark:border-slate-800">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <CalendarDays />
                    </EmptyMedia>
                    <EmptyTitle>No tenés una reserva activa</EmptyTitle>
                    <EmptyDescription>
                      Elegí una fecha para consultar disponibilidad y reservar tu videollamada.
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent />
                </Empty>
              ) : null}
            </div>
          ) : null}

          {!loadingBooking && !booking && !meetingStatus && sessionEmail ? (
            <Alert className="border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200">
              <AlertCircle />
              <AlertTitle>No pudimos determinar el estado del trial</AlertTitle>
              <AlertDescription>
                Intentá nuevamente en unos segundos. Si el problema sigue, revisá el estado de la suscripción antes de agendar.
              </AlertDescription>
            </Alert>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
