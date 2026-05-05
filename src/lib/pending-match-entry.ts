export type PendingMatchEntry = {
  tenantId: string;
  slug: string;
  ownerIdentity: string;
  requestId: string;
  status: string;
  checkoutUrl?: string;
  paymentId?: string;
  externalReference?: string;
};

const STORAGE_PREFIX = "pending-match-entry:";

export function buildPendingMatchEntryStorageKey(
  tenantId: string,
  ownerIdentity: string,
) {
  return `${STORAGE_PREFIX}${tenantId}:${ownerIdentity}`;
}

export function parsePendingMatchEntry(rawValue: string | null) {
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as PendingMatchEntry;
  } catch {
    return null;
  }
}

export function getPendingMatchEntry(
  tenantId: string,
  ownerIdentity: string,
) {
  if (typeof window === "undefined") {
    return null;
  }

  return parsePendingMatchEntry(
    window.localStorage.getItem(
      buildPendingMatchEntryStorageKey(tenantId, ownerIdentity),
    ),
  );
}

export function setPendingMatchEntry(entry: PendingMatchEntry) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    buildPendingMatchEntryStorageKey(entry.tenantId, entry.ownerIdentity),
    JSON.stringify(entry),
  );
}

export function clearPendingMatchEntry(
  tenantId: string,
  ownerIdentity: string,
) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(
    buildPendingMatchEntryStorageKey(tenantId, ownerIdentity),
  );
}
