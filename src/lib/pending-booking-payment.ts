export type PendingBookingPayment = {
  bookingId: string;
  tenantId: string;
  slug: string;
  ownerIdentity: string;
  courtNumber: number;
  date: string;
  startTime: string;
  checkoutUrl: string;
  expiresAt: string;
  externalReference?: string;
};

const STORAGE_PREFIX = "pending-booking:";

export function buildPendingPaymentOwnerIdentity({
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

export function buildPendingPaymentStorageKey(
  tenantId: string,
  ownerIdentity: string,
) {
  return `${STORAGE_PREFIX}${tenantId}:${ownerIdentity}`;
}

export function parsePendingBookingPayment(rawValue: string | null) {
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as PendingBookingPayment;
  } catch {
    return null;
  }
}

export function listPendingBookingPayments() {
  if (typeof window === "undefined") {
    return [] as Array<{ key: string; value: PendingBookingPayment }>;
  }

  const entries: Array<{ key: string; value: PendingBookingPayment }> = [];

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);

    if (!key || !key.startsWith(STORAGE_PREFIX)) {
      continue;
    }

    const parsed = parsePendingBookingPayment(window.localStorage.getItem(key));

    if (!parsed) {
      window.localStorage.removeItem(key);
      continue;
    }

    entries.push({ key, value: parsed });
  }

  return entries;
}

export function clearPendingBookingPayments(
  predicate: (pending: PendingBookingPayment) => boolean,
) {
  for (const entry of listPendingBookingPayments()) {
    if (predicate(entry.value)) {
      window.localStorage.removeItem(entry.key);
    }
  }
}
