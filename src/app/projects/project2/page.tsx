import Project2Details from "@/components/projets/projet2/Project2Details";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vitascore | Jtnova",
  description: "Détails du projet Vitascore de Jtnova, agence web & digital.",
};

export default function Project2Page() {
  return <Project2Details />;
}
