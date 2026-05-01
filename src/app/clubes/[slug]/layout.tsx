import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchWithTenantAdmin } from "@/lib/fetchWithTenantAdmin";
import { normalizePublicPlayerSession } from "@/lib/public-player-session";
import { PlayerProvider } from "@/providers/player-provider";
import CreatePlayer from "@/components/create-player";
import VerifyClubPlayerDialog from "@/components/verify-club-player-dialog";

export default async function ClubesLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  try {
    const playerLookupPath = `/player/${slug}?email=${session.user?.email}`;
    console.log("[ClubesLayout] Fetching player session", {
      slug,
      email: session.user?.email,
      path: playerLookupPath,
    });

    const response = await fetchWithTenantAdmin(
      playerLookupPath,
      { method: "GET" }
    );

    console.log("[ClubesLayout] Player session response", {
      slug,
      email: session.user?.email,
      status: response.status,
      ok: response.ok,
    });

    if (response.status === 404) {
      console.log("[ClubesLayout] Player session not found, rendering CreatePlayer", {
        slug,
        email: session.user?.email,
      });
      return <CreatePlayer slug={slug} />;
    }

    if (!response.ok) {
      throw new Error("No se pudo obtener el perfil del jugador.");
    }

    const rawPlayerSession = await response.json();
    console.log("[ClubesLayout] Raw player session payload", rawPlayerSession);

    const playerSession = normalizePublicPlayerSession(rawPlayerSession);
    console.log("[ClubesLayout] Normalized player session", playerSession);

    return (
      <PlayerProvider initialSession={playerSession}>
        <div className="flex min-h-screen flex-col bg-slate-50">
          <VerifyClubPlayerDialog slug={slug} autoOpen />
          {children}
        </div>
      </PlayerProvider>
    );
  } catch (error) {
    console.error("No se pudo cargar el perfil público del jugador:", error);

    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <div className="mx-auto flex w-full max-w-3xl flex-1 items-center px-4 py-12">
          <div className="w-full rounded-3xl border border-rose-200 bg-white p-8 shadow-lg">
            <h1 className="text-2xl font-semibold text-slate-900">
              No pudimos conectar con el club
            </h1>
            <p className="mt-3 text-sm text-slate-600">
              El frontend no pudo obtener tu perfil porque la API del club no está respondiendo.
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Revisá que el backend esté levantado y que `NEXT_PUBLIC_DEMO_API_URL` apunte a la URL correcta.
            </p>
          </div>
        </div>
      </div>
    );
  }
}
