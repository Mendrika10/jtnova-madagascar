import Project3Details from "@/components/projets/projet3/Project3Details";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Feonix | Jtnova",
  description: "Détails du projet Feonix de Jtnova, agence web & digital.",
};

export default function Project3Page() {
  return <Project3Details />;
}
