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
  console.log("[subscription-status] requesting", {
    tenantId,
    endpoint: "/config/subscription-status",
  });

  const response = await fetchWithTenantAdmin(
    "/config/subscription-status",
    {
      cache: "no-store",
    },
  );

  console.log("[subscription-status] response meta", {
    tenantId,
    status: response.status,
    ok: response.ok,
  });

  if (response.status === 404) {
    const errorText = await response.text().catch(() => null);
    console.warn("[subscription-status] endpoint unavailable, using fallback", {
      tenantId,
      status: response.status,
      body: errorText,
    });

    return buildUnavailableSubscriptionStatus();
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => null);
    console.error("[subscription-status] request failed", {
      tenantId,
      status: response.status,
      body: errorText,
    });
    throw new Error("No pudimos obtener el estado de la suscripcion.");
  }

  const data = (await response.json()) as SubscriptionStatus;

  console.log("[subscription-status] payload", {
    tenantId,
    currentPhase: data.currentPhase,
    daysRemaining: data.daysRemaining,
    validUntil: data.validUntil,
    requiresPayment: data.requiresPayment,
    accessAllowed: data.accessAllowed,
    planName: data.planName,
    paymentStatus: data.paymentStatus,
    subscriptionStatus: data.subscriptionStatus,
  });

  return data;
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
