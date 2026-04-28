"use client";

import type { ReactNode } from "react";
import { createContext, useMemo } from "react";
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
import { usePlanStatusQuery } from "@/hooks/queries/plan";

type PlanStatus = {
  active: boolean;
  planId?: string | null;
  planName?: string | null;
  status?: string | null;
  validUntil?:string | null;
};

interface AuthContextValue {
  session: Session | null;
  status: "loading" | "authenticated" | "unauthenticated";
  isAuthenticated: boolean;
  isPlanStatusLoading: boolean;
  planStatus: PlanStatus | null;
  isPlanActive: boolean;
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

  const value = useMemo<AuthContextValue>(
    () => ({
      session: session ?? null,
      status,
      isAuthenticated: status === "authenticated",
      isPlanStatusLoading,
      planStatus: planStatus ?? null,
      isPlanActive: Boolean(planStatus?.active),
      signIn: (provider, options) => nextAuthSignIn(provider, options),
      signOut: (options) =>
        nextAuthSignOut({
          callbackUrl: "/",
          ...options,
        }),
    }),
    [isPlanStatusLoading, planStatus, session, status],
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
