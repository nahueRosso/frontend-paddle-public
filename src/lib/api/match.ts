import { fetchWithTenantAdmin } from "@/lib/fetchWithTenantAdmin"

export type CreateMatchRequestPayload = {
  tenantId: string
  userName: string
  userPhone: string
  playerId?: string
  payerEmail?: string
  gender: "male" | "female" | "mixed"
  categoryMin: number
  categoryMax: number
  preferredStart: string
  preferredEnd: string
  matchType: string
}

export type MatchEntryIntentResponse =
  | {
      mode: "credit_covered"
      requestId: string
      status: "pending"
      requiredAmount: number
      creditedAmount: number
      missingAmount: number
      credit?: {
        availableCredit: number
        heldCredit: number
        totalCredit: number
        accountId: string
      }
    }
  | {
      mode: "payment_required"
      requestId: string
      status: "awaiting_payment"
      requiredAmount: number
      creditedAmount: number
      missingAmount: number
      paymentId: string
      externalReference: string
      checkoutUrl: string
      provider: string
      paymentStatus: string
      credit?: {
        availableCredit: number
        heldCredit: number
        totalCredit: number
        accountId: string
      }
    }

export async function createMatchEntryIntent(payload: CreateMatchRequestPayload) {
  const response = await fetchWithTenantAdmin("/match/entry-intent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("Hubo un error al enviar tu solicitud.")
  }

  return response.json() as Promise<MatchEntryIntentResponse>
}
