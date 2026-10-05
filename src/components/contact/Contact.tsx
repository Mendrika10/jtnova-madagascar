"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import styles from "./Contact.module.css";
import StarField from "../accueil/StarField";

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

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const successRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (sent) successRef.current?.focus?.();
  }, [sent]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // simulate async send; replace with real API call
    setTimeout(() => {
      setSent(true);
      setForm({ name: "", email: "", message: "" });
      setLoading(false);
    }, 700);
  };

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
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
    <motion.section
      id="contact"
      className={styles.section}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Étoiles */}
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
      <div className={styles.container}>
        <StarField />
        <div className={styles.content}>
          <motion.div className={styles.header} variants={itemVariants}>
            <span className={styles.label}>Contact</span>
            <h2 className={styles.title}>Travaillons ensemble.</h2>
            <p className={styles.subtitle}>
              Un projet en tête ? Parlons-en et construisons quelque chose
              d&apos;exceptionnel.
            </p>
          </motion.div>

          <motion.div className={styles.layout} variants={itemVariants}>
            {/* Infos gauche */}
            <motion.div className={styles.info} variants={itemVariants}>
              {[
                {
                  icon: (
                    <svg
                      aria-hidden="true"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M12 21s-8-6.686-8-12a8 8 0 0116 0c0 5.314-8 12-8 12z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx="12"
                        cy="9"
                        r="2.5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />
                    </svg>
                  ),
                  label: "Localisation",
                  value: "Madagascar — disponible à distance",
                },
                {
                  icon: (
                    <svg
                      aria-hidden="true"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <rect
                        x="2"
                        y="4"
                        width="20"
                        height="16"
                        rx="2"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />
                      <path
                        d="M2 8l10 7 10-7"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />
                    </svg>
                  ),
                  label: "Email",
                  value: "contact@jtnova.com",
                },
                {
                  icon: (
                    <svg
                      aria-hidden="true"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="9"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />
                      <path
                        d="M12 7v5l3 3"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  ),
                  label: "Disponibilité",
                  value: "Ouvert aux nouveaux projets",
                },
              ].map((item) => (
                <motion.div
                  key={item.label}
                  className={styles.infoItem}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className={styles.infoIcon}>{item.icon}</div>
                  <div>
                    <p className={styles.infoLabel}>{item.label}</p>
                    <p className={styles.infoValue}>{item.value}</p>
                  </div>
                </motion.div>
              ))}

              {/* Réseaux sociaux */}
              <motion.div className={styles.socials} variants={itemVariants}>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.social}
                  aria-label="GitHub"
                >
                  <svg
                    aria-hidden="true"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                </a>
                <a href="#" className={styles.social} aria-label="LinkedIn">
                  <svg
                    aria-hidden="true"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </a>
              </motion.div>
            </motion.div>

            {/* Formulaire droite */}
            <motion.div className={styles.formWrap} variants={itemVariants}>
              {sent ? (
                <div
                  className={styles.success}
                  role="status"
                  aria-live="polite"
                  tabIndex={-1}
                  ref={successRef}
                >
                  <div className={styles.successIcon}>✓</div>
                  <h3>Message envoyé !</h3>
                  <p>Notre équipe vous répondra dans les plus brefs délais.</p>
                </div>
              ) : (
                <motion.form
                  onSubmit={handleSubmit}
                  className={styles.form}
                  variants={itemVariants}
                >
                  <div className={styles.row}>
                    <div className={styles.field}>
                      <label className={styles.fieldLabel} htmlFor="name">
                        Nom
                      </label>
                      <input
                        id="name"
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Votre nom"
                        required
                        className={styles.input}
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.fieldLabel} htmlFor="email">
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="votre@email.com"
                        required
                        className={styles.input}
                      />
                    </div>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel} htmlFor="message">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Décrivez votre projet..."
                      required
                      rows={6}
                      className={styles.textarea}
                    />
                  </div>
                  <button
                    type="submit"
                    className={styles.submit}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span>Envoi...</span>
                        <span className={styles.spinner} aria-hidden="true" />
                      </>
                    ) : (
                      <>
                        <span>Envoyer le message</span>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
