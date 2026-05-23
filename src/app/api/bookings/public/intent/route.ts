import { NextResponse } from "next/server";

import { proxyBackendRequest, toProxyResponse } from "@/lib/server/backend-proxy";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json(
      { error: "Body invalido" },
      { status: 400 },
    );
  }

  try {
    const response = await proxyBackendRequest(request, "/bookings/public/intent", {
      method: "POST",
      body: JSON.stringify(body),
    });

    return toProxyResponse(response);
  } catch (error) {
    console.error("Error creating public booking intent:", error);

    return NextResponse.json(
      { error: "Error inesperado al iniciar la reserva publica." },
      { status: 500 },
    );
  }
}
