import { NextResponse } from "next/server";

import { proxyBackendRequest, toProxyResponse } from "@/lib/server/backend-proxy";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ externalReference: string }> },
) {
  const { externalReference } = await params;

  try {
    const response = await proxyBackendRequest(
      request,
      `/billing/bookings/${encodeURIComponent(externalReference)}`,
      {
        method: "GET",
        cache: "no-store",
      },
    );

    return toProxyResponse(response);
  } catch (error) {
    console.error("Error fetching billing booking status:", error);

    return NextResponse.json(
      { error: "No se pudo consultar el estado del pago." },
      { status: 500 },
    );
  }
}
