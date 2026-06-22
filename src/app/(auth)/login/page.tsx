"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  FieldDescription,
  FieldGroup,
  FieldSeparator,
  Field,
} from "@/components/ui/field";
import { useAppTheme } from "@/components/app-theme-provider";
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
      await signIn("google", {
        callbackUrl: redirectTo,
      });
    } catch {
      setError("Ocurrió un problema. Intentalo nuevamente en unos segundos.");
      setIsSubmitting(false);
    }
  };

  const isBusy = isSubmitting || status === "loading";

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <LoginForm
          onGoogleSignIn={handleGoogleSignIn}
          isBusy={isBusy}
          error={error}
        />
      </div>
    </div>
  );
}

function LoginForm({
  onGoogleSignIn,
  isBusy,
  error,
}: {
  onGoogleSignIn: () => void;
  isBusy: boolean;
  error: string | null;
}) {
  const { theme } = useAppTheme();
  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="p-6 md:p-8">
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Bienvenido</h1>
                <p className="text-balance text-muted-foreground">
                  Iniciá sesión con tu cuenta de Google para acceder a Mi Club
                  Pádel
                </p>
              </div>
              {error && (
                <p className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </p>
              )}
              <Field>
                <Button
                  variant="outline"
                  type="button"
                  className="w-full"
                  onClick={onGoogleSignIn}
                  disabled={isBusy}
                >
                  {isBusy ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Conectando...
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                          fill="currentColor"
                        />
                      </svg>
                      Continuar con Google
                    </>
                  )}
                </Button>
              </Field>
              <FieldDescription className="text-center">
                ¿Necesitás ayuda? Escribinos a{" "}
                <Link href={`mailto:${company.email}`}>{company.email}</Link>
              </FieldDescription>
            </FieldGroup>
          </div>
          <div className="relative hidden bg-muted md:block">
            <Image
              src={
                theme === "dark"
                  ? "/imagen-de-login.webp"
                  : "/imagen-de-login-light.webp"
              }
              alt="Cancha de pádel"
              fill
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.7]"
              priority
            />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        Al continuar, aceptás nuestros{" "}
        <Link href="/terminos">Términos de Servicio</Link> y{" "}
        <Link href="/privacidad">Política de Privacidad</Link>.
      </FieldDescription>
    </div>
  );
}

function LoginPageFallback() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm items-center justify-center md:max-w-4xl">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    </div>
  );
}
