"use client";
import { useRef, useEffect, useState } from "react";
import { motion, useInView, cubicBezier, type Variants } from "framer-motion";
import styles from "./About.module.css";
import StarField from "@/components/accueil/StarField";
import FloatingLogos from "@/components/accueil/FloatingLogos";
import TechBanner from "@/components/tech-banner/TechBanner";

const expo = cubicBezier(0.16, 1, 0.3, 1);

/* ── variants ─────────────────────────────────────────── */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: expo } },
};
const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -48 },
  show: { opacity: 1, x: 0, transition: { duration: 0.75, ease: expo } },
};
const fadeRight: Variants = {
  hidden: { opacity: 0, x: 48 },
  show: { opacity: 1, x: 0, transition: { duration: 0.75, ease: expo } },
};
const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.6, ease: expo },
  },
};
const blurIn: Variants = {
  hidden: { opacity: 0, filter: "blur(10px)", y: 12 },
  show: {
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    transition: { duration: 0.75, ease: expo },
  },
};
const gridContainer = (staggerDelay = 0.1): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: staggerDelay, delayChildren: 0.05 } },
});
const stagger = (delay = 0): Variants => ({
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: expo, delay } },
});

/* ── hero-specific (identiques à Hero.tsx accueil) ─────── */
// Card image — pop-in scale + blur (comme badgeVariant)
const heroCardVariant: Variants = {
  hidden: { opacity: 0, scale: 0.88, filter: "blur(12px)", x: -40 },
  show: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    x: 0,
    transition: { duration: 0.9, ease: expo, delay: 0.05 },
  },
};
// Colonne droite — glisse depuis la droite + blur (rightColVariant)
const rightColVariant: Variants = {
  hidden: { opacity: 0, x: 30, filter: "blur(8px)" },
  show: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.75, ease: expo, delay: 0.3 },
  },
};
// Titre h1 — conteneur stagger mot par mot (titleWrap)
const titleWrap: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.065, delayChildren: 0.45 } },
};
// Chaque mot — blur + slide up (wordVariant)
const wordVariant: Variants = {
  hidden: { opacity: 0, y: 56, filter: "blur(14px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.72, ease: expo },
  },
};
// Badge / label — scale + dé-flou (badgeVariant)
const badgeVariant: Variants = {
  hidden: { opacity: 0, scale: 0.8, filter: "blur(12px)", y: 14 },
  show: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    y: 0,
    transition: { duration: 0.85, ease: expo, delay: 0.28 },
  },
};
// Boutons CTA — stagger conteneur + slide gauche (socialItemVariant)
const ctasWrap: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.72 } },
};
const ctaItemVariant: Variants = {
  hidden: { opacity: 0, x: -22, filter: "blur(6px)" },
  show: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: expo },
  },
};
// Desc card info — révélation par le bas (marqueeVariant)
const infoCardVariant: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.85, ease: expo, delay: 0.65 },
  },
};

const STAT_COLOR_CLASSES = [
  "",
  "statCardViolet",
  "statCardGreen",
  "statCardOrange",
] as const;
const statCardVariants: Variants[] = [
  {
    hidden: { opacity: 0, y: 50, scale: 0.88 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.7, ease: expo },
    },
  },
  // 1 — glisse de gauche + blur
  {
    hidden: { opacity: 0, x: -44, filter: "blur(10px)" },
    show: {
      opacity: 1,
      x: 0,
      filter: "blur(0px)",
      transition: { duration: 0.72, ease: expo },
    },
  },
  // 2 — glisse de droite + blur
  {
    hidden: { opacity: 0, x: 44, filter: "blur(10px)" },
    show: {
      opacity: 1,
      x: 0,
      filter: "blur(0px)",
      transition: { duration: 0.72, ease: expo },
    },
  },
  // 3 — zoom + rotation légère
  {
    hidden: { opacity: 0, scale: 0.75, rotate: -6, y: 20 },
    show: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      y: 0,
      transition: { duration: 0.75, ease: expo },
    },
  },
];

