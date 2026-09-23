import { API_URL, DEFAULT_TENANT_SCHEMA, buildRequestUrl } from "@/lib/auth/backend";
import { BackendFetchError } from "@/lib/auth/errors";

type FetchContext = "public" | "player" | "admin";

type ContextualFetchOptions = RequestInit & {
  redirectOnAuthError?: boolean;
  authRedirectPath?: string;
};

function buildHeaders(init?: RequestInit) {
  const headers = new Headers(init?.headers);
  const isFormData = init?.body instanceof FormData;

  headers.set("X-Tenant-Schema", DEFAULT_TENANT_SCHEMA);

  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return headers;
}

function extractMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;

    if (typeof record.message === "string" && record.message.trim()) {
      return record.message;
    }

    if (typeof record.error === "string" && record.error.trim()) {
      return record.error;
    }
  }

  return fallback;
}

function getDefaultRedirectPath(context: FetchContext) {
  if (typeof window === "undefined") {
    return null;
  }

  const currentPath = `${window.location.pathname}${window.location.search}`;

  if (context === "player") {
    return `/login?redirect=${encodeURIComponent(currentPath)}`;
  }

  if (context === "admin") {
    return "/acceso-denegado";
  }

  return null;
}

function handleAuthError(
  context: FetchContext,
  status: number,
  redirectPath?: string | null,
) {
  if (typeof window === "undefined") {
    return;
  }

  if (context === "player" && status === 401) {
    window.location.assign(redirectPath ?? getDefaultRedirectPath(context) ?? "/login");
    return;
  }

  if (context === "player" && status === 403) {
    window.location.assign(redirectPath ?? "/acceso-denegado");
    return;
  }

  if (context === "admin" && (status === 401 || status === 403)) {
    window.location.assign(redirectPath ?? getDefaultRedirectPath(context) ?? "/acceso-denegado");
  }
}

async function parseResponsePayload(response: Response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

async function contextualFetch(
  context: FetchContext,
  input: string,
  init?: ContextualFetchOptions,
) {
  const response = await fetch(buildRequestUrl(input), {
    ...init,
    headers: buildHeaders(init),
    credentials: "include",
  });

  if (response.ok) {
    return response;
  }

  const payload = await parseResponsePayload(response);
  const message = extractMessage(
    payload,
    `Request to ${input || API_URL} failed with status ${response.status}.`,
  );

  if (init?.redirectOnAuthError !== false) {
    handleAuthError(context, response.status, init?.authRedirectPath);
  }

  throw new BackendFetchError(message, response.status, payload);
}

export function publicFetch(input: string, init?: ContextualFetchOptions) {
  return contextualFetch("public", input, {
    ...init,
    redirectOnAuthError: init?.redirectOnAuthError ?? false,
  });
}

export function playerFetch(input: string, init?: ContextualFetchOptions) {
  return contextualFetch("player", input, init);
}

export function adminFetch(input: string, init?: ContextualFetchOptions) {
  return contextualFetch("admin", input, init);
}
