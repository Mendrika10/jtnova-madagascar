import Project1Details from "@/components/projets/projet1/Project1Details";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Julia | Jtnova",
  description: "Détails du projet Julia de Jtnova, agence web & digital.",
};

export default function Project1Page() {
  return <Project1Details />;
}
