import { NextResponse } from "next/server";

import { fetchWithTenantAdmin } from "@/lib/fetchWithTenantAdmin";

type PlanStatus = {
  active: boolean;
  planId?: string | null;
  planName?: string | null;
  status?: "pending" | "approved" | "rejected" | null;
  validUntil?: string | null;
  isTrial?:boolean | null;
};

function isConnectionRefused(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const errorWithMessage = error as { message?: unknown };
  if (
    typeof errorWithMessage.message === "string" &&
    errorWithMessage.message.includes("ECONNREFUSED")
  ) {
    return true;
  }

  const errorWithCause = error as { cause?: unknown };
  if (!errorWithCause.cause || typeof errorWithCause.cause !== "object") {
    return false;
  }

  const causeWithCode = errorWithCause.cause as { code?: unknown };
  return causeWithCode.code === "ECONNREFUSED";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get("tenantId");

  if (!tenantId) {
    return NextResponse.json(
      { error: "tenantId es requerido" },
      { status: 400 }
    );
  }
 
  try {
    const response = await fetchWithTenantAdmin(
      `/config/is-plan-active/${encodeURIComponent(tenantId)}`,
      { cache: "no-store" }
    );

    const payload = await response.json() as PlanStatus;



    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || "No pudimos obtener el estado del plan." },
        { status: response.status }
      );
    }

    return NextResponse.json({
      active: payload.active,
      planId: payload.planId,
      planName: payload.planName,
      status:payload.status,
      validUntil: payload.validUntil,
      isTrial:payload.isTrial,
    });
  } catch (error) {
    console.error("Error consultando estado del plan:", error);

    if (isConnectionRefused(error)) {
      console.warn(
        "Servicio de planes inalcanzable. Devolviendo estado inactivo por defecto."
      );
      return NextResponse.json({
        active: false,
        planId: null,
        planName: null,
        status:null,
        validUntil: null,
        warning:
          "No se pudo contactar al servicio de planes. Se responde estado inactivo por defecto.",
      });
    }

    return NextResponse.json(
      { error: "Error inesperado consultando el estado del plan." },
      { status: 500 }
    );
  }
}
