import { NextResponse } from "next/server";

import { proxyBackendRequest, toProxyResponse } from "@/lib/server/backend-proxy";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await proxyBackendRequest(
      request,
      "/billing/tournaments/payment-link",
      {
        method: "POST",
        body: JSON.stringify(body),
      },
    );

    return toProxyResponse(response);
  } catch {

    return NextResponse.json(
      { error: "No se pudo generar el link de pago del torneo." },
      { status: 500 },
    );
  }
}
