"use client";

import ProjectDetail from "@/components/projets/ProjectDetail";

const data = {
  title: "Feonix IA",
  tag: "IA Générative",
  year: "2026",
  category: "Développement & Design",

  description:
    "Ne perdez plus de temps à rédiger. Enregistrez simplement une note vocale et laissez notre IA convertir vos idées en un écosystème marketing complet : un post LinkedIn engageant, un article de blog SEO, une newsletter captivante et un script vidéo prêt à tourner. Une seule prise de parole, quatre formats professionnels, instantanément",
  presentation: `L'alchimie vocale au service de votre marketing digital.
Feonix IA est une plateforme SaaS de "Voice-to-Content" conçue pour les créateurs, entrepreneurs et marketeurs. Elle permet de briser la barrière de la page blanche en transformant une simple note vocale spontanée en un écosystème complet de contenus écrits et scénarisés, optimisés pour chaque canal de diffusion`,
  explication: `La force de Feonix IA réside dans son architecture Full-Stack, qui fusionne une reconnaissance vocale haute fidélité avec un moteur de transformation marketing polyvalent. Le processus commence par une transcription ultra-précise capable de capter les nuances de la voix et des accents dans 12 langues différentes, éliminant ainsi toute friction entre l'idée orale et l'écrit. Une fois le texte brut extrait, l'intelligence artificielle opère une génération multi-plateforme simultanée : en un seul clic, elle décline la pensée de l'utilisateur en un post LinkedIn percutant, un article de blog optimisé pour le SEO, une newsletter engageante et un script vidéo structuré pour les formats courts (Reels/TikTok). Cette approche permet une omniprésence digitale sans effort, où chaque contenu produit respecte les codes spécifiques de son support, garantissant ainsi des taux d'ouverture élevés et un engagement maximal, tout en offrant une rapidité d'exécution qui transforme quelques secondes de parole en une véritable machine de guerre marketing.`,
  security: undefined,
  performance: `Vitesse de Traitement : Conversion de l'audio en texte et génération des 4 formats en seulement quelques secondes.

Accessibilité : 10 générations gratuites sans carte bancaire, offrant jusqu'à 40 contenus marketing pour tester la puissance de l'outil.

Fiabilité IA : Utilisation de modèles de pointe garantissant un contenu de niveau professionnel, évitant les répétitions et optimisant l'engagement`,
  tech: ["Next.js", "Bootstrap 5", "Prisma", "MySQL"],
  highlights: [
    "Productivité Décuplée : Transformer une réflexion de 30 secondes en une stratégie de contenu hebdomadaire.",
    "Omniprésence Facilitée : Permettre d'être présent sur LinkedIn, les blogs, les newsletters et la vidéo sans multiplier les efforts de rédaction",
    "Fluidité Créative : Capturer les idées 'à la volée' sans avoir besoin d'un script ou d'un clavier",
  ],
  images: [
    "/images/ImagesProjetDetail/Projet3/feonix.png",
    "/images/ImagesProjetDetail/Projet3/1.png",
    "/images/ImagesProjetDetail/Projet3/2.png",
    "/images/ImagesProjetDetail/Projet3/3.png",
    "/images/ImagesProjetDetail/Projet3/4.png",
    "/images/ImagesProjetDetail/Projet3/5.png",
    "/images/ImagesProjetDetail/Projet3/6.png",
    "/images/ImagesProjetDetail/Projet3/7.png",
  ],
  video: {
    src: "/images/VideoProjetDetail/Projet3/video1.mp4",
    poster: "/images/ImagesProjetDetail/Projet3/4.png",
  },
  liveUrl: undefined,
  repoUrl: undefined,
};

export default function Project3Details() {
  return <ProjectDetail data={data} />;
}
