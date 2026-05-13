import { BrandedStatusPage } from "@/components/branded-status-page";

export function ClubNotFound() {
  return (
    <BrandedStatusPage
      badge="Mi Club Padel | Clubes"
      code="404"
      title="No encontramos ese club"
      description="El slug del club no existe, cambió o el enlace llegó incompleto."
      detail="Podés volver al inicio o revisar el listado de clubes disponibles para entrar desde una URL válida."
      primaryHref="/clubes"
      primaryLabel="Ir a clubes"
      secondaryHref="/"
      secondaryLabel="Volver al inicio"
    />
  );
}
