export type SectionId = "home" | "turnos"  | "clases" | "match"|"torneos" | "ranking" | "perfil"

export interface RankingEntry {
  id: number
  name: string
  category: string
  position: number
  points: number
}

export interface ClubClass {
  id: number
  title: string
  instructor: string
  level: "Iniciacion" | "Intermedio" | "Avanzado"
  dayOfWeek: number // 0 = Lunes, 6 = Domingo
  startTime: string
  endTime: string
  capacity: number
  enrolled: number
}

export type MatchCategory = "1ra" | "2da" | "3ra" | "4ta" | "5ta" | "6ta" | "7ma"
export type MatchSex = "Masculino" | "Femenino" | "Mixto" | "Solo mixto"
export type MatchTimePreference = "Manana" | "Tarde" | "Noche"

export interface MatchRequest {
  tenantId: string
  category: MatchCategory
  sex: MatchSex
  timePreference: MatchTimePreference
  notes?: string
}

export interface MatchResponse {
  success: boolean
  message: string
  requestId?: number
}