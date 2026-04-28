import { fetchWithTenantAdmin } from "@/lib/fetchWithTenantAdmin"
import type { Professor } from "@/types/professor"

export async function getProfessors(tenantId: string): Promise<Professor[]> {
  const response = await fetchWithTenantAdmin(`/professor/${tenantId}`, {
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error("No se pudieron obtener los profesores.")
  }

  return (await response.json()) as Professor[]
}

export async function createProfessor(formData: FormData) {
  const response = await fetchWithTenantAdmin("/professor", {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => null)
    throw new Error(error?.message || "No se pudo crear el profesor.")
  }

  return response.json()
}

export async function updateProfessor(professorId: string, formData: FormData) {
  const response = await fetchWithTenantAdmin(`/professor/${professorId}`, {
    method: "PUT",
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => null)
    throw new Error(error?.message || "No se pudo actualizar el profesor.")
  }

  return response.json()
}

export async function deleteProfessor(professorId: string) {
  const response = await fetchWithTenantAdmin(`/professor/${professorId}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error("No se pudo eliminar el profesor.")
  }

  return response.json().catch(() => null)
}
