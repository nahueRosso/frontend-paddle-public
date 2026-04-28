import { company } from "@/config/company";

const currentYear = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-300/10 text-slate-100 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 md:px-6">
        <div className="flex flex-col gap-2 text-sm leading-relaxed text-slate-800 dark:text-slate-300">
          <p className="font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-100">
            Hecho en Argentina
          </p>
          <p>
            Trabajamos con clubes de pádel para digitalizar reservas, pagos y
            operación diaria desde la web.
          </p>
        </div>
        <p className="text-xs text-slate-900 dark:text-slate-400">
          © {currentYear} {company.brandName} — {company.legalName} — CUIT{" "}
          {company.cuit} — Responsable Inscripto — Huanguelén, Buenos Aires —{" "}
          {company.email}
        </p>
      </div>
    </footer>
  );
}
