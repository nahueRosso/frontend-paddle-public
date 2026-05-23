import { publicFetch } from "@/lib/auth/fetch";
import type { SessionState } from "@/lib/auth/types";

type PublicSessionResponse = {
  ok?: boolean;
  type?: "public_user";
  status?: SessionState;
  message?: string;
  user?: {
    id: string;
    email: string;
  };
};

export async function loginWithGooglePublic(idToken: string) {
  const response = await publicFetch("/api/auth/public/login", {
    method: "POST",
    body: JSON.stringify({ idToken }),
  });

  return (await response.json().catch(() => null)) as PublicSessionResponse | null;
}

export async function logoutPublic() {
  const response = await publicFetch("/api/auth/public/logout", {
    method: "POST",
  });

  return response.json().catch(() => null) as Promise<PublicSessionResponse | null>;
}
