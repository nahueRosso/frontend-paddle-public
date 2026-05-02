// const apiUrl = process.env.NEXT_PUBLIC_API_URL!;
const isDev = process.env.NEXT_PUBLIC_DEV === "true";

export const API_URL = isDev
  ? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"
  : "https://api.miclubpadel.com";
const defaultTenant = process.env.NEXT_PUBLIC_TENANT_SCHEMA ?? "public";

export async function fetchWithTenantAdmin(
  input: string,
  init?: RequestInit
) {
  const isFormData = init?.body instanceof FormData;

  const headers = {
    ...(init?.headers || {}),
    "X-Tenant-Schema": defaultTenant,
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
  };

  try {
    const response = await fetch(`${API_URL}${input}`, {
      ...init,
      headers,
    });

    console.log("🔍 STATUS:", response.status);

    return response;
  } catch (error) {
    console.error("❌ Fetch error:", error);
    throw error;
  }
}
