import { NextResponse } from "next/server";

import { fetchWithTenantAdmin } from "@/lib/fetchWithTenantAdmin";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json(
      { error: "Body invalido" },
      { status: 400 },
    );
  }

  try {
    const response = await fetchWithTenantAdmin("/bookings/public/intent", {
      method: "POST",
      body: JSON.stringify(body),
    });

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
    console.error("Error creating public booking intent:", error);

    return NextResponse.json(
      { error: "Error inesperado al iniciar la reserva publica." },
      { status: 500 },
    );
  }
}
