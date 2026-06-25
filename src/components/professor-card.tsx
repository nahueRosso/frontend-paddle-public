import { Card, CardContent, CardHeader } from "./ui/card";
import { Clock, MapPin, Phone, User } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Professor } from "@/types/professor";

export function ProfessorCard({ prof }: { prof: Professor }) {

  return (
    <Card className="overflow-hidden rounded-2xl border-[#1E2028] bg-[#101216] transition-shadow hover:shadow-xl">

      {/* Imagen */}
      <div className="relative h-56 w-full bg-[#1a1d24]">

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

          <h3 className="text-lg font-semibold">
            {prof.firstName} {prof.lastName}
          </h3>

          {prof.minPrice && (
            <Badge className="border-0 bg-[#D6FF3D]/15 text-[#D6FF3D] hover:bg-[#D6FF3D]/15">
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

            <Badge key={cat} variant="secondary" className="bg-[#1a1d24] text-[#9CA3AF] bg-[#14161A]">
              {cat}
            </Badge>

          ))}

        </div>

        {/* descripcion */}
        {prof.shortDescription && (

          <p className="text-sm text-muted-foreground">
            {prof.shortDescription}
          </p>

        )}

        {/* cancha */}
        {prof.court && (

          <div className="flex items-center gap-2 text-sm text-[#6B7280]">

            <MapPin className="h-4 w-4" />
            {prof.court}

          </div>

        )}

        {/* duracion */}
        <div className="flex items-center gap-2 text-sm text-[#6B7280]">

          <Clock className="h-4 w-4" />
          Turnos de {prof.turnDuration} min

        </div>

        {/* dias */}
        <div className="flex flex-wrap gap-1">

          {prof.days?.map((d) => (

            <Badge key={d} variant="outline" className="border-[#2a3036] text-[#D6FF3D] border-[#1E2028]">
              {/* {DAYS[d]} */}
            </Badge>

          ))}

        </div>

        {/* boton */}
        {prof.phoneNumber && (

          <Button className="w-full gap-2 rounded-full bg-[#D6FF3D] text-[#0A0B0D] hover:bg-[#e4ff6a]">

            <Phone className="h-4 w-4" />

            Reservar

          </Button>

        )}

      </CardContent>

    </Card>

  )

}
