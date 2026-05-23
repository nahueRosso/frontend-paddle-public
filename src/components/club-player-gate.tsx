"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import CreatePlayer from "@/components/create-player";
import VerifyClubPlayerDialog from "@/components/verify-club-player-dialog";
import { Button } from "@/components/ui/button";
import { fetchPublicPlayerLookup } from "@/lib/api/player";
import { isBackendFetchError } from "@/lib/auth/errors";
import { buildLoginRedirectUrl } from "@/lib/auth/navigation";
import { ensurePlayerSession } from "@/lib/auth/player-session";
import type { SessionState } from "@/lib/auth/types";
import {
  mergePublicPlayerSession,
  normalizePublicPlayerSession,
  type PublicPlayerSession,
} from "@/lib/public-player-session";
import { useAuth } from "@/hooks/use-auth";
import { PlayerProvider } from "@/providers/player-provider";

type ClubPlayerGateProps = {
  slug: string;
  userEmail: string;
  children: React.ReactNode;
};

const EMPTY_PLAYER_SESSION: PublicPlayerSession = {
  personExists: false,
  playerExists: false,
  personId: null,
  playerId: null,
  verifiedInClub: false,
  playerStatus: null,
  person: null,
  player: null,
};

export function ClubPlayerGate({
  slug,
  userEmail,
  children,
}: ClubPlayerGateProps) {
  const router = useRouter();
  const {
    publicSessionStatus,
    syncPublicSession,
    markPublicSessionActive,
  } = useAuth();
  const [playerSession, setPlayerSession] = useState<PublicPlayerSession | null>(null);
  const [playerAuthStatus, setPlayerAuthStatus] =
    useState<SessionState>("loading");
  const [playerAuthMessage, setPlayerAuthMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    if (publicSessionStatus === "loading") {
      setIsLoading(true);
      setErrorMessage(null);
      return () => {
        cancelled = true;
      };
    }

    if (publicSessionStatus !== "authenticated") {
      setPlayerSession(null);
      setPlayerAuthStatus(publicSessionStatus);
      setPlayerAuthMessage("No se pudo validar la sesión pública del club.");
      setIsLoading(false);
      setErrorMessage("No se pudo validar la sesión pública del club.");
      return () => {
        cancelled = true;
      };
    }

    const loadPlayerSession = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const ensuredClubSession = await ensurePlayerSession(slug);

        if (cancelled) {
          return;
        }

        if (ensuredClubSession.status === "unauthenticated") {
          setPlayerSession(null);
          setPlayerAuthStatus("unauthenticated");
          setPlayerAuthMessage(
            ensuredClubSession.message ?? "Necesitas volver a iniciar sesion.",
          );
          router.replace(buildLoginRedirectUrl(`/clubes/${slug}`));
          return;
        }

        if (ensuredClubSession.status === "forbidden") {
          setPlayerSession(EMPTY_PLAYER_SESSION);
          setPlayerAuthStatus("forbidden");
          setPlayerAuthMessage(
            ensuredClubSession.message ?? "No tenes acceso a este club.",
          );
          setErrorMessage(
            ensuredClubSession.message ?? "No tenes acceso a este club.",
          );
          return;
        }

        markPublicSessionActive();

        const lookupResponse = await fetchPublicPlayerLookup(slug, userEmail);

        if (cancelled) {
          return;
        }

        const normalizedPlayerSession = normalizePublicPlayerSession(lookupResponse);

        console.log("ClubPlayerGate: lookupResponse", lookupResponse);
        console.log(
          "ClubPlayerGate: normalizedPlayerSession",
          normalizedPlayerSession,
        );

        if (!normalizedPlayerSession.personExists || !normalizedPlayerSession.playerExists) {
          setPlayerSession(normalizedPlayerSession);
          setPlayerAuthStatus("needs_person_registration");
          setPlayerAuthMessage(null);
          return;
        }

        console.log("ClubPlayerGate: ensuredClubSession", ensuredClubSession);
        console.log(
          "ClubPlayerGate: finalPlayerSession",
          ensuredClubSession.payload
            ? mergePublicPlayerSession(
                normalizedPlayerSession,
                ensuredClubSession.payload,
              )
            : normalizedPlayerSession,
        );

        setPlayerSession(
          ensuredClubSession.payload
            ? mergePublicPlayerSession(
                normalizedPlayerSession,
                ensuredClubSession.payload,
              )
            : normalizedPlayerSession,
        );
        setPlayerAuthStatus(ensuredClubSession.status);
        setPlayerAuthMessage(ensuredClubSession.message ?? null);
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (isBackendFetchError(error) && error.status === 401) {
          setPlayerSession(null);
          setPlayerAuthStatus("unauthenticated");
          setPlayerAuthMessage(error.message);
          router.replace(buildLoginRedirectUrl(`/clubes/${slug}`));
          return;
        }

        setPlayerSession(null);
        setPlayerAuthStatus("forbidden");
        setPlayerAuthMessage(null);
        setErrorMessage(
          isBackendFetchError(error)
            ? error.message
            : error instanceof Error
              ? error.message
              : "No se pudo cargar el perfil público del jugador.",
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadPlayerSession();

    return () => {
      cancelled = true;
    };
  }, [markPublicSessionActive, publicSessionStatus, router, slug, userEmail]);

  if (isLoading || !playerSession) {
    if (errorMessage && !isLoading) {
      const isAccessDenied = playerAuthStatus === "forbidden";

      return (
        <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_38%),linear-gradient(180deg,#f8fafc_0%,#ecfdf5_100%)] dark:bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.16),transparent_30%),linear-gradient(180deg,#020617_0%,#0f172a_100%)]">
          <div className="mx-auto flex w-full max-w-3xl flex-1 items-center px-4 py-12">
            <div className="w-full rounded-3xl border border-rose-200 bg-white p-8 shadow-lg shadow-rose-100/60 dark:border-rose-900/60 dark:bg-slate-950/85 dark:shadow-rose-950/20">
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                {isAccessDenied
                  ? "No tenes acceso a este club"
                  : "No pudimos conectar con el club"}
              </h1>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                {errorMessage}
              </p>
              {!isAccessDenied ? (
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Revisá que el backend esté levantado. En desarrollo, este flujo usa
                  `NEXT_PUBLIC_API_URL` con `NEXT_PUBLIC_DEV=true`; si no, apunta a
                  `https://api.miclubpadel.com`.
                </p>
              ) : null}
              <Button
                type="button"
                className="mt-6"
                onClick={() => {
                  setIsLoading(true);
                  void syncPublicSession();
                }}
              >
                Reintentar
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <PlayerProvider
        initialSession={EMPTY_PLAYER_SESSION}
        initialAuthStatus={playerAuthStatus}
        initialAuthMessage={playerAuthMessage}
        slug={slug}
      >
        <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_38%),linear-gradient(180deg,#f8fafc_0%,#ecfdf5_100%)] px-4 dark:bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.16),transparent_30%),linear-gradient(180deg,#020617_0%,#0f172a_100%)]">
          <div className="w-full max-w-xl rounded-3xl border border-emerald-100 bg-white/90 p-8 text-center shadow-lg shadow-emerald-100/60 backdrop-blur dark:border-emerald-900/60 dark:bg-slate-950/85 dark:shadow-emerald-950/20">
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              Validando acceso al club
            </h1>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              Estamos sincronizando tu sesión con la API del club para cargar tu perfil.
            </p>
          </div>
        </div>
      </PlayerProvider>
    );
  }

  if (!playerSession.personExists) {
    return (
      <PlayerProvider
        initialSession={playerSession}
        initialAuthStatus={playerAuthStatus}
        initialAuthMessage={playerAuthMessage}
        slug={slug}
      >
        <CreatePlayer slug={slug} />
      </PlayerProvider>
    );
  }

  return (
    <PlayerProvider
      initialSession={playerSession}
      initialAuthStatus={playerAuthStatus}
      initialAuthMessage={playerAuthMessage}
      slug={slug}
    >
      <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_38%),linear-gradient(180deg,#f8fafc_0%,#ecfdf5_100%)] dark:bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.16),transparent_30%),linear-gradient(180deg,#020617_0%,#0f172a_100%)]">
        <VerifyClubPlayerDialog slug={slug} autoOpen />
        {children}
      </div>
    </PlayerProvider>
  );
}
