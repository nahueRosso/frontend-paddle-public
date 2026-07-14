"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { company } from "@/config/company";
import { useAuth } from "@/hooks/use-auth";
import { sanitizeRelativeRedirect } from "@/lib/auth/navigation";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, status } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestedRedirect =
    searchParams.get("redirect") ?? searchParams.get("next");
  const redirectTo = sanitizeRelativeRedirect(requestedRedirect, "/");

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
      await signIn("google", { callbackUrl: redirectTo });
    } catch {
      setError("Ocurrió un problema. Intentalo nuevamente en unos segundos.");
      setIsSubmitting(false);
    }
  };

  const isBusy = isSubmitting || status === "loading";

  return (
    <div className="flex min-h-svh bg-[#0A0B0D]">
      {/* Left - Form */}
      <div className="flex flex-1 flex-col justify-center px-8 py-12 sm:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-md">
          {/* Logo */}
          <div className="mb-10 flex items-center gap-3">
            <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#D6FF3D]">
              <Image
                src="/mi-padel-club-icon-black.svg"
                alt="Mi Club Padel"
                width={19}
                height={23}
                priority
              />
            </span>
            <div className="leading-tight">
              <span className="font-heading text-base font-bold text-[#F2F3F5]">
                Mi Club Pádel
              </span>
              <br />
              <span className="text-xs text-[#6B7280]">Gestión + WhatsApp IA</span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="font-heading text-3xl font-bold text-[#F2F3F5] sm:text-4xl">
            Bienvenido de nuevo
          </h1>
          <p className="mt-3 text-base text-[#9CA3AF]">
            Iniciá sesión con tu cuenta de Google para entrar al panel de{" "}
            <strong className="text-[#F2F3F5]">Mi Club Pádel</strong>.
          </p>

          {/* Error */}
          {error ? (
            <div className="mt-6 rounded-xl border border-rose-800 bg-rose-950/20 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          ) : null}

          {/* Google button */}
          <Button
            type="button"
            variant="outline"
            className="mt-8 w-full justify-center gap-3 rounded-xl border-white/[0.14] bg-[#F2F3F5] px-6 py-6 text-base font-medium text-[#111827] transition hover:bg-white"
            onClick={handleGoogleSignIn}
            disabled={isBusy}
          >
            {isBusy ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Conectando...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continuar con Google
              </>
            )}
          </Button>

          {/* Security note */}
          <p className="mt-5 flex items-center gap-2 text-sm text-[#6B7280]">
            <Lock className="h-3.5 w-3.5" />
            Acceso seguro · solo con Google
          </p>

          {/* Help */}
          <p className="mt-6 text-sm text-[#6B7280]">
            ¿Necesitás ayuda? Escribinos a{" "}
            <a href={`mailto:${company.email}`} className="font-semibold text-[#F2F3F5] no-underline hover:text-[#D6FF3D]">
              {company.email}
            </a>
          </p>

          {/* Legal */}
          <p className="mt-6 text-xs leading-relaxed text-[#6B7280]">
            Al continuar, aceptás nuestros{" "}
            <Link href="/terminos" className="text-[#9CA3AF] underline underline-offset-2 hover:text-[#D6FF3D]">
              Términos de Servicio
            </Link>{" "}
            y{" "}
            <Link href="/privacidad" className="text-[#9CA3AF] underline underline-offset-2 hover:text-[#D6FF3D]">
              Política de Privacidad
            </Link>
          </p>
        </div>
      </div>

      {/* Right - Paddle court illustration */}
      <div className="relative hidden flex-1 overflow-hidden lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(52,211,153,0.08),transparent_70%)]" />

        {/* Court SVG */}
        <svg
          viewBox="0 0 500 700"
          className="absolute inset-0 h-full w-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background gradient */}
          <defs>
            <radialGradient id="court-glow" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="rgba(52,211,153,0.12)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
          <rect width="500" height="700" fill="url(#court-glow)" />

          {/* Court outline */}
          <rect x="80" y="120" width="340" height="480" rx="4" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
          {/* Center line */}
          <line x1="80" y1="360" x2="420" y2="360" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          {/* Service boxes */}
          <rect x="140" y="120" width="220" height="160" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          <rect x="140" y="440" width="220" height="160" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          <line x1="250" y1="120" x2="250" y2="280" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          <line x1="250" y1="440" x2="250" y2="600" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          {/* Net */}
          <line x1="60" y1="360" x2="440" y2="360" stroke="rgba(214,255,61,0.15)" strokeWidth="2" />

          {/* Balls */}
          <circle cx="120" cy="160" r="6" fill="rgba(255,255,255,0.5)" />
          <circle cx="390" cy="100" r="4" fill="rgba(255,255,255,0.3)" />
          <circle cx="400" cy="560" r="10" fill="#D6FF3D" opacity="0.9" />
          <circle cx="400" cy="560" r="18" fill="#D6FF3D" opacity="0.15" />
        </svg>

        {/* Bottom text */}
        <div className="absolute bottom-10 left-0 right-0 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-[#6B7280]">
            Tu club, en juego
          </p>
        </div>
      </div>
    </div>
  );
}

function LoginPageFallback() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-[#0A0B0D]">
      <Loader2 className="h-5 w-5 animate-spin text-[#6B7280]" />
    </div>
  );
}
