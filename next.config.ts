import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * S8 — `imapflow` (lecture de la boîte Gmail pour le passage automatique en
   * « lu ») est un paquet Node natif côté serveur : il est résolu à
   * l'exécution, hors bundling, ce qui évite les faux positifs de l'analyseur
   * sur ses dépendances (`pino`, sockets TLS).
   */
  serverExternalPackages: ["imapflow"],
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
