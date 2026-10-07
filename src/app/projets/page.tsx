import Projects from "@/components/projets/Projects";
import { getPublishedProjects } from "@/lib/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Réalisations | Jtnova",
  description: "Découvrez les projets et réalisations de Jtnova, agence web.",
};

// Revalide les contenus depuis Supabase toutes les 60 s (ISR)
export const revalidate = 60;

export default async function ProjetsPage() {
  const projects = await getPublishedProjects();
  // F7.3 — la page dédiée porte le titre principal de niveau h1.
  return <Projects items={projects ?? undefined} titleAs="h1" />;
}
