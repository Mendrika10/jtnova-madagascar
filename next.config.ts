import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * F7.4 — images optimisées : `next/image` sert automatiquement du WebP
   * (repli AVIF→WebP selon le navigateur), à la bonne largeur et en différé.
   * Les captures de réalisations font ~500 Ko chacune en PNG ; affichées en
   * vignette elles tombaient donc entières dans la page détail.
   *
   * `remotePatterns` liste les hôtes distants autorisés par l'optimiseur.
   * Un src distant hors de cette liste est rendu brut (`unoptimized`, cf.
   * `src/lib/images.ts`) plutôt que de casser la page : aucun hôte inconnu
   * ne doit faire échouer le rendu.
   */
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "ik.imagekit.io" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
