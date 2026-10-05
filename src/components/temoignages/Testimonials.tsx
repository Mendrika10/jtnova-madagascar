"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  cubicBezier,
  type Variants,
} from "framer-motion";
import styles from "./Testimonials.module.css";

const expo = cubicBezier(0.16, 1, 0.3, 1);

const INTERVAL = 5000;

const headerVar: Variants = {
  hidden: { opacity: 0, x: -30, filter: "blur(6px)" },
  show: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: expo },
  },
};

const testimonials = [
  {
    name: "Sophie Martin",
    role: "CEO, TechStart",
    avatar: "SM",
    text: "Jtnova a transform\u00e9 notre pr\u00e9sence en ligne. Le site livr\u00e9 est non seulement magnifique mais aussi extr\u00eamement performant. Notre taux de conversion a augment\u00e9 de 40% d\u00e8s le premier mois. Une \u00e9quipe professionnelle, \u00e0 l\u2019\u00e9coute et qui sait comment transformer une vision en r\u00e9alit\u00e9 digitale.",
    linkedin: "https://linkedin.com",
  },
  {
    name: "Karim Benali",
    role: "Directeur Marketing, Nexora",
    avatar: "KB",
    text: "Une \u00e9quipe \u00e0 l\u2019\u00e9coute, r\u00e9active, et qui comprend vraiment les enjeux business. Le r\u00e9sultat final a d\u00e9pass\u00e9 toutes nos attentes. Je recommande sans h\u00e9sitation \u00e0 toute entreprise cherchant un partenaire digital de confiance.",
    linkedin: "https://linkedin.com",
  },
  {
    name: "L\u00e9a Fontaine",
    role: "Fondatrice, Moda Shop",
    avatar: "LF",
    text: "Notre boutique e-commerce a \u00e9t\u00e9 d\u00e9velopp\u00e9e en un temps record avec une qualit\u00e9 impeccable. Le suivi apr\u00e8s livraison est \u00e9galement top. L\u2019interface est intuitive et nos clients adorent l\u2019exp\u00e9rience d\u2019achat.",
    linkedin: "https://linkedin.com",
  },
  {
    name: "Thomas Roux",
    role: "CTO, DataFlow SAS",
    avatar: "TR",
    text: "Collaboration fluide du d\u00e9but \u00e0 la fin. Jtnova ma\u00eetrise les technologies modernes et sait les appliquer intelligemment pour livrer des produits robustes et scalables. Une vraie expertise technique.",
    linkedin: "https://linkedin.com",
  },
  {
    name: "Amira Diallo",
    role: "Responsable Digital, GreenBio",
    avatar: "AD",
    text: "Le redesign de notre site a redonn\u00e9 vie \u00e0 notre marque. L\u2019\u00e9quipe a su capturer notre identit\u00e9 et la traduire en une exp\u00e9rience digitale coh\u00e9rente et engageante. Les r\u00e9sultats ont \u00e9t\u00e9 imm\u00e9diats.",
    linkedin: "https://linkedin.com",
  },
  {
    name: "Marc Leclerc",
    role: "G\u00e9rant, Studio Arc",
    avatar: "ML",
    text: "Interface \u00e9pur\u00e9e, animations soign\u00e9es, performances au top. Exactement ce que nous cherchions. Jtnova est maintenant notre partenaire digital de r\u00e9f\u00e9rence pour tous nos projets futurs.",
    linkedin: "https://linkedin.com",
  },
];

const MAX_CHARS = 220;

