import About from "@/components/a-propos/About";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "À propos | Jtnova",
  description:
    "Découvrez l'équipe et la vision de Jtnova, agence web & digital.",
};

export default function AProposPage() {
  return <About />;
}
