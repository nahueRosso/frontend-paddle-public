"use client";

import { createContext, useContext, useMemo, useState } from "react"

import {
  normalizePublicPlayerSession,
  type PublicPlayerSession,
} from "@/lib/public-player-session"

interface PlayerContextType extends PublicPlayerSession {
  setPlayerSession: (payload: unknown) => void
}

const PlayerContext = createContext<PlayerContextType | null>(null)

export function PlayerProvider({
  initialSession,
  children,
}: {
  initialSession: PublicPlayerSession
  children: React.ReactNode
}) {
  const [playerSession, setPlayerSessionState] = useState(initialSession)

  const value = useMemo<PlayerContextType>(
    () => ({
      ...playerSession,
      setPlayerSession: (payload) => {
        setPlayerSessionState(normalizePublicPlayerSession(payload))
      },
    }),
    [playerSession],
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
