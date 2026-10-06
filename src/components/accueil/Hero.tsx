"use client";
import Link from "next/link";
import { motion, cubicBezier, type Variants } from "framer-motion";
import StarField from "./StarField";
import FloatingLogos from "./FloatingLogos";
import styles from "./Hero.module.css";
import type { HeroSetting, SocialLink } from "@/lib/site-settings";

// Easing expo-out ultra-fluide
const expo = cubicBezier(0.16, 1, 0.3, 1);

// Badge — scale + dé-flou (pop-in)
const badgeVariant: Variants = {
  hidden: { opacity: 0, scale: 0.8, filter: "blur(12px)", y: 14 },
  show: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    y: 0,
    transition: { duration: 0.85, ease: expo, delay: 0.1 },
  },
};

// Titre — conteneur stagger mot par mot
const titleWrap: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.065, delayChildren: 0.28 } },
};

// Chaque mot — blur + slide up (signature futuriste)
const wordVariant: Variants = {
  hidden: { opacity: 0, y: 56, filter: "blur(14px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.72, ease: expo },
  },
};

// Socials — conteneur stagger
const socialsWrap: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.78 } },
};

// Chaque lien — slide depuis la gauche + blur
const socialItemVariant: Variants = {
  hidden: { opacity: 0, x: -22, filter: "blur(6px)" },
  show: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: expo },
  },
};

// Colonne droite — glisse depuis la droite + blur
const rightColVariant: Variants = {
  hidden: { opacity: 0, x: 30, filter: "blur(8px)" },
  show: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.75, ease: expo, delay: 0.88 },
  },
};

// Marquee — révélation par le bas
const marqueeVariant: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.85, ease: expo, delay: 1.25 },
  },
};

const marqueeTop = [
  { text: "Création web", highlight: false },
  { text: "Design UI/UX", highlight: true },
  { text: "E-commerce", highlight: false },
  { text: "Performance", highlight: false },
  { text: "Applications web", highlight: true },
  { text: "Branding", highlight: false },
  { text: "Optimisation SEO", highlight: false },
  { text: "Sur mesure", highlight: true },
  { text: "Création web", highlight: false },
  { text: "Design UI/UX", highlight: true },
  { text: "E-commerce", highlight: false },
  { text: "Performance", highlight: false },
  { text: "Applications web", highlight: true },
  { text: "Branding", highlight: false },
  { text: "Optimisation SEO", highlight: false },
  { text: "Sur mesure", highlight: true },
];

const marqueeBottom = [
  { text: "Next.js", highlight: true },
  { text: "React", highlight: false },
  { text: "TypeScript", highlight: false },
  { text: "Tailwind", highlight: true },
  { text: "Node.js", highlight: false },
  { text: "PostgreSQL", highlight: false },
  { text: "Figma", highlight: true },
  { text: "Docker", highlight: false },
  { text: "Next.js", highlight: true },
  { text: "React", highlight: false },
  { text: "TypeScript", highlight: false },
  { text: "Tailwind", highlight: true },
  { text: "Node.js", highlight: false },
  { text: "PostgreSQL", highlight: false },
  { text: "Figma", highlight: true },
  { text: "Docker", highlight: false },
];

/** Normalise un mot (minuscules, ponctuation retirée) pour la comparaison. */
function normalizeWord(word: string): string {
  return word.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");
}

