export type PendingTournamentPayment = {
  tenantId: string;
  slug: string;
  tournamentId: string;
  tournamentTeamId: string;
  checkoutUrl: string;
  externalReference?: string;
};

const STORAGE_PREFIX = "pending-tournament-payment:";

export function buildPendingTournamentPaymentStorageKey(
  tenantId: string,
  tournamentTeamId: string,
) {
  return `${STORAGE_PREFIX}${tenantId}:${tournamentTeamId}`;
}

export function parsePendingTournamentPayment(rawValue: string | null) {
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as PendingTournamentPayment;
  } catch {
    return null;
  }
}

export function listPendingTournamentPayments() {
  if (typeof window === "undefined") {
    return [] as Array<{ key: string; value: PendingTournamentPayment }>;
  }

  const entries: Array<{ key: string; value: PendingTournamentPayment }> = [];

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);

    if (!key || !key.startsWith(STORAGE_PREFIX)) {
      continue;
    }

    const parsed = parsePendingTournamentPayment(window.localStorage.getItem(key));

    if (!parsed) {
      window.localStorage.removeItem(key);
      continue;
    }

    entries.push({ key, value: parsed });
  }

  return entries;
}

export function setPendingTournamentPayment(payment: PendingTournamentPayment) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    buildPendingTournamentPaymentStorageKey(
      payment.tenantId,
      payment.tournamentTeamId,
    ),
    JSON.stringify(payment),
  );
}

export function clearPendingTournamentPayments(
  predicate: (pending: PendingTournamentPayment) => boolean,
) {
  for (const entry of listPendingTournamentPayments()) {
    if (predicate(entry.value)) {
      window.localStorage.removeItem(entry.key);
    }
  }
}
