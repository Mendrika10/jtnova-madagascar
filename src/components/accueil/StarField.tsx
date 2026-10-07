"use client";
import { useEffect, useRef } from "react";
import styles from "./StarField.module.css";
import "./stars.css";

/**
 * F7.5 — champ d'étoiles. Les positions/tailles/délais ne sont **plus** des
 * styles inline (ils pesaient ~90 Ko de HTML sur l'accueil) : chaque étoile
 * est un `<i>` portant une classe courte, la géométrie vit dans
 * `stars.css` (généré par `scripts/generate-stars.mjs`, mis en cache).
 *
 * Les plages d'indices sont réparties par section (hero, services/réalisations,
 * témoignages, CTA) pour que deux blocs d'une même page n'affichent pas les
 * mêmes étoiles. Les étoiles filantes restent créées côté client.
 */

type StarFieldProps = {
  /** Nombre d'étoiles rendues. */
  count?: number;
  /** Décalage dans le jeu généré (évite les doublons entre sections). */
  offset?: number;
  /** Nombre d'étoiles filantes (0 = aucune). */
  shooters?: number;
};

const SHOOTING_COUNT = 3;
/** Intervalle entre deux créations de filante (ms). */
const SHOOTER_STAGGER = 2500;

function createShooter(container: HTMLDivElement) {
  const el = document.createElement("span");
  el.className = styles.shooter;
  const startX = Math.random() * 80;
  const startY = Math.random() * 35;
  const angle = 30 + Math.random() * 20;
  const length = 100 + Math.random() * 120;
  const delay = Math.random() * 2;
  const dur = 0.8 + Math.random() * 0.5;

  el.style.setProperty("--sx", `${startX}%`);
  el.style.setProperty("--sy", `${startY}%`);
  el.style.setProperty("--angle", `${angle}deg`);
  el.style.setProperty("--len", `${length}px`);
  el.style.animationDelay = `${delay}s`;
  el.style.animationDuration = `${dur}s`;

  container.appendChild(el);

  // Recréer avec une longue pause entre chaque apparition
  const total = (delay + dur + 0.1) * 1000;
  setTimeout(
    () => {
      el.remove();
      if (container.isConnected) createShooter(container);
    },
    total + 6000 + Math.random() * 8000,
  );
}

export default function StarField({
  count = 200,
  offset = 0,
  shooters = SHOOTING_COUNT,
}: StarFieldProps) {
  const shooterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = shooterRef.current;
    if (!el || shooters <= 0) return;
    const timers: number[] = [];
    for (let i = 0; i < shooters; i++) {
      timers.push(
        window.setTimeout(() => createShooter(el), i * SHOOTER_STAGGER),
      );
    }
    return () => {
      timers.forEach(clearTimeout);
      el.innerHTML = "";
    };
  }, [shooters]);

  return (
    <div className="jt-stars" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => {
        const idx = offset + i;
        const bright = idx % 18 === 0;
        const medium = !bright && idx % 7 === 0;
        return (
          <i
            key={idx}
            className={`jt-star${medium ? " jt-star-medium" : ""}${
              bright ? " jt-star-bright" : ""
            } jt-s${idx}`}
          />
        );
      })}
      {shooters > 0 && (
        <div ref={shooterRef} className={styles.shooterContainer} />
      )}
    </div>
  );
}
