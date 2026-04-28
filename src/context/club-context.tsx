"use client"

import { createContext, useContext } from "react"
import type { ClubConfig } from "@/types/tenant-config"

interface ClubContextType {
  config: ClubConfig
}

const ClubContext = createContext<ClubContextType | null>(null)

export function ClubProvider({
  config,
  children,
}: {
  config: ClubConfig
  children: React.ReactNode
}) {
  return (
    <ClubContext.Provider value={{ config }}>
      {children}
    </ClubContext.Provider>
  )
}

export function useClub() {
  const context = useContext(ClubContext)

  if (!context) {
    throw new Error("useClub must be used inside ClubProvider")
  }

  return context
}
