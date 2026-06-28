"use client";

import { RotateCcw } from "lucide-react";

import { BrandedStatusPage } from "@/components/branded-status-page";
import { Button } from "@/components/ui/button";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {

  console.log('hay un error');
  
  return (
    <BrandedStatusPage
      badge="Mi Club Padel | Error"
      code="500"
      title="La página no pudo cargar"
      description="Hubo un problema al renderizar esta vista o al resolver sus datos."
      detail="Probá recargar esta pantalla. Si el error sigue, revisá la ruta o intentá entrar desde el inicio."
      extraAction={
        <Button
          type="button"
          variant="outline"
          onClick={reset}
          className="rounded-full border-white/15 bg-white/5 px-6 text-sm font-semibold text-white hover:bg-white/10 hover:text-white"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reintentar
        </Button>
      }
    />
  );
}