export default function Hero({
  hero,
  socials,
}: {
  hero: HeroSetting;
  socials: SocialLink[];
}) {
  // F5.1 — les mots listés dans `title_accent` sont rendus en couleur d'accent.
  const accentWords = new Set(
    hero.title_accent
      .split(/\s+/)
      .map(normalizeWord)
      .filter(Boolean),
  );
  const titleWords = hero.title.split(/\s+/).filter(Boolean);
  const visibleSocials = socials.filter((s) => s.label && s.href);

  return (
    <section id="hero" className={styles.hero}>
      <StarField />
      <FloatingLogos />
      <div className={styles.container}>
        {/* Badge */}
        <motion.div
          className={styles.badge}
          variants={badgeVariant}
          initial="hidden"
          animate="show"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="var(--color-accent)"
            aria-hidden="true"
          >
            <path d="M13 2L4.5 13.5H11L10 22L20.5 10H14L13 2Z" />
          </svg>
          {hero.badge}
        </motion.div>

        {/* Titre pleine largeur — animation mot par mot */}
        <motion.h1
          className={styles.title}
          variants={titleWrap}
          initial="hidden"
          animate="show"
        >
          {titleWords.map((word, i) => (
            <motion.span
              key={`${word}-${i}`}
              variants={wordVariant}
              className={
                accentWords.has(normalizeWord(word)) ? styles.accent : undefined
              }
              style={{ display: "inline-block" }}
            >
              {word}
            </motion.span>
          ))}
        </motion.h1>

        {/* Barre basse : socials gauche | desc + CTA droite */}
        <div className={styles.bottomRow}>
          <div className={styles.leftCol}>
            {/* Stats cards */}
            <motion.div
              className={styles.statsRow}
              variants={socialsWrap}
              initial="hidden"
              animate="show"
            >
              {[
                { num: "3+", label: "Années d'expérience" },
                { num: "98%", label: "Clients satisfaits" },
                { num: "15+", label: "Technologies" },
              ].map((s) => (
                <motion.div
                  key={s.label}
                  className={styles.statItem}
                  variants={socialItemVariant}
                >
                  <span className={styles.statNum}>{s.num}</span>
                  <span className={styles.statLabel}>{s.label}</span>
                </motion.div>
              ))}
            </motion.div>

            <div className={styles.socialsDivider} />

            {/* Liens sociaux */}
            <motion.div
              className={styles.socials}
              variants={socialsWrap}
              initial="hidden"
              animate="show"
            >
              {visibleSocials.map((s) => (
                <motion.a
                  key={`${s.label}-${s.href}`}
                  href={s.href}
                  className={styles.socialLink}
                  variants={socialItemVariant}
                  target={s.href.startsWith("http") ? "_blank" : undefined}
                  rel={
                    s.href.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                >
                  {s.label}
                  <svg
                    width="9"
                    height="9"
                    viewBox="0 0 12 12"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 10L10 2M10 2H4M10 2V8"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.a>
              ))}
            </motion.div>
          </div>
          {/* /leftCol */}

          <motion.div
            className={styles.rightBottom}
            variants={rightColVariant}
            initial="hidden"
            animate="show"
          >
            <p className={styles.desc}>{hero.subtitle}</p>
            <div className={styles.ctaActions}>
              {hero.cta_primary.label && (
                <Link
                  href={hero.cta_primary.href || "#"}
                  className={styles.ctaBtn}
                >
                  {hero.cta_primary.label}
                </Link>
              )}
              {hero.cta_secondary.label && (
                <Link
                  href={hero.cta_secondary.href || "#"}
                  className={`${styles.ctaBtn} ${styles.ctaBtnGhost}`}
                >
                  {hero.cta_secondary.label}
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bande défilante */}
      <motion.div
        className={styles.marqueeSection}
        aria-hidden="true"
        variants={marqueeVariant}
        initial="hidden"
        animate="show"
      >
        {/* Piste 1 — gauche */}
        <div className={styles.marqueeTrack}>
          <div className={styles.marquee}>
            {marqueeTop.map((w, i) => (
              <span
                key={i}
                className={`${styles.marqueeItem} ${w.highlight ? styles.marqueeHighlight : ""}`}
              >
                {w.text}
                <span className={styles.marqueeSep}>✦</span>
              </span>
            ))}
          </div>
        </div>
        {/* Piste 2 — droite (sens inverse) */}
        <div className={styles.marqueeTrack}>
          <div className={`${styles.marquee} ${styles.marqueeReverse}`}>
            {marqueeBottom.map((w, i) => (
              <span
                key={i}
                className={`${styles.marqueeItem} ${w.highlight ? styles.marqueeHighlight : ""}`}
              >
                {w.text}
                <span className={styles.marqueeSep}>◈</span>
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
