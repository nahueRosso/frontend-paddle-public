"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { company } from "@/config/company";
import { useAuth } from "@/hooks/use-auth";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, status } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectTo =
    searchParams.get("redirect") ??
    searchParams.get("next") ??
    "/";

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(redirectTo);
      router.refresh();
    }
  }, [status, redirectTo, router]);

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await signIn("google", {
        callbackUrl: redirectTo,
        redirect: false,
      });

      if (response?.error) {
        setError("No pudimos iniciar sesion con Google. Intentalo nuevamente.");
        setIsSubmitting(false);
        return;
      }

      if (response?.url) {
        router.replace(response.url);
        router.refresh();
        return;
      }

      router.replace(redirectTo);
      router.refresh();
    } catch (err) {
      console.error("Google sign-in error:", err);
      setError("Ocurrio un problema. Intentalo nuevamente en unos segundos.");
      setIsSubmitting(false);
    }
  };

  const isBusy = isSubmitting || status === "loading";

  return (
    <main className="flex min-h-[calc(100vh-6rem)] items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_transparent_38%),linear-gradient(180deg,_#f8fafc_0%,_#ecfdf5_48%,_#f8fafc_100%)] px-4 py-16 sm:px-6 dark:bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_30%),linear-gradient(180deg,_#020617_0%,_#052e2b_45%,_#020617_100%)]">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-emerald-100 bg-white/85 p-8 shadow-lg shadow-emerald-100 backdrop-blur-sm dark:border-emerald-900/70 dark:bg-slate-950/80 dark:shadow-emerald-950/20">
        <div className="space-y-2 text-center text-[#4B5563] dark:text-slate-300">
          <h1 className="text-3xl font-semibold tracking-tight text-[#111827] dark:text-slate-100">
            Iniciar sesión
          </h1>
          <p className="text-sm leading-relaxed">
            Accedé al panel administrativo de Mi Club Pádel.
          </p>
        </div>

        {error ? (
          <p className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-200">
            {error}
          </p>
        ) : null}

        <Button
          onClick={handleGoogleSignIn}
          type="button"
          disabled={isBusy}
          className="mx-auto flex w-full max-w-sm items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-base font-medium text-white shadow-md transition-all hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-70 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400 dark:focus-visible:ring-offset-slate-950"
        >
          {isBusy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Conectando con Google...
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="h-4 w-4"
              >
                <path
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  className="fill-current"
                />
              </svg>
              Continuar con Google
            </>
          )}
        </Button>

        <p className="text-center text-sm text-[#4B5563] dark:text-slate-300">
          ¿Necesitás ayuda? Escribinos a{" "}
          <Link
            href={`mailto:${company.email}`}
            className="font-semibold text-emerald-600 underline underline-offset-2 transition-all hover:text-emerald-700 dark:text-emerald-300 dark:hover:text-emerald-200"
          >
            {company.email}
          </Link>
        </p>
      </div>
    </main>
  );
}
