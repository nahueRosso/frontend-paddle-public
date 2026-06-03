import { NextResponse } from "next/server";

import { AUTH_BACKEND_ROUTES } from "@/lib/auth/backend";
import { proxyBackendRequest, toProxyResponse } from "@/lib/server/backend-proxy";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const idToken =
    body && typeof body.idToken === "string" && body.idToken.trim()
      ? body.idToken.trim()
      : null;

  if (!body || typeof body.slug !== "string" || !body.slug.trim()) {
    return NextResponse.json(
      { message: "slug es requerido.", status: "forbidden" },
      { status: 400 },
    );
  }

  try {
    const response = await proxyBackendRequest(
      request,
      AUTH_BACKEND_ROUTES.playerEnsure,
      {
        method: "POST",
        body: JSON.stringify({
          slug: body.slug.trim(),
          ...(idToken ? { idToken } : {}),
        }),
      },
    );

    return toProxyResponse(response);
  } catch {

    return NextResponse.json(
      { message: "No se pudo asegurar la sesion del jugador.", status: "forbidden" },
      { status: 500 },
    );
  }
}
