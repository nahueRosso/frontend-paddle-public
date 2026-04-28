import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { fetchWithTenantAdmin } from "@/lib/fetchWithTenantAdmin";
import { PlayerProvider } from "@/providers/player-provider";
import CreatePlayer from "@/components/create-player";

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

  const response = await fetchWithTenantAdmin(
    `/player/${slug}?email=${session.user?.email}`,
    { method: "GET" }
  );

  console.log("response:", response);
if (response.status === 404) {
  return <CreatePlayer slug={slug} />;
}

  const player = await response.json();

  console.log("PLAYER:", player);

  return (
    <PlayerProvider player={player}>
      <div className="flex min-h-screen flex-col bg-slate-50">
        {children}
      </div>
    </PlayerProvider>
  );
}