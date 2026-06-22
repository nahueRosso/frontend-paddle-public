export type CourtStructure = "blindex" | "clasica";
export type CourtEnvironment = "cerrada" | "abierta";
export type CourtSurface = "sintetico" | "cemento";

export interface CourtConfig {
  id?: string;
  tenantConfigId?: string;
  number: number;
  active: boolean;
  structure?: CourtStructure;
  environment?: CourtEnvironment;
  surface?: CourtSurface;
  details?: string;
  price?: number | null;
  name?: string;
  isIndoor?: boolean;
}


// export interface TenantConfig {
//   id: string;
//   tenantId: string;
//   slug?: string | null;
//   logoUrl?: string | null;
//   iconUrl?: string | null;
//   clubName: string;
//   slogan: string | null;
//   address: string;
//   city?: string | null;
//   province?: string | null;
//   contactPhone: string;
//   contactEmail: string;
//   hasWebBooking?: boolean | null;
//   turnDuration: number;
//   isDiscontinuous: boolean;
//   openingMorning?: string | null;
//   closingMorning?: string | null;
//   openingEvening?: string | null;
//   closingEvening?: string | null;
//   courts: CourtConfig[];
//   priceMode: "uniform" | "byCourt" | "byHour";
//   basePrice: number;
//   peakPrice?: number | null;
//   peakStart?: string | null;
//   peakEnd?: string | null;
//   paymentPlanId?: string | null;
//   paymentConfig?: {
//     provider?: "mercadopago" | "stripe" | null;
//     accessToken?: string | null;
//     currency?: string | null;
//   } | null;
//   whatsappConfig?: {
//     phoneNumberId?: string | null;
//     accessToken?: string | null;
//     templateName?: string | null;
//   } | null;
// }

export interface TenantConfig {
  id: string;
  tenantId: string;
  slug: string;
  slogan?: string | null;
  logoUrl?: string;
  iconUrl?: string;
  clubName: string;
  address: string;
  city?: string;
  province?: string;
  latitude?: number | null;
  longitude?: number | null;
  placeId?: string | null;
  contactPhone: string;
  contactEmail: string;
  turnDuration: number;
  isDiscontinuous: boolean;
  openingMorning?: string;
  closingMorning?: string;
  openingEvening?: string;
  closingEvening?: string;
  courts: Array<{
    number: number;
    active: boolean;
    structure: string;
    environment: string;
    surface?: string;
    details?: string;
    price?: number;
  }>;

  priceMode: "uniform" | "byCourt" | "byHour";
  basePrice: number;
  peakPrice?: number;
  peakStart?: string;
  peakEnd?: string;

  isTurnsEnabled: boolean;
  isClassesEnabled: boolean;
  isMatchEnabled: boolean;
  isTournamentsEnabled: boolean;

  bookingTotalPrice: number;
  bookingReservationPrice: number;
  matchTotalPrice: number;
  matchReservationPrice: number;

  features: {
    turnos: boolean;
    clases: boolean;
    match: boolean;
    torneos: boolean;
  };

  pricing: {
    booking: {
      totalPrice: number;
      reservationPrice: number;
    };
    match: {
      totalPrice: number;
      reservationPrice: number;
    };
  };

  bookingRules?: {
    allowUnverifiedPlayers: boolean;
    unverifiedPlayerReservationPrice: number;
    showCourtPrice: boolean;
  };

  hasWebBooking?: boolean;
  hasWhatsApp?: boolean;
  isVisible?: boolean;
  paymentStatus?: "pending" | "approved" | "rejected";
  paymentConfig?: {
    provider?: "mercadopago" | "stripe";
    accessToken?: string;
    currency?: string;
  };
  whatsappConfig?: {
    phoneNumberId?: string;
    accessToken?: string;
    templateName?: string;
  };
}


export type TenantPublic = {
  id: string;
  clubName: string;
  province?: string;
  hasWhatsApp: boolean;
  hasWebBooking: boolean;
};

export type Court = CourtConfig;

export interface ClubConfig {
  id: number;
  slug: string;
  slogan: string | null;
  tenantId: string;
  clubName: string;
  address: string;

  city: string;
  province: string;
  latitude?: number | null;
  longitude?: number | null;
  placeId?: string | null;

  contactPhone: string;
  contactEmail: string;

  openDays?: number[];
  turnDuration: number;
  isDiscontinuous: boolean;

  openingMorning: string;
  closingMorning: string;

  openingEvening?: string;
  closingEvening?: string;

  courts: CourtConfig[];

  priceMode: "uniform" | "byCourt" | "byHour";
  basePrice: number;
  peakPrice?: number;
  peakStart?: string;
  peakEnd?: string;

  hasWebBooking: boolean;
  isTurnsEnabled?: boolean;
  isClassesEnabled?: boolean;
  isMatchEnabled?: boolean;
  isTournamentsEnabled?: boolean;
  features?: {
    turnos: boolean;
    clases: boolean;
    match: boolean;
    torneos: boolean;
  };
  pricing?: {
    booking: {
      totalPrice: number;
      reservationPrice: number;
    };
    match: {
      totalPrice: number;
      reservationPrice: number;
    };
  };
  bookingRules?: {
    allowUnverifiedPlayers: boolean;
    unverifiedPlayerReservationPrice: number;
    showCourtPrice: boolean;
  };
  bookingTotalPrice?: number;
  bookingReservationPrice?: number;
  matchTotalPrice?: number;
  matchReservationPrice?: number;

  iconUrl?: string;
  logoUrl?: string;
}


export interface ClubesFetch {
  iconUrl?: string;
  logoUrl?: string;
  clubName: string;
  hasWebBooking: boolean;
  hasWhatsApp: boolean;
  id: string;
  address:string;
  city:string;
  province: string;
  slug: string;
  tenantId: string;
  paymentStatus:'pending' | 'approved' | 'rejected';
}
