const isDev = process.env.NEXT_PUBLIC_DEV === "true";

const API_BASE_URL = isDev
  ? process.env.NEXT_PUBLIC_API_URL ?? "http://172.18.80.1:5000"
  : "https://api.miclubpadel.com";

export const API_URL = `${API_BASE_URL}/api/v1`;

export const DEFAULT_TENANT_SCHEMA =
  process.env.NEXT_PUBLIC_TENANT_SCHEMA ?? "public";

export const AUTH_BACKEND_ROUTES = {
  publicLogin:
    process.env.BACKEND_PUBLIC_SESSION_LOGIN_PATH ?? "/auth/google/public",
  publicLogout:
    process.env.BACKEND_PUBLIC_SESSION_LOGOUT_PATH ?? "/auth/logout/public",
  playerEnsure:
    process.env.BACKEND_PLAYER_SESSION_ENSURE_PATH ?? "/auth/player-session",
  playerLogout:
    process.env.BACKEND_PLAYER_SESSION_LOGOUT_PATH ?? "/auth/logout/player",
  adminEnsure:
    process.env.BACKEND_ADMIN_SESSION_ENSURE_PATH ?? "/auth/admin-session",
  adminLogout:
    process.env.BACKEND_ADMIN_SESSION_LOGOUT_PATH ?? "/auth/logout/admin",
} as const;

export function isInternalApiPath(input: string) {
  return input.startsWith("/api/");
}

export function buildRequestUrl(input: string) {
  if (/^https?:\/\//i.test(input) || isInternalApiPath(input)) {
    return input;
  }

  return `${API_URL}${input}`;
}
