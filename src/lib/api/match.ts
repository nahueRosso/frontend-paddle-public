import { playerFetch } from "@/lib/auth/fetch"

export type CreateMatchRequestPayload = {
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
      reused: boolean
      requestId: string
      status: "awaiting_payment"
      requiredAmount: number
      creditedAmount: number
      missingAmount: number
      paymentId: string
      externalReference: string
      checkoutUrl?: string | null
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
  const response = await playerFetch("/match/entry-intent", {
    method: "POST",
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    let message = "Hubo un error al enviar tu solicitud."

    try {
      const text = await response.text()

      if (response.status === 409) {
        throw new Error("Ya tenes una solicitud de match activa.")
      }

      if (text) {
        try {
          const data = JSON.parse(text) as { message?: string; error?: string }
          message = data.message || data.error || message
        } catch {
          message = text
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
    }

    throw new Error(message)
  }

  return response.json() as Promise<MatchEntryIntentResponse>
}
