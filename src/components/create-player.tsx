"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { useSession } from "next-auth/react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { isValidPhoneNumber } from "libphonenumber-js";
import { ArrowLeft, CheckCircle2, Clock, Loader2, MessageCircle, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreatePlayerMutation } from "@/hooks/mutations/player";
import { usePlayer } from "@/providers/player-provider";
import {
  checkPhoneChallenge,
  getPhoneChallengeStatus,
  type ExistingPersonSummary,
} from "@/lib/api/player";

const schema = z.object({
  dni: z.string().optional(),
  birthdayDate: z.string().optional(),
  phoneNumber: z.string().refine(
    (val) => val.length > 0 && isValidPhoneNumber(val),
    { message: "Teléfono inválido. Seleccioná el país e ingresá el número completo." },
  ),
  puntos: z.number().optional(),
  email: z.string().email("Email inválido").optional(),
  firstName: z.string().min(2, "Nombre requerido"),
  lastName: z.string().min(2, "Apellido requerido"),
  category: z.number().min(1).max(8).optional(),
  gender: z.enum(["male", "female"]).optional(),
});

type FormValues = z.infer<typeof schema>;

type VerificationState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "person_conflict"; existingPerson: ExistingPersonSummary }
  | { status: "pending"; challengeId: string; whatsappNumber: string; phoneNumber: string }
  | { status: "verified"; challengeId: string; phoneNumber: string }
  | { status: "expired" };

