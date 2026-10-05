import Skills from "@/components/competences/Skills";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compétences | Jtnova",
  description:
    "Les compétences techniques et l'expertise de l'agence Jtnova.",
};

export default function CompetencesPage() {
  return <Skills />;
}
