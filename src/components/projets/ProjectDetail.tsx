"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { cubicBezier, motion, useInView, Variants } from "framer-motion";
import styles from "./ProjectDetail.module.css";
import TechBannerImages from "../tech-banner/TechBannerImages";
import VideoShowcase from "./VideoShowcase";
import StarField from "@/components/accueil/StarField";
import { shouldSkipOptimizer } from "@/lib/images";

export type ProjectData = {
  title: string;
  tag?: string;
  year?: string;
  category?: string;
  bg?: string;
  accent?: string;
  description: string;
  presentation?: string;
  explication?: string;
  security?: string;
  performance?: string;
  tech: string[];
  highlights: string[];
  images: string[];
  video?: { src: string; poster?: string };
  liveUrl?: string;
  repoUrl?: string;
};

const expo = cubicBezier(0.16, 1, 0.3, 1);

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
export default function ProjectDetail({ data }: { data: ProjectData }) {
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
  const socialItemVariant: Variants = {
    hidden: { opacity: 0, x: -22, filter: "blur(6px)" },
    show: {
      opacity: 1,
      x: 0,
      filter: "blur(0px)",
      transition: { duration: 0.5, ease: expo },
    },
  };
  const socialsWrap: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.09, delayChildren: 0.78 } },
  };

  return (
    <section className={styles.detail}>
      <div className={styles.cardDetail}>
        {/* F7.5 — étoiles : géométrie en CSS (`stars.css`), plus de styles inline. */}
        <StarField count={80} offset={200} />
        <div className={styles.bg} aria-hidden="true" />
        <div className={styles.bottomRow}>
          <div className={styles.leftCol}>
            {/* Stats cards */}
            <motion.div
              className={styles.statsRow}
              variants={socialsWrap}
              initial="hidden"
              animate="show"
            >
              <motion.div
                className={styles.heroLeft}
                variants={socialItemVariant}
                initial="hidden"
                animate="show"
              >
                <span className={styles.tag}>{data.tag}</span>
                <h1 className={styles.title}>{data.title}</h1>
                <p className={styles.meta}>
                  {data.category} • {data.year}
                </p>
                <p className={styles.description}>{data.description}</p>
              </motion.div>
            </motion.div>

            <div className={styles.socialsDivider} />

            {/* Liens sociaux */}
            <motion.div
              className={styles.socials}
              variants={socialsWrap}
              initial="hidden"
              animate="show"
            >
              <motion.a
                href="/projets"
                className={styles.socialLink}
                variants={socialItemVariant}
              >
                Retour aux projets
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
              {data.liveUrl && (
                <motion.a
                  href={data.liveUrl}
                  className={styles.socialLink}
                  variants={socialItemVariant}
                  target="_blank"
                  rel="noreferrer"
                >
                  Voir le site
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
              )}

              {data.repoUrl && (
                <motion.a
                  href={data.repoUrl}
                  className={styles.socialLink}
                  variants={socialItemVariant}
                  target="_blank"
                  rel="noreferrer"
                >
                  Voir le code
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
              )}
            </motion.div>
          </div>
          {/* /leftCol */}

          <motion.div
            className={styles.rightBottom}
            variants={rightColVariant}
            initial="hidden"
            animate="show"
          >
            {data.images?.[0] ? (
              <div className={styles.mediaWrap}>
                {/* F7.4 — visuel principal : WebP à la bonne largeur (~40 Ko
                    au lieu de ~500 Ko en PNG), chargé sans attendre (LCP). */}
                <Image
                  src={data.images[0]}
                  alt={data.title}
                  className={styles.heroImg}
                  width={0}
                  height={0}
                  priority
                  sizes="(max-width: 560px) 100vw, 520px"
                  unoptimized={shouldSkipOptimizer(data.images[0])}
                  onError={(e) =>
                    ((e.target as HTMLImageElement).style.display = "none")
                  }
                />
              </div>
            ) : null}
          </motion.div>
        </div>
        <TechBannerImages images={data.images} title={data.title} />
        <div className={styles.container}>
          <div className={styles.whoGrid}>
            <AnimBlock className={styles.whoLeft} variant={fadeLeft}>
              <h2
                className={styles.sectionTitle}
                style={{ textAlign: "left", marginBottom: "0.5rem" }}
              >
                Présentation
              </h2>
              <p className={styles.lead} style={{ marginBottom: "3.5rem" }}>
                {data.presentation ?? data.description}
              </p>

              <h2
                className={styles.sectionTitle}
                style={{ textAlign: "left", marginBottom: "0.9rem" }}
              >
                Fonctionnalités & objectifs
              </h2>
              <ul
                className={styles.mvPoints}
                style={{ paddingLeft: "0", marginBottom: "3.5rem" }}
              >
                {data.highlights.map((pt) => (
                  <li key={pt} className={styles.mvPoint}>
                    {pt}
                  </li>
                ))}
              </ul>
              {data.explication && (
                <>
                  <h2
                    className={styles.sectionTitle}
                    style={{ textAlign: "left", marginBottom: "0.9rem" }}
                  >
                    Explication
                  </h2>
                  <p className={styles.lead} style={{ marginBottom: "1rem" }}>
                    {data.explication}
                  </p>
                </>
              )}
            </AnimBlock>

            <div className={styles.whoRight}>
              <AnimBlock className={styles.whoCard} variant={fadeRight}>
                <div className={styles.whoCardGlow} />
                <div className={styles.whoBadges}>
                  {data.tech.map((t) => (
                    <span key={t} className={styles.whoBadge}>
                      {t}
                    </span>
                  ))}
                </div>
              </AnimBlock>
              {data.security && (
                <AnimBlock className={styles.whoCard} variant={fadeRight}>
                  <div className={styles.whoCardGlow} />
                  <div className={styles.whoBadges}>
                    {data.security && (
                      <>
                        <h2
                          className={styles.sectionTitle}
                          style={{ textAlign: "left", marginBottom: "0.5rem" }}
                        >
                          Sécurité
                        </h2>
                        <p
                          className={styles.lead}
                          style={{
                            marginBottom: "1rem",
                            whiteSpace: "pre-line",
                          }}
                        >
                          {data.security}
                        </p>
                      </>
                    )}
                  </div>
                </AnimBlock>
              )}
              {data.performance && (
                <AnimBlock className={styles.whoCard} variant={fadeRight}>
                  <div className={styles.whoCardGlow} />
                  <div className={styles.whoBadges}>
                    {data.performance && (
                      <>
                        <h2
                          className={styles.sectionTitle}
                          style={{ textAlign: "left", marginBottom: "0.5rem" }}
                        >
                          Performance
                        </h2>
                        <p
                          className={styles.lead}
                          style={{
                            marginBottom: "1rem",
                            whiteSpace: "pre-line",
                          }}
                        >
                          {data.performance}
                        </p>
                      </>
                    )}
                  </div>
                </AnimBlock>
              )}
            </div>
          </div>
        </div>
        <div className={styles.container}>
          {data.video && <VideoShowcase video={data.video} />}
        </div>
      </div>
    </section>
  );
}
