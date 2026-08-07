import { NextResponse } from "next/server";

import { AUTH_BACKEND_ROUTES } from "@/lib/auth/backend";
import { proxyBackendRequest, toProxyResponse } from "@/lib/server/backend-proxy";

export async function DELETE(request: Request) {
  try {
    const response = await proxyBackendRequest(
      request,
      AUTH_BACKEND_ROUTES.publicDeleteAccount,
      { method: "DELETE" },
    );

    return toProxyResponse(response);
  } catch {
    return NextResponse.json(
      { message: "No se pudo eliminar la cuenta." },
      { status: 500 },
    );
  }
}
