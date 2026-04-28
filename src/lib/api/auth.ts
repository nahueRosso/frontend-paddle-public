import { fetchWithTenantAdmin } from "../fetchWithTenantAdmin";

export async function authWithGoogle(
  email: string | null | undefined ,
  name: string | null | undefined, 
  picture: string | null | undefined,
  googleId: string | null | undefined,
) {
  const response = await fetchWithTenantAdmin(
    "/auth-with-google/prueba-demo",
    {
      method: "POST",
      body: JSON.stringify({ email, name, picture, googleId }),
    },
  );

  return response.json(); // 👈 acá ya devolvés el JSON directamente
}