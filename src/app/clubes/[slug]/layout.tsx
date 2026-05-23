import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ClubPlayerGate } from "@/components/club-player-gate";
import { buildLoginRedirectUrl } from "@/lib/auth/navigation";

export default async function ClubesLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const session = await getServerSession(authOptions);
  const loginRedirectUrl = buildLoginRedirectUrl(`/clubes/${slug}`);

  if (!session) {
    redirect(loginRedirectUrl);
  }

  const userEmail = session.user?.email?.trim();

  if (!userEmail) {
    redirect(loginRedirectUrl);
  }

  return (
    <ClubPlayerGate slug={slug} userEmail={userEmail}>
      {children}
    </ClubPlayerGate>
  );
}
