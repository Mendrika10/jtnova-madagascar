import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

/** F7.1 — `robots.txt` : le site public est indexable, l'admin et l'API ne le
 * sont pas ; le sitemap est déclaré pour les moteurs. */
export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
