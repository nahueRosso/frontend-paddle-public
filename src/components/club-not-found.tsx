import { CircleOff } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ClubNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_38%),linear-gradient(180deg,_#f8fafc_0%,_#ecfdf5_48%,_#f8fafc_100%)] p-6 text-center dark:bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_28%),linear-gradient(180deg,_#020617_0%,_#062f2b_40%,_#020617_100%)]">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/15">
        <CircleOff className="h-10 w-10 text-emerald-700" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Club no encontrado
        </h1>
        <p className="max-w-md leading-relaxed text-slate-600 dark:text-slate-400">
          El club que estas buscando no existe o la URL es incorrecta. Verifica
          el enlace e intenta nuevamente.
        </p>
      </div>
      <Button variant="outline" asChild className="rounded-full border-emerald-300 bg-white/80 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500/40 dark:bg-slate-950/80 dark:text-emerald-300 dark:hover:bg-emerald-500/10">
        <a href="/">Volver al inicio</a>
      </Button>
    </div>
  )
}
