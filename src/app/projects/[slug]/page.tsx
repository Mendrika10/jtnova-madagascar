import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import ProjectDetail from "@/components/projets/ProjectDetail";
import { getProjectBySlug } from "@/lib/content";
import { getSiteSetting } from "@/lib/site-settings";
import { getSupabasePublicClient } from "@/lib/supabase/server";
import { getSlugRedirect } from "@/lib/slug-history";
import { absoluteUrl } from "@/lib/site-url";

// Revalide depuis Supabase toutes les 60 s (ISR), comme les autres pages publiques.
export const revalidate = 60;

type PageProps = { params: Promise<{ slug: string }> };

/**
 * F7.2 — métadonnées + Open Graph **par réalisation** : titre, description,
 * image (première image de la réalisation, sinon l'image de partage globale),
 * URL canonique. Les URL d'images sont rendues absolues (exigence OG).
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const [project, seo] = await Promise.all([
    getProjectBySlug(slug),
    getSiteSetting("seo"),
  ]);
  if (!project) {
    return { title: `Réalisation introuvable | ${seo.site_name}` };
  }

  const url = absoluteUrl(`/projects/${slug}`);
  const image = absoluteUrl(project.images[0] || seo.og_image);
  const title = `${project.title} | ${seo.site_name}`;
  const description = project.description;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      siteName: seo.site_name,
      title,
      description,
      locale: seo.locale,
      images: [{ url: image, alt: project.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) {
    // Ancien slug renommé → redirection permanente (F4.7).
    const client = getSupabasePublicClient();
    const target = client ? await getSlugRedirect(client, slug) : null;
    if (target) permanentRedirect(`/projects/${target}`);
    notFound();
  }
  return <ProjectDetail data={project} />;
}
