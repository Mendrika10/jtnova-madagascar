"use client";

import { motion, cubicBezier, type Variants } from "framer-motion";
import styles from "./Services.module.css";
import type { ServiceItem } from "@/lib/content";
import StarField from "@/components/accueil/StarField";

const expo = cubicBezier(0.16, 1, 0.3, 1);

const headerContainerVar: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.13, delayChildren: 0.1 } },
};

const labelVar: Variants = {
  hidden: { opacity: 0, x: -18, filter: "blur(6px)" },
  show: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: expo },
  },
};

const titleVar: Variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.78, ease: expo },
  },
};

const subtitleVar: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: expo } },
};

const gridVariant: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
};

const cardVariant: Variants = {
  hidden: { opacity: 0, y: 38, filter: "blur(10px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.72, ease: expo },
  },
};

const servicesFallback = [
  {
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
      </svg>
    ),
    title: "Création de sites web",
    desc: "Sites vitrine, landing pages et portails web modernes, rapides et responsive, optimisés pour convertir.",
    tag: "Web",
  },
  {
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 19l-7-7 7-7M19 19l-7-7 7-7" />
      </svg>
    ),
    title: "Applications web",
    desc: "Développement d'applications web sur mesure avec React, Next.js et Node.js pour automatiser vos processus.",
    tag: "Dev",
  },
  {
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    ),
    title: "Design UI/UX",
    desc: "Conception d'interfaces intuitives et esthétiques sous Figma, centrées sur l'expérience utilisateur.",
    tag: "Design",
  },
  {
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 2l.01 6L10 12l-3.99 4.01L6 22h12v-5.99L14 12l4-3.99V2H6z" />
      </svg>
    ),
    title: "E-commerce",
    desc: "Boutiques en ligne performantes avec gestion produits, paiements sécurisés et tableaux de bord analytiques.",
    tag: "Commerce",
  },
  {
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "Optimisation & SEO",
    desc: "Audit de performance, Core Web Vitals, référencement naturel pour améliorer votre visibilité en ligne.",
    tag: "SEO",
  },
  {
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
    title: "Conseil & Accompagnement",
    desc: "Stratégie digitale, choix technologiques et accompagnement de A à Z pour concrétiser votre vision.",
    tag: "Conseil",
  },
];

// Icônes décoratives des cartes, attribuées par ordre.
const SERVICES_ICONS = [
  <svg key="web" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></svg>,
  <svg key="dev" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l-7-7 7-7M19 19l-7-7 7-7" /></svg>,
  <svg key="design" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>,
  <svg key="commerce" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2l.01 6L10 12l-3.99 4.01L6 22h12v-5.99L14 12l4-3.99V2H6z" /></svg>,
  <svg key="seo" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  <svg key="conseil" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>,
];

type ServicesProps = {
  /** Services publiés depuis Supabase ; absent → repli sur les données locales. */
  items?: ServiceItem[];
  /** F7.3 — niveau du titre de section : `h1` sur la page dédiée, `h2` sur l'accueil. */
  titleAs?: "h1" | "h2";
};

export default function Services({ items, titleAs = "h2" }: ServicesProps = {}) {
  const Title = titleAs === "h1" ? motion.h1 : motion.h2;
  const services =
    items && items.length > 0
      ? items.map((it, i) => ({
          icon: SERVICES_ICONS[i % SERVICES_ICONS.length],
          title: it.title,
          desc: it.description,
          tag: it.tag,
        }))
      : servicesFallback;

  return (
    <section id="services" className={styles.section}>
      {/* F7.5 — étoiles : géométrie en CSS (`stars.css`), plus de styles inline. */}
      <StarField count={90} offset={200} />
      <div className={styles.bg} aria-hidden="true" />
      <div className={styles.container}>
        <motion.div
          className={styles.header}
          variants={headerContainerVar}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
          <motion.div className={styles.topLabel} variants={labelVar}>
            <span className={styles.dot} />
            Nos services
          </motion.div>
          <Title className={styles.title} variants={titleVar}>
            Ce que nous
            <br />
            <span className={styles.accent}>construisons</span> pour vous
          </Title>
          <motion.p className={styles.subtitle} variants={subtitleVar}>
            De la conception à la mise en production, Jtnova couvre
            l&apos;ensemble du spectre digital pour transformer vos idées en
            produits performants.
          </motion.p>
        </motion.div>

        <motion.div
          className={styles.grid}
          variants={gridVariant}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
        >
          {services.map((s, i) => (
            <motion.div
              key={s.title}
              className={styles.card}
              variants={cardVariant}
              whileHover={{ y: -8, transition: { duration: 0.3, ease: expo } }}
            >
              <span className={styles.cardNumber}>0{i + 1}</span>
              <div className={styles.cardIcon}>{s.icon}</div>
              <span className={styles.cardTag}>{s.tag}</span>
              <h3 className={styles.cardTitle}>{s.title}</h3>
              <p className={styles.cardDesc}>{s.desc}</p>
              <div className={styles.cardFooter}>
                <span className={styles.cardArrow}>
                  Explorer
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M7 17L17 7M17 7H7M17 7v10" />
                  </svg>
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
