import { playerFetch, publicFetch } from "@/lib/auth/fetch"
import { fetchWithTenantAdmin } from "@/lib/fetchWithTenantAdmin"
import type { PublicPlayerSession } from "@/lib/public-player-session"

type CreatePlayerPayload = Record<string, unknown>
export type PlayerStatus = "pending" | "verified" | "rejected"

export type UpdatePlayerPayload = {
  firstName?: string
  lastName?: string
  phoneNumber?: string
  category?: number
  status?: PlayerStatus
}

export type TournamentSelectionGender = "male" | "female" | "mixed" | "mixed-only"
export type WomenCategoryMode = "same_categories" | "higher_categories"

export type GetAvailablePlayersParams = {
  categoryLevel: number
  gender: TournamentSelectionGender
  allowWomenInMaleCategory?: boolean
  womenCategoryMode?: WomenCategoryMode
  womenCategoryOffset?: number
  onlyVerified?: boolean
}

export type AvailablePlayer = {
  id: string
  firstName: string
  lastName: string
  category: number
  gender: TournamentSelectionGender
  status: PlayerStatus
  verified: boolean
}

export type GetAvailableSumPlayersParams = {
  sumLimit: number
  player1Id?: string
  onlyVerified?: boolean
}

export type AvailableSumPlayer = AvailablePlayer

export type TenantPlayer = {
  id: string
  dni: string | null
  birthdayDate: string | null
  tenantId: string
  phoneNumber: string
  puntos: number | null
  email: string
  firstName: string
  lastName: string
  category: number
  gender: TournamentSelectionGender
  status: PlayerStatus
  verified: boolean
  createdAt: string
  updatedAt: string
}

export type CreatePlayerResponse = PublicPlayerSession & {
  [key: string]: unknown
}

export type PublicPlayerLookupResponse = Partial<PublicPlayerSession> & {
  personExists?: boolean
  playerExists?: boolean
  verifiedInClub?: boolean
  playerStatus?: PlayerStatus | null
  personId?: string | null
  playerId?: string | null
  email?: string | null
  firstName?: string | null
  lastName?: string | null
  phoneNumber?: string | null
  [key: string]: unknown
}

export async function fetchPublicPlayerLookup(slug: string, email: string) {
  const response = await publicFetch(
    `/player/${slug}?email=${encodeURIComponent(email)}`,
    {
      method: "GET",
      cache: "no-store",
    },
  )

  if (response.status === 404) {
    return {
      personExists: false,
      playerExists: false,
      verifiedInClub: false,
      playerStatus: null,
      personId: null,
      playerId: null,
      email,
    } satisfies PublicPlayerLookupResponse
  }

  if (!response.ok) {
    const error = await response.json().catch(() => null)
    throw new Error(error?.message || "No se pudo obtener el perfil del jugador.")
  }

  return (await response.json().catch(() => null)) as PublicPlayerLookupResponse
}

export type ExistingPersonSummary = {
  id: string
  firstName: string | null
  lastName: string | null
  baseCategory: number | null
  gender: string
  phoneNumber: string | null
}

export type PhoneChallengeResponse =
  | { conflict: 'none' }
  | { conflict: 'person'; person: ExistingPersonSummary }
  | { conflict: 'player'; challengeId: string; whatsappNumber: string }

export type PhoneChallengeStatusResponse = {
  verified: boolean
  expired: boolean
}