export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [expanded, setExpanded] = useState(false);
  const [paused, setPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const go = useCallback((d: number) => {
    setDir(d);
    setExpanded(false);
    setProgressKey((k) => k + 1);
    setIndex((prev) => (prev + d + testimonials.length) % testimonials.length);
  }, []);

  const goTo = (i: number) => {
    setDir(i > index ? 1 : -1);
    setExpanded(false);
    setProgressKey((k) => k + 1);
    setIndex(i);
  };

  useEffect(() => {
    if (paused) return;
    timerRef.current = setTimeout(() => go(1), INTERVAL);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [index, paused, go]);

  const t = testimonials[index];
  const needsTruncate = t.text.length > MAX_CHARS;
  const displayText =
    needsTruncate && !expanded ? t.text.slice(0, MAX_CHARS) : t.text;

  // Étoiles déterministes
  const seed = (n: number) => {
    let x = Math.sin(n) * 10000;
    return x - Math.floor(x);
  };
  const STARS = Array.from({ length: 70 }, (_, i) => ({
    left: `${(seed(i * 3.1) * 100).toFixed(2)}%`,
    top: `${(seed(i * 5.7) * 100).toFixed(2)}%`,
    size: parseFloat((seed(i * 2.3) * 2 + 1).toFixed(2)),
    dur: `${(seed(i * 1.7) * 3 + 2).toFixed(2)}s`,
    delay: `${(seed(i * 4.1) * 3).toFixed(2)}s`,
    bright: seed(i * 6.3) > 0.82,
  }));

  const SHOOTING_COUNT = 3;
  const shooterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = shooterRef.current;
    if (!container) return;
    const create = () => {
      const el = document.createElement("div");
      el.className = styles.shooter;
      const angle = 25 + Math.random() * 20;
      el.style.setProperty("--sx", `${10 + Math.random() * 70}%`);
      el.style.setProperty("--sy", `${Math.random() * 40}%`);
      el.style.setProperty("--len", `${120 + Math.random() * 100}px`);
      el.style.setProperty("--angle", `${angle}deg`);
      el.style.animationDuration = `${0.8 + Math.random() * 0.6}s`;
      el.style.animationDelay = `${Math.random() * 8}s`;
      container.appendChild(el);
      el.addEventListener("animationend", () => el.remove(), { once: true });
    };
    const ids = Array.from({ length: SHOOTING_COUNT }, (_, i) =>
      setInterval(create, 3000 + i * 1700),
    );
    return () => ids.forEach(clearInterval);
  }, []);

  return (
    <section
      id="temoignages"
      className={styles.section}
      style={{ marginBottom: "80px" }}
    >
      <div className={styles.container}>
        <div className={styles.layout}>
          {/* Colonne gauche */}
          <motion.div
            className={styles.left}
            variants={headerVar}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
          >
            <div className={styles.topLabel}>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="var(--color-accent)"
                aria-hidden="true"
              >
                <path d="M13 2L4.5 13.5H11L10 22L20.5 10H14L13 2Z" />
              </svg>
              {"Témoignages"}
            </div>
            <h2 className={styles.title}>
              Ce que disent nos&nbsp;
              <span className={styles.accent}>clients</span>
            </h2>
            <p className={styles.subtitle}>
              La satisfaction de nos clients est notre meilleure carte de
              visite. Voici ce qu&apos;ils pensent de notre collaboration.
            </p>

            <div className={styles.dots}>
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  className={`${styles.dot} ${i === index ? styles.dotActive : ""}`}
                  onClick={() => goTo(i)}
                  aria-label={`T\u00e9moignage ${i + 1}`}
                />
              ))}
            </div>
          </motion.div>

          {/* Colonne droite */}
          <div
            className={styles.right}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={index}
                className={styles.card}
                custom={dir}
                initial={{ opacity: 0, x: dir * 60, filter: "blur(10px)" }}
                animate={{
                  opacity: 1,
                  x: 0,
                  filter: "blur(0px)",
                  transition: { duration: 0.5, ease: expo },
                }}
                exit={{
                  opacity: 0,
                  x: dir * -60,
                  filter: "blur(10px)",
                  transition: { duration: 0.3 },
                }}
              >
                <div className={styles.cardGlow} aria-hidden="true" />
                <div className={styles.quoteIcon} aria-hidden="true">
                  &ldquo;
                </div>

                <p className={styles.quote}>
                  {displayText}
                  {needsTruncate && !expanded && (
                    <>
                      {"\u2026 "}
                      <button
                        className={styles.seeMore}
                        onClick={() => setExpanded(true)}
                      >
                        voir plus
                      </button>
                    </>
                  )}
                  {needsTruncate && expanded && (
                    <>
                      {" "}
                      <button
                        className={styles.seeMore}
                        onClick={() => setExpanded(false)}
                      >
                        voir moins
                      </button>
                    </>
                  )}
                </p>

                <div className={styles.divider} />

                <div className={styles.bottomBar}>
                  <div className={styles.author}>
                    <div className={styles.avatarWrap}>
                      <div className={styles.avatar}>{t.avatar}</div>
                    </div>
                    <div className={styles.authorInfo}>
                      <div className={styles.authorName}>{t.name}</div>
                      <div className={styles.authorRole}>{t.role}</div>
                    </div>
                  </div>

                  <div className={styles.navRow}>
                    <button
                      className={styles.navBtn}
                      onClick={() => go(-1)}
                      aria-label="Pr\u00e9c\u00e9dent"
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                    </button>
                    <span className={styles.counter}>
                      {String(index + 1).padStart(2, "0")}&nbsp;/&nbsp;
                      {String(testimonials.length).padStart(2, "0")}
                    </span>
                    <button
                      className={styles.navBtn}
                      onClick={() => go(1)}
                      aria-label="Suivant"
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  </div>
                </div>

                {!paused && (
                  <div className={styles.progressBar}>
                    <motion.div
                      key={progressKey}
                      className={styles.progressFill}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: INTERVAL / 1000, ease: "linear" }}
                    />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <a
              href={t.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.linkedinLink}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
              Voir sur LinkedIn
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="7" y1="17" x2="17" y2="7" />
                <polyline points="7 7 17 7 17 17" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
