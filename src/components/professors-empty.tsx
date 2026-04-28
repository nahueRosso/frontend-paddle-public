import { Card, CardContent } from "./ui/card";

export function ProfessorsEmpty() {

  return (

    <Card className="rounded-[1.75rem] border-emerald-100 bg-white/90 shadow-lg shadow-emerald-100/60 dark:border-emerald-900/60 dark:bg-slate-950/80 dark:shadow-emerald-950/20">

      <CardContent className="py-16 text-center text-slate-600 dark:text-slate-400">

        No hay profesores disponibles

      </CardContent>

    </Card>

  )

}
