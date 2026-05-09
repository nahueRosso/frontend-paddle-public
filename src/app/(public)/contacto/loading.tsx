import { HeroLoader } from "@/components/hero-loader";

export default function ContactLoading() {
  return (
    <HeroLoader
      visible
      title="Mi Club Pádel"
      message="Cargando datos..."
    />
  );
}
