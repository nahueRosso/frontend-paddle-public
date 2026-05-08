import { Card, CardContent, CardHeader } from "./ui/card";
import { Clock, MapPin, Phone, User } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Professor } from "@/types/professor";

export function ProfessorCard({ prof }: { prof: Professor }) {

  return (
    <Card className="overflow-hidden rounded-[1.75rem] border-emerald-100 bg-white/90 shadow-lg shadow-emerald-100/60 transition-shadow hover:shadow-xl hover:shadow-emerald-100 dark:border-emerald-900/60 dark:bg-slate-950/80 dark:shadow-emerald-950/20">

      {/* Imagen */}
      <div className="relative h-56 w-full bg-emerald-50 dark:bg-slate-900/80">

        {prof.imageProfeUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={prof.imageProfeUrl || ""}
              alt={prof.firstName}
              // fill
              className="h-full w-full object-cover"
            />
          </>

        ) : (

          <div className="flex h-full items-center justify-center">
            <User className="h-10 w-10 text-muted-foreground" />
          </div>

        )}

      </div>

      <CardHeader className="pb-2">

        <div className="flex items-center justify-between">

          <h3 className="text-lg font-semibold dark:text-slate-100">
            {prof.firstName} {prof.lastName}
          </h3>

          {prof.minPrice && (
            <Badge className="border-0 bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/12 dark:text-emerald-300 dark:hover:bg-emerald-500/12">
              ${prof.minPrice}
              {prof.maxPrice && ` - ${prof.maxPrice}`}
            </Badge>
          )}

        </div>

      </CardHeader>

      <CardContent className="space-y-3">

        {/* categorias */}
        <div className="flex flex-wrap gap-1">

          {prof.categories?.map((cat) => (

            <Badge key={cat} variant="secondary" className="bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
              {cat}
            </Badge>

          ))}

        </div>

        {/* descripcion */}
        {prof.shortDescription && (

          <p className="text-sm text-muted-foreground dark:text-slate-400">
            {prof.shortDescription}
          </p>

        )}

        {/* cancha */}
        {prof.court && (

          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">

            <MapPin className="h-4 w-4" />
            {prof.court}

          </div>

        )}

        {/* duracion */}
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">

          <Clock className="h-4 w-4" />
          Turnos de {prof.turnDuration} min

        </div>

        {/* dias */}
        <div className="flex flex-wrap gap-1">

          {prof.days?.map((d) => (

            <Badge key={d} variant="outline" className="border-emerald-200 text-emerald-700 dark:border-emerald-900/60 dark:text-emerald-300">
              {/* {DAYS[d]} */}
            </Badge>

          ))}

        </div>

        {/* boton */}
        {prof.phoneNumber && (

          <Button className="w-full gap-2 rounded-full bg-emerald-600 text-white hover:bg-emerald-500 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400">

            <Phone className="h-4 w-4" />

            Reservar

          </Button>

        )}

      </CardContent>

    </Card>

  )

}
