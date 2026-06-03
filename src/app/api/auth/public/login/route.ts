import { NextResponse } from "next/server";

import { AUTH_BACKEND_ROUTES } from "@/lib/auth/backend";
import { proxyBackendRequest, toProxyResponse } from "@/lib/server/backend-proxy";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body.idToken !== "string" || !body.idToken.trim()) {
    return NextResponse.json(
      { message: "idToken es requerido.", status: "unauthenticated" },
      { status: 400 },
    );
  }

  try {
    const response = await proxyBackendRequest(
      request,
      AUTH_BACKEND_ROUTES.publicLogin,
      {
        method: "POST",
        body: JSON.stringify({ idToken: body.idToken }),
      },
    );

    return toProxyResponse(response);
  } catch {

    return NextResponse.json(
      { message: "No se pudo iniciar la sesion publica.", status: "forbidden" },
      { status: 500 },
    );
  }
}

