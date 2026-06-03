import { fetchWithTenantAdmin } from "@/lib/fetchWithTenantAdmin";
import type {
  SubscriptionCheckoutResponse,
  SubscriptionStatus,
} from "@/types/subscription";

function buildUnavailableSubscriptionStatus(): SubscriptionStatus {
  return {
    currentPhase: "active",
    daysRemaining: null,
    validUntil: null,
    requiresPayment: false,
    accessAllowed: true,
    planName: null,
    paymentStatus: null,
    subscriptionStatus: "unavailable",
  };
}

export async function getSubscriptionStatus(
  tenantId: string,
): Promise<SubscriptionStatus> {
  const response = await fetchWithTenantAdmin(
    "/config/subscription-status",
    { cache: "no-store" },
  );

  if (response.status === 404) {
    return buildUnavailableSubscriptionStatus();
  }

  if (!response.ok) {
    throw new Error("No pudimos obtener el estado de la suscripcion.");
  }

  return (await response.json()) as SubscriptionStatus;
}

export async function createSubscriptionCheckout(
  tenantId: string,
): Promise<SubscriptionCheckoutResponse> {
  const response = await fetchWithTenantAdmin(
    "/config/subscription-checkout",
    {
      method: "POST",
    },
  );

  if (!response.ok) {
    throw new Error("No pudimos iniciar el checkout de la suscripcion.");
  }

  return (await response.json()) as SubscriptionCheckoutResponse;
}
