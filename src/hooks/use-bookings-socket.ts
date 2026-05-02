"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";

import { bookingKeys } from "@/lib/queryKeys/booking";
import type { Booking } from "@/types/booking";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_DEMO_API_URL ?? "http://localhost:5000";

type UseBookingsSocketOptions = {
  tenantId?: string | null;
  bookingDate?: string;
  onBookingsList?: (bookings: Booking[]) => void;
};

export function useBookingsSocket({
  tenantId,
  bookingDate,
  onBookingsList,
}: UseBookingsSocketOptions) {
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!tenantId) {
      return;
    }

    const socket = io(SOCKET_URL, {
      auth: { tenantId },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("joinBookings");
    });

    socket.on("bookings:list", (bookings: Booking[]) => {
      const filteredBookings = bookingDate
        ? bookings.filter((booking) => booking.date === bookingDate)
        : bookings;

      if (bookingDate) {
        queryClient.setQueryData(
          bookingKeys.list(tenantId, bookingDate),
          filteredBookings,
        );
      }

      onBookingsList?.(filteredBookings);

      queryClient.invalidateQueries({
        queryKey: bookingKeys.availabilityByTenant(tenantId, bookingDate),
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [bookingDate, onBookingsList, queryClient, tenantId]);
}
