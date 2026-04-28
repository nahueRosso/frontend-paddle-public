"use client";

import { useRouter } from "next/navigation";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
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
import { useCreatePlayerMutation } from "@/hooks/mutations/player";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { AlertDialog, AlertDialogContent,AlertDialogAction,AlertDialogCancel,AlertDialogDescription,AlertDialogFooter,AlertDialogHeader,AlertDialogTitle } from "./ui/alert-dialog";

const schema = z.object({
  dni: z.string().optional(),
  birthdayDate: z.string().optional(),
  phoneNumber: z.string().min(6, "Teléfono requerido"),
  puntos: z.number().optional(),
  email: z.string().email("Email inválido").optional(),
  firstName: z.string().min(2, "Nombre requerido"),
  lastName: z.string().min(2, "Apellido requerido"),
  category: z.number().min(1).max(8).optional(),
  gender: z.enum(["male", "female", "mixed"]).optional(),
});

type FormValues = z.infer<typeof schema>;

export default function CreatePlayer({ slug }: { slug: string }) {
  const router = useRouter();
  const {data:session} = useSession()
  const createPlayerMutation = useCreatePlayerMutation();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const [open, setOpen] = useState(false);
//   const {
//   register,
//   handleSubmit,
  
//   formState: { errors },
// } = useForm<FormValues>({
//   resolver: zodResolver(schema),
// });

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

  await createPlayerMutation.mutateAsync({ slug, payload });

  router.refresh();
};

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl p-12">
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <FieldSet>
              <FieldLegend className="text-2xl">
                Crear Perfil
              </FieldLegend>
              <FieldDescription>
                Completa tus datos para acceder al club
              </FieldDescription>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <Field>
                  <FieldLabel>Nombre</FieldLabel>
                  <Input {...register("firstName")} />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm">
                      {errors.firstName.message}
                    </p>
                  )}
                </Field>

                <Field>
                  <FieldLabel>Apellido</FieldLabel>
                  <Input {...register("lastName")} />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm">
                      {errors.lastName.message}
                    </p>
                  )}
                </Field>

<Field>
  <FieldLabel>Email</FieldLabel>
  <Input
    type="email"
    {...register("email")}
    readOnly
    className="bg-slate-100 cursor-not-allowed"
  />
</Field>

                <Field>
                  <FieldLabel>Teléfono</FieldLabel>
                  <Input {...register("phoneNumber")} />
                  {errors.phoneNumber && (
                    <p className="text-red-500 text-sm">
                      {errors.phoneNumber.message}
                    </p>
                  )}
                </Field>

                <Field>
                  <FieldLabel>DNI</FieldLabel>
                  <Input {...register("dni")} />
                </Field>

                <Field>
                  <FieldLabel>Fecha de nacimiento</FieldLabel>
                  <Input type="date" {...register("birthdayDate")} />
                </Field>

                <Field>
                  <FieldLabel>Categoría</FieldLabel>
                  <Select
                    onValueChange={(value) =>
                      setValue("category", Number(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5,6,7,8].map((num) => (
                        <SelectItem key={num} value={String(num)}>
                          Categoría {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel>Género</FieldLabel>
                  <Select
                    defaultValue="male"
                    onValueChange={(value) =>
                      setValue("gender", value as any)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Masculino</SelectItem>
                      <SelectItem value="female">Femenino</SelectItem>
                      <SelectItem value="mixed">Mixto</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              {/* <div className="mt-6 flex items-center gap-2">
                <Checkbox
                  checked={watch("verified")}
                  onCheckedChange={(val) =>
                    setValue("verified", Boolean(val))
                  }
                />
                <FieldLabel className="font-normal">
                  Cuenta verificada
                </FieldLabel>
              </div> */}
            </FieldSet>

            <FieldSeparator />

            <Button
  type="button"
  onClick={() => setOpen(true)}
  className="w-full mt-4"
>
  Crear jugador
</Button>
          </FieldGroup>
        </form>
        <AlertDialog open={open} onOpenChange={setOpen}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>
        ¿Confirmar creación de perfil?
      </AlertDialogTitle>
      <AlertDialogDescription>
        Una vez enviados los datos, solo el dueño del club podrá
        modificarlos.

        <br /><br />

        Las categorías están alineadas bajo un mismo criterio general.
        Si el dueño del club decide subir o bajar tu categoría,
        no podrás modificarla por tu cuenta.

        <br /><br />

        Si necesitas cambios, deberás comunicarte con el dueño del club.
      </AlertDialogDescription>
    </AlertDialogHeader>

    <AlertDialogFooter>
      <AlertDialogCancel>Cancelar</AlertDialogCancel>

      <AlertDialogAction
        onClick={handleSubmit(async (data) => {
          setOpen(false);
          await onSubmit(data);
        })}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Creando..." : "Confirmar y crear"}
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
      </div>
    </div>
  );
}
