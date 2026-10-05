import Skills from "@/components/competences/Skills";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compétences | Nante",
  description: "Les compétences techniques de Nante",
};

export default function CompetencesPage() {
  return <Skills />;
}
