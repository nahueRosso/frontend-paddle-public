import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json(
      { error: "Body inv\u00e1lido" },
      {
        status: 400,
      },
    );
  }

  const { name, email, message } = body as {
    name?: string;
    email?: string;
    message?: string;
  };

  // TODO: integrar proveedor externo (CRM, ticketing o email transaccional)

  return NextResponse.json({ success: true });
}

