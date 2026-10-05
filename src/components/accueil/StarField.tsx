"use client";
import { useEffect, useRef } from "react";
import styles from "./StarField.module.css";

// Pseudo-aléatoire déterministe → pas de mismatch d'hydratation
const seed = (n: number): number => {
  const x = Math.sin(n + 1) * 10000;
  return x - Math.floor(x);
};

const r = (n: number, d = 4): number => parseFloat(n.toFixed(d));

const STARS = Array.from({ length: 200 }, (_, i) => ({
  id: i,
  x: r(seed(i) * 100),
  y: r(seed(i * 3.7) * 100),
  size: r(seed(i * 7.3) * 1.6 + 0.4),
  delay: r(seed(i * 11.1) * 7),
  duration: r(seed(i * 13.7) * 3 + 2),
  bright: i % 18 === 0,
  medium: i % 7 === 0,
}));

const SHOOTING_COUNT = 3;

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
      createShooter(container);
    },
    total + 6000 + Math.random() * 8000,
  );
}

export default function StarField() {
  const shooterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = shooterRef.current;
    if (!el) return;
    for (let i = 0; i < SHOOTING_COUNT; i++) {
      setTimeout(() => createShooter(el), i * 2500);
    }
  }, []);

  return (
    <div className={styles.field} aria-hidden="true">
      {/* Étoiles fixes */}
      {STARS.map((s) => (
        <span
          key={s.id}
          className={`${styles.star} ${s.bright ? styles.starBright : ""} ${s.medium ? styles.starMedium : ""}`}
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
      {/* Conteneur étoiles filantes (client only) */}
      <div ref={shooterRef} className={styles.shooterContainer} />
    </div>
  );
}