/* ── data ──────────────────────────────────────────────── */
const STATS = [
  {
    target: 50,
    suffix: "+",
    label: "Projets livrés",
    sublabel: "",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    target: 5,
    suffix: "+",
    label: "Années d’expérience",
    sublabel: "",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    target: 98,
    suffix: "%",
    label: "Clients satisfaits",
    sublabel: "",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  {
    target: 15,
    suffix: "+",
    label: "Technologies maîtrisées",
    sublabel: "",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
];

const VALUES = [
  {
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2L13.09 8.26L19 7L15.45 11.86L21 14L15.45 16.14L19 21L13.09 15.74L12 22L10.91 15.74L5 21L8.55 16.14L3 14L8.55 11.86L5 7L10.91 8.26L12 2Z" />
      </svg>
    ),
    title: "Innovation continue",
    desc: "Nous explorons constamment les dernières technologies pour offrir des solutions avant-gardistes à nos clients.",
  },
  {
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 12l2 2 4-4" />
        <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
      </svg>
    ),
    title: "Qualité sans compromis",
    desc: "Chaque ligne de code, chaque pixel est pensé avec soin. Nous ne livrons que ce qui dépasse les attentes.",
  },
  {
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    title: "Transparence totale",
    desc: "Nous croyons en une communication ouverte et honnête à chaque étape du projet. Pas de surprises.",
  },
  {
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="13 2 13 9 20 9" />
        <path d="M21 4L13 12 9 8 3 14" />
        <polyline points="17 21 21 21 21 17" />
      </svg>
    ),
    title: "Performance & rapidité",
    desc: "Des sites ultra-rapides, optimisés SEO et accessibles. La performance n'est pas une option, c'est une exigence.",
  },
  {
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    title: "Partenariat sur la durée",
    desc: "Nous nous impliquons comme si votre projet était le nôtre. Votre succès est notre réussite.",
  },
  {
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: "Réactivité exemplaire",
    desc: "Délais respectés, réponses rapides. Nous prenons nos engagements au sérieux et livrons dans les temps.",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Découverte & Analyse",
    desc: "Nous étudions vos besoins, votre secteur et vos objectifs pour construire une stratégie digitale solide.",
  },
  {
    num: "02",
    title: "Design & Prototypage",
    desc: "Maquettes wireframes, identité visuelle et prototypes interactifs pour valider l'expérience utilisateur.",
  },
  {
    num: "03",
    title: "Développement",
    desc: "Code propre, architecture scalable et technologies modernes. Chaque fonctionnalité est testée rigoureusement.",
  },
  {
    num: "04",
    title: "Livraison & Suivi",
    desc: "Déploiement soigné, formation si besoin et suivi post-lancement pour garantir une transition parfaite.",
  },
];
/* ── CountUp component ───────────────────────────────── */
function CountUp({
  target,
  suffix,
  active,
}: {
  target: number;
  suffix: string;
  active: boolean;
}) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start: number | null = null;
    const duration = 1600;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
      else setCount(target);
    };
    requestAnimationFrame(step);
  }, [active, target]);
  return (
    <>
      {count}
      {suffix}
    </>
  );
}
/* ── sub-components ────────────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.label}>
      <span className={styles.labelDot} />
      {children}
    </div>
  );
}

function AnimBlock({
  children,
  className,
  variant = fadeUp,
}: {
  children: React.ReactNode;
  className?: string;
  variant?: Variants;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      variants={variant}
    >
      {children}
    </motion.div>
  );
}

/* ── main component ───────────────────────────────────── */
export default function About() {
  const heroRef = useRef<HTMLDivElement>(null);
  const heroInView = useInView(heroRef, { once: true });
  const mvRef = useRef<HTMLDivElement>(null);
  const mvInView = useInView(mvRef, { once: true, margin: "-60px" });
  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true, margin: "-60px" });
  const valuesRef = useRef<HTMLDivElement>(null);
  const valuesInView = useInView(valuesRef, { once: true, margin: "-60px" });
  const stepsRef = useRef<HTMLDivElement>(null);
  const stepsInView = useInView(stepsRef, { once: true, margin: "-60px" });

  return (
    <main className={styles.page}>
      {/* ── BG déco ── */}
      <div className={styles.bgGlow1} aria-hidden="true" />
      <div className={styles.bgGlow2} aria-hidden="true" />
      <div className={styles.grid} aria-hidden="true" />
      <StarField />
      <FloatingLogos />

      {/* ══════════ HERO ══════════ */}
      <section className={styles.hero} ref={heroRef}>
        <motion.div
          className={styles.heroGrid}
          initial="hidden"
          animate={heroInView ? "show" : "hidden"}
        >
          {/* LEFT — glass card */}
          <motion.div className={styles.heroLeft} variants={heroCardVariant}>
            <div className={styles.glassCard}>
              {/* Image de fond */}
              <img
                src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=900&q=85"
                alt="Code — développement web moderne"
                className={styles.glassImg}
              />

              {/* Overlay glassmorphism */}
              <div className={styles.glassOverlay} aria-hidden="true" />

              {/* Contenu overlay bas */}
              <div className={styles.glassContent}>
                <div className={styles.glassTags}>
                  <span className={styles.glassTag}>Web Design</span>
                  <span className={styles.glassTag}>Développement</span>
                  <span className={styles.glassTag}>UX/UI</span>
                </div>
                {/* <p className={styles.glassQuote}>
                  Votre <span className={styles.glassAccent}>inspiration</span>
                  <br />
                  digitale commence ici.
                </p> */}
                <div className={styles.glassBar}>
                  <div className={styles.glassBarFill} />
                </div>
              </div>

              {/* Badge disponible — coin haut droit */}
              <div className={styles.floatBadge1}>
                <div className={styles.floatDot} />
                <span>Disponible</span>
              </div>

              {/* Stat — coin bas droit */}
              <div className={styles.floatBadge2}>
                <span className={styles.floatNum}>50+</span>
                <span className={styles.floatLabel}>Projets</span>
              </div>

              {/* Cercle tournant */}
              <a
                href="/#contact"
                className={styles.spinWrap}
                aria-label="Travaillons ensemble"
              >
                <svg
                  className={styles.spinText}
                  viewBox="0 0 160 160"
                  width="130"
                  height="130"
                  aria-hidden="true"
                >
                  <defs>
                    <path
                      id="heroCircle"
                      d="M 80 80 m -52 0 a 52 52 0 1 1 104 0 a 52 52 0 1 1 -104 0"
                    />
                  </defs>
                  <text
                    fontSize="10.5"
                    fontWeight="700"
                    fill="rgba(0,212,255,0.9)"
                    letterSpacing="4"
                  >
                    <textPath href="#heroCircle">
                      TRAVAILLONS ENSEMBLE • JTNOVA •
                    </textPath>
                  </text>
                </svg>
                <div className={styles.spinArrow}>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M7 17L17 7M17 7H7M17 7v10" />
                  </svg>
                </div>
              </a>
            </div>
          </motion.div>

          {/* RIGHT — texte */}
          <motion.div
            className={styles.heroRight}
            initial="hidden"
            animate={heroInView ? "show" : "hidden"}
            variants={rightColVariant}
          >
            <motion.div
              initial="hidden"
              animate={heroInView ? "show" : "hidden"}
              variants={badgeVariant}
            >
              <SectionLabel>Jtnova</SectionLabel>
            </motion.div>
            <motion.h1
              className={styles.heroTitle}
              variants={titleWrap}
              initial="hidden"
              animate={heroInView ? "show" : "hidden"}
            >
              <motion.span
                variants={wordVariant}
                style={{ display: "inline-block" }}
              >
                Une
              </motion.span>{" "}
              <motion.span
                variants={wordVariant}
                style={{ display: "inline-block" }}
              >
                agence
              </motion.span>{" "}
              <motion.span
                variants={wordVariant}
                className={styles.accent}
                style={{ display: "inline-block" }}
              >
                créative
              </motion.span>{" "}
              <motion.span
                variants={wordVariant}
                className={styles.accent}
                style={{ display: "inline-block" }}
              >
                &amp;
              </motion.span>{" "}
              <motion.span
                variants={wordVariant}
                className={styles.accent}
                style={{ display: "inline-block" }}
              >
                technique
              </motion.span>{" "}
              <motion.span
                variants={wordVariant}
                style={{ display: "inline-block" }}
              >
                au
              </motion.span>{" "}
              <motion.span
                variants={wordVariant}
                style={{ display: "inline-block" }}
              >
                service
              </motion.span>{" "}
              <motion.span
                variants={wordVariant}
                style={{ display: "inline-block" }}
              >
                de
              </motion.span>{" "}
              <motion.span
                variants={wordVariant}
                style={{ display: "inline-block" }}
              >
                votre
              </motion.span>{" "}
              <motion.span
                variants={wordVariant}
                style={{ display: "inline-block" }}
              >
                digital
              </motion.span>
            </motion.h1>
            <motion.div
              className={styles.heroInfoCard}
              variants={infoCardVariant}
              initial="hidden"
              animate={heroInView ? "show" : "hidden"}
            >
              <p className={styles.heroInfoText}>
                Nous collaborons avec des entreprises pour concevoir des sites
                et applications percutants, qui{" "}
                <span className={styles.heroInfoAccent}>
                  génèrent des résultats
                </span>{" "}
                et atteignent vos objectifs business.
              </p>
              <motion.div
                className={styles.heroInfoCtas}
                variants={ctasWrap}
                initial="hidden"
                animate={heroInView ? "show" : "hidden"}
              >
                <motion.a
                  href="/#contact"
                  className={styles.btnPrimary}
                  variants={ctaItemVariant}
                >
                  Démarrer un projet
                </motion.a>
                <motion.a
                  href="/#services"
                  className={styles.btnGhost}
                  variants={ctaItemVariant}
                >
                  Nos services
                </motion.a>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      <TechBanner />

      {/* ══════════ MISSION / VISION ══════════ */}
      <section className={styles.mvSection}>
        <div className={styles.mvStars} aria-hidden="true" />
        <div className={styles.container}>
          <AnimBlock variant={blurIn}>
            <SectionLabel>Notre raison d&apos;être</SectionLabel>
          </AnimBlock>
          <AnimBlock variant={blurIn}>
            <h2 className={styles.sectionTitle}>Mission &amp; Vision</h2>
          </AnimBlock>
          <AnimBlock variant={blurIn}>
            <p className={styles.sectionSub}>
              Deux axes fondateurs qui guident chaque décision, chaque projet,
              chaque collaboration.
            </p>
          </AnimBlock>

          <motion.div
            ref={mvRef}
            className={styles.mvGrid}
            initial="hidden"
            animate={mvInView ? "show" : "hidden"}
            variants={gridContainer(0.2)}
          >
            {/* ── Card Mission ── */}
            <motion.div className={styles.mvCard} variants={fadeLeft}>
              <div className={styles.mvCardBg} />
              <span className={styles.mvNum}>01</span>

              <div className={styles.mvHeader}>
                <div className={styles.mvIconWrap}>
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <span className={styles.mvBadge}>Mission</span>
              </div>

              <h3 className={styles.mvTitle}>
                Transformer les idées en produits digitaux qui comptent
              </h3>

              <p className={styles.mvDesc}>
                Permettre à chaque entreprise — startup ou grand groupe — de
                disposer d&apos;une présence digitale puissante, esthétique et
                performante. Nous transformons vos ambitions en produits
                numériques concrets qui génèrent une valeur mesurable.
              </p>

              <ul className={styles.mvPoints}>
                {[
                  "Présence digitale haut de gamme",
                  "Solutions sur mesure & scalables",
                  "Valeur business mesurable",
                ].map((pt) => (
                  <li key={pt} className={styles.mvPoint}>
                    {pt}
                  </li>
                ))}
              </ul>

              <div className={styles.mvFooterLine} />
            </motion.div>

            {/* ── Séparateur central ── */}
            <div className={styles.mvSeparator} aria-hidden="true">
              <div className={styles.mvSepLine} />
              <div className={styles.mvSepDot} />
              <div className={styles.mvSepLine} />
            </div>

            {/* ── Card Vision ── */}
            <motion.div className={styles.mvCard} variants={fadeRight}>
              <div
                className={styles.mvCardBg}
                style={{
                  right: "-60px",
                  left: "auto",
                  background:
                    "radial-gradient(circle, rgba(125,217,245,0.07) 0%, transparent 70%)",
                }}
              />
              <span
                className={styles.mvNum}
                style={{ right: "auto", left: "2rem" }}
              >
                02
              </span>

              <div className={styles.mvHeader}>
                <div className={styles.mvIconWrap}>
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                  </svg>
                </div>
                <span className={styles.mvBadge}>Vision</span>
              </div>

              <h3 className={styles.mvTitle}>
                Devenir la référence de l&apos;excellence digitale
              </h3>

              <p className={styles.mvDesc}>
                S&apos;imposer comme la référence des agences numériques pour
                les entreprises qui veulent croître vite et bien. Prouver que
                l&apos;excellence technique et la créativité peuvent coexister
                sans le moindre compromis.
              </p>

              <ul className={styles.mvPoints}>
                {[
                  "Référence reconnue à l'international",
                  "Alliance créativité & rigueur technique",
                  "Impact durable pour nos clients",
                ].map((pt) => (
                  <li key={pt} className={styles.mvPoint}>
                    {pt}
                  </li>
                ))}
              </ul>

              <div
                className={styles.mvFooterLine}
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(0,212,255,0.35) 100%)",
                }}
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══════════ STATS ══════════ */}
      <section className={styles.statsSection}>
        <div className={styles.statsStars} aria-hidden="true" />
        <div className={styles.container}>
          <motion.div
            ref={statsRef}
            className={styles.statsGrid}
            initial="hidden"
            animate={statsInView ? "show" : "hidden"}
            variants={gridContainer(0.12)}
          >
            {STATS.map((s, i) => (
              <motion.div
                key={i}
                className={`${styles.statCard}${STAT_COLOR_CLASSES[i] ? ` ${styles[STAT_COLOR_CLASSES[i]]}` : ""}`}
                variants={statCardVariants[i]}
              >
                <div className={styles.statCardGlow} />
                <div className={styles.statCardInner}>
                  <div className={styles.statIconWrap}>{s.icon}</div>
                  <div className={styles.statNumWrap}>
                    <span className={styles.statNum}>
                      <CountUp
                        target={s.target}
                        suffix={s.suffix}
                        active={statsInView}
                      />
                    </span>
                  </div>
                  <div className={styles.statTexts}>
                    <span className={styles.statLabel}>{s.label}</span>
                    <span className={styles.statSublabel}>{s.sublabel}</span>
                  </div>
                </div>
                <div className={styles.statProgressBar}>
                  <motion.div
                    className={styles.statProgressFill}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: statsInView ? 1 : 0 }}
                    transition={{
                      duration: 1.4,
                      ease: expo,
                      delay: 0.3 + i * 0.12,
                    }}
                    style={{ transformOrigin: "left" }}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════ VALEURS ══════════ */}
      <section className={styles.valuesSection}>
        <div className={styles.container}>
          {/* Titre en haut */}
          <div className={styles.valuesHeader}>
            <AnimBlock variant={blurIn}>
              <SectionLabel>Ce qui nous définit</SectionLabel>
            </AnimBlock>
            <AnimBlock variant={blurIn}>
              <h2 className={styles.valuesMainTitle}>
                Ce que nous <span className={styles.accent}>croyons</span> &amp;
                pratiquons
              </h2>
            </AnimBlock>
          </div>

          {/* Drum roll en dessous */}
          <div className={styles.valuesRoll}>
            <div className={styles.valuesRollTrack}>
              {[...VALUES, ...VALUES].map((v, i) => (
                <div key={i} className={styles.valuesRollItem}>
                  {v.title}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ PROCESSUS ══════════ */}
      <section className={styles.section}>
        <div className={styles.container}>
          <AnimBlock variant={blurIn}>
            <SectionLabel>Comment nous travaillons</SectionLabel>
          </AnimBlock>
          <AnimBlock variant={blurIn}>
            <h2 className={styles.sectionTitle}>Notre Processus</h2>
          </AnimBlock>
          <AnimBlock>
            <p className={styles.sectionSub}>
              Une méthode éprouvée, pensée pour la clarté, la rapidité et la
              qualité.
            </p>
          </AnimBlock>
          <motion.div
            ref={stepsRef}
            className={styles.stepsGrid}
            initial="hidden"
            animate={stepsInView ? "show" : "hidden"}
            variants={gridContainer(0.12)}
          >
            {STEPS.map((step, i) => (
              <motion.div
                key={i}
                className={styles.stepCard}
                variants={fadeLeft}
              >
                <span className={styles.stepNum}>{step.num}</span>
                <div className={styles.stepLine} />
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════ QUI SOMMES-NOUS ══════════ */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.whoGrid}>
            <AnimBlock className={styles.whoLeft} variant={fadeLeft}>
              <SectionLabel>L&apos;équipe</SectionLabel>
              <h2
                className={styles.sectionTitle}
                style={{ textAlign: "left", marginBottom: "1.5rem" }}
              >
                Une équipe passionnée au service de votre succès
              </h2>
              <p className={styles.whoText}>
                Chez Jtnova, nous sommes une équipe de développeurs, designers
                et stratèges digitaux réunis autour d&apos;une même passion :
                créer des produits numériques exceptionnels.
              </p>
              <p className={styles.whoText}>
                Notre équipe pluridisciplinaire maîtrise les technologies les
                plus récentes — React, Next.js, Node.js, TypeScript — et
                s&apos;appuie sur une solide expérience en UX/UI pour concevoir
                des interfaces à la fois belles et fonctionnelles.
              </p>
              <p className={styles.whoText}>
                Nous collaborons avec des clients en France et à
                l&apos;international, dans des secteurs variés : e-commerce,
                SaaS, fintech, immobilier, santé et bien plus encore.
              </p>
            </AnimBlock>
            <div className={styles.whoRight}>
              <AnimBlock className={styles.whoCard} variant={fadeRight}>
                <div className={styles.whoCardGlow} />
                <div className={styles.whoBadges}>
                  <span className={styles.whoBadge}>Next.js</span>
                  <span className={styles.whoBadge}>React</span>
                  <span className={styles.whoBadge}>TypeScript</span>
                  <span className={styles.whoBadge}>Node.js</span>
                  <span className={styles.whoBadge}>UI/UX Design</span>
                  <span className={styles.whoBadge}>SEO</span>
                  <span className={styles.whoBadge}>Figma</span>
                  <span className={styles.whoBadge}>PostgreSQL</span>
                  <span className={styles.whoBadge}>Tailwind</span>
                  <span className={styles.whoBadge}>Docker</span>
                  <span className={styles.whoBadge}>Vercel</span>
                  <span className={styles.whoBadge}>Framer Motion</span>
                </div>
                <div className={styles.whoCardLabel}>
                  <span className={styles.whoCardDot} />
                  Technologies maîtrisées
                </div>
              </AnimBlock>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ IDENTIFICATION LÉGALE ══════════ */}
      <section className={styles.section}>
        <div className={styles.container}>
          <AnimBlock variant={blurIn}>
            <SectionLabel>Informations légales</SectionLabel>
          </AnimBlock>
          <AnimBlock variant={blurIn}>
            <h2 className={styles.legalSectionTitle}>
              Identification de l'entreprise
            </h2>
          </AnimBlock>
          <AnimBlock>
            <p className={styles.sectionSub}>
              Toutes les informations officielles concernant Jtnova.
            </p>
          </AnimBlock>
          <div className={styles.legalGrid}>
            {/* ── Card Identité ── */}
            <AnimBlock className={styles.legalCard}>
              <div className={styles.legalCardGlow} />
              <div className={styles.legalCardHeader}>
                <div className={styles.legalIcon}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <path d="M8 21h8M12 17v4" />
                  </svg>
                </div>
                <span className={styles.legalCardTitle}>Identité</span>
                <span className={styles.legalCardBadge}>Officiel</span>
              </div>
              <ul className={styles.legalList}>
                {[
                  { k: "Raison sociale", v: "Jtnova" },
                  { k: "Forme juridique", v: "SARL" },
                  { k: "Date de création", v: "2019" },
                  {
                    k: "Secteur d'activité",
                    v: "Services informatiques & web",
                  },
                ].map(({ k, v }, i) => (
                  <motion.li
                    key={k}
                    className={styles.legalItem}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.4,
                      ease: expo,
                      delay: 0.1 + i * 0.07,
                    }}
                  >
                    <span className={styles.legalKey}>{k}</span>
                    <span className={styles.legalVal}>{v}</span>
                  </motion.li>
                ))}
              </ul>
            </AnimBlock>

            {/* ── Card Fiscal ── */}
            <AnimBlock className={styles.legalCard}>
              <div className={styles.legalCardGlow} />
              <div className={styles.legalCardHeader}>
                <div className={styles.legalIcon}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                </div>
                <span className={styles.legalCardTitle}>Fiscal & Registre</span>
                <span className={styles.legalCardBadge}>Vérifié</span>
              </div>
              <ul className={styles.legalList}>
                {[
                  { k: "NIF", v: "JTN-2019-0001", hi: true },
                  { k: "STAT / SIREN", v: "519 284 731" },
                  { k: "N° RCS", v: "RCS Antananarivo B 519 284" },
                  { k: "TVA intracommunautaire", v: "MG 519 284 731" },
                ].map(({ k, v, hi }, i) => (
                  <motion.li
                    key={k}
                    className={styles.legalItem}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.4,
                      ease: expo,
                      delay: 0.15 + i * 0.07,
                    }}
                  >
                    <span className={styles.legalKey}>{k}</span>
                    <span
                      className={
                        hi ? styles.legalValHighlight : styles.legalVal
                      }
                    >
                      {v}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </AnimBlock>

            {/* ── Card Localisation ── */}
            <AnimBlock className={styles.legalCard}>
              <div className={styles.legalCardGlow} />
              <div className={styles.legalCardHeader}>
                <div className={styles.legalIcon}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <span className={styles.legalCardTitle}>
                  Localisation & Contact
                </span>
                <span className={styles.legalCardBadge}>Actif</span>
              </div>
              <ul className={styles.legalList}>
                {[
                  { k: "Adresse", v: "Lot II A 47, Antananarivo 101" },
                  { k: "État / Région", v: "Analamanga, Madagascar" },
                  { k: "Email", v: "contact@jtnova.mg" },
                  { k: "Téléphone", v: "+261 34 00 000 00" },
                ].map(({ k, v }, i) => (
                  <motion.li
                    key={k}
                    className={styles.legalItem}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.4,
                      ease: expo,
                      delay: 0.2 + i * 0.07,
                    }}
                  >
                    <span className={styles.legalKey}>{k}</span>
                    <span className={styles.legalVal}>{v}</span>
                  </motion.li>
                ))}
              </ul>
            </AnimBlock>
          </div>
        </div>
      </section>

      {/* ══════════ CTA ══════════ */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <AnimBlock className={styles.ctaBox}>
            <div className={styles.ctaGlow} />
            <h2 className={styles.ctaTitle}>Prêt à collaborer avec nous ?</h2>
            <p className={styles.ctaSub}>
              Parlez-nous de votre projet. Nous vous répondons sous 24h.
            </p>
            <a href="/#contact" className={styles.btnPrimary}>
              Démarrer un projet
            </a>
          </AnimBlock>
        </div>
      </section>
    </main>
  );
}
