import { DEFAULT_TENANT_SCHEMA, buildRequestUrl } from "@/lib/auth/backend";

function buildProxyHeaders(request: Request, init?: RequestInit) {
  const headers = new Headers(init?.headers);
  const cookie = request.headers.get("cookie");
  const contentType = request.headers.get("content-type");
  const isFormData = init?.body instanceof FormData;

  headers.set("X-Tenant-Schema", DEFAULT_TENANT_SCHEMA);

  if (cookie) {
    headers.set("cookie", cookie);
  }

  if (contentType && !isFormData && !headers.has("content-type")) {
    headers.set("content-type", contentType);
  }

  return headers;
}

function appendSetCookieHeaders(source: Response, target: Headers) {
  const responseHeaders = source.headers as Headers & {
    getSetCookie?: () => string[];
  };

  if (typeof responseHeaders.getSetCookie === "function") {
    for (const cookie of responseHeaders.getSetCookie()) {
      target.append("set-cookie", cookie);
    }
    return;
  }

  const setCookie = source.headers.get("set-cookie");
  if (setCookie) {
    target.append("set-cookie", setCookie);
  }
}

export async function proxyBackendRequest(
  request: Request,
  input: string,
  init?: RequestInit,
) {
  return fetch(buildRequestUrl(input), {
    ...init,
    method: init?.method ?? request.method,
    headers: buildProxyHeaders(request, init),
    body: init?.body,
    cache: init?.cache,
  });
}

export async function toProxyResponse(response: Response) {
  const body = await response.text();
  const headers = new Headers();
  const contentType = response.headers.get("content-type");

  if (contentType) {
    headers.set("content-type", contentType);
  }

  appendSetCookieHeaders(response, headers);

  return new Response(body || null, {
    status: response.status,
    headers,
  });
}
