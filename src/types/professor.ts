export type Professor = {
  id: number
  tenantId: string
  firstName: string
  lastName: string
  imageProfeUrl?: string
  categories: string[]
  schedules: string[]
  days: number[]
  turnDuration: number
  court: string
  phoneNumber?: string
  minPrice?: number
  maxPrice?: number
  shortDescription?: string
}