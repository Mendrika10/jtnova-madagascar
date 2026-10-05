import Projects from "@/components/projets/Projects";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Réalisations | Jtnova",
  description: "Découvrez les projets et réalisations de Jtnova, agence web.",
};

export default function ProjetsPage() {
  return <Projects />;
}
