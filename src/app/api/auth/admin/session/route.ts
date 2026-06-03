import { NextResponse } from "next/server";

import { AUTH_BACKEND_ROUTES } from "@/lib/auth/backend";
import { proxyBackendRequest, toProxyResponse } from "@/lib/server/backend-proxy";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || (typeof body.slug !== "string" && typeof body.tenantId !== "string")) {
    return NextResponse.json(
      { message: "slug o tenantId es requerido.", status: "forbidden" },
      { status: 400 },
    );
  }

  try {
    const response = await proxyBackendRequest(
      request,
      AUTH_BACKEND_ROUTES.adminEnsure,
      {
        method: "POST",
        body: JSON.stringify(body),
      },
    );

    return toProxyResponse(response);
  } catch {

    return NextResponse.json(
      { message: "No se pudo asegurar la sesion de admin.", status: "forbidden" },
      { status: 500 },
    );
  }
}

