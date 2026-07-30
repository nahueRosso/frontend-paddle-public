import { playerFetch } from "@/lib/auth/fetch";
import { fetchWithTenantAdmin } from "@/lib/fetchWithTenantAdmin";
import type { Tournament, TournamentCategory } from "@/types/tournament";
import type { TournamentGroup } from "@/types/tournament-group";

export type PartnerRequestStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "cancelled"
  | "expired";

export type AvailableTournamentPlayerStatus =
  | "available"
  | "picked"
  | "withdrawn"
  | "assigned";

export type TournamentRegistrationPlayer = {
  id: string;
  firstName?: string;
  lastName?: string;
  category?: number;
  gender?: string;
};

export type TournamentRegistrationStatus = "approved" | "pending";

export type TournamentPartnerRequestPayment = {
  paymentId: string;
  externalReference: string;
  status: string;
  provider: string;
  checkoutUrl: string | null;
  amountGross: number;
  createdAt: string;
  updatedAt: string;
};

export type TournamentPartnerRegistration = {
  teamId: string;
  registrationStatus?: TournamentRegistrationStatus;
  approved: boolean;
  tournament: Tournament | string;
  category: TournamentCategory | null;
  partner: TournamentRegistrationPlayer | null;
  payment: TournamentPartnerRequestPayment | null;
  canGeneratePaymentLink: boolean;
  canReusePaymentLink: boolean;
};

export type PartnerRequestsResponse = {
  requests: TournamentPartnerRequest[];
  tournamentRegistrations: TournamentPartnerRegistration[];
};

export type TournamentActionResponse = {
  ok: boolean;
  code: string;
  message: string;
  [key: string]: unknown;
};

export type TournamentBillingPaymentLinkPayload = {
  tenantId: string;
  tournamentTeamId: string;
  playerName?: string;
  playerPhone?: string;
  playerEmail?: string;
  tournamentId?: string;
};

export type TournamentBillingPaymentLinkResponse = {
  alreadyPaid?: boolean;
  checkoutUrl?: string;
  reusable?: boolean;
  externalReference?: string;
  message?: string;
  [key: string]: unknown;
};

export type BillingTournamentStatusResponse = {
  paymentStatus?: string;
  status?: string;
  externalReference?: string;
  billingPayment?: {
    status?: string;
    externalReference?: string;
    [key: string]: unknown;
  } | null;
  tournamentTeam?: {
    id?: string;
    approved?: boolean;
    [key: string]: unknown;
  } | null;
  team?: {
    id?: string;
    approved?: boolean;
    [key: string]: unknown;
  } | null;
  [key: string]: unknown;
};

export type TournamentAvailablePlayer = {
  id: string;
  playerId?: string;
  status?: AvailableTournamentPlayerStatus;
  player?: TournamentRegistrationPlayer | null;
  firstName?: string;
  lastName?: string;
  category?: number;
  gender?: string;
};

export type TournamentPartnerRequest = {
  id: string;
  status: PartnerRequestStatus;
  requesterPlayerId?: string;
  requestedPlayerId?: string;
  requester?: TournamentRegistrationPlayer | null;
  requested?: TournamentRegistrationPlayer | null;
  requesterPlayer?: TournamentRegistrationPlayer | null;
  requestedPlayer?: TournamentRegistrationPlayer | null;
  tournament?: Pick<Tournament, "id" | "name"> | null;
  category?: TournamentCategory | null;
};

export type TournamentRegistrationOptions = {
  canRegister?: boolean;
  alreadyHasPartner?: boolean;
  hasPartner?: boolean;
  isAvailable?: boolean;
  message?: string;
  receivedRequests?: TournamentPartnerRequest[];
  sentRequests?: TournamentPartnerRequest[];
  tournament?: Tournament;
  category?: TournamentCategory | null;
  player?: TournamentRegistrationPlayer;
  availablePlayer?: TournamentAvailablePlayer | null;
  availablePlayerId?: string | null;
};

function appendCategoryParam(searchParams: URLSearchParams, categoryId?: string) {
  if (categoryId) {
    searchParams.set("categoryId", categoryId);
  }
}

async function parseTournamentApiResponse<T>(
  response: Response,
  fallbackMessage: string,
) {
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    if (response.status === 403) {
      const message = "Solo el jugador invitado puede responder esta solicitud.";
      throw Object.assign(new Error(message), {
        response: { data: { ...error, message } },
      });
    }

    const message = error?.message || fallbackMessage;
    throw Object.assign(new Error(message), {
      response: { data: { ...error, message } },
    });
  }

  return response.json().catch(() => null) as Promise<T>;
}

