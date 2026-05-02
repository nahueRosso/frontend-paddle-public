"use client";

import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import type { Booking, PublicBookingIntentResponse, TimeSlot } from "@/types/booking";
import type { CourtConfig } from "@/types/tenant-config";
import { useBookingsQuery } from "@/hooks/queries/booking";
import { useCurrentTime } from "@/hooks/use-current-time";
import { useBookingsSocket } from "@/hooks/use-bookings-socket";
import { createPublicBookingIntent } from "@/lib/api/booking";
import { bookingKeys } from "@/lib/queryKeys/booking";
import { generateTimeSlots } from "@/lib/slots";
import { isSlotPast } from "@/lib/schedule";
import { cn } from "@/lib/utils";
import { useClub } from "@/context/club-context";
import { toast } from "@/hooks/use-toast";
import { usePlayer } from "@/providers/player-provider";
import VerifyClubPlayerDialog from "./verify-club-player-dialog";
import VerifyPlayerDialog from "./verify-player-dialog";

function formatCourtEnvironment(environment?: CourtConfig["environment"]) {
  if (environment === "abierta") {
    return "Abierta";
  }

  if (environment === "cerrada") {
    return "Cerrada";
  }

  return null;
}

function formatCourtStructure(structure?: CourtConfig["structure"]) {
  if (structure === "blindex") {
    return "Blindex";
  }

  if (structure === "clasica") {
    return "Clasica";
  }

  return null;
}

function formatCourtSurface(surface?: CourtConfig["surface"]) {
  if (surface === "sintetico") {
    return "Sintetico";
  }

  if (surface === "cemento") {
    return "Cemento";
  }

  return null;
}

