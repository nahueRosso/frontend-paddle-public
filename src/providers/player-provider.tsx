"use client";

import { createContext, useContext } from "react";

export interface Player {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  tenantId: string;
  phoneNumber:string;
  status: "pending" | "verified" | "rejected";
  verified:boolean;
  category:number;
  gender:string;
}



interface PlayerContextType {
  player: Player;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({
  player,
  children,
}: {
  player: Player;
  children: React.ReactNode;
}) {
  return (
    <PlayerContext.Provider value={{ player }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);

  if (!context) {
    throw new Error("usePlayer debe usarse dentro de PlayerProvider");
  }

  return context;
}
