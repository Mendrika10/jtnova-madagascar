"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

/**
 * Habillage du site public (Navbar + Footer). Masqué sur l'espace /admin, qui
 * possède sa propre coquille. Les enfants restent des Server Components
 * (passés en props) : seule cette enveloppe est cliente.
 */
export default function SiteChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return <main>{children}</main>;
  }

  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