function formatCountdown(expiresAt: string, now: number) {
  const remaining = new Date(expiresAt).getTime() - now;

  if (remaining <= 0) return "0:00";

  const totalSeconds = Math.ceil(remaining / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

type PendingBookingPayment = {
  bookingId: string;
  tenantId: string;
  ownerIdentity: string;
  courtNumber: number;
  date: string;
  startTime: string;
  checkoutUrl: string;
  expiresAt: string;
};

function buildPendingPaymentOwnerIdentity({
  playerId,
  personId,
  phoneNumber,
  email,
}: {
  playerId?: string | null;
  personId?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
}) {
  if (playerId) {
    return `player:${playerId}`;
  }

  if (personId) {
    return `person:${personId}`;
  }

  if (phoneNumber) {
    return `phone:${phoneNumber}`;
  }

  if (email) {
    return `email:${email.toLowerCase()}`;
  }

  return null;
}

export function ClubTurnos() {
  const { config } = useClub();
  const queryClient = useQueryClient();
  const currentTime = useCurrentTime();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedCourt, setSelectedCourt] = useState<number | null>(null);
  const [submittingSlot, setSubmittingSlot] = useState<string | null>(null);
  const [verifyPlayer, setVerifyPlayer] = useState<boolean>(false);
  const [verifyReason, setVerifyReason] = useState<string | null>(null);
  const [verifyClubPlayer, setVerifyClubPlayer] = useState(false);
  const [pendingPayment, setPendingPayment] = useState<PendingBookingPayment | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const activeCourts = config.courts.filter((c) => c.active);
  const showCourtPrice = config.bookingRules?.showCourtPrice ?? true;
  const defaultCourtPrice = config.basePrice ?? 0;

  const { player, person, playerId, personId } = usePlayer();
  const bookingActor = player ?? person;
  const pendingPaymentOwnerIdentity = buildPendingPaymentOwnerIdentity({
    playerId,
    personId,
    phoneNumber: bookingActor?.phoneNumber ?? null,
    email: bookingActor?.email ?? null,
  });
  const bookingDate = format(selectedDate, "yyyy-MM-dd");
  const { data: bookings = [], isLoading: isBookingsLoading } = useBookingsQuery(
    config.tenantId,
    bookingDate,
  );
  const legacyPendingPaymentStorageKey = `pending-booking:${config.tenantId}`;
  const pendingPaymentStorageKey = pendingPaymentOwnerIdentity
    ? `pending-booking:${config.tenantId}:${pendingPaymentOwnerIdentity}`
    : null;

  const clearPendingPayment = useCallback(() => {
    setPendingPayment(null);
    window.localStorage.removeItem(legacyPendingPaymentStorageKey);
    if (pendingPaymentStorageKey) {
      window.localStorage.removeItem(pendingPaymentStorageKey);
    }
  }, [legacyPendingPaymentStorageKey, pendingPaymentStorageKey]);

  const reconcilePendingPayment = useCallback(
    (nextBookings: Booking[]) => {
      setPendingPayment((currentPendingPayment) => {
        if (!currentPendingPayment || currentPendingPayment.date !== bookingDate) {
          return currentPendingPayment;
        }

        const matchingBooking = nextBookings.find((booking) => {
          if (currentPendingPayment.bookingId) {
            return booking.id === currentPendingPayment.bookingId;
          }

          return (
            booking.courtNumber === currentPendingPayment.courtNumber &&
            booking.date === currentPendingPayment.date &&
            booking.startTime === currentPendingPayment.startTime
          );
        });

        if (!matchingBooking || matchingBooking.status !== "pending") {
          window.localStorage.removeItem(legacyPendingPaymentStorageKey);
          if (pendingPaymentStorageKey) {
            window.localStorage.removeItem(pendingPaymentStorageKey);
          }
          return null;
        }

        return currentPendingPayment;
      });
    },
    [bookingDate, legacyPendingPaymentStorageKey, pendingPaymentStorageKey],
  );

  // useEffect(() => {
  //   console.log("[ClubTurnos] state", {
  //     tenantId: config.tenantId,
  //     hasWebBooking: config.hasWebBooking,
  //     bookingDate,
  //     currentTime: currentTime.toISOString(),
  //     activeCourts: activeCourts.map((court) => ({
  //       number: court.number,
  //       active: court.active,
  //     })),
  //     bookingsCount: bookings.length,
  //   });
  // }, [
  //   activeCourts,
  //   bookingDate,
  //   bookings.length,
  //   config.hasWebBooking,
  //   config.tenantId,
  //   currentTime,
  // ]);

  useBookingsSocket({
    tenantId: config.tenantId,
    bookingDate,
    onBookingsList: reconcilePendingPayment,
  });

  useEffect(() => {
    if (!pendingPayment) {
      return;
    }

    setNow(Date.now());

    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [pendingPayment]);

  useEffect(() => {
    window.localStorage.removeItem(legacyPendingPaymentStorageKey);

    if (!pendingPaymentStorageKey || !pendingPaymentOwnerIdentity) {
      setPendingPayment(null);
      return;
    }

    const rawValue = window.localStorage.getItem(pendingPaymentStorageKey);

    if (!rawValue) {
      return;
    }

    try {
      const parsed = JSON.parse(rawValue) as PendingBookingPayment;
      if (parsed.ownerIdentity !== pendingPaymentOwnerIdentity) {
        window.localStorage.removeItem(pendingPaymentStorageKey);
        setPendingPayment(null);
        return;
      }

      if (new Date(parsed.expiresAt).getTime() <= Date.now()) {
        clearPendingPayment();
        return;
      }

      setPendingPayment(parsed);
      setSelectedDate(new Date(`${parsed.date}T00:00:00`));
      if (typeof parsed.courtNumber === "number") {
        setSelectedCourt(parsed.courtNumber);
      }
    } catch {
      clearPendingPayment();
    }
  }, [
    clearPendingPayment,
    legacyPendingPaymentStorageKey,
    pendingPaymentOwnerIdentity,
    pendingPaymentStorageKey,
  ]);

  useEffect(() => {
    if (!pendingPaymentStorageKey) {
      return;
    }

    if (!pendingPayment) {
      window.localStorage.removeItem(pendingPaymentStorageKey);
      return;
    }

    window.localStorage.setItem(
      pendingPaymentStorageKey,
      JSON.stringify(pendingPayment),
    );
  }, [pendingPayment, pendingPaymentStorageKey]);

  useEffect(() => {
    if (!pendingPayment) {
      return;
    }

    if (new Date(pendingPayment.expiresAt).getTime() <= now) {
      clearPendingPayment();
      void queryClient.invalidateQueries({
        queryKey: bookingKeys.availabilityByTenant(config.tenantId, pendingPayment.date),
      });
      void queryClient.invalidateQueries({
        queryKey: bookingKeys.list(config.tenantId, pendingPayment.date),
      });
    }
  }, [clearPendingPayment, config.tenantId, now, pendingPayment, queryClient]);

  useEffect(() => {
    if (!pendingPayment || pendingPayment.date !== bookingDate) {
      return;
    }

    reconcilePendingPayment(bookings);
  }, [bookingDate, bookings, pendingPayment, reconcilePendingPayment]);

  const goToPreviousDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    if (prev >= new Date(new Date().setHours(0, 0, 0, 0))) {
      setSelectedDate(prev);
    }
  };

  const goToNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next);
  };

  const handleBooking = async (courtNumber: number, slot: TimeSlot) => {
    if (!bookingActor) {
      setVerifyClubPlayer(true);
      return;
    }

    if (isSlotPast(bookingDate, slot.startTime, currentTime)) {
      toast({
        title: "El horario ya pasó. Elegí otro turno.",
        variant: "destructive",
      });
      return;
    }

    const slotKey = `${courtNumber}-${bookingDate}-${slot.startTime}`;
    setSubmittingSlot(slotKey);

    try {
      const response = await createPublicBookingIntent({
        tenantId: config.tenantId,
        courtNumber,
        date: bookingDate,
        startTime: slot.startTime,
        userName: `${bookingActor.firstName} ${bookingActor.lastName}`.trim(),
        userPhone: bookingActor.phoneNumber,
        reservedBy: "usuario",
        source: "web",
      });

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: bookingKeys.availabilityByTenant(config.tenantId, bookingDate),
        }),
        queryClient.invalidateQueries({
          queryKey: bookingKeys.list(config.tenantId, bookingDate),
        }),
      ]);

      if (response.mode === "verification_required") {
        setVerifyReason(
          response.reason?.trim() || "Tu cuenta debe ser verificada.",
        );
        setVerifyPlayer(true);
        return;
      }

      if (response.mode === "direct_reservation") {
        clearPendingPayment();
        toast({
          title: response.message || "Turno reservado",
        });
        return;
      }

      const nextPendingPayment: PendingBookingPayment = {
        bookingId: response.bookingId ?? slotKey,
        tenantId: config.tenantId,
        ownerIdentity: pendingPaymentOwnerIdentity ?? `phone:${bookingActor.phoneNumber}`,
        courtNumber,
        date: bookingDate,
        startTime: slot.startTime,
        checkoutUrl: response.checkoutUrl,
        expiresAt: response.expiresAt,
      };

      setPendingPayment(nextPendingPayment);
      setSelectedCourt(courtNumber);
      toast({
        title: response.message || "Tu turno quedo pendiente de pago por 10 minutos.",
      });
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : "Error inesperado",
        variant: "destructive",
      });
    } finally {
      setSubmittingSlot(null);
    }
  };

  const isToday =
    format(selectedDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
  const paymentCountdown = pendingPayment
    ? formatCountdown(pendingPayment.expiresAt, now)
    : null;
  const isPendingPaymentExpired = pendingPayment
    ? new Date(pendingPayment.expiresAt).getTime() <= now
    : false;
  const pendingCourtLabel = pendingPayment
    ? `Cancha ${pendingPayment.courtNumber}`
    : null;
  const handleContinuePayment = () => {
    if (!pendingPayment) {
      return;
    }

    window.location.href = pendingPayment.checkoutUrl;
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-emerald-100 bg-white/75 p-6 shadow-lg shadow-emerald-100/60 backdrop-blur dark:border-emerald-900/60 dark:bg-slate-950/75 dark:shadow-emerald-950/20">
        <span className="inline-flex rounded-full bg-emerald-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
          Reservas web
        </span>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 lg:text-3xl">
          Turnos disponibles
        </h2>
        <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-400">
          Selecciona una fecha y cancha para ver la disponibilidad.
        </p>
        {pendingPayment ? (
          <div className="mt-4 rounded-[1.5rem] border border-amber-200 bg-amber-50/90 p-4 text-sm text-amber-900 shadow-sm dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="font-semibold">
                  Tenes una reserva pendiente para {pendingCourtLabel} a las {pendingPayment.startTime}.
                </p>
                <p className="text-amber-800/90 dark:text-amber-200/90">
                  {isPendingPaymentExpired
                    ? "El tiempo de pago vencio. La disponibilidad se va a refrescar."
                    : `Te quedan ${paymentCountdown} para completar el pago.`}
                </p>
                <p className="text-xs text-amber-700/80 dark:text-amber-300/80">
                  Fecha: {pendingPayment.date}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {!isPendingPaymentExpired ? (
                  <Button
                    onClick={handleContinuePayment}
                    className="bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-400"
                  >
                    Continuar pago
                  </Button>
                ) : null}
                <Button
                  variant="outline"
                  onClick={clearPendingPayment}
                  className="border-amber-300 bg-white/80 text-amber-900 hover:bg-amber-100 dark:border-amber-900/60 dark:bg-slate-950/50 dark:text-amber-100 dark:hover:bg-amber-500/10"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      <Card className="rounded-[1.75rem] border-emerald-100 bg-white/90 shadow-lg shadow-emerald-100/60 dark:border-emerald-900/60 dark:bg-slate-950/80 dark:shadow-emerald-950/20">
        <CardContent className="flex flex-col items-center gap-4 p-4 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPreviousDay}
              disabled={isToday}
              aria-label="Dia anterior"
              className="border-emerald-200 bg-white/80 text-slate-700 hover:bg-emerald-50 dark:border-emerald-900/60 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:bg-emerald-500/10"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="min-w-[200px] justify-center gap-2 border-emerald-200 bg-white/80 text-slate-700 hover:bg-emerald-50 dark:border-emerald-900/60 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:bg-emerald-500/10"
                >
                  <Clock className="h-4 w-4" />
                  <span className="capitalize">
                    {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto border-emerald-100 p-0 dark:border-emerald-900/60 dark:bg-slate-950" align="center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  disabled={(date) =>
                    date < new Date(new Date().setHours(0, 0, 0, 0))
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Button
              variant="outline"
              size="icon"
              onClick={goToNextDay}
              aria-label="Dia siguiente"
              className="border-emerald-200 bg-white/80 text-slate-700 hover:bg-emerald-50 dark:border-emerald-900/60 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:bg-emerald-500/10"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {isToday && (
            <Badge className="border-0 bg-emerald-100 text-xs text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-300 dark:hover:bg-emerald-500/15">
              Hoy
            </Badge>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-2 rounded-[1.5rem] border border-emerald-100 bg-white/80 p-3 shadow-sm shadow-emerald-100/50 dark:border-emerald-900/60 dark:bg-slate-950/70 dark:shadow-emerald-950/10">
        <Button
          variant={selectedCourt === null ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCourt(null)}
          className="rounded-full border-emerald-200 dark:border-emerald-900/60 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:bg-emerald-500/10"
        >
          Todas
        </Button>
        {activeCourts.map((court) => (
          <Button
            key={court.number}
            variant={selectedCourt === court.number ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCourt(court.number)}
            className="rounded-full border-emerald-200 dark:border-emerald-900/60 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:bg-emerald-500/10"
          >
            Cancha {court.number}
          </Button>
        ))}
      </div>

      {/* Schedule Grid */}
      {isBookingsLoading ? (
        <ScheduleSkeleton count={activeCourts.length} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {activeCourts
            .filter(
              (court) =>
                selectedCourt === null || court.number === selectedCourt,
            )
            .map((court) => {
              const slots = generateTimeSlots(
                config.openingMorning,
                config.closingMorning,
                config.turnDuration,
                court.number,
                bookings,
              );

              return (
                <CourtSchedule
                  key={court.number}
                  courtNumber={court.number}
                  courtName={`Cancha ${court.number}`}
                  courtData={court}
                  slots={slots}
                  hasWebBooking={config.hasWebBooking}
                  showCourtPrice={showCourtPrice}
                  courtPrice={court.price ?? defaultCourtPrice}
                  onBooking={handleBooking}
                  submittingSlot={submittingSlot}
                  selectedDate={selectedDate}
                  currentTime={currentTime}
                />
              );
            })}
        </div>
      )}
      <VerifyPlayerDialog
        open={verifyPlayer}
        onClose={() => {
          setVerifyPlayer(false);
          setVerifyReason(null);
        }}
        reason={verifyReason}
      />
      <VerifyClubPlayerDialog
        slug={config.slug}
        open={verifyClubPlayer}
        onOpenChange={setVerifyClubPlayer}
      />
    </div>
  );
}

function CourtSchedule({
  courtNumber,
  courtName,
  courtData,
  slots,
  hasWebBooking,
  showCourtPrice,
  courtPrice,
  onBooking,
  submittingSlot,
  selectedDate,
  currentTime,
}: {
  courtNumber: number;
  courtName: string;
  courtData: CourtConfig;
  slots: TimeSlot[];
  hasWebBooking: boolean;
  showCourtPrice: boolean;
  courtPrice: number | null;
  onBooking: (courtNumber: number, slot: TimeSlot) => void;
  submittingSlot: string | null;
  selectedDate: Date;
  currentTime: Date;
}) {
  const availableCount = slots.filter((s) => s.status === "available").length;
  const environmentLabel = formatCourtEnvironment(courtData.environment);
  const structureLabel = formatCourtStructure(courtData.structure);
  const surfaceLabel = formatCourtSurface(courtData.surface);


  return (
    <Card className="rounded-[1.75rem] border-emerald-100 bg-white/90 shadow-lg shadow-emerald-100/60 dark:border-emerald-900/60 dark:bg-slate-950/80 dark:shadow-emerald-950/20">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-sm font-bold text-white">
            {courtNumber}
          </div>
          <div className="space-y-1">
            <CardTitle className="text-base text-slate-900 dark:text-slate-100">{courtName}</CardTitle>
            <div className="flex flex-wrap gap-2">
              {environmentLabel ? (
                <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-[11px] font-normal text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-500/10 dark:text-emerald-300">
                  {environmentLabel}
                </Badge>
              ) : null}
              {structureLabel ? (
                <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-[11px] font-normal text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-500/10 dark:text-emerald-300">
                  {structureLabel}
                </Badge>
              ) : null}
              {surfaceLabel ? (
                <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-[11px] font-normal text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-500/10 dark:text-emerald-300">
                  {surfaceLabel}
                </Badge>
              ) : null}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {availableCount} turnos disponibles
            </p>
            {showCourtPrice ? (
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                ${Number(courtPrice ?? 0).toLocaleString()} por turno
              </p>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {slots.map((slot) => (
            <SlotButton
              onClick={() => onBooking(courtNumber, slot)}
              key={slot.startTime}
              slot={slot}
              hasWebBooking={hasWebBooking}
              isPast={isSlotPast(
                format(selectedDate, "yyyy-MM-dd"),
                slot.startTime,
                currentTime,
              )}
              isSubmitting={
                submittingSlot ===
                `${courtNumber}-${format(selectedDate, "yyyy-MM-dd")}-${slot.startTime}`
              }
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SlotButton({
  onClick,
  slot,
  hasWebBooking,
  isPast,
  isSubmitting,
}: {
  onClick: () => void;
  slot: TimeSlot;
  hasWebBooking: boolean;
  isPast: boolean;
  isSubmitting: boolean;
}) {
  // useEffect(() => {
  //   console.log("[ClubTurnos][SlotButton]", {
  //     startTime: slot.startTime,
  //     endTime: slot.endTime,
  //     status: slot.status,
  //     hasWebBooking,
  //     isPast,
  //     isSubmitting,
  //     disabled: !hasWebBooking || isPast,
  //   });
  // }, [
  //   hasWebBooking,
  //   isPast,
  //   isSubmitting,
  //   slot.endTime,
  //   slot.startTime,
  //   slot.status,
  // ]);

  if (isSubmitting) {
    return (
        <Button
        variant="outline"
        className="h-auto rounded-2xl border-emerald-200 bg-white/80 px-3 py-2.5 text-xs font-medium text-slate-700 dark:border-emerald-900/60 dark:bg-slate-900/80 dark:text-slate-200"
        disabled
      >
        <div className="flex items-center gap-1.5">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Reservando...</span>
        </div>
      </Button>
    );
  }

  if (slot.status === "occupied") {
    return (
      <div
        className="flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-100/80 px-3 py-2.5 text-center opacity-60 dark:border-slate-800 dark:bg-slate-900/70"
      >
        <span className="text-xs font-medium text-slate-500 line-through dark:text-slate-500">
          {slot.startTime} - {slot.endTime}
        </span>
      </div>
    );
  }

  if (slot.status === "pending") {
    return (
      <div
        className="flex items-center justify-center rounded-2xl border border-amber-300/40 bg-amber-50 px-3 py-2.5 text-center dark:border-amber-900/60 dark:bg-amber-950/25"
      >
        <div className="flex items-center gap-1.5">
          <Clock className="h-3 w-3 text-amber-700 dark:text-amber-300" />
          <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
            Pendiente {slot.startTime}
          </span>
        </div>
      </div>
    );
  }

  if (isPast) {
    return (
      <div
        className="flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-100/80 px-3 py-2.5 text-center opacity-60 dark:border-slate-800 dark:bg-slate-900/70"
      >
        <span className="text-xs font-medium text-slate-500 line-through dark:text-slate-500">
          {slot.startTime} - {slot.endTime}
        </span>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      className={cn(
        "h-auto rounded-2xl border-emerald-200 bg-emerald-50/50 px-3 py-2.5 text-xs font-medium text-slate-700 dark:border-emerald-900/60 dark:bg-slate-900/80 dark:text-slate-100",
        "hover:border-emerald-500 hover:bg-emerald-100 hover:text-emerald-700 dark:hover:border-emerald-500/70 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-300",
        "transition-colors",
      )}
      onClick={onClick}
      disabled={!hasWebBooking || isPast}
    >
      <span>
        {slot.startTime} - {slot.endTime}
      </span>
    </Button>
  );
}

function ScheduleSkeleton({ count }: { count: number }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {Array.from({ length: Math.max(count, 2) }).map((_, i) => (
        <Card key={i} className="rounded-[1.75rem] border-emerald-100 bg-white/90 shadow-lg shadow-emerald-100/60 dark:border-emerald-900/60 dark:bg-slate-950/80 dark:shadow-emerald-950/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {Array.from({ length: 6 }).map((_, j) => (
                <Skeleton key={j} className="h-10 rounded-lg" />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
