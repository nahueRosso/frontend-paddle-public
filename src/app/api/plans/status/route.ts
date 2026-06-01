import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { API_URL, DEFAULT_TENANT_SCHEMA } from "@/lib/auth/backend";

type PlanStatus = {
  active: boolean;
  planId?: string | null;
  planName?: string | null;
  status?: "pending" | "approved" | "rejected" | null;
  validUntil?: string | null;
  isTrial?: boolean | null;
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
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ active: false });
  }

  // Extract only public_token to avoid stale admin_token from a previous user
  // polluting the plan status response for the current authenticated user.
  const cookieHeader = request.headers.get("cookie") ?? "";
  const publicTokenEntry = cookieHeader
    .split(";")
    .find((c) => c.trim().startsWith("public_token="))
    ?.trim();

  try {
    const response = await fetch(`${API_URL}/config/is-plan-active`, {
      method: "GET",
      headers: {
        "X-Tenant-Schema": DEFAULT_TENANT_SCHEMA,
        ...(publicTokenEntry ? { cookie: publicTokenEntry } : {}),
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({ active: false }, { status: response.status });
    }

    const payload = (await response.json()) as Partial<PlanStatus>;

    return NextResponse.json({
      active: payload.active ?? false,
      planId: payload.planId ?? null,
      planName: payload.planName ?? null,
      status: payload.status ?? null,
      validUntil: payload.validUntil ?? null,
      isTrial: payload.isTrial ?? null,
    });
  } catch (error) {
    console.error("Error consultando estado del plan:", error);

    if (isConnectionRefused(error)) {
      console.warn(
        "Servicio de planes inalcanzable. Devolviendo estado inactivo por defecto.",
      );
      return NextResponse.json({
        active: false,
        planId: null,
        planName: null,
        status: null,
        validUntil: null,
        warning:
          "No se pudo contactar al servicio de planes. Se responde estado inactivo por defecto.",
      });
    }

    return NextResponse.json(
      { error: "Error inesperado consultando el estado del plan." },
      { status: 500 },
    );
  }
}