export async function checkPhoneChallenge(phoneNumber: string): Promise<PhoneChallengeResponse> {
  const response = await publicFetch('/player/phone-challenge', {
    method: 'POST',
    body: JSON.stringify({ phoneNumber }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => null)
    throw new Error(error?.message || 'No se pudo verificar el teléfono.')
  }

  return response.json() as Promise<PhoneChallengeResponse>
}

export async function getPhoneChallengeStatus(challengeId: string): Promise<PhoneChallengeStatusResponse> {
  const response = await publicFetch(`/player/phone-challenge/${challengeId}`, {
    method: 'GET',
    cache: 'no-store',
  })

  if (!response.ok) {
    return { verified: false, expired: true }
  }

  return response.json() as Promise<PhoneChallengeStatusResponse>
}

export async function createPlayer(slug: string, payload: CreatePlayerPayload) {
  const { tenantId: _tenantId, ...body } = payload as CreatePlayerPayload & {
    tenantId?: string
  }
  const response = await publicFetch(`/player/${slug}`, {
    method: "POST",
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => null)
    throw new Error(error?.message || "No se pudo crear el jugador.")
  }

  return response.json() as Promise<CreatePlayerResponse>
}

export async function updatePlayer(playerId: string, payload: UpdatePlayerPayload) {
  const { tenantId: _tenantId, ...body } = payload as UpdatePlayerPayload & {
    tenantId?: string
  }
  const response = await publicFetch(`/player/${playerId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error("No se pudo actualizar el jugador.")
  }

  return response.json()
}

export async function verifyPlayerInClub(personId: string, slug: string) {
  const response = await publicFetch(`/player/${personId}`, {
    method: "PATCH",
    body: JSON.stringify({ slug }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => null)
    throw new Error(error?.message || "No se pudo verificar el jugador en este club.")
  }

  return response.json()
}

export async function fetchAvailablePlayers(
  tenantId: string,
  params: GetAvailablePlayersParams,
) {
  const searchParams = new URLSearchParams({
    categoryLevel: String(params.categoryLevel),
    gender: params.gender,
    onlyVerified: String(params.onlyVerified ?? true),
  })

  if (params.allowWomenInMaleCategory !== undefined) {
    searchParams.set(
      "allowWomenInMaleCategory",
      String(params.allowWomenInMaleCategory),
    )
  }

  if (params.womenCategoryMode) {
    searchParams.set("womenCategoryMode", params.womenCategoryMode)
  }

  if (params.womenCategoryOffset !== undefined) {
    searchParams.set("womenCategoryOffset", String(params.womenCategoryOffset))
  }

  const response = await fetchWithTenantAdmin(
    `/player/available?${searchParams.toString()}`,
    { cache: "no-store" },
  )

  if (!response.ok) {
    const error = await response.json().catch(() => null)
    throw new Error(error?.message || "No se pudo obtener los jugadores disponibles.")
  }

  const json = await response.json().catch(() => null)

  if (Array.isArray(json)) {
    return json as AvailablePlayer[]
  }

  if (Array.isArray(json?.players)) {
    return json.players as AvailablePlayer[]
  }

  if (Array.isArray(json?.data)) {
    return json.data as AvailablePlayer[]
  }

  return []
}

export async function fetchAvailableSumPlayers(
  tenantId: string,
  params: GetAvailableSumPlayersParams,
) {
  const searchParams = new URLSearchParams({
    sumLimit: String(params.sumLimit),
    onlyVerified: String(params.onlyVerified ?? true),
  })

  if (params.player1Id) {
    searchParams.set("player1Id", params.player1Id)
  }

  const response = await fetchWithTenantAdmin(
    `/player/available-sum?${searchParams.toString()}`,
    { cache: "no-store" },
  )

  if (!response.ok) {
    const error = await response.json().catch(() => null)
    throw new Error(error?.message || "No se pudo obtener los jugadores disponibles para suma.")
  }

  const json = await response.json().catch(() => null)

  if (Array.isArray(json)) {
    return json as AvailableSumPlayer[]
  }

  if (Array.isArray(json?.players)) {
    return json.players as AvailableSumPlayer[]
  }

  if (Array.isArray(json?.data)) {
    return json.data as AvailableSumPlayer[]
  }

  return []
}

export async function fetchPlayersByTenant(tenantId: string) {
  const response = await fetchWithTenantAdmin("/player/tenant", {
    cache: "no-store",
  })

  if (!response.ok) {
    const error = await response.json().catch(() => null)
    throw new Error(error?.message || "No se pudo obtener el ranking de jugadores.")
  }

  const json = await response.json().catch(() => null)

  if (Array.isArray(json)) {
    return json as TenantPlayer[]
  }

  if (Array.isArray(json?.players)) {
    return json.players as TenantPlayer[]
  }

  if (Array.isArray(json?.data)) {
    return json.data as TenantPlayer[]
  }

  return []
}
