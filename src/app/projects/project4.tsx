"use client";

import ProjectDetail from "@/components/projets/ProjectDetail";

const data = {
  title: "Site Vitrine Corporate",
  tag: "Vitrine",
  year: "2024",
  category: "Développement & Design",
  bg: "linear-gradient(145deg, #071a10 0%, #0a2818 100%)",
  accent: "rgba(0,220,120,0.18)",
  description:
    "Site vitrine élégant et professionnel, orienté conversion, présentation des services et contact commercial.",
  tech: ["Next.js 16", "React 19", "TypeScript", "Bootstrap 5", "CMS"],
  highlights: [
    "Pages marketing optimisées",
    "Formulaire contact & lead gen",
    "SEO & accessibilité",
  ],
  images: ["/images/projects/vina.png"],
};

export default function Project4() {
  return <ProjectDetail data={data} />;
}
