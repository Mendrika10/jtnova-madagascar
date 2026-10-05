"use client";
import {
  SiJavascript,
  SiTypescript,
  SiReact,
  SiNextdotjs,
  SiNodedotjs,
  SiPython,
  SiTailwindcss,
  SiGit,
  SiDocker,
  SiFigma,
  SiGraphql,
  SiPostgresql,
  SiMongodb,
  SiRedis,
  SiLinux,
  SiRust,
} from "react-icons/si";
import styles from "./FloatingLogos.module.css";

const seed = (n: number): number => {
  const x = Math.sin(n + 77) * 10000;
  return x - Math.floor(x);
};
const r = (n: number, d = 2) => parseFloat(n.toFixed(d));

const ICONS = [
  SiReact,
  SiTypescript,
  SiJavascript,
  SiNextdotjs,
  SiNodedotjs,
  SiPython,
  SiTailwindcss,
  SiGit,
  SiDocker,
  SiFigma,
  SiGraphql,
  SiPostgresql,
  SiMongodb,
  SiRedis,
  SiLinux,
  SiRust,
];

const LOGOS = ICONS.map((Icon, i) => ({
  Icon,
  x: r(seed(i * 2.3) * 90 + 4), // 4–94% position horizontale
  size: r(seed(i * 5.1) * 22 + 28), // 28–50 px
  opacity: r(seed(i * 7.3) * 0.08 + 0.06, 3), // 0.06–0.14
  delay: r(seed(i * 11.7) * -80), // déjà en cours au chargement
  duration: r(seed(i * 13.3) * 30 + 70), // 70–100 s
  goUp: i % 2 === 0, // pair = monte, impair = descend
  offset: r(seed(i * 19.1) * 120), // décalage de départ (vh)
}));

export default function FloatingLogos() {
  return (
    <div className={styles.wrapper} aria-hidden="true">
      {LOGOS.map(
        ({ Icon, x, size, opacity, delay, duration, goUp, offset }, i) => (
          <span
            key={i}
            className={`${styles.logo} ${goUp ? styles.logoUp : styles.logoDown}`}
            style={{
              left: `${x}%`,
              fontSize: `${size}px`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
              ["--op" as string]: opacity,
              ["--offset" as string]: `${offset}vh`,
            }}
          >
            <Icon />
          </span>
        ),
      )}
    </div>
  );
}
