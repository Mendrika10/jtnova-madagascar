import Hero from "@/components/accueil/Hero";
import Services from "@/components/services/Services";
import Projects from "@/components/projets/Projects";
import FAQ from "@/components/faq/FAQ";
import Testimonials from "@/components/temoignages/Testimonials";
import TechBanner from "@/components/tech-banner/TechBanner";
import CTA from "@/components/cta/CTA";

export default function Home() {
  return (
    <>
      <Hero />
      <Services />
      <Projects />
      <Testimonials />
      <TechBanner />
      <FAQ />
      <CTA />
    </>
  );
}
