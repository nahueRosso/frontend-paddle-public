import { API_URL } from "@/lib/auth/backend";
import { publicFetch } from "@/lib/auth/fetch";

export { API_URL };

export function fetchWithTenantAdmin(input: string, init?: RequestInit) {
  return publicFetch(input, init);
}
