"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

import { isBackendFetchError } from "@/lib/auth/errors"
import {
  ensurePlayerSession,
  ensurePlayerSessionWithGoogle,
  logoutPlayer,
} from "@/lib/auth/player-session"
import type { SessionState } from "@/lib/auth/types"
import { useAuth } from "@/hooks/use-auth"
import {
  mergePublicPlayerSession,
  normalizePublicPlayerSession,
  type PublicPlayerSession,
} from "@/lib/public-player-session"

interface PlayerContextType extends PublicPlayerSession {
  authStatus: SessionState
  authMessage: string | null
  setPlayerSession: (payload: unknown) => void
  ensureClubPlayerSession: () => Promise<void>
  clearClubPlayerSession: () => Promise<void>
}

const PlayerContext = createContext<PlayerContextType | null>(null)

export function PlayerProvider({
  initialSession,
  initialAuthStatus,
  initialAuthMessage,
  slug,
  children,
}: {
  initialSession: PublicPlayerSession
  initialAuthStatus?: SessionState
  initialAuthMessage?: string | null
  slug: string
  children: React.ReactNode
}) {
  const [playerSession, setPlayerSessionState] = useState(initialSession)
  const [authStatus, setAuthStatus] = useState<SessionState>(() => {
    if (initialAuthStatus) {
      return initialAuthStatus
    }

    if (!initialSession.personExists || !initialSession.playerExists) {
      return "needs_person_registration"
    }

    return "authenticated"
  })
  const [authMessage, setAuthMessage] = useState<string | null>(
    initialAuthMessage ?? null,
  )
  const {
    publicSessionStatus,
    session,
    markPublicSessionActive,
  } = useAuth()

  useEffect(() => {
    setPlayerSessionState(initialSession)
  }, [initialSession])

  useEffect(() => {
    if (initialAuthStatus) {
      setAuthStatus(initialAuthStatus)
      return
    }

    setAuthStatus(
      initialSession.personExists && initialSession.playerExists
        ? "authenticated"
        : "needs_person_registration",
    )
  }, [initialAuthStatus, initialSession.personExists, initialSession.playerExists])

  useEffect(() => {
    setAuthMessage(initialAuthMessage ?? null)
  }, [initialAuthMessage])

  const ensureClubPlayerSession = useCallback(async () => {
    if (!playerSession.personExists || !playerSession.playerExists) {
      setAuthStatus("needs_person_registration")
      return
    }

    setAuthStatus("loading")
    setAuthMessage(null)

    try {
      const response =
        publicSessionStatus === "authenticated"
          ? await ensurePlayerSession(slug)
          : session?.idToken
            ? await ensurePlayerSessionWithGoogle(slug, session.idToken)
            : await ensurePlayerSession(slug)

      if (response.payload) {
        setPlayerSessionState((current) =>
          mergePublicPlayerSession(current, response.payload),
        )
      }

      setAuthStatus(response.status)
      setAuthMessage(response.message ?? null)

      if (response.status === "authenticated") {
        markPublicSessionActive()
      }
    } catch (error) {
      if (isBackendFetchError(error) && error.status === 401) {
        setAuthStatus("unauthenticated")
        return
      }

      if (isBackendFetchError(error) && error.status === 403) {
        setAuthStatus("forbidden")
        setAuthMessage(error.message)
        return
      }

      setAuthStatus("forbidden")
      setAuthMessage(
        error instanceof Error
          ? error.message
          : "No se pudo validar la sesion del jugador.",
      )
    }
  }, [
    playerSession.personExists,
    playerSession.playerExists,
    publicSessionStatus,
    session?.idToken,
    markPublicSessionActive,
    slug,
  ])

  const clearClubPlayerSession = useCallback(async () => {
    try {
      await logoutPlayer()
    } finally {
      setAuthStatus("unauthenticated")
      markPublicSessionActive()
    }
  }, [markPublicSessionActive])

  const value = useMemo<PlayerContextType>(
    () => ({
      ...playerSession,
      authStatus,
      authMessage,
      setPlayerSession: (payload) => {
        const normalizedSession = normalizePublicPlayerSession(payload)
        setPlayerSessionState(normalizedSession)
        setAuthStatus(
          normalizedSession.personExists && normalizedSession.playerExists
            ? "authenticated"
            : "needs_person_registration",
        )
      },
      ensureClubPlayerSession,
      clearClubPlayerSession,
    }),
    [
      authMessage,
      authStatus,
      clearClubPlayerSession,
      ensureClubPlayerSession,
      playerSession,
    ],
  )

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
}

export function usePlayer() {
  const context = useContext(PlayerContext)

  if (!context) {
    throw new Error("usePlayer debe usarse dentro de PlayerProvider")
  }

  return context
}
