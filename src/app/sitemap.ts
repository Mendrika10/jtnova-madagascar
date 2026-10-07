import type { MetadataRoute } from "next";
import { getPublishedProjects } from "@/lib/content";
import { getSiteUrl } from "@/lib/site-url";

// Les réalisations viennent de la base : on suit l'ISR des pages publiques.
export const revalidate = 60;

/** F7.1 — `sitemap.xml` : pages publiques + une entrée par réalisation publiée
 * (les brouillons sont exclus — `getPublishedProjects` applique `published`). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    {
      url: `${base}/projets`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${base}/services`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/competences`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${base}/a-propos`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${base}/contact`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.6,
    },
  ];

  const projects = (await getPublishedProjects()) ?? [];
  const projectRoutes: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${base}${p.href}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...projectRoutes];
}
