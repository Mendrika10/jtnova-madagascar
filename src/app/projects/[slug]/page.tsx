import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProjectDetail from "@/components/projets/ProjectDetail";
import { getProjectBySlug } from "@/lib/content";

// Revalide depuis Supabase toutes les 60 s (ISR), comme les autres pages publiques.
export const revalidate = 60;

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Réalisation introuvable | Jtnova" };
  return {
    title: `${project.title} | Jtnova`,
    description: project.description,
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();
  return <ProjectDetail data={project} />;
}
