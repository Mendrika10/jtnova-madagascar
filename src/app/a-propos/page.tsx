import About from "@/components/a-propos/About";
import type { Metadata } from "next";
import { getSiteSetting } from "@/lib/site-settings";

export const metadata: Metadata = {
  title: "À propos | Jtnova",
  description:
    "Découvrez l'équipe et la vision de Jtnova, agence web & digital.",
};

export default async function AProposPage() {
  const about = await getSiteSetting("about");
  return <About setting={about} />;
}
