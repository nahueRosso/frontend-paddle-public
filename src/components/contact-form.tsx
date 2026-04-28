"use client";

import { useState } from "react";
import { useSubmitContactMutation } from "@/hooks/mutations/contact";

const initialState = {
  name: "",
  email: "",
  message: "",
};

export function ContactForm() {
  const [formData, setFormData] = useState(initialState);
  const contactMutation = useSubmitContactMutation();

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await contactMutation.mutateAsync(formData);
      setFormData(initialState);
    } catch {}
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100 dark:border-slate-800 dark:bg-slate-950/90 dark:shadow-slate-950/40 md:p-8"
    >
      <div className="space-y-1.5">
        <label htmlFor="name" className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Nombre completo
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          value={formData.name}
          onChange={handleChange}
          placeholder="Ej. María Pérez"
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-emerald-500 dark:focus:ring-emerald-950/70"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Email de contacto
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={formData.email}
          onChange={handleChange}
          placeholder="Ej. contacto@miclubpadel.com"
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-emerald-500 dark:focus:ring-emerald-950/70"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="message" className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Mensaje
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={4}
          value={formData.message}
          onChange={handleChange}
          placeholder="Contanos cómo podemos ayudarte..."
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-emerald-500 dark:focus:ring-emerald-950/70"
        />
      </div>
      <button
        type="submit"
        disabled={contactMutation.isPending}
        className="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-400/40 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400 dark:focus-visible:ring-emerald-950/70"
      >
        {contactMutation.isPending ? "Enviando..." : "Enviar mensaje"}
      </button>
      {contactMutation.isSuccess && (
        <p className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200">
          ¡Gracias! Registramos tu consulta. Te contactaremos a la brevedad.
        </p>
      )}
      {contactMutation.isError && (
        <p className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200">
          {contactMutation.error instanceof Error
            ? contactMutation.error.message
            : "Ocurrió un error inesperado. Intentalo nuevamente."}
        </p>
      )}
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Los datos enviados se almacenan solo para responder tu consulta.{" "}
        <span className="font-semibold">TODO:</span> integrar proveedor de CRM o
        ticketing.
      </p>
    </form>
  );
}
