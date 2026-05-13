import { BrandedStatusPage } from "@/components/branded-status-page";

export default function NotFound() {
  return (
    <BrandedStatusPage
      badge="Mi Club Padel | Navegacion"
      code="404"
      title="Esta página quedó afuera de la cancha"
      description="La ruta que intentaste abrir no existe o tiene un error en el path."
      detail="Revisá la URL o usá los accesos directos para volver a una sección válida del sitio."
    />
  );
}
