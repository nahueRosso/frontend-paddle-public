import { API_URL, DEFAULT_TENANT_SCHEMA } from "@/lib/auth/backend";

let inFlightRefresh: Promise<boolean> | null = null;

/**
 * Silently rotates the public_token/public_refresh_token cookie pair via
 * POST /auth/refresh. Concurrent 401s share a single in-flight request:
 * the refresh token rotates on every use, so two parallel calls sending the
 * same (about-to-be-rotated) cookie would otherwise race and trip the
 * backend's reuse detection, logging the user out instead of renewing.
 */
export function refreshWebSession(): Promise<boolean> {
  if (!inFlightRefresh) {
    inFlightRefresh = fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-Tenant-Schema": DEFAULT_TENANT_SCHEMA,
      },
      body: JSON.stringify({}),
    })
      .then((response) => response.ok)
      .catch(() => false)
      .finally(() => {
        inFlightRefresh = null;
      });
  }

  return inFlightRefresh;
}
