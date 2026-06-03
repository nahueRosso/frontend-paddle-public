import { ClubesFetch, TenantConfig, TenantPublic } from "@/types/tenant-config";
import { fetchWithTenantAdmin } from "../fetchWithTenantAdmin";

export type TenantConfigQueryResponse =
  | { exists: false; data: null }
  | { exists: true; data: TenantConfig };

export type UpdateTenantConfigPayload = {
  tenantId: string;
  data: Partial<TenantConfig>;
};

export type UpdateTenantFeaturesPricingPayload = {
  tenantId: string;
  data: {
    features?: {
      turnos?: boolean;
      clases?: boolean;
      match?: boolean;
      torneos?: boolean;
    };
    pricing?: {
      booking?: {
        totalPrice?: number;
        reservationPrice?: number;
      };
      match?: {
        totalPrice?: number;
        reservationPrice?: number;
      };
    };
    bookingRules?: {
      allowUnverifiedPlayers?: boolean;
      unverifiedPlayerReservationPrice?: number;
      showCourtPrice?: boolean;
    };
  };
};

export type CreateTenantConfigInput = {
  tenantId: string;
  data: Omit<TenantConfig, "id" | "tenantId">;
};

export type CreateTenantConfigWithAssetsInput = {
  tenantId: string;
  formData: FormData;
};

export type UpdateTenantConfigAssetsInput = {
  tenantId: string;
  formData: FormData;
};

export type CourtHoursConfigResponse = {
  openingMorning?: string;
  closingMorning?: string;
  openingEvening?: string;
  closingEvening?: string;
  courts?: { number: number }[];
};

export async function getTenant(tenant: string): Promise<TenantPublic | null> {
  try {
    const res = await fetch(
      // `${process.env.NEXT_PUBLIC_API_URL}/config`,
      `${process.env.NEXT_PUBLIC_API_URL}/config/slug/${tenant}`,
      {
        cache: "no-store", // dinámico (sin cache)
      }
    );

    if (!res.ok) return null;

    const json = await res.json();

    if (!json.exists) return null;

    return json.data;
  } catch {
    return null;
  }
}

// export async function fetchGetConfigAll(): Promise<TenantConfigQueryResponse> {
export async function fetchGetConfigAll(): Promise<ClubesFetch[]> {
  const res = await fetchWithTenantAdmin(`/config`, {
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Error al traer ejercicios");
  const json = (await res.json()) as ClubesFetch[]; // Cambiado a ClubesFetch[]
  return json;
}


export async function fetchGetConfig(
  googleId: string,
): Promise<TenantConfigQueryResponse> {
  const res = await fetchWithTenantAdmin("/config/current", {
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Error al traer ejercicios");
  const json = (await res.json()) as TenantConfigQueryResponse;
  return json;
}

export async function fetchGetConfigBySlug(
  slug: string,
): Promise<TenantConfigQueryResponse> {
  const res = await fetchWithTenantAdmin(`/config/slug/${slug}`, {
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Error al traer ejercicios");
  const json = (await res.json()) as TenantConfigQueryResponse;
  return json;
}

export async function createTenantConfig(
  payload: CreateTenantConfigInput,
): Promise<TenantConfig> {
  const { tenantId, data } = payload;
  const res = await fetchWithTenantAdmin("/config", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tenantId,
      ...data,
    }),
  });

  if (!res.ok) throw new Error("Error al crear la configuración");
  const json = (await res.json()) as TenantConfig;
  return json;
}

export async function createTenantConfigWithAssets({
  formData,
}: CreateTenantConfigWithAssetsInput) {
  const response = await fetchWithTenantAdmin("/config", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("No pudimos guardar la configuración inicial.");
  }

  return response.json();
}

export async function updateTenantConfig({
  tenantId,
  data,
}: UpdateTenantConfigPayload): Promise<TenantConfig> {
  const res = await fetchWithTenantAdmin("/config/current", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error al actualizar configuración: ${errorText}`);
  }

  const json = (await res.json()) as TenantConfig;
  return json;
}

export async function updateTenantFeaturesPricing({
  tenantId,
  data,
}: UpdateTenantFeaturesPricingPayload): Promise<TenantConfig> {
  const res = await fetchWithTenantAdmin("/config/features-pricing", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error al actualizar funcionalidades y precios: ${errorText}`);
  }

  return (await res.json()) as TenantConfig;
}

export async function updateTenantConfigAssets({
  tenantId,
  formData,
}: UpdateTenantConfigAssetsInput): Promise<TenantConfig> {
  const res = await fetchWithTenantAdmin("/config/assets", {
    method: "PATCH",
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error al actualizar assets: ${errorText}`);
  }

  return (await res.json()) as TenantConfig;
}

export async function updatePaymentStatus(
  tenantId: string,
  paymentStatus: "pending" | "approved" | "rejected"
) {
  const res = await fetchWithTenantAdmin(
    "/config/payment-status",
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentStatus }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }

  return res.json();
}

export async function getCourtHoursConfig(
  tenantId: string,
): Promise<CourtHoursConfigResponse> {
  const response = await fetchWithTenantAdmin("/config/court-hours", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("No se pudo obtener la configuración de horarios.");
  }

  return (await response.json()) as CourtHoursConfigResponse;
}
