"use client";

import ProjectDetail from "@/components/projets/ProjectDetail";

const data = {
  title: "Plateforme SaaS posters visuels professionnels",
  tag: "Application Web",
  year: "2026",
  category: "Développement & Design",

  description:
    "Vitascore est une plateforme SaaS qui transforme automatiquement les statistiques de vos matchs sportifs en posters visuels professionnels. Entrez vos donnees, choisissez un template, telechargez votre visuel — en moins de 3 secondes.",
  presentation:
    " L'art de transformer les données sportives en visuels d'élite. VITASCORE est une solution SaaS (Software as a Service) innovante conçue pour les clubs de sport et les community managers. La plateforme permet de générer des posters de match professionnels de manière instantanée, supprimant le besoin de compétences en design graphique complexe ou d'outils coûteux comme Photoshop",
  explication: `L'écosystème technologique de VITASCORE s'articule autour de quatre piliers fondamentaux conçus pour automatiser l'excellence visuelle du marketing sportif. Au cœur du système, la personnalisation intelligente permet une adaptation chromatique instantanée, où chaque template se moule aux couleurs officielles de votre club pour préserver une identité de marque rigoureuse sans aucun effort manuel. Cette souplesse s'accompagne d'une bibliothèque de styles thématiques d'une grande richesse, offrant des esthétiques variées allant du néon ultra-moderne au grain vintage, tout en proposant des thèmes immersifs dédiés aux plus grandes compétitions mondiales comme la Ligue 1 ou la Champions League. L'expérience est complétée par un module d'édition de données dynamique qui simplifie la saisie des statistiques complexes — scores, buteurs, taux de possession ou distinction du "Man of the Match" — pour les transformer en infographies claires. Enfin, la plateforme garantit un export haute définition au format 1080x1080, assurant une netteté absolue et une compatibilité parfaite avec les exigences techniques des réseaux sociaux tels qu'Instagram, Twitter/X et Facebook.`,
  security: `Protection des Données : Infrastructure sécurisée garantissant la confidentialité des informations des clubs et des utilisateurs.

Stabilité du Rendu : Système de "Cloud Rendering" qui assure que chaque poster est généré avec la même qualité, peu importe la puissance de l'appareil de l'utilisateur.

Validation : Déjà adopté par plus de 200 community managers, prouvant la robustesse et la fiabilité de l'outil sur le terrain.`,
  performance: `Vitesse de génération : Environ 2.3 secondes pour produire un visuel complet.

Précision : Algorithme de rendu garantissant une précision de 96.4% sur l'alignement des données et des graphiques.

Disponibilité : Architecture Cloud permettant une utilisation fluide, même lors des pics de trafic (fins de matchs simultanés)`,
  tech: ["Next.js", "Bootstrap 5", "Prisma", "MySQL", "Payment Stripe"],
  highlights: [
    "Accessibilité : Permettre à tous les clubs (amateurs comme pros) d'avoir une identité visuelle de haut niveau",
    "Engagement : Augmenter l'interaction sur les réseaux sociaux grâce à des visuels cinématiques et percutants.",
    "Gain de temps : Réduire le processus de création de plusieurs heures à quelques secondes seulement après le coup de sifflet final",
  ],
  images: [
    "/images/ImagesProjetDetail/Projet2/vitascore.png",
    "/images/ImagesProjetDetail/Projet2/1.png",
    "/images/ImagesProjetDetail/Projet2/2.png",
    "/images/ImagesProjetDetail/Projet2/3.png",
    "/images/ImagesProjetDetail/Projet2/4.png",
    "/images/ImagesProjetDetail/Projet2/5.png",
    "/images/ImagesProjetDetail/Projet2/6.png",
    "/images/ImagesProjetDetail/Projet2/7.png",
    "/images/ImagesProjetDetail/Projet2/8.png",
    "/images/ImagesProjetDetail/Projet2/9.png",
    "/images/ImagesProjetDetail/Projet2/10.png",
    "/images/ImagesProjetDetail/Projet2/11.png",
  ],
  video: {
    src: "https://ia903105.us.archive.org/11/items/vitascore/vitascore.mp4",
    poster: "/images/ImagesProjetDetail/Projet2/3.png",
  },
  liveUrl: undefined,
  repoUrl: undefined,
};

export default function Project2Details() {
  return <ProjectDetail data={data} />;
}
