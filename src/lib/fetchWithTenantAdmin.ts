// const apiUrl = process.env.NEXT_PUBLIC_API_URL!;
const apiDemoUrl = process.env.NEXT_PUBLIC_DEMO_API_URL ?? "http://localhost:5000";
const defaultTenant = process.env.NEXT_PUBLIC_TENANT_SCHEMA ?? "public";

// // 🔍 Función para obtener parámetros del iframe (tokengoogle, tenant) con fallback a localStorage
// function getIframeParams() {
//   if (typeof window === "undefined") {
//     return { tokengoogle: "", tenant: defaultTenant };
//   }

//   const searchParams = new URLSearchParams(window.location.search);

//   // Primero intento leer de la URL
//   let tokengoogle = searchParams.get("tokengoogle") || "";
//   let tenant = searchParams.get("tenant") || "";

//   // Si vinieron en la URL → los guardo en localStorage
//   if (tokengoogle) localStorage.setItem("tokengoogle", tokengoogle);
//   if (tenant) localStorage.setItem("tenant", tenant);

//   // Si no están en la URL → los leo del localStorage
//   if (!tokengoogle) tokengoogle = localStorage.getItem("tokengoogle") || "";
//   if (!tenant) tenant = localStorage.getItem("tenant") || defaultTenant;

//   console.log("🔍 Token Google:", tokengoogle);
//   console.log("🔍 Tenant:", tenant);

//   return {
//     tokengoogle,
//     tenant,
//   };
// }

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
    const response = await fetch(`${apiDemoUrl}${input}`, {
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
