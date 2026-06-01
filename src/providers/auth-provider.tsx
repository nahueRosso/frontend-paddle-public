"use client";

import type { ReactNode } from "react";
import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import type { Session } from "next-auth";
import {
  SessionProvider,
  signIn as nextAuthSignIn,
  signOut as nextAuthSignOut,
  useSession,
  type SignInOptions,
  type SignInResponse,
  type SignOutParams,
} from "next-auth/react";
import { isBackendFetchError } from "@/lib/auth/errors";
import { buildRelativeUrl, sanitizeRelativeRedirect } from "@/lib/auth/navigation";
import { logoutPlayer } from "@/lib/auth/player-session";
import { loginWithGooglePublic, logoutPublic } from "@/lib/auth/public-session";
import type { SessionState } from "@/lib/auth/types";
import { usePlanStatusQuery } from "@/hooks/queries/plan";

type PlanStatus = {
  active: boolean;
  planId?: string | null;
  planName?: string | null;
  status?: string | null;
  validUntil?:string | null;
};

type SessionScope = "none" | "public";

interface AuthContextValue {
  session: Session | null;
  status: "loading" | "authenticated" | "unauthenticated";
  isAuthenticated: boolean;
  isPlanStatusLoading: boolean;
  planStatus: PlanStatus | null;
  isPlanActive: boolean;
  publicSessionStatus: SessionState;
  sessionScope: SessionScope;
  syncPublicSession: () => Promise<void>;
  clearPublicSession: () => Promise<void>;
  markPublicSessionActive: () => void;
  signIn: (
    provider?: string,
    options?: SignInOptions,
  ) => Promise<SignInResponse | undefined>;
  signOut: (options?: SignOutParams<true>) => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
 
function AuthContextBridge({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const { data: planStatus, isLoading: isPlanStatusLoading } = usePlanStatusQuery(
    session?.user?.id,
  );
  const [publicSessionStatus, setPublicSessionStatus] =
    useState<SessionState>("loading");
  const [sessionScope, setSessionScope] = useState<SessionScope>("none");

  const syncPublicSession = useCallback(async () => {
    if (!session?.idToken) {
      setPublicSessionStatus("unauthenticated");
      setSessionScope("none");
      return;
    }

    setPublicSessionStatus("loading");

    try {
      const response = await loginWithGooglePublic(session.idToken);
      setPublicSessionStatus(response?.status ?? "authenticated");
      setSessionScope("public");
    } catch (error) {
      if (isBackendFetchError(error) && error.status === 401) {
        setPublicSessionStatus("unauthenticated");
        setSessionScope("none");
        return;
      }

      setPublicSessionStatus("forbidden");
      setSessionScope("none");
    }
  }, [session?.idToken]);

  const clearPublicSession = useCallback(async () => {
    try {
      await Promise.allSettled([logoutPlayer(), logoutPublic()]);
    } finally {
      setPublicSessionStatus("unauthenticated");
      setSessionScope("none");
    }
  }, []);

  const markPublicSessionActive = useCallback(() => {
    setPublicSessionStatus("authenticated");
    setSessionScope("public");
  }, []);

  useEffect(() => {
    if (status === "loading") {
      setPublicSessionStatus("loading");
      return;
    }

    if (status !== "authenticated" || !session?.idToken) {
      setPublicSessionStatus("unauthenticated");
      setSessionScope("none");
      return;
    }

    void syncPublicSession();
  }, [session?.idToken, status, syncPublicSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session: session ?? null,
      status,
      isAuthenticated: status === "authenticated",
      isPlanStatusLoading,
      planStatus: planStatus ?? null,
      isPlanActive: Boolean(planStatus?.active),
      publicSessionStatus,
      sessionScope,
      syncPublicSession,
      clearPublicSession,
      markPublicSessionActive,
      signIn: (provider, options) => nextAuthSignIn(provider, options),
      signOut: async (options) => {
        const fallbackCallbackUrl =
          typeof window === "undefined"
            ? "/"
            : buildRelativeUrl(window.location.pathname, window.location.search);
        const { callbackUrl, ...restOptions } = options ?? {};

        await clearPublicSession();
        await nextAuthSignOut({
          ...restOptions,
          callbackUrl: sanitizeRelativeRedirect(callbackUrl ?? fallbackCallbackUrl, "/"),
        });
      },
    }),
    [
      clearPublicSession,
      isPlanStatusLoading,
      markPublicSessionActive,
      planStatus,
      publicSessionStatus,
      session,
      sessionScope,
      syncPublicSession,
      status,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthContextBridge>{children}</AuthContextBridge>
    </SessionProvider>
  );
}
