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
  personId: string | null
  playerId: string | null
  verifiedInClub: boolean
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

  const person = normalizeProfile(embeddedPerson ?? embeddedClubPlayer ?? root)
  const player = normalizeClubPlayer(embeddedClubPlayer)
  const explicitPlayerId = asString(root?.playerId) ?? player?.id ?? null
  const verifiedInClub = asBoolean(root?.verifiedInClub) ?? Boolean(explicitPlayerId)
  const personId =
    asString(root?.personId) ??
    asString(embeddedPerson?.id) ??
    (verifiedInClub ? null : asString(root?.id)) ??
    null

  return {
    personId,
    playerId: verifiedInClub ? explicitPlayerId : null,
    verifiedInClub,
    person,
    player: verifiedInClub ? player : null,
  }
}
