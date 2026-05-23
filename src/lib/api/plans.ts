import { fetchWithTenantAdmin } from "@/lib/fetchWithTenantAdmin";

export type CreatePlanTenantConfigPayload = Record<string, unknown>;

export type ChangePlanPayload = {
  tenantId: string;
  newPlanName: string;
  email?: string | null;
};

export type CancelPlanPayload = {
  tenantId: string;
};

export type PlanStatus = {
  active: boolean;
  planId?: string | null;
  planName?: string | null;
  status?: "pending" | "approved" | "rejected" | null;
  validUntil?: string | null;
};

export type PaymentsPlan = {
  id: string;
  name: string;
  price: number;
  currency: string;
};

export async function createTenantConfig(payload: CreatePlanTenantConfigPayload) {
  const res = await fetchWithTenantAdmin("/config", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok)
    throw new Error("Error creating tenant config");

  return res.json();
}

export async function changePlan(payload: ChangePlanPayload) {
  const res = await fetchWithTenantAdmin(
    "/payments-suscription/mercadopago/change",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );

  if (!res.ok)
    throw new Error("Error changing plan");

  return res.json();
}

export async function cancelPlan(payload: CancelPlanPayload) {
  const res = await fetchWithTenantAdmin(
    "/config/subscription",
    {
      method: "DELETE",
    },
  );

  if (!res.ok)
    throw new Error("Error canceling plan");

  return res.json();
}

export async function getPlanStatus(tenantId: string): Promise<PlanStatus> {
  const response = await fetch("/api/plans/status", { cache: "no-store" });

  if (!response.ok) {
    if (response.status === 404) {
      return { active: false };
    }

    throw new Error("No pudimos obtener el estado del plan");
  }

  const data = (await response.json()) as Partial<PlanStatus>;

  return {
    active:
      typeof data.active === "boolean"
        ? data.active
        : data.status === "approved",
    planId: data.planId ?? null,
    planName: data.planName ?? null,
    status: data.status ?? null,
    validUntil: data.validUntil ?? null,
  };
}

export async function getPaymentsPlans(): Promise<PaymentsPlan[]> {
  const response = await fetchWithTenantAdmin("/payments/plans", {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("No pudimos obtener el catalogo de planes.");
  }

  return response.json() as Promise<PaymentsPlan[]>;
}
