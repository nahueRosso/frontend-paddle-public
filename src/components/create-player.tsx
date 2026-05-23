"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";

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
import { useCreatePlayerMutation } from "@/hooks/mutations/player";
import { usePlayer } from "@/providers/player-provider";

const schema = z.object({
  dni: z.string().optional(),
  birthdayDate: z.string().optional(),
  phoneNumber: z.string().min(6, "Teléfono requerido"),
  puntos: z.number().optional(),
  email: z.string().email("Email inválido").optional(),
  firstName: z.string().min(2, "Nombre requerido"),
  lastName: z.string().min(2, "Apellido requerido"),
  category: z.number().min(1).max(8).optional(),
  gender: z.enum(["male", "female"]).optional(),
});

type FormValues = z.infer<typeof schema>;

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
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });
  const [open, setOpen] = useState(false);
  const isSubmitting = createPlayerMutation.isPending;

  useEffect(() => {
    if (session?.user?.email) {
      reset({
        email: session.user.email,
        gender: "male",
      });
    }
  }, [session, reset]);

  const onSubmit = async (data: FormValues) => {
    const payload = {
      ...data,
      email: session?.user?.email,
    };

    const response = await createPlayerMutation.mutateAsync({ slug, payload });
    setPlayerSession(response);
    await ensureClubPlayerSession();
    router.refresh();
  };

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
                    <Input
                      {...register("phoneNumber")}
                      className="border-emerald-100 bg-white dark:border-emerald-900/60 dark:bg-slate-900 dark:text-slate-100"
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

              {/* <FieldSeparator className="bg-emerald-100 dark:bg-emerald-900/50" /> */}

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
                  onClick={() => setOpen(true)}
                  disabled={isSubmitting}
                  className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
                >
                  {isSubmitting ? (
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

        <AlertDialog open={open} onOpenChange={setOpen}>
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
                  setOpen(false);
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
      </div>
    </div>
  );
}
