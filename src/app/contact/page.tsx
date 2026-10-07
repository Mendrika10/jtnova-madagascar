import Contact from "@/components/contact/Contact";
import type { Metadata } from "next";
import { getSiteSetting } from "@/lib/site-settings";

export const metadata: Metadata = {
  title: "Contact | Jtnova",
  description: "Contactez Jtnova pour votre projet web ou digital.",
};

export const revalidate = 60;

export default async function ContactPage() {
  // F7.3 — les réseaux sociaux du formulaire viennent des réglages
  // (`contact_info`, éditables en admin) : plus de `href="#"` (lien mort).
  const contact = await getSiteSetting("contact_info");
  return <Contact contact={contact} />;
}
