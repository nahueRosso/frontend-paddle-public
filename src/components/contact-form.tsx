"use client";

import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";

import { useSubmitContactMutation } from "@/hooks/mutations/contact";
import { useAuth } from "@/hooks/use-auth";
import { ContactApiError } from "@/lib/api/contact";

const initialState = {
  message: "",
};

export function ContactForm() {
  const router = useRouter();
  const { session } = useAuth();
  const [formData, setFormData] = useState(initialState);
  const contactMutation = useSubmitContactMutation();

  const sessionEmail = session?.user?.email?.trim() ?? "";
  const isAuthenticated = Boolean(sessionEmail);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!sessionEmail) {
      router.push("/login?redirect=/");
      return;
    }

    try {
      await contactMutation.mutateAsync({
        senderEmail: sessionEmail,
        message: formData.message.trim(),
      });
      setFormData(initialState);
    } catch {}
  };

  return (
    <div className="relative">
      {!isAuthenticated ? (
        <div className="absolute inset-0 z-10 flex items-start justify-center rounded-2xl bg-[#0A0B0D]/60 p-5 backdrop-blur-[3px]">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0A0B0D]/95 p-5 text-center shadow-lg">
            <p className="text-sm font-semibold text-[#F2F3F5]">
              Iniciá sesión para enviar un mensaje
            </p>
            <p className="mt-2 text-sm text-[#9CA3AF]">
              Usamos el email de tu cuenta para enviar la consulta y evitar errores de contacto.
            </p>
            <button
              type="button"
              onClick={() => router.push("/login?redirect=/")}
              className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-[#D6FF3D] px-5 py-3 text-sm font-semibold text-[#0A0B0D] transition hover:bg-[#e4ff6a]"
            >
              Ir a login
            </button>
          </div>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label
            htmlFor="contact-email"
            className="text-sm font-semibold text-[#F2F3F5]"
          >
            Email de contacto
          </label>
          <div className="w-full rounded-xl border border-white/10 bg-[#111417] px-4 py-3 text-sm text-[#9CA3AF]">
            {sessionEmail || "Necesitás iniciar sesión para usar tu email de cuenta"}
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="message"
            className="text-sm font-semibold text-[#F2F3F5]"
          >
            Mensaje
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={4}
            minLength={2}
            maxLength={300}
            value={formData.message}
            onChange={handleChange}
            placeholder="Contanos cómo podemos ayudarte..."
            disabled={!isAuthenticated || contactMutation.isPending}
            className="w-full rounded-xl border border-white/10 bg-[#111417] px-4 py-3 text-sm text-[#E4E5E7] placeholder:text-[#6B7280] focus:border-[#D6FF3D]/50 focus:outline-none focus:ring-2 focus:ring-[#D6FF3D]/20 disabled:cursor-not-allowed disabled:opacity-70"
          />
        </div>

        <button
          type="submit"
          disabled={!isAuthenticated || contactMutation.isPending}
          className="inline-flex w-full items-center justify-center rounded-full bg-[#D6FF3D] px-5 py-3 text-sm font-semibold text-[#0A0B0D] transition hover:bg-[#e4ff6a] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {contactMutation.isPending ? "Enviando..." : "Enviar mensaje"}
        </button>

        {contactMutation.isSuccess ? (
          <p className="rounded-xl border border-emerald-800 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-200">
            ¡Gracias! Tu mensaje fue enviado correctamente.
          </p>
        ) : null}

        {contactMutation.isError ? (
          <p className="rounded-xl border border-rose-800 bg-rose-950/30 px-4 py-3 text-sm text-rose-200">
            {contactMutation.error instanceof ContactApiError
              ? contactMutation.error.message
              : contactMutation.error instanceof Error
                ? contactMutation.error.message
                : "Ocurrió un error inesperado. Intentalo nuevamente."}
          </p>
        ) : null}

        <p className="text-xs text-[#6B7280]">
          El mensaje se envía con el email de tu sesión para responderte por ese mismo canal.
        </p>
      </form>
    </div>
  );
}