function normalizeArrayResponse<T>(json: unknown, key: string): T[] {
  if (Array.isArray(json)) return json as T[];
  if (json && typeof json === "object") {
    const record = json as Record<string, unknown>;
    if (Array.isArray(record[key])) return record[key] as T[];
    if (Array.isArray(record.data)) return record.data as T[];
    if (Array.isArray(record.items)) return record.items as T[];
  }

  return [];
}

function normalizePartnerRequestsResponse(json: unknown): PartnerRequestsResponse {
  if (!json || typeof json !== "object") {
    return { requests: [], tournamentRegistrations: [] };
  }

  const record = json as Record<string, unknown>;
  const rawRegistrations = record.tournamentRegistrations;

  return {
    requests: Array.isArray(record.requests)
      ? (record.requests as TournamentPartnerRequest[])
      : [],
    tournamentRegistrations: Array.isArray(rawRegistrations)
      ? (rawRegistrations as TournamentPartnerRegistration[])
      : rawRegistrations && typeof rawRegistrations === "object"
        ? [rawRegistrations as TournamentPartnerRegistration]
        : [],
  };
}

export async function fetchTournament(
  tenantId: string,
  status: "ongoing" | "finished" | "upcoming" | "post_deadline" = "ongoing",
): Promise<Tournament[]> {
  const response = await fetchWithTenantAdmin(
    `/tournament?status=${status}`,
    { cache: "no-store" },
  );

  if (!response.ok) {
    throw new Error("No se pudieron obtener los torneos.");
  }

  return (await response.json()) as Tournament[];
}

export async function fetchTournamentsByStatus(
  tenantId: string,
): Promise<TournamentGroup[]> {
  const response = await fetchWithTenantAdmin(
    "/tournament/fixture",
    { cache: "no-store" },
  );

  if (!response.ok) {
    throw new Error("No se pudo obtener el fixture del torneo.");
  }

  return (await response.json()) as TournamentGroup[];
}

export async function fetchTournamentRegistrationOptions({
  tenantId,
  tournamentId,
  playerId,
  categoryId,
}: {
  tenantId: string;
  tournamentId: string;
  playerId: string;
  categoryId?: string;
}) {
  const searchParams = new URLSearchParams();
  appendCategoryParam(searchParams, categoryId);
  const query = searchParams.toString();
  const response = await playerFetch(
    `/tournament/${tournamentId}/player/${playerId}/options${query ? `?${query}` : ""}`,
    { cache: "no-store" },
  );

  return parseTournamentApiResponse<TournamentRegistrationOptions>(
    response,
    "No se pudo consultar el estado de inscripción.",
  );
}

export async function fetchEligibleTournamentPartners({
  tenantId,
  tournamentId,
  playerId,
  categoryId,
}: {
  tenantId: string;
  tournamentId: string;
  playerId: string;
  categoryId?: string;
}) {
  const searchParams = new URLSearchParams({ playerId });
  appendCategoryParam(searchParams, categoryId);
  const response = await playerFetch(
    `/tournament/${tournamentId}/eligible-partners?${searchParams.toString()}`,
    { cache: "no-store" },
  );
  const json = await parseTournamentApiResponse<unknown>(
    response,
    "No se pudo obtener la lista de compañeros elegibles.",
  );

  return normalizeArrayResponse<TournamentRegistrationPlayer>(json, "players");
}

export async function createTournamentPartnerRequest({
  tenantId,
  tournamentId,
  requesterPlayerId,
  requestedPlayerId,
  categoryId,
}: {
  tenantId: string;
  tournamentId: string;
  requesterPlayerId: string;
  requestedPlayerId: string;
  categoryId?: string;
}) {
  const response = await playerFetch(
    `/tournament/${tournamentId}/partner-request`,
    {
      method: "POST",
      body: JSON.stringify({
        requesterPlayerId,
        requestedPlayerId,
        ...(categoryId ? { categoryId } : {}),
      }),
    },
  );

  return parseTournamentApiResponse<TournamentActionResponse>(
    response,
    "No se pudo enviar la solicitud.",
  );
}

export async function fetchTournamentAvailablePlayers({
  tenantId,
  tournamentId,
  categoryId,
}: {
  tenantId: string;
  tournamentId: string;
  categoryId?: string;
}) {
  const searchParams = new URLSearchParams();
  appendCategoryParam(searchParams, categoryId);
  const query = searchParams.toString();
  const response = await playerFetch(
    `/tournament/${tournamentId}/available-players${query ? `?${query}` : ""}`,
    { cache: "no-store" },
  );
  const json = await parseTournamentApiResponse<unknown>(
    response,
    "No se pudo obtener la lista de jugadores disponibles.",
  );

  return normalizeArrayResponse<TournamentAvailablePlayer>(json, "players");
}

