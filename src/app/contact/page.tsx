import Contact from "@/components/contact/Contact";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | Jtnova",
  description: "Contactez Jtnova pour votre projet web ou digital.",
};

export default function ContactPage() {
  return <Contact />;
}
