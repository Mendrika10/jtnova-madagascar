"use client";

import ProjectDetail from "@/components/projets/ProjectDetail";

const data = {
  title: "Plateforme de gestion d'activités et de planning",
  tag: "Application Web",
  year: "2023",
  category: "Développement & Design",
  bg: "linear-gradient(145deg, #0a1628 0%, #0d2040 100%)",
  accent: "rgba(0,180,216,0.18)",
  description:
    "Ce projet consistait en la création d'une plateforme de gestion d’activités et de planning permettant aux utilisateurs de planifier, suivre et organiser efficacement leurs tâches et événements",
  presentation:
    "Ce projet consistait en la création d'une plateforme de gestion d’activités et de planning permettant aux utilisateurs de planifier, suivre et organiser efficacement leurs tâches et événements. En combinant des technologies modernes de frontend et backend, la plateforme offre une expérience utilisateur fluide et des fonctionnalités robustes pour la gestion de projet.",
  explication: `Pour ce projet, j’ai opté pour un développement basé sur React.js et Next.js pour le frontend, tandis que Laravel a été utilisé pour gérer le backend. Ce choix technologique a permis de créer une plateforme réactive et performante, avec une structure modulaire permettant une évolution facile des fonctionnalités. La base de données MySQL a été utilisée pour stocker les données des utilisateurs, des tâches et des événements, assurant une gestion efficace des informations.
L’intégration de Framer Motion a permis d’ajouter des animations fluides et engageantes, améliorant ainsi l’expérience utilisateur. Le projet a également mis en œuvre des fonctionnalités d’authentification sécurisée, de gestion multi-utilisateurs et de tableaux de bord en temps réel pour offrir une solution complète de gestion d’activités et de planning.`,
  security: `Authentification forte (JWT / tokens)
Hashage des mots de passe (bcrypt)
Permissions et rôles fins (RBAC)
Validation et sanitation côté serveur
HTTPS, HSTS, en-têtes sécurité (CSP, X-Frame-Options)
Surveillance et logs d'audit`,
  performance: `Mise en cache (Redis) pour endpoints coûteux
Optimisation des requêtes SQL et indexation
Pagination et lazy-loading pour listes volumineuses
CDN pour assets statiques et compression des médias
Traitement asynchrone (jobs/background) pour tâches lourdes
Mise en place de monitoring et alerting (metrics)`,
  tech: [
    "Next.js 16",
    "React 19",
    "TypeScript",
    "Bootstrap 5",
    "Framer Motion",
    "Laravel",
    "MySQL",
  ],
  highlights: [
    "Authentification et gestion multi-utilisateurs",
    "Gestion des activités",
    "Planification avancée",
    "Notifications et rappels",
    "Suivi et rapports en temps réel",
  ],
  images: [
    "/images/ImagesProjetDetail/Projet1/referent.png",
    "/images/ImagesProjetDetail/Projet1/suivi.png",
    "/images/ImagesProjetDetail/Projet1/reviseur.png",
    "/images/ImagesProjetDetail/Projet1/client.png",
    "/images/ImagesProjetDetail/Projet1/comptable.png",
    "/images/ImagesProjetDetail/Projet1/commercial.png",
    "/images/ImagesProjetDetail/Projet1/admin.png",
  ],
  video: {
    src: "/images/VideoProjetDetail/Projet1/video1.mp4",
    poster: "/images/ImagesProjetDetail/Projet1/login.png",
  },
  liveUrl: "https://julia.vilogi.com/login",
  repoUrl: undefined,
};

export default function Project1Details() {
  return <ProjectDetail data={data} />;
}
