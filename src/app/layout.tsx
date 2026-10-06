import type { Metadata } from "next";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import SiteChrome from "@/components/layout/SiteChrome";
import { getSiteSetting } from "@/lib/site-settings";

/** Base absolue pour les URL Open Graph (relative `/images/...` acceptée). */
function metadataBase(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return new URL(explicit);
  if (process.env.VERCEL_URL) return new URL(`https://${process.env.VERCEL_URL}`);
  return new URL("http://localhost:3000");
}

/** Convertit `#rrggbb` en « r, g, b » pour la variable CSS `--color-accent-rgb`. */
function hexToRgb(hex: string): string {
  const match = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!match) return "0, 180, 216";
  const int = parseInt(match[1], 16);
  return `${(int >> 16) & 255}, ${(int >> 8) & 255}, ${int & 255}`;
}

/**
 * F5.7 — Les réglages SEO globaux (table `site_settings`, clé « seo »)
 * alimentent la balise `<title>`, la description et les métadonnées Open Graph
 * du site. Les pages qui définissent leur propre `metadata` restent prioritaires.
 */
export async function generateMetadata(): Promise<Metadata> {
  const [seo, identity] = await Promise.all([
    getSiteSetting("seo"),
    getSiteSetting("identity"),
  ]);

  return {
    metadataBase: metadataBase(),
    title: seo.title,
    description: seo.description,
    icons: { icon: identity.favicon_url },
    openGraph: {
      type: "website",
      siteName: seo.site_name,
      title: seo.title,
      description: seo.description,
      locale: seo.locale,
      images: seo.og_image ? [{ url: seo.og_image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: seo.og_image ? [seo.og_image] : undefined,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [identity, cta] = await Promise.all([
    getSiteSetting("identity"),
    getSiteSetting("cta"),
  ]);

  return (
    <html lang="fr">
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@700,800,500,400,300&display=swap"
          rel="stylesheet"
        />
        {/* F5.8 — couleur d'accent définie par l'admin (identité). Valeur validée
            en #rrggbb côté serveur avant écriture : pas d'injection CSS possible. */}
        <style
          dangerouslySetInnerHTML={{
            __html: `:root{--color-accent:${identity.accent_color};--color-accent-rgb:${hexToRgb(identity.accent_color)};}`,
          }}
        />
      </head>
      <body>
        <SiteChrome identity={identity} socials={cta.socials}>
          {children}
        </SiteChrome>
      </body>
    </html>
  );
}
