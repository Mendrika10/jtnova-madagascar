"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import type { SocialLink } from "@/lib/site-settings";

/**
 * Habillage du site public (Navbar + Footer). Masqué sur l'espace /admin, qui
 * possède sa propre coquille. Les enfants restent des Server Components
 * (passés en props) : seule cette enveloppe est cliente. L'identité (logo) et
 * les réseaux sociaux proviennent des réglages du site (S5) lus dans le layout.
 */
export default function SiteChrome({
  children,
  identity,
  socials,
}: {
  children: React.ReactNode;
  identity: { logo_url: string };
  socials: SocialLink[];
}) {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return <main>{children}</main>;
  }

  return (
    <>
      <Navbar logoUrl={identity.logo_url} />
      <main>{children}</main>
      <Footer logoUrl={identity.logo_url} socials={socials} />
    </>
  );
}
