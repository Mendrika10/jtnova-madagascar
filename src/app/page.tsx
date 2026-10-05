import Hero from "@/components/accueil/Hero";
import Services from "@/components/services/Services";
import Projects from "@/components/projets/Projects";
import FAQ from "@/components/faq/FAQ";
import Testimonials from "@/components/temoignages/Testimonials";
import TechBanner from "@/components/tech-banner/TechBanner";
import CTA from "@/components/cta/CTA";
import {
  getServices,
  getFaqs,
  getTestimonials,
  getTechBanner,
  getPublishedProjects,
} from "@/lib/content";

// Revalide les contenus depuis Supabase toutes les 60 s (ISR)
export const revalidate = 60;

export default async function Home() {
  const [services, faqs, testimonials, techs, projects] = await Promise.all([
    getServices(),
    getFaqs(),
    getTestimonials(),
    getTechBanner(),
    getPublishedProjects(),
  ]);

  return (
    <>
      <Hero />
      <Services items={services ?? undefined} />
      <Projects items={projects ?? undefined} />
      <Testimonials items={testimonials ?? undefined} />
      <TechBanner items={techs ?? undefined} />
      <FAQ items={faqs ?? undefined} />
      <CTA />
    </>
  );
}
