import type { Metadata } from "next"
import { ClubPage } from "@/components/club-page"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  return {
    title: `${slug.split('-')[0]} - Club de Padel`,
    description: `Reserva tu turno de padel en ${slug}. Consulta disponibilidad y agenda tu cancha.`,
  }
}

export default async function TenantPage({ params }: PageProps) {
  
  const { slug } = await params

  return <ClubPage slug={slug} />
  
}
