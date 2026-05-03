import { NextResponse } from "next/server";

import { fetchWithTenantAdmin } from "@/lib/fetchWithTenantAdmin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ externalReference: string }> },
) {
  const { externalReference } = await params;

  try {
    const response = await fetchWithTenantAdmin(
      `/billing/bookings/${encodeURIComponent(externalReference)}`,
      {
        method: "GET",
        cache: "no-store",
      },
    );

    const text = await response.text();

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
    console.error("Error fetching billing booking status:", error);

    return NextResponse.json(
      { error: "No se pudo consultar el estado del pago." },
      { status: 500 },
    );
  }
}
