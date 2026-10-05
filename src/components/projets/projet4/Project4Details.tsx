"use client";

import ProjectDetail from "@/components/projets/ProjectDetail";

const data = {
  title: "Vina.io",
  tag: "IA Générative",
  year: "2026",
  category: "Développement & Design",

  description:
    "Dites adieu à la saisie manuelle et aux erreurs de recopie. Vina.io transforme instantanément vos baux PDF, scans et fichiers Excel en données comptables et techniques structurées. Divisez votre temps de migration par dix et passez de 3 semaines de travail à une seule journée de production, avec une précision garantie de 100%. Importez, validez et exportez vos actifs immobiliers en quelques clics",
  presentation: `L'intelligence artificielle au service de la donnée immobilière.
Vina.io est une plateforme SaaS de pointe spécialisée dans l'automatisation de la migration de données pour la gestion locative. En utilisant des technologies d'OCR et d'IA avancées, le projet résout le problème majeur des professionnels de l'immobilier : la saisie manuelle chronophage et source d'erreurs lors du changement de logiciel ou de la reprise de portefeuilles.`,
  explication: `L'architecture de Vina.io redéfinit les standards de la gestion immobilière en remplaçant des semaines de travail manuel par un flux automatisé ultra-performant. Grâce à la puissance de Vina IA, la plateforme est capable de traiter plus de 250 baux en moins de deux heures, là où un processus classique exigerait 120 heures de saisie humaine. Cette efficacité repose sur un pipeline technologique robuste, utilisant Prisma et MySQL pour structurer des données complexes (techniques et comptables) avec une précision chirurgicale. Au-delà de la simple extraction, le système sécurise la migration grâce à des alertes intelligentes qui signalent instantanément toute incohérence contractuelle, garantissant une mise en production en un temps record d'une journée. Que ce soit pour une agence, un cabinet comptable ou un syndic, Vina.io transforme la contrainte de la migration en un levier de rentabilité immédiat, avec un taux d'erreur réduit à zéro`,
  security: undefined,
  performance: `🎯 Vina OCR & IA : Un moteur capable de lire et comprendre tous types de fichiers (scans, images, exports CSV) pour extraire loyers, charges, baux et clauses contractuelles.

🎯 Migration Comptable & Technique : Extraction automatique du plan comptable (journaux, appels de fonds) et structuration des actifs (biens, locataires, états des lieux) via MySQL et Prisma.

🎯 Alertes Intelligentes : Système de détection automatique des anomalies pour identifier les dates de révision oubliées ou les données manquantes.

🎯 Export Flexible : Mise à disposition des données via Excel, CSV ou directement par API REST.`,
  tech: ["Next.js", "Bootstrap 5", "Prisma", "MySQL", "Groq (IA)"],
  highlights: [
    "Productivité Massive : Réduire le temps de traitement de 3 semaines à seulement 1 journée (gain de 98%)",
    "Fiabilité Absolue : Éliminer les erreurs de saisie humaine grâce à une extraction de données garantie sans fautes",
    "Simplification Technique : Transformer des documents hétérogènes (PDF, scans, Excel) en bases de données structurées et exploitables",
  ],
  images: [
    "/images/ImagesProjetDetail/Projet4/vina.png",
    "/images/ImagesProjetDetail/Projet4/1.png",
    "/images/ImagesProjetDetail/Projet4/2.png",
    "/images/ImagesProjetDetail/Projet4/3.png",
    "/images/ImagesProjetDetail/Projet4/4.png",
    "/images/ImagesProjetDetail/Projet4/5.png",
    "/images/ImagesProjetDetail/Projet4/6.png",
    "/images/ImagesProjetDetail/Projet4/7.png",
  ],
  video: {
    src: "https://ia903105.us.archive.org/11/items/vitascore/vina.mp4",
    poster: "/images/ImagesProjetDetail/Projet4/1.png",
  },
  liveUrl: undefined,
  repoUrl: undefined,
};

export default function Project4Details() {
  return <ProjectDetail data={data} />;
}
