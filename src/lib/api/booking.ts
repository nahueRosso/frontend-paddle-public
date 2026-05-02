import {
  Booking,
  BookingResponse,
  BookingStatus,
  CourtSchedule,
  CreateBooking,
  PublicBookingIntentPayload,
  PublicBookingIntentResponse,
} from "@/types/booking";
import { fetchWithTenantAdmin } from "../fetchWithTenantAdmin";
 
export async function fetchBookings(
  tenantId: string,
  date?: string
): Promise<Booking[]> {
  try {
    let endpoint = `/bookings/${tenantId}`;
    if (date) endpoint += `?date=${date}`;

    const res = await fetchWithTenantAdmin(endpoint, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Error al traer bookings: ${res.status}`);
    }

    // 👇 Si el backend responde vacío → []
    const text = await res.text();
    if (!text) return [];

    try {
      return JSON.parse(text) as Booking[];
    } catch {
      console.error("⚠️ JSON inválido en /bookings →", text);
      return [];
    }
  } catch (error) {
    console.error("❌ fetchBookings error:", error);
    return []; // 👈 evita romper UI
  }
}


  
export async function fetchGetAvailability(
  googleId: string,
 date?: string
): Promise<CourtSchedule> {
  let endpoint = `/bookings/availability/${googleId}`;
    if (date) endpoint += `?date=${date}`;
  const res = await fetchWithTenantAdmin(endpoint, {
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Error al traer ejercicios");
  const json = (await res.json()) as CourtSchedule;
  return json;
}


export async function CreatePaddleBooking(
  data: CreateBooking
): Promise<BookingResponse> {
  const res = await fetchWithTenantAdmin("/bookings/reserve", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const text = await res.text();
  let payload: Partial<BookingResponse> | null = null;

  if (text) {
    try {
      payload = JSON.parse(text) as Partial<BookingResponse>;
    } catch {
      payload = null;
    }
  }

  if (!res.ok) {
    throw new Error(payload?.message || "Error al crear la reserva");
  }

  return {
    tenantId: data.tenantId,
    courtNumber: data.courtNumber,
    date: data.date,
    startTime: data.startTime,
    status: (payload?.status as BookingResponse["status"] | undefined) ?? "pending",
    message: payload?.message || "Reserva creada correctamente.",
    id: payload?.id,
    endTime: payload?.endTime,
    createdAt: payload?.createdAt,
  };
}

export async function createPublicBookingIntent(
  data: PublicBookingIntentPayload,
): Promise<PublicBookingIntentResponse> {
  const response = await fetch("/api/bookings/public/intent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const text = await response.text();
  let payload: Record<string, unknown> | null = null;

  if (text) {
    try {
      payload = JSON.parse(text) as Record<string, unknown>;
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    const message =
      typeof payload?.message === "string"
        ? payload.message
        : typeof payload?.error === "string"
          ? payload.error
          : "Error al iniciar la reserva publica";
    throw new Error(message);
  }

  return payload as PublicBookingIntentResponse;
}

export async function updateBookingStatus({
  bookingId,
  status,
}: {
  bookingId: string;
  status: BookingStatus;
}): Promise<void> {
  const res = await fetchWithTenantAdmin(`/bookings/${bookingId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "No se pudo actualizar el estado de la reserva");
  }
}

export async function generateBookingStoryImage(tenantId: string): Promise<Blob> {
  const res = await fetchWithTenantAdmin(
    `/generate-image/story-booking/${tenantId}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "No se pudo generar la imagen de los turnos.");
  }

  return await res.blob();
}

