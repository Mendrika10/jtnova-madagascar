"use client";

import ProjectDetail from "@/components/projets/ProjectDetail";

const data = {
  title: "Dashboard Analytics",
  tag: "Dashboard",
  year: "2024",
  category: "Application web",
  bg: "linear-gradient(145deg, #071520 0%, #0a2030 100%)",
  accent: "rgba(0,220,180,0.18)",
  description:
    "Solution d'analyse et visualisation de données pour piloter les KPIs principaux et prendre des décisions éclairées.",
  tech: [
    "Next.js 16",
    "React 19",
    "TypeScript",
    "D3.js",
    "Postgres",
    "Node.js",
  ],
  highlights: [
    "Visualisations temps réel",
    "Filtres avancés",
    "Exports et partages",
    "Auth et rôles",
  ],
  images: ["/images/projects/feonix.png"],
  video: {
    src: "/images/projects/feonix-demo.mp4",
    poster: "/images/projects/feonix.png",
  },
};

export default function Project3() {
  return <ProjectDetail data={data} />;
}
