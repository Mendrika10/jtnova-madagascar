"use client";

import { useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
  cubicBezier,
} from "framer-motion";
import styles from "./CTA.module.css";

const expo = cubicBezier(0.16, 1, 0.3, 1);

function seed(n: number) {
  return (Math.sin(n) * 43758.5453) % 1;
}
const PARTICLES = Array.from({ length: 55 }, (_, i) => ({
  left: (Math.abs(seed(i * 3.1)) * 100).toFixed(2),
  top: (Math.abs(seed(i * 7.3)) * 100).toFixed(2),
  size: (Math.abs(seed(i * 2.7)) * 2 + 1).toFixed(2),
  opacity: (Math.abs(seed(i * 5.9)) * 0.45 + 0.08).toFixed(2),
  dur: (Math.abs(seed(i * 4.1)) * 4 + 3).toFixed(2),
  delay: (Math.abs(seed(i * 6.3)) * 5).toFixed(2),
}));

const colVar = {
  hidden: { opacity: 0, y: 28, filter: "blur(6px)" },
  show: (d: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.65, delay: d, ease: expo },
  }),
};

export default function CTA() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [sent, setSent] = useState(false);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const mx = useSpring(rawX, { stiffness: 100, damping: 24 });
  const my = useSpring(rawY, { stiffness: 100, damping: 24 });
  const rotateX = useTransform(my, [-0.5, 0.5], [4, -4]);
  const rotateY = useTransform(mx, [-0.5, 0.5], [-5, 5]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    rawX.set((e.clientX - rect.left) / rect.width - 0.5);
    rawY.set((e.clientY - rect.top) / rect.height - 0.5);
  }
  function handleMouseLeave() {
    rawX.set(0);
    rawY.set(0);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <section id="contact" className={styles.section} aria-label="Contact">
      {/* <div className={styles.outerBg} aria-hidden="true" />
      <div className={styles.outerGlow} aria-hidden="true" /> */}

      <div className={styles.wrapper}>
        <motion.div
          ref={cardRef}
          className={styles.card}
          style={{ rotateX, rotateY, transformPerspective: 1100 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.85, ease: expo }}
        >
          {/* bg effects */}

          <div className={styles.particles} aria-hidden="true">
            {PARTICLES.map((p, i) => (
              <span
                key={i}
                className={styles.particle}
                style={{
                  left: `${p.left}%`,
                  top: `${p.top}%`,
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  opacity: Number(p.opacity),
                  animationDuration: `${p.dur}s`,
                  animationDelay: `${p.delay}s`,
                }}
              />
            ))}
          </div>
          <div className={styles.scanLine} aria-hidden="true" />
          <div className={styles.glowTop} aria-hidden="true" />

          {/* corners */}
          <div className={styles.cTL} aria-hidden="true" />
          <div className={styles.cTR} aria-hidden="true" />
          <div className={styles.cBL} aria-hidden="true" />
          <div className={styles.cBR} aria-hidden="true" />

          {/* 2-col layout */}
          <div className={styles.grid}>
            {/* ── Left ── */}
            <motion.div
              className={styles.left}
              custom={0}
              variants={colVar}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              <div className={styles.badge}>
                <span className={styles.badgeDot} aria-hidden="true" />
                {"Disponible pour de nouveaux projets"}
              </div>

              <h2 className={styles.title}>
                {"Créons votre prochaine"}
                <br />
                <span className={styles.accent}>{"grande idée."}</span>
              </h2>

              <p className={styles.sub}>
                {
                  "Discutons de votre projet — un brief, une vision, et on construit quelque chose d'exceptionnel ensemble."
                }
              </p>

              <div className={styles.infos}>
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon} aria-hidden="true">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </span>
                  <span>{"contact@jtnova.fr"}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon} aria-hidden="true">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </span>
                  <span>{"Madagascar — Remote worldwide"}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon} aria-hidden="true">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </span>
                  <span>{"Réponse sous 24h"}</span>
                </div>
              </div>

              <div className={styles.socials}>
                <a
                  href="#"
                  className={styles.social}
                  aria-label="LinkedIn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                  {"LinkedIn"}
                </a>
                <a
                  href="#"
                  className={styles.social}
                  aria-label="GitHub"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                  </svg>
                  {"GitHub"}
                </a>
              </div>
            </motion.div>

            {/* ── Right: Form ── */}
            <motion.div
              className={styles.right}
              custom={0.15}
              variants={colVar}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              {sent ? (
                <div className={styles.successBox}>
                  <div className={styles.successIcon} aria-hidden="true">
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <p className={styles.successTitle}>{"Message envoyé !"}</p>
                  <p className={styles.successSub}>
                    {"Je vous répondrai dans les plus brefs délais."}
                  </p>
                </div>
              ) : (
                <form
                  className={styles.form}
                  onSubmit={handleSubmit}
                  noValidate
                >
                  <div className={styles.formRow}>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="cta-name">
                        {"Nom"}
                      </label>
                      <input
                        id="cta-name"
                        type="text"
                        className={styles.input}
                        placeholder="Votre nom"
                        required
                        autoComplete="name"
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="cta-email">
                        {"Email"}
                      </label>
                      <input
                        id="cta-email"
                        type="email"
                        className={styles.input}
                        placeholder="votre@email.com"
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="cta-subject">
                      {"Sujet"}
                    </label>
                    <input
                      id="cta-subject"
                      type="text"
                      className={styles.input}
                      placeholder="De quoi s'agit-il ?"
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="cta-message">
                      {"Message"}
                    </label>
                    <textarea
                      id="cta-message"
                      className={`${styles.input} ${styles.textarea}`}
                      placeholder={
                        "Décrivez votre projet en quelques lignes..."
                      }
                      rows={4}
                      required
                    />
                  </div>
                  <button type="submit" className={styles.btnSubmit}>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                    {"Envoyer le message"}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