export default function CreatePlayer({ slug }: { slug: string }) {
  const router = useRouter();
  const { data: session } = useSession();
  const createPlayerMutation = useCreatePlayerMutation();
  const { setPlayerSession, ensureClubPlayerSession } = usePlayer();
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [verificationState, setVerificationState] = useState<VerificationState>({ status: "idle" });
  const isSubmitting = createPlayerMutation.isPending;
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (session?.user?.email) {
      reset({
        email: session.user.email,
        gender: "male",
      });
    }
  }, [session, reset]);

  // Limpieza del polling al desmontar
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const startPolling = useCallback(
    (challengeId: string, phoneNumber: string) => {
      stopPolling();
      pollingRef.current = setInterval(async () => {
        try {
          const result = await getPhoneChallengeStatus(challengeId);
          if (result.verified) {
            stopPolling();
            setVerificationState({ status: "verified", challengeId, phoneNumber });
          } else if (result.expired) {
            stopPolling();
            setVerificationState({ status: "expired" });
          }
        } catch {
          // silenciar errores de red durante polling
        }
      }, 3000);
    },
    [stopPolling],
  );

  const handleCreateButtonClick = async () => {
    const valid = await trigger();
    if (!valid) return;

    const phoneNumber = getValues("phoneNumber");
    setVerificationState({ status: "checking" });

    try {
      const result = await checkPhoneChallenge(phoneNumber);

      if (result.conflict === 'none') {
        setVerificationState({ status: "idle" });
        setConfirmOpen(true);
        return;
      }

      if (result.conflict === 'person') {
        setVerificationState({ status: "person_conflict", existingPerson: result.person });
        return;
      }

      // conflict === 'player' → verificación WA
      setVerificationState({
        status: "pending",
        challengeId: result.challengeId,
        whatsappNumber: result.whatsappNumber,
        phoneNumber,
      });
      startPolling(result.challengeId, phoneNumber);
    } catch {
      setVerificationState({ status: "idle" });
      setConfirmOpen(true);
    }
  };

  const handleVerificationDialogClose = () => {
    stopPolling();
    setVerificationState({ status: "idle" });
  };

  const handleProceedAfterVerification = () => {
    if (verificationState.status !== "verified") return;
    stopPolling();
    setVerificationState({ status: "idle" });
    setConfirmOpen(true);
  };

  const onSubmit = async (data: FormValues) => {
    const challengeId =
      verificationState.status === "verified" ? verificationState.challengeId : undefined;

    const payload = {
      ...data,
      email: session?.user?.email,
      ...(challengeId ? { phoneVerificationChallengeId: challengeId } : {}),
    };

    const response = await createPlayerMutation.mutateAsync({ slug, payload });
    setPlayerSession(response);
    await ensureClubPlayerSession();
    window.location.href = "/clubes";
  };

  const verificationOpen =
    verificationState.status === "checking" ||
    verificationState.status === "person_conflict" ||
    verificationState.status === "pending" ||
    verificationState.status === "verified" ||
    verificationState.status === "expired";

  const whatsappLink =
    verificationState.status === "pending"
      ? `https://wa.me/${verificationState.whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(`SOY YO ${verificationState.phoneNumber}`)}`
      : null;

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_38%),linear-gradient(180deg,#f8fafc_0%,#ecfdf5_100%)] px-4 py-8 dark:bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.16),transparent_30%),linear-gradient(180deg,#020617_0%,#0f172a_100%)]">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <div className="flex items-center justify-start">
          <Button
            type="button"
            variant="ghost"
            className="rounded-full px-3 text-slate-700 hover:bg-white/70 hover:text-emerald-700 dark:text-slate-200 dark:hover:bg-slate-900/70 dark:hover:text-emerald-300"
            onClick={() => router.push(`/clubes`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Ir atrás
          </Button>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-emerald-100/80 bg-white/90 shadow-xl shadow-emerald-100/60 backdrop-blur dark:border-emerald-900/60 dark:bg-slate-950/85 dark:shadow-emerald-950/20">
          <div className="border-b border-emerald-100 bg-emerald-50/80 px-6 py-6 dark:border-emerald-900/50 dark:bg-emerald-950/20 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">
              Alta de jugador
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">
              Crear perfil
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
              Completá tus datos para vincularte al club y continuar con reservas,
              torneos y el resto de la experiencia.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-8">
            <FieldGroup>
              <FieldSet>
                <FieldLegend className="text-lg text-slate-900 dark:text-slate-100">
                  Datos personales
                </FieldLegend>
                <FieldDescription className="text-slate-600 dark:text-slate-400">
                  Usamos esta información para crear tu perfil público dentro del club.
                </FieldDescription>

                <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                  <Field>
                    <FieldLabel className="text-slate-800 dark:text-slate-200">
                      Nombre
                    </FieldLabel>
                    <Input
                      {...register("firstName")}
                      className="border-emerald-100 bg-white dark:border-emerald-900/60 dark:bg-slate-900 dark:text-slate-100"
                    />
                    {errors.firstName && (
                      <p className="text-sm text-rose-500">
                        {errors.firstName.message}
                      </p>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel className="text-slate-800 dark:text-slate-200">
                      Apellido
                    </FieldLabel>
                    <Input
                      {...register("lastName")}
                      className="border-emerald-100 bg-white dark:border-emerald-900/60 dark:bg-slate-900 dark:text-slate-100"
                    />
                    {errors.lastName && (
                      <p className="text-sm text-rose-500">
                        {errors.lastName.message}
                      </p>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel className="text-slate-800 dark:text-slate-200">
                      Email
                    </FieldLabel>
                    <Input
                      type="email"
                      {...register("email")}
                      readOnly
                      className="cursor-not-allowed border-emerald-100 bg-slate-50 text-slate-500 dark:border-emerald-900/60 dark:bg-slate-900 dark:text-slate-400"
                    />
                  </Field>

                  <Field>
                    <FieldLabel className="text-slate-800 dark:text-slate-200">
                      Teléfono
                    </FieldLabel>
                    <Controller
                      control={control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <PhoneInput
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          error={!!errors.phoneNumber}
                          inputClassName="border-emerald-100 bg-white dark:border-emerald-900/60 dark:bg-slate-900 dark:text-slate-100"
                        />
                      )}
                    />
                    {errors.phoneNumber && (
                      <p className="text-sm text-rose-500">
                        {errors.phoneNumber.message}
                      </p>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel className="text-slate-800 dark:text-slate-200">
                      DNI
                    </FieldLabel>
                    <Input
                      {...register("dni")}
                      className="border-emerald-100 bg-white dark:border-emerald-900/60 dark:bg-slate-900 dark:text-slate-100"
                    />
                  </Field>

                  <Field>
                    <FieldLabel className="text-slate-800 dark:text-slate-200">
                      Fecha de nacimiento
                    </FieldLabel>
                    <Input
                      type="date"
                      {...register("birthdayDate")}
                      className="border-emerald-100 bg-white dark:border-emerald-900/60 dark:bg-slate-900 dark:text-slate-100"
                    />
                  </Field>

                  <Field>
                    <FieldLabel className="text-slate-800 dark:text-slate-200">
                      Categoría
                    </FieldLabel>
                    <Select
                      onValueChange={(value) => setValue("category", Number(value))}
                    >
                      <SelectTrigger className="border-emerald-100 bg-white dark:border-emerald-900/60 dark:bg-slate-900 dark:text-slate-100">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent className="border-emerald-100 bg-white dark:border-emerald-900/60 dark:bg-slate-950">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                          <SelectItem key={num} value={String(num)}>
                            Categoría {num}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <FieldLabel className="text-slate-800 dark:text-slate-200">
                      Género
                    </FieldLabel>
                    <Select
                      defaultValue="male"
                      onValueChange={(value) =>
                        setValue("gender", value as FormValues["gender"])
                      }
                    >
                      <SelectTrigger className="border-emerald-100 bg-white dark:border-emerald-900/60 dark:bg-slate-900 dark:text-slate-100">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-emerald-100 bg-white dark:border-emerald-900/60 dark:bg-slate-950">
                        <SelectItem value="male">Masculino</SelectItem>
                        <SelectItem value="female">Femenino</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </FieldSet>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl border-emerald-200 bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-900/60 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-emerald-500/10"
                  onClick={() => router.push(`/clubes`)}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={handleCreateButtonClick}
                  disabled={isSubmitting || verificationState.status === "checking"}
                  className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
                >
                  {verificationState.status === "checking" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verificando...
                    </>
                  ) : isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    "Crear jugador"
                  )}
                </Button>
              </div>
            </FieldGroup>
          </form>
        </div>

        {/* Dialog de confirmación normal */}
        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent className="border-emerald-100 bg-white text-slate-900 shadow-2xl shadow-emerald-100/70 dark:border-emerald-900/60 dark:bg-slate-950 dark:text-slate-100 dark:shadow-emerald-950/30">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-slate-900 dark:text-slate-100">
                ¿Confirmar creación de perfil?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
                Una vez enviados los datos, solo el dueño del club podrá
                modificarlos.
                <br />
                <br />
                Las categorías están alineadas bajo un mismo criterio general.
                Si el dueño del club decide subir o bajar tu categoría, no
                podrás modificarla por tu cuenta.
                <br />
                <br />
                Si necesitás cambios, vas a tener que comunicarte con el dueño
                del club.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel className="border-emerald-200 bg-white text-slate-900 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-900/60 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-emerald-500/10">
                Cancelar
              </AlertDialogCancel>

              <AlertDialogAction
                onClick={handleSubmit(async (data) => {
                  setConfirmOpen(false);
                  await onSubmit(data);
                })}
                disabled={isSubmitting}
                className="bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  "Confirmar y crear"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Dialog de verificación por WhatsApp */}
        <Dialog
          open={verificationOpen}
          onOpenChange={(open) => {
            if (!open) handleVerificationDialogClose();
          }}
        >
          <DialogContent className="border-emerald-100 bg-white text-slate-900 shadow-2xl dark:border-emerald-900/60 dark:bg-slate-950 dark:text-slate-100 sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-slate-900 dark:text-slate-100">
                {verificationState.status === "verified"
                  ? "¡Identidad verificada!"
                  : verificationState.status === "expired"
                    ? "Verificación expirada"
                    : "Verificá tu identidad"}
              </DialogTitle>
              <DialogDescription asChild>
                <div className="space-y-4 pt-2 text-slate-600 dark:text-slate-400">
                  {verificationState.status === "checking" && (
                    <div className="flex items-center gap-3 py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
                      <span>Verificando teléfono...</span>
                    </div>
                  )}

                  {verificationState.status === "person_conflict" && (
                    <>
                      <p>
                        Ese número ya tiene un perfil registrado en la plataforma:
                      </p>

                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800/60 dark:bg-emerald-950/30">
                        <p className="font-semibold text-slate-800 dark:text-slate-100">
                          {[verificationState.existingPerson.firstName, verificationState.existingPerson.lastName]
                            .filter(Boolean)
                            .join(" ") || "Sin nombre"}
                        </p>
                        {verificationState.existingPerson.baseCategory !== null && (
                          <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
                            Categoría {verificationState.existingPerson.baseCategory} ·{" "}
                            {verificationState.existingPerson.gender === "male" ? "Masculino" : "Femenino"}
                          </p>
                        )}
                        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-500">
                          {verificationState.existingPerson.phoneNumber}
                        </p>
                      </div>

                      <p className="text-sm">
                        Si ese sos vos, tu cuenta se va a vincular a este perfil y vas a conservar tu historial y categoría en todos los clubes.
                      </p>

                      <div className="flex flex-col gap-2">
                        <Button
                          onClick={() => {
                            const claimPersonId = verificationState.existingPerson.id;
                            setVerificationState({ status: "idle" });
                            handleSubmit(async (data) => {
                              const payload = {
                                ...data,
                                email: session?.user?.email,
                                claimPersonId,
                              };
                              const response = await createPlayerMutation.mutateAsync({ slug, payload });
                              setPlayerSession(response);
                              await ensureClubPlayerSession();
                              window.location.href = "/clubes";
                            })();
                          }}
                          disabled={isSubmitting}
                          className="w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
                        >
                          {isSubmitting ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Vinculando...</>
                          ) : (
                            "Sí, ese soy yo"
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleVerificationDialogClose}
                          className="w-full rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                        >
                          No, usar otro número
                        </Button>
                      </div>
                    </>
                  )}

                  {verificationState.status === "pending" && (
                    <>
                      <p>
                        Ese número ya está registrado en la plataforma. Para
                        confirmar que es tuyo, enviá un WhatsApp al número{" "}
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {verificationState.whatsappNumber}
                        </span>{" "}
                        con el siguiente mensaje:
                      </p>

                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800/60 dark:bg-emerald-950/30">
                        <p className="font-mono text-base font-semibold text-emerald-800 dark:text-emerald-300">
                          SOY YO {verificationState.phoneNumber}
                        </p>
                      </div>

                      <p className="text-sm">
                        El mensaje debe ser enviado{" "}
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          desde ese mismo número
                        </span>
                        . Así verificamos que te pertenece.
                      </p>

                      {whatsappLink && (
                        <a
                          href={whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-semibold text-white hover:bg-[#1ebe5d]"
                        >
                          <MessageCircle className="h-4 w-4" />
                          Abrir WhatsApp y enviar
                        </a>
                      )}

                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-500">
                        <Clock className="h-4 w-4" />
                        <span>Esperando respuesta... (válido por 10 minutos)</span>
                        <Loader2 className="h-3 w-3 animate-spin" />
                      </div>
                    </>
                  )}

                  {verificationState.status === "verified" && (
                    <>
                      <div className="flex flex-col items-center gap-3 py-4 text-center">
                        <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                        <p className="text-slate-700 dark:text-slate-300">
                          Tu número fue verificado correctamente. Podés continuar
                          con la creación de tu perfil.
                        </p>
                      </div>
                      <Button
                        onClick={handleProceedAfterVerification}
                        className="w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
                      >
                        Continuar
                      </Button>
                    </>
                  )}

                  {verificationState.status === "expired" && (
                    <>
                      <div className="flex flex-col items-center gap-3 py-4 text-center">
                        <XCircle className="h-12 w-12 text-rose-400" />
                        <p className="text-slate-700 dark:text-slate-300">
                          La verificación expiró. Cerrá este diálogo e intentá
                          nuevamente.
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={handleVerificationDialogClose}
                        className="w-full rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-900/60 dark:text-rose-400"
                      >
                        Cerrar e intentar de nuevo
                      </Button>
                    </>
                  )}
                </div>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
