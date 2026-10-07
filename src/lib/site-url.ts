/**
 * F7.1/F7.2 — URL de base du site, utilisée par le sitemap, robots.txt et les
 * métadonnées Open Graph (qui exigent des URL absolues).
 *
 * `NEXT_PUBLIC_SITE_URL` permet de viser un domaine personnalisé ou une
 * preview ; à défaut, la production Vercel actuelle sert de référence.
 */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) return raw.replace(/\/+$/, "");
  return "https://jtnova-madagascar.vercel.app";
}

/** Transforme un chemin interne en URL absolue (les URL http(s) sont gardées). */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${getSiteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}
