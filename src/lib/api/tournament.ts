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

export type TournamentActionResponse = {
  ok: boolean;
  code: string;
  message: string;
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

export async function fetchTournament(
  tenantId: string,
  status: "ongoing" | "finished" | "upcoming" | "post_deadline" = "ongoing",
): Promise<Tournament[]> {
  const response = await fetchWithTenantAdmin(
    `/tournament/${tenantId}?status=${status}`,
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
    `/tournament/${tenantId}/fixture`,
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
  const response = await fetchWithTenantAdmin(
    `/tournament/${tenantId}/${tournamentId}/player/${playerId}/options${query ? `?${query}` : ""}`,
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
  const response = await fetchWithTenantAdmin(
    `/tournament/${tenantId}/${tournamentId}/eligible-partners?${searchParams.toString()}`,
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
  const response = await fetchWithTenantAdmin(
    `/tournament/${tenantId}/${tournamentId}/partner-request`,
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
  const response = await fetchWithTenantAdmin(
    `/tournament/${tenantId}/${tournamentId}/available-players${query ? `?${query}` : ""}`,
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
  const response = await fetchWithTenantAdmin(
    `/tournament/${tenantId}/${tournamentId}/available-players`,
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

export async function withdrawTournamentAvailablePlayer(availablePlayerId: string) {
  const response = await fetchWithTenantAdmin(
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
  const response = await fetchWithTenantAdmin(
    `/tournament/${tenantId}/${tournamentId}/pick-available-player`,
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
}) {
  const response = await fetchWithTenantAdmin(
    `/tournament/${tenantId}/player/${playerId}/partner-requests`,
    { cache: "no-store" },
  );
  const json = await parseTournamentApiResponse<unknown>(
    response,
    "No se pudieron obtener las solicitudes.",
  );

  return normalizeArrayResponse<TournamentPartnerRequest>(json, "requests");
}

export async function acceptTournamentPartnerRequest({
  requestId,
  playerId,
}: {
  requestId: string;
  playerId: string;
}) {
  const response = await fetchWithTenantAdmin(
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
  const response = await fetchWithTenantAdmin(
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
