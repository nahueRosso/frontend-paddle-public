import { fetchWithTenantAdmin } from "@/lib/fetchWithTenantAdmin"

export type CreateMatchRequestPayload = {
  tenantId: string
  userName: string
  userPhone: string
  gender: "male" | "female" | "mixed"
  categoryMin: number
  categoryMax: number
  preferredStart: string
  preferredEnd: string
  matchType: string
}

export async function createMatchRequest(payload: CreateMatchRequestPayload) {
  const response = await fetchWithTenantAdmin("/match/request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("Hubo un error al enviar tu solicitud.")
  }

  return response.json().catch(() => null)
}
