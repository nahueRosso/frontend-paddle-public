import type { Metadata } from "next";

import { ContactForm } from "@/components/contact-form";
import { company } from "@/config/company";

export const metadata: Metadata = {
  title: `Contacto | ${company.brandName}`,
  description:
    "Hablemos sobre cómo automatizar la operación de tu club de pádel con WhatsApp Business.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto mt-10 grid max-w-5xl gap-12 px-4 py-16 text-[#4B5563] dark:text-slate-300 sm:px-6 md:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-8">
        <header className="space-y-4">
          <h1 className="text-3xl font-semibold tracking-tight text-[#111827] dark:text-slate-100 md:text-4xl">
            Contacto
          </h1>
          <p className="text-base leading-relaxed">
            Completá el formulario y un integrante del equipo te responderá en
            menos de 24 horas hábiles. También podés escribirnos por WhatsApp o
            correo electrónico.
          </p>
        </header>
        <div className="rounded-3xl border border-emerald-100 bg-white/80 p-6 shadow-lg shadow-emerald-50 backdrop-blur-sm dark:border-emerald-900/60 dark:bg-slate-950/80 dark:shadow-emerald-950/20 md:p-8">
          <ContactForm />
        </div>
      </div>
      <aside className="space-y-8 rounded-3xl border border-emerald-100 bg-white p-6 shadow-lg shadow-emerald-50 backdrop-blur-sm dark:border-emerald-900/60 dark:bg-slate-950/80 dark:shadow-emerald-950/20 md:p-8">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">
            Datos de contacto
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed">
            <li>
              <span className="block font-semibold text-[#111827] dark:text-slate-100">Email</span>
              {company.email}
            </li>
            <li>
              <span className="block font-semibold text-[#111827] dark:text-slate-100">
                Teléfono
              </span>
              {company.phone}
            </li>
            <li>
              <span className="block font-semibold text-[#111827] dark:text-slate-100">
                Base operativa
              </span>
              {company.address}
            </li>
            <li>
              <span className="block font-semibold text-[#111827] dark:text-slate-100">
                Horario de atención
              </span>
              Lunes a viernes de 9 a 18 hs (GMT-3).
            </li>
          </ul>
        </div>
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">
            Antes de contratar
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed">
            <li>
              Coordinamos una demo, validamos tu caso de uso y te pasamos una
              propuesta simple para empezar.
            </li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
