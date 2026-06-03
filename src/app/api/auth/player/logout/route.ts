import { NextResponse } from "next/server";

import { AUTH_BACKEND_ROUTES } from "@/lib/auth/backend";
import { proxyBackendRequest, toProxyResponse } from "@/lib/server/backend-proxy";

export async function POST(request: Request) {
  try {
    const response = await proxyBackendRequest(
      request,
      AUTH_BACKEND_ROUTES.playerLogout,
      { method: "POST" },
    );

    return toProxyResponse(response);
  } catch {

    return NextResponse.json(
      { message: "No se pudo cerrar la sesion del jugador." },
      { status: 500 },
    );
  }
}

