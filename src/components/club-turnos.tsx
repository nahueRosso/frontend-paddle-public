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
import type { Booking, TimeSlot } from "@/types/booking";
import type { CourtConfig } from "@/types/tenant-config";
import { useBookingsQuery } from "@/hooks/queries/booking";
import { useCurrentTime } from "@/hooks/use-current-time";
import { useBookingsSocket } from "@/hooks/use-bookings-socket";
import { cancelBooking, createPublicBookingIntent } from "@/lib/api/booking";
import {
  buildPendingPaymentOwnerIdentity,
  buildPendingPaymentStorageKey,
  parsePendingBookingPayment,
  type PendingBookingPayment,
} from "@/lib/pending-booking-payment";
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
  const openDays = config.openDays ?? [1, 2, 3, 4, 5, 6, 0];
  const isDayClosed = !openDays.includes(selectedDate.getDay());

  const { player, person, playerId, personId, personExists } = usePlayer();
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
    ? buildPendingPaymentStorageKey(config.tenantId, pendingPaymentOwnerIdentity)
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
      const parsed = parsePendingBookingPayment(rawValue);
      if (!parsed) {
        clearPendingPayment();
        return;
      }
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
    if (!personExists || !bookingActor) {
      toast({
        title: "Completa tu perfil antes de reservar.",
        variant: "destructive",
      });
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
    const userName = `${bookingActor.firstName} ${bookingActor.lastName}`.trim();
    const payerEmail = bookingActor.email?.trim() || undefined;
    const userPhone = bookingActor.phoneNumber?.trim() || undefined;
    const hasBookingIdentity = Boolean(playerId || personId || userPhone || payerEmail);

    if (!userName) {
      toast({
        title: "Completa tu nombre y apellido antes de reservar.",
        variant: "destructive",
      });
      return;
    }

    if (!hasBookingIdentity) {
      toast({
        title: "Falta completar tu identidad de reserva. Verificá tu perfil antes de continuar.",
        variant: "destructive",
      });
      return;
    }

    setSubmittingSlot(slotKey);

    try {
      const response = await createPublicBookingIntent({
        courtNumber,
        date: bookingDate,
        startTime: slot.startTime,
        userName,
        userPhone,
        playerId: playerId ?? undefined,
        personId: personId ?? undefined,
        payerEmail,
        clubSlug: config.slug,
        returnSection: "turnos",
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
        slug: config.slug,
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
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const handleContinuePayment = () => {
    if (!pendingPayment) {
      return;
    }

    window.location.href = pendingPayment.checkoutUrl;
  };

  const handleCancelBooking = async () => {
    if (!pendingPayment?.bookingId) return;
    if (!cancelConfirm) {
      setCancelConfirm(true);
      return;
    }

    setCancelling(true);
    try {
      const result = await cancelBooking(pendingPayment.bookingId);
      clearPendingPayment();
      setCancelConfirm(false);
      toast({ title: result.message });
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: bookingKeys.list(config.tenantId, bookingDate),
        }),
        queryClient.invalidateQueries({
          queryKey: bookingKeys.availabilityByTenant(config.tenantId, bookingDate),
        }),
      ]);
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : "Error al cancelar",
        variant: "destructive",
      });
    } finally {
      setCancelling(false);
    }
  };

  const allCourtSlots = activeCourts.map((court) => ({
    court,
    slots: generateTimeSlots(
      config.openingMorning,
      config.closingMorning,
      config.turnDuration,
      court.number,
      bookings,
    ),
  }));

  const timeSlotMap = new Map<string, { courtNumber: number; slot: TimeSlot; court: typeof activeCourts[0] }[]>();
  for (const { court, slots } of allCourtSlots) {
    for (const slot of slots) {
      const key = slot.startTime;
      if (!timeSlotMap.has(key)) timeSlotMap.set(key, []);
      timeSlotMap.get(key)!.push({ courtNumber: court.number, slot, court });
    }
  }
  const timeSlotEntries = [...timeSlotMap.entries()].sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-[#F2F3F5]">Reservar turno</h2>
        <p className="text-sm text-[#6B7280]">{config.clubName}</p>
      </div>

      {pendingPayment ? (
        <div className="rounded-2xl border border-amber-900/60 bg-amber-950/30 p-4 text-sm text-amber-100">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="font-semibold">
                Reserva pendiente: {pendingCourtLabel} a las {pendingPayment.startTime}
              </p>
              <p className="text-amber-200">
                {isPendingPaymentExpired
                  ? "El tiempo de pago venció."
                  : `Te quedan ${paymentCountdown} para pagar.`}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {!isPendingPaymentExpired ? (
                <Button onClick={handleContinuePayment} className="bg-amber-500 text-white hover:bg-amber-400">
                  Continuar pago
                </Button>
              ) : null}
              <Button
                variant="outline"
                onClick={handleCancelBooking}
                disabled={cancelling}
                className={cancelConfirm ? "border-rose-900/60 bg-rose-950/30 text-rose-300" : "border-amber-900/60 bg-[#14161A] text-amber-100"}
              >
                {cancelling ? "Cancelando..." : cancelConfirm ? "Confirmar cancelación" : "Cancelar reserva"}
              </Button>
              {cancelConfirm && !cancelling ? (
                <Button variant="outline" onClick={() => setCancelConfirm(false)} className="border-amber-900/60 bg-[#14161A] text-amber-100">
                  No, mantener
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {/* Day selector - horizontal chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        {Array.from({ length: 7 }).map((_, i) => {
          const date = new Date();
          date.setDate(date.getDate() + i);
          const isSelected = format(date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
          const dayLabel = i === 0 ? "Hoy" : format(date, "EEE", { locale: es }).replace(/^\w/, c => c.toUpperCase());
          const dayNum = format(date, "d");

          return (
            <button
              key={i}
              onClick={() => setSelectedDate(date)}
              className={`flex shrink-0 flex-col items-center rounded-xl px-4 py-2 text-xs font-medium transition ${
                isSelected
                  ? "border border-[#D6FF3D] bg-[#D6FF3D]/10 text-[#D6FF3D]"
                  : "border border-[#1E2028] bg-[#101216] text-[#6B7280] hover:border-[#2a3036]"
              }`}
            >
              <span>{dayLabel}</span>
              <span className="text-lg font-bold">{dayNum}</span>
            </button>
          );
        })}
      </div>

      {/* View toggle: Por horario / Por cancha */}
      <div className="flex rounded-xl border border-[#1E2028] bg-[#101216] p-1 w-fit">
        <button
          onClick={() => setSelectedCourt(null)}
          className={`rounded-lg px-4 py-1.5 text-xs font-medium transition ${
            selectedCourt === null
              ? "bg-[#F2F3F5] text-[#0A0B0D]"
              : "text-[#6B7280] hover:text-[#9CA3AF]"
          }`}
        >
          Por horario
        </button>
        <button
          onClick={() => setSelectedCourt(-1)}
          className={`rounded-lg px-4 py-1.5 text-xs font-medium transition ${
            selectedCourt !== null
              ? "bg-[#F2F3F5] text-[#0A0B0D]"
              : "text-[#6B7280] hover:text-[#9CA3AF]"
          }`}
        >
          Por cancha
        </button>
      </div>

      {/* Schedule */}
      {isDayClosed ? (
        <div className="rounded-2xl border border-dashed border-[#2a3036] bg-[#14161A] p-8 text-center text-sm text-[#6B7280]">
          El club no abre este día.
        </div>
      ) : isBookingsLoading ? (
        <ScheduleSkeleton count={activeCourts.length} />
      ) : selectedCourt === null ? (
        /* === BY TIME VIEW === */
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[...timeSlotEntries]
            .sort(([, a], [, b]) => {
              const aAvail = a.some((c) => c.slot.status === "available" && !isSlotPast(bookingDate, c.slot.startTime, currentTime));
              const bAvail = b.some((c) => c.slot.status === "available" && !isSlotPast(bookingDate, c.slot.startTime, currentTime));
              if (aAvail === bAvail) return 0;
              return aAvail ? -1 : 1;
            })
            .map(([startTime, courts]) => {
            const availableCount = courts.filter((c) => c.slot.status === "available" && !isSlotPast(bookingDate, c.slot.startTime, currentTime)).length;
            const slotIsPast = isSlotPast(bookingDate, startTime, currentTime);
            const hasAvailable = availableCount > 0;

            return (
              <div key={startTime} className="rounded-2xl border border-[#1E2028] bg-[#101216] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className={`text-xl font-bold ${!hasAvailable ? "text-[#4B5563]" : "text-[#F2F3F5]"}`}>
                    {startTime}
                  </h3>
                  <span className="text-xs text-[#6B7280]">{availableCount} libres</span>
                </div>
                <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(courts.length, 7)}, minmax(0, 1fr))` }}>
                  {courts.map(({ courtNumber, slot }) => {
                    const isPast = isSlotPast(bookingDate, slot.startTime, currentTime);
                    const isPending = slot.status === "pending";
                    const isOccupied = slot.status === "occupied" || isPast;
                    const slotKey = `${courtNumber}-${bookingDate}-${slot.startTime}`;
                    const isSubmittingThis = submittingSlot === slotKey;

                    if (isSubmittingThis) {
                      return (
                        <div key={courtNumber} className="flex h-10 items-center justify-center rounded-xl border border-[#D6FF3D]/50 bg-[#D6FF3D]/10">
                          <Loader2 className="h-4 w-4 animate-spin text-[#D6FF3D]" />
                        </div>
                      );
                    }

                    if (isPending) {
                      return (
                        <div key={courtNumber} className="flex h-10 items-center justify-center rounded-xl border border-amber-900/60 bg-amber-950/30 text-xs font-bold text-amber-200">
                          {courtNumber}
                        </div>
                      );
                    }

                    if (isOccupied) {
                      return (
                        <div key={courtNumber} className="flex h-10 items-center justify-center rounded-xl border border-[#1E2028] bg-[#1a1d24] text-xs font-bold text-[#4B5563]">
                          {courtNumber}
                        </div>
                      );
                    }

                    return (
                      <button
                        key={courtNumber}
                        onClick={() => handleBooking(courtNumber, slot)}
                        disabled={!config.hasWebBooking}
                        className="flex h-10 items-center justify-center rounded-xl border border-[#D6FF3D]/40 bg-[#D6FF3D]/10 text-sm font-bold text-[#D6FF3D] transition hover:bg-[#D6FF3D]/20"
                      >
                        {courtNumber}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* === BY COURT VIEW === */
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {activeCourts.map((court) => {
            const slots = generateTimeSlots(
              config.openingMorning,
              config.closingMorning,
              config.turnDuration,
              court.number,
              bookings,
            );
            const envLabel = formatCourtEnvironment(court.environment);
            const structLabel = formatCourtStructure(court.structure);

            return (
              <div key={court.number} className="rounded-2xl border border-[#1E2028] bg-[#101216] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-base font-bold text-[#F2F3F5]">Cancha {court.number}</h3>
                    {structLabel && <span className="text-xs text-[#6B7280]">{structLabel}</span>}
                  </div>
                  {envLabel && (
                    <span className="text-xs text-[#6B7280]">{envLabel}</span>
                  )}
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {slots.map((slot) => {
                    const isPast = isSlotPast(bookingDate, slot.startTime, currentTime);
                    const isPending = slot.status === "pending";
                    const isOccupied = slot.status === "occupied" || isPast;
                    const slotKey = `${court.number}-${bookingDate}-${slot.startTime}`;
                    const isSubmittingThis = submittingSlot === slotKey;

                    if (isSubmittingThis) {
                      return (
                        <div key={slot.startTime} className="flex h-10 items-center justify-center rounded-xl border border-[#D6FF3D]/50 bg-[#D6FF3D]/10 px-3">
                          <Loader2 className="h-4 w-4 animate-spin text-[#D6FF3D]" />
                        </div>
                      );
                    }

                    if (isPending) {
                      return (
                        <div key={slot.startTime} className="flex h-10 items-center justify-center rounded-xl border border-amber-900/60 bg-amber-950/30 px-3 text-xs font-bold text-amber-200">
                          {slot.startTime}
                        </div>
                      );
                    }

                    if (isOccupied) {
                      return (
                        <div key={slot.startTime} className="flex h-10 items-center justify-center rounded-xl border border-[#1E2028] bg-[#1a1d24] px-3 text-xs font-bold text-[#4B5563]">
                          {slot.startTime}
                        </div>
                      );
                    }

                    return (
                      <button
                        key={slot.startTime}
                        onClick={() => handleBooking(court.number, slot)}
                        disabled={!config.hasWebBooking}
                        className="flex h-10 items-center justify-center rounded-xl border border-[#D6FF3D]/40 bg-[#D6FF3D]/10 px-3 text-xs font-bold text-[#D6FF3D] transition hover:bg-[#D6FF3D]/20"
                      >
                        {slot.startTime}
                      </button>
                    );
                  })}
                </div>
              </div>
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
    <Card className="rounded-2xl border-[#1E2028] bg-[#101216]">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-sm font-bold text-white">
            {courtNumber}
          </div>
          <div className="space-y-1">
            <CardTitle className="text-base text-[#F2F3F5]">{courtName}</CardTitle>
            <div className="flex flex-wrap gap-2">
              {environmentLabel ? (
                <Badge variant="outline" className="border-[#2a3036] bg-[#D6FF3D]/10 text-[11px] font-normal text-[#D6FF3D]">
                  {environmentLabel}
                </Badge>
              ) : null}
              {structureLabel ? (
                <Badge variant="outline" className="border-[#2a3036] bg-[#D6FF3D]/10 text-[11px] font-normal text-[#D6FF3D]">
                  {structureLabel}
                </Badge>
              ) : null}
              {surfaceLabel ? (
                <Badge variant="outline" className="border-[#2a3036] bg-[#D6FF3D]/10 text-[11px] font-normal text-[#D6FF3D]">
                  {surfaceLabel}
                </Badge>
              ) : null}
            </div>
            <p className="text-xs text-[#6B7280]">
              {availableCount} turnos disponibles
            </p>
            {showCourtPrice ? (
              <p className="text-xs font-semibold text-[#D6FF3D]">
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

  if (isSubmitting) {
    return (
        <Button
        variant="outline"
        className="h-auto rounded-2xl border-[#2a3036] bg-[#14161A] px-3 py-2.5 text-xs font-medium text-[#9CA3AF] border-[#1E2028] bg-[#14161A]"
        // disabled
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
        className="flex items-center justify-center rounded-2xl border border-[#2a3036] bg-[#1a1d24] px-3 py-2.5 text-center opacity-60 bg-[#14161A]"
      >
        <span className="text-xs font-medium text-[#6B7280] line-through">
          {slot.startTime} - {slot.endTime}
        </span>
      </div>
    );
  }

  if (slot.status === "pending") {
    return (
      <div
        className="flex items-center justify-center rounded-2xl border border-amber-900/60/40 bg-amber-950/30 px-3 py-2.5 text-center"
      >
        <div className="flex items-center gap-1.5">
          <Clock className="h-3 w-3 text-amber-200" />
          <span className="text-xs font-medium text-amber-200">
            Pendiente {slot.startTime}
          </span>
        </div>
      </div>
    );
  }

  if (isPast) {
    return (
      <div
        className="flex items-center justify-center rounded-2xl border border-[#2a3036] bg-[#1a1d24] px-3 py-2.5 text-center opacity-60 bg-[#14161A]"
      >
        <span className="text-xs font-medium text-[#6B7280] line-through">
          {slot.startTime} - {slot.endTime}
        </span>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      className={cn(
        "h-auto rounded-2xl border-[#2a3036] bg-[#14161A]/50 px-3 py-2.5 text-xs font-medium text-[#9CA3AF] border-[#1E2028] bg-[#14161A]",
        "hover:border-[#D6FF3D]/50 hover:bg-[#D6FF3D]/15 hover:text-[#D6FF3D]",
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
        <Card key={i} className="rounded-2xl border-[#1E2028] bg-[#101216]">
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
