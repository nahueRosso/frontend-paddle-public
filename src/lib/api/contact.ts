import { fetchWithTenantAdmin } from "@/lib/fetchWithTenantAdmin";

export type ContactPayload = {
  senderEmail: string;
  message: string;
};

export type ContactResponse = {
  success: boolean;
  message: string;
  id: number;
  status: string;
  createdAt: string;
};

type ErrorPayload = {
  message?: string;
  statusCode?: number;
  lastMessageAt?: string;
};

export class ContactApiError extends Error {
  status: number;
  lastMessageAt?: string;

  constructor(message: string, status: number, lastMessageAt?: string) {
    super(message);
    this.name = "ContactApiError";
    this.status = status;
    this.lastMessageAt = lastMessageAt;
  }
}

export async function submitContactForm(
  payload: ContactPayload,
): Promise<ContactResponse> {
  const response = await fetchWithTenantAdmin("/message", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  let parsed: ContactResponse | ErrorPayload | null = null;

  if (text) {
    try {
      parsed = JSON.parse(text) as ContactResponse | ErrorPayload;
    } catch {
      parsed = null;
    }
  }

  if (!response.ok) {
    const message =
      typeof (parsed as ErrorPayload | null)?.message === "string"
        ? (parsed as ErrorPayload).message!
        : "No se pudo enviar el mensaje.";

    throw new ContactApiError(
      message,
      response.status,
      typeof (parsed as ErrorPayload | null)?.lastMessageAt === "string"
        ? (parsed as ErrorPayload).lastMessageAt
        : undefined,
    );
  }

  return parsed as ContactResponse;
}
