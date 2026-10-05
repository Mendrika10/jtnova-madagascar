import Project3Details from "@/components/projets/projet3/Project3Details";
import Project4Details from "@/components/projets/projet4/Project4Details";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VINA.IO | Jtnova",
  description: "Détails du projet VINA.IO de Jtnova, agence web & digital.",
};

export default function Project4Page() {
  return <Project4Details />;
}
