import Services from "@/components/services/Services";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services | Jtnova",
  description:
    "Découvrez tous les services de Jtnova : création web, design UI/UX, e-commerce, applications et conseil digital.",
};

export default function ServicesPage() {
  return <Services />;
}
