"use client";

import { useState, useRef, useEffect, useActionState } from "react";
import {
  submitContactAction,
  type ContactFormState,
} from "@/app/contact/actions";
import type { ContactInfoSetting } from "@/lib/site-settings";
import { motion } from "framer-motion";
import styles from "./Contact.module.css";
import StarField from "../accueil/StarField";

export default function Contact({ contact }: { contact?: ContactInfoSetting }) {
  // F7.3 — réseaux sociaux issus des réglages : plus de `href="#"` (lien mort).
  // Si une URL n'est pas renseignée, l'icône reste décorative (sans href).
  const githubUrl = contact?.github?.trim() || undefined;
  const linkedinUrl = contact?.linkedin?.trim() || undefined;
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  // S6 — soumission réelle : Server Action validée par Zod, insertion en base,
  // anti-spam (honeypot + débit) et e-mails. `state.ok` remplace l'ancien
  // envoi simulé (setTimeout), `pending` l'ancien état `loading`.
  const [state, formAction, pending] = useActionState<ContactFormState, FormData>(
    submitContactAction,
    { ok: false, error: null },
  );
  const successRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (state.ok) successRef.current?.focus?.();
  }, [state.ok]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };


  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.section
      id="contact"
      className={styles.section}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* F7.5 — étoiles : géométrie en CSS (`stars.css`), plus de styles inline. */}
      <StarField count={80} offset={200} shooters={0} />
      <div className={styles.bg} aria-hidden="true" />
      <div className={styles.container}>
        <StarField />
        <div className={styles.content}>
          <motion.div className={styles.header} variants={itemVariants}>
            <span className={styles.label}>Contact</span>
            <h1 className={styles.title}>Travaillons ensemble.</h1>
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
                  href={githubUrl}
                  target={githubUrl ? "_blank" : undefined}
                  rel={githubUrl ? "noopener noreferrer" : undefined}
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
                <a
                  href={linkedinUrl}
                  target={linkedinUrl ? "_blank" : undefined}
                  rel={linkedinUrl ? "noopener noreferrer" : undefined}
                  className={styles.social}
                  aria-label="LinkedIn"
                >
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
              {state.ok ? (
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
                  action={formAction}
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
                  {state.error && (
                    <p className={styles.formError} role="alert">
                      {state.error}
                    </p>
                  )}
                  {/* F6.7 — honeypot : invisible pour un humain, rempli par
                      les robots → succès factice côté serveur. */}
                  <div className={styles.hpField} aria-hidden="true">
                    <label htmlFor="website">Site web</label>
                    <input
                      id="website"
                      type="text"
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>
                  <button
                    type="submit"
                    className={styles.submit}
                    disabled={pending}
                  >
                    {pending ? (
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