export async function addTournamentAvailablePlayer({
  tenantId,
  tournamentId,
  playerId,
  categoryId,
}: {
  tenantId: string;
  tournamentId: string;
  playerId: string;
  categoryId?: string;
}) {
  const response = await playerFetch(
    `/tournament/${tournamentId}/available-players`,
    {
      method: "POST",
      body: JSON.stringify({
        playerId,
        ...(categoryId ? { categoryId } : {}),
      }),
    },
  );

  return parseTournamentApiResponse<TournamentActionResponse>(
    response,
    "No se pudo agregarte a jugadores disponibles.",
  );
}

export async function registerTournamentAmericanoPlayer({
  tournamentId,
  playerId,
  categoryId,
}: {
  tournamentId: string;
  playerId: string;
  categoryId?: string;
}) {
  const response = await playerFetch(`/tournament/americano/register`, {
    method: "POST",
    body: JSON.stringify({
      tournamentId,
      playerId,
      ...(categoryId ? { categoryId } : {}),
    }),
  });

  return parseTournamentApiResponse<TournamentActionResponse>(
    response,
    "No se pudo completar la inscripcion.",
  );
}

export async function withdrawTournamentAvailablePlayer(availablePlayerId: string) {
  const response = await playerFetch(
    `/tournament/available-players/${availablePlayerId}`,
    { method: "DELETE" },
  );

  return parseTournamentApiResponse<TournamentActionResponse>(
    response,
    "No se pudo salir de la lista de jugadores disponibles.",
  );
}

export async function pickTournamentAvailablePlayer({
  tenantId,
  tournamentId,
  pickerPlayerId,
  availablePlayerId,
}: {
  tenantId: string;
  tournamentId: string;
  pickerPlayerId: string;
  availablePlayerId: string;
}) {
  const response = await playerFetch(
    `/tournament/${tournamentId}/pick-available-player`,
    {
      method: "POST",
      body: JSON.stringify({
        pickerPlayerId,
        availablePlayerId,
      }),
    },
  );

  return parseTournamentApiResponse<TournamentActionResponse>(
    response,
    "No se pudo elegir el jugador disponible.",
  );
}

export async function fetchTournamentPartnerRequests({
  tenantId,
  playerId,
}: {
  tenantId: string;
  playerId: string;
}): Promise<PartnerRequestsResponse> {
  const response = await playerFetch(
    `/tournament/player/${playerId}/partner-requests`,
    { cache: "no-store" },
  );
  const json = await parseTournamentApiResponse<unknown>(
    response,
    "No se pudieron obtener las solicitudes.",
  );

  return normalizePartnerRequestsResponse(json);
}

export async function acceptTournamentPartnerRequest({
  requestId,
  playerId,
}: {
  requestId: string;
  playerId: string;
}) {
  const response = await playerFetch(
    `/tournament/partner-request/${requestId}/accept`,
    {
      method: "PATCH",
      body: JSON.stringify({ playerId }),
    },
  );

  return parseTournamentApiResponse<TournamentActionResponse>(
    response,
    "No se pudo aceptar la solicitud.",
  );
}

export async function rejectTournamentPartnerRequest({
  requestId,
  playerId,
}: {
  requestId: string;
  playerId: string;
}) {
  const response = await playerFetch(
    `/tournament/partner-request/${requestId}/reject`,
    {
      method: "PATCH",
      body: JSON.stringify({ playerId }),
    },
  );

  return parseTournamentApiResponse<TournamentActionResponse>(
    response,
    "No se pudo rechazar la solicitud.",
  );
}

export async function createTournamentPaymentLink(
  payload: TournamentBillingPaymentLinkPayload,
) {
  const response = await playerFetch("/api/billing/tournaments/payment-link", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  let body: Record<string, unknown> | null = null;

  if (text) {
    try {
      body = JSON.parse(text) as Record<string, unknown>;
    } catch {
      body = null;
    }
  }

  if (!response.ok) {
    const message =
      typeof body?.message === "string"
        ? body.message
        : typeof body?.error === "string"
          ? body.error
          : "No se pudo generar el link de pago del torneo.";
    throw new Error(message);
  }

  return (body ?? {}) as TournamentBillingPaymentLinkResponse;
}

export async function fetchBillingTournamentStatus(
  externalReference: string,
): Promise<BillingTournamentStatusResponse> {
  const response = await playerFetch(
    `/api/billing/tournaments/${encodeURIComponent(externalReference)}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  const text = await response.text();
  let body: Record<string, unknown> | null = null;

  if (text) {
    try {
      body = JSON.parse(text) as Record<string, unknown>;
    } catch {
      body = null;
    }
  }

  if (!response.ok) {
    const message =
      typeof body?.message === "string"
        ? body.message
        : typeof body?.error === "string"
          ? body.error
          : "No se pudo obtener el estado del pago del torneo.";
    throw new Error(message);
  }

  return (body ?? {}) as BillingTournamentStatusResponse;
}
