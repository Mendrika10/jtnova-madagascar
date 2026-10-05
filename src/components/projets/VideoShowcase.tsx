"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  cubicBezier,
} from "framer-motion";
import styles from "./ProjectDetail.module.css";
import videoStyles from "./VideoShowcase.module.css";

type Props = {
  video?: { src: string; poster?: string } | null;
  particleCount?: number;
};

export default function VideoShowcase({ video, particleCount = 55 }: Props) {
  const expo = cubicBezier(0.16, 1, 0.3, 1);

  const seed = (n: number) => {
    const x = Math.sin(n + 1) * 10000;
    return x - Math.floor(x);
  };
  const r = (n: number, d = 4) => parseFloat(n.toFixed(d));

  const PARTICLES = Array.from({ length: particleCount }, (_, i) => ({
    left: (Math.abs(seed(i * 3.1)) * 100).toFixed(2),
    top: (Math.abs(seed(i * 7.3)) * 100).toFixed(2),
    size: (Math.abs(seed(i * 2.7)) * 2 + 1).toFixed(2),
    opacity: (Math.abs(seed(i * 5.9)) * 0.45 + 0.08).toFixed(2),
    dur: (Math.abs(seed(i * 4.1)) * 4 + 3).toFixed(2),
    delay: (Math.abs(seed(i * 6.3)) * 5).toFixed(2),
  }));

  const cardRef = useRef<HTMLDivElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const mx = useSpring(rawX, { stiffness: 100, damping: 24 });
  const my = useSpring(rawY, { stiffness: 100, damping: 24 });
  const rotateX = useTransform(my, [-0.5, 0.5], [4, -4]);
  const rotateY = useTransform(mx, [-0.5, 0.5], [-5, 5]);

  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (playing && videoRef.current) {
      videoRef.current.play().catch(() => {
        /* ignore play rejection */
      });
    }
  }, [playing]);

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

  return (
    <div className={styles.container}>
      <div className={styles.outerBg} aria-hidden="true" />
      <div className={styles.outerGlow} aria-hidden="true" />

      <div className={styles.wrapper}>
        <motion.div
          ref={cardRef}
          className={styles.carddemo}
          style={{ rotateX, rotateY, transformPerspective: 1100 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.85, ease: expo }}
        >
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

          <div
            className={styles.cTL}
            aria-hidden="true"
            style={{ pointerEvents: "none" }}
          />
          <div
            className={styles.cTR}
            aria-hidden="true"
            style={{ pointerEvents: "none" }}
          />
          <div
            className={styles.cBL}
            aria-hidden="true"
            style={{ pointerEvents: "none" }}
          />
          <div
            className={styles.cBR}
            aria-hidden="true"
            style={{ pointerEvents: "none" }}
          />

          {video?.src ? (
            <div
              className={`${styles.videoWrap} ${videoStyles.videoContainer}`}
            >
              {!playing ? (
                <div
                  className={videoStyles.posterWrap}
                  role="button"
                  tabIndex={0}
                  onClick={() => setPlaying(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setPlaying(true);
                  }}
                  aria-label="Lire la démo"
                >
                  {video.poster ? (
                    <img
                      src={video.poster}
                      alt={`${"Poster"}`}
                      className={videoStyles.posterImg}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "320px",
                        background: "#000",
                      }}
                    />
                  )}

                  <div className={videoStyles.playOverlay} aria-hidden="true">
                    <button
                      className={videoStyles.playButton}
                      aria-hidden="true"
                    >
                      <svg
                        className={videoStyles.playIcon}
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M5 3v18l15-9L5 3z" fill="currentColor" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  controls
                  playsInline
                  src={video.src}
                  poster={video.poster}
                  className={styles.video}
                />
              )}
            </div>
          ) : (
            <p className={styles.muted}>Aucune vidéo fournie pour le moment.</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
