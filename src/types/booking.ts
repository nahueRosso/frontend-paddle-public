export type SlotStatus = "available" | "pending" | "occupied";
export type ManualSlotStatus = "available" | "occupied";
export type BookingStatus = "pending" | "confirmed" | "cancelled" | "expired";
export type BookingSource = "whatsapp" | "web" | "mobile";
export type BookingReservedBy = "usuario" | "administrador" | "match" | "torneo";

export interface SlotBookingData {
  bookingId?: string;
  userName?: string;
  userPhone?: string;
  status?: BookingStatus;
  reservedBy?: BookingReservedBy;
  source?: BookingSource;
  createdAt?: string;
}

export interface SlotChangeRequest {
  status: ManualSlotStatus;
  userName?: string;
  userPhone?: string;
}

export interface TimeSlot {
  time: string;
  status: SlotStatus;
  data?: SlotBookingData;
}

export interface CourtAvailability {
  courtId: number;
  slots: TimeSlot[];
}
export type CourtSchedule = CourtAvailability[];

export interface CreateBooking {
  tenantId: string;
  courtNumber: number;
  date: string;
  startTime: string;
  userName: string;
  userPhone: string;
  reservedBy?: "usuario" | "administrador" | "match" | "torneo";
  source?: "whatsapp" | "web" | "mobile";
  status?: BookingStatus;
}

export type PublicBookingIntentMode =
  | "verification_required"
  | "direct_reservation"
  | "payment_required";

export type PublicBookingIntentPayload = Omit<CreateBooking, "userPhone"> & {
  userPhone?: string;
  playerId?: string;
  personId?: string;
  payerEmail?: string;
  clubSlug?: string;
  returnSection?: string;
};

export type PublicBookingIntentResponse =
  | {
      mode: "verification_required";
      reason?: string;
      message?: string;
    }
  | {
      mode: "direct_reservation";
      message?: string;
      bookingId?: string;
    }
  | {
      mode: "payment_required";
      message?: string;
      bookingId?: string;
      billingPaymentId?: string;
      checkoutUrl: string;
      expiresAt: string;
    };

export type BillingBookingStatusResponse = {
  status?: string;
  paymentStatus?: string;
  bookingStatus?: BookingStatus | "expired";
  bookingId?: string;
  tenantId?: string;
  externalReference?: string;
  message?: string;
  booking?: {
    id?: string;
    tenantId?: string;
    date?: string;
    startTime?: string;
    courtNumber?: number;
    status?: BookingStatus | "expired";
  };
  billingPayment?: {
    id?: string;
    paymentId?: string;
    status?: string;
    externalReference?: string;
  };
  [key: string]: unknown;
};

export type BookingResponse = {
  id?: string;
  tenantId: string;
  courtNumber: number;
  date: string;
  startTime: string;
  endTime?: string;
  status: BookingStatus;
  createdAt?: string;
  message: string;
};

export interface Booking {
  id: string;
  courtNumber: number;
  date: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  userName?: string;
  userPhone?: string;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  status: "available" | "occupied" | "pending";
  bookingId?: string;
  data?: SlotBookingData;
}
