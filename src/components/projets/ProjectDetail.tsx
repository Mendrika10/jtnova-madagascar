"use client";

import React, { useEffect, useRef } from "react";
import { cubicBezier, motion, useInView, Variants } from "framer-motion";
import styles from "./ProjectDetail.module.css";
import TechBannerImages from "../tech-banner/TechBannerImages";
import VideoShowcase from "./VideoShowcase";

type ProjectData = {
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

// Étoiles déterministes
const seed = (n: number) => {
  const x = Math.sin(n + 1) * 10000;
  return x - Math.floor(x);
};
const r = (n: number, d = 4) => parseFloat(n.toFixed(d));
const STARS = Array.from({ length: 80 }, (_, i) => ({
  id: i,
  x: r(seed(i * 2.9) * 100),
  y: r(seed(i * 4.7) * 100),
  size: r(seed(i * 8.3) * 1.5 + 0.4),
  delay: r(seed(i * 11.7) * 7),
  duration: r(seed(i * 14.1) * 3 + 2),
  bright: i % 13 === 0,
}));
function createShooter(container: HTMLDivElement) {
  if (!container || !container.isConnected) return;
  const el = document.createElement("span");
  el.className = styles.shooter;
  const startX = Math.random() * 80;
  const startY = Math.random() * 40;
  const angle = 28 + Math.random() * 22;
  const length = 100 + Math.random() * 130;
  const delay = Math.random() * 1.5;
  const dur = 0.8 + Math.random() * 0.5;
  el.style.setProperty("--sx", `${startX}%`);
  el.style.setProperty("--sy", `${startY}%`);
  el.style.setProperty("--angle", `${angle}deg`);
  el.style.setProperty("--len", `${length}px`);
  el.style.animationDelay = `${delay}s`;
  el.style.animationDuration = `${dur}s`;
  container.appendChild(el);
  const total = (delay + dur + 0.1) * 1000;
  setTimeout(
    () => {
      el.remove();
      if (container.isConnected) createShooter(container);
    },
    total + 5000 + Math.random() * 9000,
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
  const shooterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = shooterRef.current;
    if (!el) return;
    const timers: number[] = [];
    for (let i = 0; i < 3; i++) {
      timers.push(window.setTimeout(() => createShooter(el), i * 2400));
    }
    return () => {
      timers.forEach(clearTimeout);
      if (el) el.innerHTML = "";
    };
  }, []);

  return (
    <section className={styles.detail}>
      <div className={styles.cardDetail}>
        <div className={styles.starsLayer} aria-hidden="true">
          {STARS.map((s) => (
            <span
              key={s.id}
              className={`${styles.star} ${s.bright ? styles.starBright : ""}`}
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                width: `${s.size}px`,
                height: `${s.size}px`,
                animationDelay: `${s.delay}s`,
                animationDuration: `${s.duration}s`,
              }}
            />
          ))}
          <div ref={shooterRef} className={styles.shooterContainer} />
        </div>
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
                <img
                  src={data.images[0]}
                  alt={data.title}
                  className={styles.heroImg}
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
