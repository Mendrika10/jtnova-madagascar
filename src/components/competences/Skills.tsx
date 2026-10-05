"use client";

import { useState } from "react";
import styles from "./Skills.module.css";

const areas = [
  {
    title: "Développement Web",
    icon: "</>",
    desc: "Je crée des applications web performantes avec Next.js, React, Node.js et TypeScript — du front-end au back-end.",
  },
  {
    title: "UI/UX Design",
    icon: "◈",
    desc: "Je conçois des interfaces élégantes et intuitives, from wireframes to pixel-perfect implementations.",
  },
  {
    title: "DevOps & Déploiement",
    icon: "⚙",
    desc: "Docker, Vercel, CI/CD — je gère le déploiement et l'optimisation des applications en production.",
  },
];

const techStack = [
  "Docker", "Node.js", "Next.js", "React", "TypeScript",
  "Figma", "PostgreSQL", "Tailwind CSS", "Git", "HTML/CSS",
];

export default function Skills() {
  const [open, setOpen] = useState(0);

  return (
    <section id="skills" className={styles.section}>
      <div className={styles.container}>

        <div className={styles.topLabel}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--color-accent)" aria-hidden="true">
            <path d="M13 2L4.5 13.5H11L10 22L20.5 10H14L13 2Z"/>
          </svg>
          Spécialité
        </div>

        <h2 className={styles.title}>
          Domaines<br />d&apos;expertise
        </h2>

        <div className={styles.layout}>
          {/* Accordéon gauche */}
          <div className={styles.accordion}>
            {areas.map((area, i) => (
              <div
                key={area.title}
                className={`${styles.item} ${open === i ? styles.itemOpen : ""}`}
              >
                <button
                  className={styles.itemHeader}
                  onClick={() => setOpen(open === i ? -1 : i)}
                  aria-expanded={open === i}
                >
                  <span className={styles.itemIcon}>{area.icon}</span>
                  <span className={styles.itemTitle}>{area.title}</span>
                  <span className={styles.chevron}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.8"
                        strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </button>
                {open === i && (
                  <p className={styles.itemDesc}>{area.desc}</p>
                )}
              </div>
            ))}
          </div>

          {/* Image droite */}
          <div className={styles.imageCol}>
            <div className={styles.imagePlaceholder}>
              <div className={styles.imageMock}>
                <div className={styles.imageMockScreen}>
                  <div className={styles.codeLines}>
                    {["const dev = () => {", '  return "Nante";', "};", "", "// Full Stack"].map((line, i) => (
                      <span key={i} className={styles.codeLine} style={{ opacity: 1 - i * 0.15 }}>
                        {line}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tech stack tags */}
        <div className={styles.techRow}>
          {techStack.map((t) => (
            <span key={t} className={styles.techTag}>{t}</span>
          ))}
        </div>

      </div>
    </section>
  );
}
