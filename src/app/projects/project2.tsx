"use client";

import ProjectDetail from "@/components/projets/ProjectDetail";

const data = {
  title: "Boutique E-commerce",
  tag: "E-commerce",
  year: "2025",
  category: "Développement & UX",
  bg: "linear-gradient(145deg, #0f0a20 0%, #1a0a35 100%)",
  accent: "rgba(160,80,255,0.18)",
  description:
    "Boutique en ligne complète avec gestion catalogue, panier, paiement sécurisé et espace client optimisé pour la conversion.",
  tech: [
    "Next.js 16",
    "React 19",
    "TypeScript",
    "Bootstrap 5",
    "Stripe",
    "Prisma",
  ],
  highlights: [
    "Catalogue dynamique",
    "Paiement sécurisé (Stripe)",
    "Gestion commandes et stocks",
    "Optimisation SEO et performance",
  ],
  images: ["/images/projects/vitascore.png"],
  video: {
    src: "/images/projects/vitascore-demo.mp4",
    poster: "/images/projects/vitascore.png",
  },
};

export default function Project2() {
  return <ProjectDetail data={data} />;
}
