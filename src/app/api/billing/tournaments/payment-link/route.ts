import { NextResponse } from "next/server";

import { fetchWithTenantAdmin } from "@/lib/fetchWithTenantAdmin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await fetchWithTenantAdmin(
      "/billing/tournaments/payment-link",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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
    console.error("Error creating tournament payment link:", error);

    return NextResponse.json(
      { error: "No se pudo generar el link de pago del torneo." },
      { status: 500 },
    );
  }
}
