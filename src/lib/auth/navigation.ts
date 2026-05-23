export function sanitizeRelativeRedirect(
  value: string | null | undefined,
  fallback = "/",
) {
  if (!value) {
    return fallback;
  }

  return value.startsWith("/") && !value.startsWith("//") ? value : fallback;
}

export function buildRelativeUrl(pathname: string, search?: string | null) {
  const normalizedPath = sanitizeRelativeRedirect(pathname, "/");

  if (!search || search === "?") {
    return normalizedPath;
  }

  return `${normalizedPath}${search.startsWith("?") ? search : `?${search}`}`;
}

export function buildLoginRedirectUrl(target: string) {
  const redirect = sanitizeRelativeRedirect(target, "/");
  return `/login?redirect=${encodeURIComponent(redirect)}`;
}
