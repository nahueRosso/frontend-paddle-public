export type ContactPayload = {
  name: string
  email: string
  message: string
}

export async function submitContactForm(payload: ContactPayload) {
  const response = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("No se pudo enviar el formulario.")
  }

  return response.json().catch(() => null)
}
