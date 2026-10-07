import Services from "@/components/services/Services";
import { getServices } from "@/lib/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services | Jtnova",
  description:
    "Découvrez tous les services de Jtnova : création web, design UI/UX, e-commerce, applications et conseil digital.",
};

// Revalide les contenus depuis Supabase toutes les 60 s (ISR)
export const revalidate = 60;

export default async function ServicesPage() {
  const services = await getServices();
  // F7.3 — la page dédiée porte le titre principal de niveau h1.
  return <Services items={services ?? undefined} titleAs="h1" />;
}
