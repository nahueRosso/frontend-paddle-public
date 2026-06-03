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
      `/billing/tournaments/${encodeURIComponent(externalReference)}`,
      {
        method: "GET",
        cache: "no-store",
      },
    );

    return toProxyResponse(response);
  } catch {

    return NextResponse.json(
      { error: "No se pudo consultar el estado del pago del torneo." },
      { status: 500 },
    );
  }
}
