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

const SESSION_PAYLOAD_KEYS = [
  "id",
  "personId",
  "playerId",
  "person",
  "player",
  "globalPerson",
  "tenantPlayer",
  "personExists",
  "playerExists",
  "verifiedInClub",
  "playerStatus",
  "email",
  "firstName",
  "lastName",
  "phoneNumber",
  "tenantId",
  "status",
  "category",
  "gender",
] as const

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

function hasProfileData(value: Record<string, unknown> | null) {
  if (!value) return false

  return Boolean(
    asString(value.email) ??
      asString(value.firstName) ??
      asString(value.lastName) ??
      asString(value.phoneNumber) ??
      asString(value.gender) ??
      asString(value.tenantId) ??
      asNumber(value.category),
  )
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
  const embeddedPlayer = asRecord(root?.player) ?? asRecord(root?.tenantPlayer)
  const explicitPersonExists = asBoolean(root?.personExists)
  const explicitPlayerExists = asBoolean(root?.playerExists)
  const topLevelProfile = hasProfileData(root) ? root : null
  const personSource = embeddedPerson ?? topLevelProfile
  const explicitPlayerId =
    asString(root?.playerId) ??
    asString(embeddedPlayer?.id) ??
    (explicitPlayerExists === true ? asString(root?.id) : null) ??
    null
  const explicitPersonId =
    asString(root?.personId) ??
    asString(embeddedPerson?.id) ??
    (explicitPlayerExists === false || !explicitPlayerId ? asString(root?.id) : null) ??
    null
  const playerStatus =
    (asString(root?.playerStatus) as PlayerStatus | null) ??
    (asString(root?.status) as PlayerStatus | null) ??
    (asString(embeddedPlayer?.status) as PlayerStatus | null) ??
    null
  const personExists =
    explicitPersonExists ??
    Boolean(explicitPersonId || personSource || root?.person || root?.globalPerson)
  const playerExists =
    explicitPlayerExists ??
    Boolean(explicitPlayerId || root?.player || root?.tenantPlayer)
  const verifiedInClub =
    asBoolean(root?.verifiedInClub) ??
    asBoolean(root?.verified) ??
    asBoolean(embeddedPlayer?.verified) ??
    playerStatus === "verified"

  const person = personExists
    ? normalizeProfile(personSource)
    : null
  const playerSource = playerExists ? embeddedPlayer ?? topLevelProfile : null
  const normalizedPlayer = normalizeClubPlayer(playerSource)
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

function hasSessionPayloadFields(payload: unknown) {
  const root = asRecord(payload)

  if (!root) return false

  return SESSION_PAYLOAD_KEYS.some((key) => key in root)
}

export function mergePublicPlayerSession(
  base: PublicPlayerSession,
  payload: unknown,
): PublicPlayerSession {
  if (!hasSessionPayloadFields(payload)) {
    return base
  }

  const next = normalizePublicPlayerSession(payload)

  return {
    personExists: next.personExists || base.personExists,
    playerExists: next.playerExists || base.playerExists,
    personId: next.personId ?? base.personId,
    playerId: next.playerId ?? base.playerId,
    verifiedInClub: next.verifiedInClub || base.verifiedInClub,
    playerStatus: next.playerStatus ?? base.playerStatus,
    person: next.person ?? base.person,
    player: next.player ?? base.player,
  }
}
