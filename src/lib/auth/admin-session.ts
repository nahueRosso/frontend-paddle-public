import { adminFetch, publicFetch } from "@/lib/auth/fetch";
import type { AdminSessionResult } from "@/lib/auth/types";

function normalizeAdminSessionResult(payload: unknown): AdminSessionResult {
  if (!payload || typeof payload !== "object") {
    return { status: "forbidden", payload };
  }

  const record = payload as Record<string, unknown>;

  return {
    status:
      typeof record.status === "string"
        ? (record.status as AdminSessionResult["status"])
        : "authenticated",
    message: typeof record.message === "string" ? record.message : null,
    tenantId: typeof record.tenantId === "string" ? record.tenantId : null,
    slug: typeof record.slug === "string" ? record.slug : null,
    payload,
  };
}

export async function ensureAdminSession(input: {
  slug?: string;
  tenantId?: string;
  idToken?: string;
}) {
  const response = await publicFetch("/api/auth/admin/session", {
    method: "POST",
    body: JSON.stringify(input),
    redirectOnAuthError: false,
  });

  const payload = await response.json().catch(() => null);
  return normalizeAdminSessionResult(payload);
}

export async function logoutAdmin() {
  const response = await adminFetch("/api/auth/admin/logout", {
    method: "POST",
    redirectOnAuthError: false,
  });

  return response.json().catch(() => null) as Promise<AdminSessionResult | null>;
}

