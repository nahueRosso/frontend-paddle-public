import { NextResponse } from "next/server";

import { fetchWithTenantAdmin } from "@/lib/fetchWithTenantAdmin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ externalReference: string }> },
) {
  const { externalReference } = await params;
  console.log(
    "[tournament-payment-status] Checking status for externalReference:",
    externalReference,
  );

  try {
    const response = await fetchWithTenantAdmin(
      `/billing/tournaments/${encodeURIComponent(externalReference)}`,
      {
        method: "GET",
        cache: "no-store",
      },
    );

    const text = await response.text();
    console.log("[tournament-payment-status] Backend response status:", response.status);
    console.log("[tournament-payment-status] Backend response body:", text || null);

    if (!text) {
      return new NextResponse(null, { status: response.status });
    }

    return new NextResponse(text, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") ?? "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching tournament billing status:", error);

    return NextResponse.json(
      { error: "No se pudo consultar el estado del pago del torneo." },
      { status: 500 },
    );
  }
}
