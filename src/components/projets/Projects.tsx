"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, cubicBezier, type Variants } from "framer-motion";
import styles from "./Projects.module.css";
import type { ProjectCardItem } from "@/lib/content";
import StarField from "@/components/accueil/StarField";
import { shouldSkipOptimizer } from "@/lib/images";

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
  hidden: { opacity: 0, y: 28, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.75, ease: expo },
  },
};
const subtitleVar: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: expo } },
};
const gridVar: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const cardVar: Variants = {
  hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.75, ease: expo },
  },
};

const projectsFallback = [
  {
    title: "JULIA - Plateforme de gestion d'activités et de planning",
    category: "Développement & Design",
    year: "2023",
    bg: "linear-gradient(145deg, #90bcff 0%, #2a79ff 100%)",
    accent: "rgba(0,180,216,0.18)",
    href: "/projects/project1",
    tag: "Application Web",
    image: "/images/ImagesProjetDetail/Projet1/referent.png",
    frame: "desktop",
  },
  {
    title: "Vitascore - Plateforme de création de visuels professionnels",
    category: "Développement & Design",
    year: "2025",
    bg: "linear-gradient(145deg, #d82323d4 0%, #c0c0c0 100%)",
    accent: "rgba(160,80,255,0.18)",
    href: "/projects/project2",
    tag: "E-commerce",
    image: "/images/ImagesProjetDetail/Projet2/vitascore.png",
    frame: "desktop",
  },
  {
    title: "Feonix IA",
    category: "IA Générative & Marketing",
    year: "2026",
    bg: "linear-gradient(145deg, rgb(120 19 230) 0%, rgb(204 234 255) 100%)",
    accent: "rgba(0,220,180,0.18)",
    href: "/projects/project3",
    tag: "Dashboard",
    image: "/images/ImagesProjetDetail/Projet3/feonix.png",
    frame: "desktop",
  },
  {
    title: "VINA.IO",
    category: "IA Générative",
    year: "2024",
    bg: "linear-gradient(145deg, rgb(0 161 173) 0%, rgb(74 253 255) 100%)",
    accent: "rgba(0,220,120,0.18)",
    href: "/projects/project4",
    tag: "Vitrine",
    image: "/images/ImagesProjetDetail/Projet4/vina.png",
    frame: "desktop",
  },
];

function DeviceFrame({
  frame,
  image,
  title,
  accent,
}: {
  frame: string;
  image: string;
  title: string;
  accent: string;
}) {
  const isMobile = frame === "mobile";
  const isDesktop = frame === "desktop";

  if (isMobile) {
    return (
      <div className={styles.deviceMobile}>
        <div className={styles.deviceNotch} />
        <div className={styles.deviceScreen}>
          {/* F7.4 — aperçu de réalisation optimisé (WebP, ~420 px de large). */}
          <Image
            src={image}
            alt={title}
            className={styles.deviceImg}
            fill
            sizes="(max-width: 900px) 90vw, 420px"
            unoptimized={shouldSkipOptimizer(image)}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <div className={styles.devicePlaceholder}>
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(0,180,216,0.35)"
              strokeWidth="1.4"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
          </div>
          <div className={styles.scanLine} />
        </div>
      </div>
    );
  }

  // desktop / tablet
  const cls = isDesktop ? styles.deviceDesktop : styles.deviceTablet;
  return (
    <div className={cls}>
      {/* <div className={styles.deviceBar}>
        <span className={styles.dot} style={{ background: "#ff5f57" }} />
        <span className={styles.dot} style={{ background: "#febc2e" }} />
        <span className={styles.dot} style={{ background: "#28c840" }} />
        <span className={styles.deviceUrl}>
          {title.toLowerCase().replace(/ /g, "-")}.app
        </span>
      </div> */}
      <div className={styles.deviceScreen}>
        {/* F7.4 — aperçu de réalisation optimisé (WebP, ~420 px de large). */}
        <Image
          src={image}
          alt={title}
          className={styles.deviceImg}
          fill
          sizes="(max-width: 900px) 90vw, 420px"
          unoptimized={shouldSkipOptimizer(image)}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      </div>
    </div>
  );
}

type ProjectsProps = {
  /** Réalisations publiées depuis Supabase ; absent → repli sur les données locales. */
  items?: ProjectCardItem[];
  /** F7.3 — niveau du titre de section : `h1` sur la page dédiée, `h2` sur l'accueil. */
  titleAs?: "h1" | "h2";
};

export default function Projects({ items, titleAs = "h2" }: ProjectsProps = {}) {
  const Title = titleAs === "h1" ? motion.h1 : motion.h2;
  const projects =
    items && items.length > 0
      ? items.map((it) => ({
          ...it,
          bg: "linear-gradient(145deg, #1a2332 0%, #0d1420 100%)",
          accent: "rgba(0,180,216,0.18)",
          frame: "desktop",
        }))
      : projectsFallback;

  return (
    <section id="projects" className={styles.section}>
      {/* F7.5 — étoiles : géométrie en CSS (`stars.css`), plus de styles inline. */}
      <StarField count={80} offset={290} />
      <div className={styles.bg} aria-hidden="true" />
      <div className={styles.container}>
        <motion.div
          className={styles.header}
          variants={headerContainerVar}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
          <motion.span className={styles.topLabel} variants={labelVar}>
            <span className={styles.labelDot} />
            Nos réalisations
          </motion.span>
          <Title className={styles.title} variants={titleVar}>
            Projets <span className={styles.accent}>sélectionnés</span>
          </Title>
          <motion.p className={styles.subtitle} variants={subtitleVar}>
            Une sélection de nos réalisations pour des clients de secteurs
            variés.
          </motion.p>
        </motion.div>

        <motion.div
          className={styles.grid}
          variants={gridVar}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
        >
          {projects.map((p, i) => (
            <Link key={p.title} href={p.href}>
              <motion.article
                className={styles.card}
                variants={cardVar}
                whileHover={{
                  y: -8,
                  transition: { duration: 0.3, ease: expo },
                }}
                style={{ cursor: "pointer" }}
              >
                <div className={styles.cardVisual} style={{ background: p.bg }}>
                  {/* Glow accent radial */}
                  <div
                    className={styles.cardGlow}
                    style={{
                      background: `radial-gradient(circle at 50% 110%, ${p.accent} 0%, transparent 65%)`,
                    }}
                  />
                  {/* Lignes de coin futuristes */}
                  <div className={styles.cornerTL} />
                  <div className={styles.cornerBR} />
                  {/* Numéro */}
                  <span className={styles.cardNum}>0{i + 1}</span>
                  <DeviceFrame
                    frame={p.frame}
                    image={p.image}
                    title={p.title}
                    accent={p.accent}
                  />
                </div>
                <div className={styles.cardInfo}>
                  <div>
                    <h3 className={styles.cardTitle}>{p.title}</h3>
                    <p className={styles.cardCat}>{p.category}</p>
                  </div>
                  <div className={styles.cardMeta}>
                    <span className={styles.cardYear}>{p.year}</span>
                    <span className={styles.cardArrow}>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="M7 17L17 7M17 7H7M17 7v10" />
                      </svg>
                    </span>
                  </div>
                </div>
              </motion.article>
            </Link>
          ))}
        </motion.div>

        <motion.div
          className={styles.viewAll}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: expo, delay: 0.3 }}
        >
          <Link href="/projets" className={styles.viewAllBtn}>
            Voir toutes les réalisations
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
