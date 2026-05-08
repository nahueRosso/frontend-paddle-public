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
      router.push("/login?redirect=/contacto");
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
        <div className="absolute inset-0 z-10 flex items-start justify-center rounded-3xl bg-white/45 p-5 backdrop-blur-[3px] dark:bg-slate-950/45">
          <div className="w-full max-w-md rounded-2xl border border-emerald-200 bg-white/95 p-5 text-center shadow-lg dark:border-emerald-900/60 dark:bg-slate-950/95">
            <p className="text-sm font-semibold text-[#111827] dark:text-slate-100">
              Iniciá sesión para enviar un mensaje
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Usamos el email de tu cuenta para enviar la consulta y evitar errores de contacto.
            </p>
            <button
              type="button"
              onClick={() => router.push("/login?redirect=/contacto")}
              className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400 dark:focus-visible:ring-emerald-950/70"
            >
              Ir a login
            </button>
          </div>
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100 dark:border-slate-800 dark:bg-slate-950/90 dark:shadow-slate-950/40 md:p-8"
      >
        <div className="space-y-1.5">
          <label
            htmlFor="contact-email"
            className="text-sm font-semibold text-slate-900 dark:text-slate-100"
          >
            Email de contacto
          </label>
          <div className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            {sessionEmail || "Necesitás iniciar sesión para usar tu email de cuenta"}
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="contact-sender"
            className="text-sm font-semibold text-slate-900 dark:text-slate-100"
          >
            Remitente
          </label>
          <div className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            contacto@miclubpadel.com
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="message"
            className="text-sm font-semibold text-slate-900 dark:text-slate-100"
          >
            Mensaje
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={5}
            value={formData.message}
            onChange={handleChange}
            placeholder="Contanos cómo podemos ayudarte..."
            disabled={!isAuthenticated || contactMutation.isPending}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-emerald-500 dark:focus:ring-emerald-950/70"
          />
        </div>

        <button
          type="submit"
          disabled={!isAuthenticated || contactMutation.isPending}
          className="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-400/40 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400 dark:focus-visible:ring-emerald-950/70"
        >
          {contactMutation.isPending ? "Enviando..." : "Enviar mensaje"}
        </button>

        {contactMutation.isSuccess ? (
          <p className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200">
            ¡Gracias! Tu mensaje fue enviado correctamente.
          </p>
        ) : null}

        {contactMutation.isError ? (
          <p className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200">
            {contactMutation.error instanceof ContactApiError
              ? contactMutation.error.message
              : contactMutation.error instanceof Error
                ? contactMutation.error.message
                : "Ocurrió un error inesperado. Intentalo nuevamente."}
          </p>
        ) : null}

        <p className="text-xs text-slate-500 dark:text-slate-400">
          El mensaje se envía con el email de tu sesión para responderte por ese mismo canal.
        </p>
      </form>
    </div>
  );
}
