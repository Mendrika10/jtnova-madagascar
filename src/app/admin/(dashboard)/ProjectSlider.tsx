"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "@deemlol/next-icons";
import styles from "../admin.module.css";

/** Vitesse du défilé automatique (px/s) : assez lente pour être lue, assez
 *  soutenue pour que la piste avance visiblement. */
const SPEED = 46;
/** Arrêt à chaque extrémité avant de repartir dans l'autre sens (ms). */
const TURN_PAUSE = 1400;
/** Reprise après une action manuelle — survol, clic, clavier, molette (ms). */
const HAND_PAUSE = 3500;
/** Reprise après le passage de la souris ou du focus (ms). */
const LEAVE_PAUSE = 700;
/** Attente avant le premier mouvement, le temps que la page se pose (ms). */
const START_PAUSE = 900;

/**
 * UI-ADMIN — carrousel horizontal des réalisations publiées du Tableau de bord.
 *
 * Seul morceau client de la page : il ne fait que **défiler** la piste
 * (`scrollBy` d'une vignette par flèche, défilé automatique en aller-retour),
 * signale les extrémités atteintes (flèches désactivées) et laisse le clavier
 * faire défiler la piste focalisée. Aucune donnée n'est chargée ici : les cartes
 * sont rendues côté serveur et passées en enfants.
 *
 * Le défilé automatique part après une seconde, va jusqu'au bout de la piste,
 * revient : il ne saute jamais d'un bord à l'autre. Il **s'arrête au survol, au
 * focus et à la moindre action manuelle** (clic, molette, clavier) pour ne
 * jamais voler la main à l'utilisateur, ne démarre pas sous
 * `prefers-reduced-motion: reduce` et ne fait rien si la piste ne déborde pas.
 * Pendant qu'il est disponible, il désactive l'aimantation de la piste
 * (`scroll-snap`) : sans cela le navigateur ramènerait la piste sur la vignette
 * la plus proche à chaque image, et elle sauterait d'un coup à la reprise après
 * un survol.
 */
export default function ProjectSlider({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });
  const holdRef = useRef<(ms: number) => void>(() => {});

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const sync = () => {
      const max = track.scrollWidth - track.clientWidth;
      setEdges((previous) => {
        const next = {
          start: track.scrollLeft <= 4,
          end: track.scrollLeft >= max - 4,
        };
        return previous.start === next.start && previous.end === next.end
          ? previous
          : next;
      });
    };

    sync();
    track.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let last = performance.now();
    let holdUntil = performance.now() + START_PAUSE;
    let turnUntil = 0;
    let direction = 1;

    holdRef.current = (ms: number) => {
      holdUntil = performance.now() + ms;
    };

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);

      const max = track.scrollWidth - track.clientWidth;
      if (reduced.matches || max <= 1) {
        // Rien à faire défiler : la piste retrouve l'aimantation du CSS.
        if (track.style.scrollSnapType !== "") track.style.scrollSnapType = "";
        return;
      }
      if (track.style.scrollSnapType !== "none") {
        track.style.scrollSnapType = "none";
      }

      const elapsed = Math.min(64, now - last) / 1000;
      last = now;
      if (document.hidden || now < holdUntil || now < turnUntil) return;

      let next = track.scrollLeft + direction * SPEED * elapsed;
      if (next >= max) {
        next = max;
        direction = -1;
        turnUntil = now + TURN_PAUSE;
      } else if (next <= 0) {
        next = 0;
        direction = 1;
        turnUntil = now + TURN_PAUSE;
      }
      track.scrollLeft = next;
    };

    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      track.style.scrollSnapType = "";
      holdRef.current = () => {};
      track.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, []);

  /** Une vignette exactement (largeur de la première + gouttière) : les flèches
   *  retombent donc toujours sur une carte entière, même sans aimantation. */
  const slide = (direction: number) => {
    const track = trackRef.current;
    if (!track) return;
    holdRef.current(HAND_PAUSE);
    const first = track.firstElementChild;
    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
    const step =
      first instanceof HTMLElement && first.offsetWidth > 0
        ? first.offsetWidth + gap
        : track.clientWidth * 0.8;
    track.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  return (
    <div
      className={styles.slider}
      onMouseEnter={() => holdRef.current(HAND_PAUSE)}
      onMouseLeave={() => holdRef.current(LEAVE_PAUSE)}
      onFocus={() => holdRef.current(HAND_PAUSE)}
      onBlur={() => holdRef.current(LEAVE_PAUSE)}
      onPointerDown={() => holdRef.current(HAND_PAUSE)}
      onWheel={() => holdRef.current(HAND_PAUSE)}
      onTouchStart={() => holdRef.current(HAND_PAUSE)}
      onKeyDown={() => holdRef.current(HAND_PAUSE)}
    >
      <ul
        ref={trackRef}
        className={styles.sliderTrack}
        aria-label={label}
        tabIndex={0}
      >
        {children}
      </ul>

      <div className={styles.sliderNav}>
        <button
          type="button"
          className={styles.sliderBtn}
          onClick={() => slide(-1)}
          disabled={edges.start}
          aria-label="Réalisations précédentes"
        >
          <ChevronLeft size={16} strokeWidth={2} aria-hidden />
        </button>
        <button
          type="button"
          className={styles.sliderBtn}
          onClick={() => slide(1)}
          disabled={edges.end}
          aria-label="Réalisations suivantes"
        >
          <ChevronRight size={16} strokeWidth={2} aria-hidden />
        </button>
      </div>
    </div>
  );
}
