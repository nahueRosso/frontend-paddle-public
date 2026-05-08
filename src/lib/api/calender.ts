"use client";

import { fetchWithTenantAdmin } from "@/lib/fetchWithTenantAdmin";

export type CalenderBookingStatus =
  | "scheduled"
  | "pending"
  | "cancelled"
  | "completed"
  | "rescheduled"
  | string;

export type CalenderBooking = {
  id: number;
  name: string;
  email: string;
  googleId?: string | null;
  phoneNumber: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  notes?: string | null;
  status: CalenderBookingStatus;
};

export type MyBookingResponse = {
  hasActiveBooking: boolean;
  booking: CalenderBooking | null;
};

export type CalenderAvailabilitySlot = {
  startTime: string;
  endTime: string;
  startDateTime: string;
  endDateTime: string;
};

export type CalenderAvailability = {
  date: string;
  timeZone: string;
  durationMinutes: number;
  isBlockedDate: boolean;
  reason: string | null;
  slots: CalenderAvailabilitySlot[];
};

export type CreateCalenderBookingPayload = {
  name: string;
  email: string;
  googleId?: string;
  phoneNumber: string;
  bookingDate: string;
  startTime: string;
  durationMinutes: number;
  notes?: string;
};

export type CancelCalenderBookingResponse = {
  success: boolean;
  message: string;
};

type ErrorPayload = {
  message?: string;
  error?: string;
};

export class CalenderApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "CalenderApiError";
    this.status = status;
  }
}

async function parseResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  const text = await response.text();
  let payload: T | ErrorPayload | null = null;

  if (text) {
    try {
      payload = JSON.parse(text) as T | ErrorPayload;
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    const message =
      typeof (payload as ErrorPayload | null)?.message === "string"
        ? (payload as ErrorPayload).message!
        : typeof (payload as ErrorPayload | null)?.error === "string"
          ? (payload as ErrorPayload).error!
          : fallbackMessage;

    throw new CalenderApiError(message, response.status);
  }

  return payload as T;
}

export async function getMyCalenderBooking(email: string): Promise<MyBookingResponse> {
  const response = await fetchWithTenantAdmin(
    `/calender/my-booking?email=${encodeURIComponent(email)}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  return parseResponse<MyBookingResponse>(
    response,
    "No pudimos consultar tu reserva actual.",
  );
}

export async function getCalenderAvailability(
  date: string,
): Promise<CalenderAvailability> {
  const response = await fetchWithTenantAdmin(
    `/calender/availability?date=${encodeURIComponent(date)}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  return parseResponse<CalenderAvailability>(
    response,
    "No pudimos obtener la disponibilidad.",
  );
}

export async function createCalenderBooking(
  payload: CreateCalenderBookingPayload,
): Promise<CalenderBooking> {
  const response = await fetchWithTenantAdmin("/calender/bookings", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return parseResponse<CalenderBooking>(
    response,
    "No pudimos crear la reserva.",
  );
}

export async function cancelCalenderBooking(
  bookingId: number,
): Promise<CancelCalenderBookingResponse> {
  const response = await fetchWithTenantAdmin(`/calender/bookings/${bookingId}`, {
    method: "DELETE",
  });

  return parseResponse<CancelCalenderBookingResponse>(
    response,
    "No pudimos cancelar la reserva.",
  );
}
