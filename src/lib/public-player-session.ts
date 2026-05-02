import type { PlayerStatus } from "@/lib/api/player"

export type PublicPlayerProfile = {
  email: string
  firstName: string
  lastName: string
  phoneNumber: string
  tenantId: string | null
  status: PlayerStatus | null
  verified: boolean
  category: number | null
  gender: string
}

export type PublicClubPlayer = PublicPlayerProfile & {
  id: string
}

export type PublicPlayerSession = {
  personExists: boolean
  playerExists: boolean
  personId: string | null
  playerId: string | null
  verifiedInClub: boolean
  playerStatus: PlayerStatus | null
  person: PublicPlayerProfile | null
  player: PublicClubPlayer | null
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null
  }

  return value as Record<string, unknown>
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null
}

function asBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null
}

function normalizeProfile(value: Record<string, unknown> | null): PublicPlayerProfile | null {
  if (!value) return null

  return {
    email: asString(value.email) ?? "",
    firstName: asString(value.firstName) ?? "",
    lastName: asString(value.lastName) ?? "",
    phoneNumber: asString(value.phoneNumber) ?? "",
    tenantId: asString(value.tenantId),
    status: (asString(value.status) as PlayerStatus | null) ?? null,
    verified: asBoolean(value.verified) ?? false,
    category: asNumber(value.category),
    gender: asString(value.gender) ?? "",
  }
}

function normalizeClubPlayer(value: Record<string, unknown> | null): PublicClubPlayer | null {
  const id = asString(value?.id)
  const profile = normalizeProfile(value)

  if (!id || !profile) return null

  return {
    id,
    ...profile,
  }
}

export function normalizePublicPlayerSession(payload: unknown): PublicPlayerSession {
  const root = asRecord(payload)
  const embeddedPerson = asRecord(root?.person) ?? asRecord(root?.globalPerson)
  const embeddedClubPlayer =
    asRecord(root?.player) ??
    asRecord(root?.tenantPlayer) ??
    (root && (asString(root.tenantId) || asString(root.phoneNumber) || asString(root.status)) ? root : null)
  const explicitPersonExists = asBoolean(root?.personExists)
  const explicitPlayerExists = asBoolean(root?.playerExists)
  const explicitPersonId =
    asString(root?.personId) ??
    asString(embeddedPerson?.id) ??
    null
  const explicitPlayerId =
    asString(root?.playerId) ??
    asString(embeddedClubPlayer?.id) ??
    null
  const playerStatus =
    (asString(root?.playerStatus) as PlayerStatus | null) ??
    (asString(root?.status) as PlayerStatus | null) ??
    (asString(embeddedClubPlayer?.status) as PlayerStatus | null) ??
    null
  const personExists =
    explicitPersonExists ??
    Boolean(explicitPersonId || embeddedPerson || root?.person || root?.globalPerson)
  const playerExists =
    explicitPlayerExists ??
    Boolean(explicitPlayerId || root?.player || root?.tenantPlayer)
  const verifiedInClub =
    asBoolean(root?.verifiedInClub) ??
    asBoolean(root?.verified) ??
    asBoolean(embeddedClubPlayer?.verified) ??
    playerStatus === "verified"

  const person = personExists
    ? normalizeProfile(embeddedPerson ?? embeddedClubPlayer ?? root)
    : null
  const normalizedPlayer = normalizeClubPlayer(embeddedClubPlayer ?? root)
  const player =
    playerExists && explicitPlayerId
      ? normalizedPlayer ?? (person ? { id: explicitPlayerId, ...person } : null)
      : null

  return {
    personExists,
    playerExists,
    personId: personExists ? explicitPersonId : null,
    playerId: playerExists ? explicitPlayerId : null,
    verifiedInClub,
    playerStatus,
    person,
    player,
  }
}
