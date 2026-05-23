import { playerFetch, publicFetch } from "@/lib/auth/fetch";
import type { PlayerSessionResult } from "@/lib/auth/types";

function normalizePlayerSessionResult(payload: unknown): PlayerSessionResult {
  if (!payload || typeof payload !== "object") {
    return { status: "forbidden", payload };
  }

  const record = payload as Record<string, unknown>;
  const status =
    typeof record.status === "string"
      ? (record.status as PlayerSessionResult["status"])
      : "authenticated";

  return {
    status,
    message: typeof record.message === "string" ? record.message : null,
    personExists:
      typeof record.personExists === "boolean" ? record.personExists : undefined,
    playerExists:
      typeof record.playerExists === "boolean" ? record.playerExists : undefined,
    verifiedInClub:
      typeof record.verifiedInClub === "boolean"
        ? record.verifiedInClub
        : undefined,
    personId: typeof record.personId === "string" ? record.personId : null,
    playerId: typeof record.playerId === "string" ? record.playerId : null,
    payload,
  };
}

export async function ensurePlayerSession(slug: string) {
  return ensurePlayerSessionWithOptionalGoogle(slug);
}

export async function ensurePlayerSessionWithOptionalGoogle(
  slug: string,
  idToken?: string,
) {
  const response = await publicFetch("/api/auth/player/session", {
    method: "POST",
    body: JSON.stringify({
      slug,
      ...(idToken ? { idToken } : {}),
    }),
    redirectOnAuthError: false,
  });

  const payload = await response.json().catch(() => null);
  return normalizePlayerSessionResult(payload);
}

export async function ensurePlayerSessionWithGoogle(slug: string, idToken: string) {
  return ensurePlayerSessionWithOptionalGoogle(slug, idToken);
}

export async function logoutPlayer() {
  const response = await playerFetch("/api/auth/player/logout", {
    method: "POST",
    redirectOnAuthError: false,
  });

  return response.json().catch(() => null) as Promise<PlayerSessionResult | null>;
}
