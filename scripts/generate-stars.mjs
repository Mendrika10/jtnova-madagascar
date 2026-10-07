/**
 * F7.5 — génère `src/components/accueil/stars.css`.
 *
 * Avant : chaque étoile était une `<span>` portant 6 styles inline
 * (`left/top/width/height/animationDelay/animationDuration`) — ~495 éléments
 * et ~90 Ko de HTML sur l'accueil. Désormais les positions vivent dans une
 * feuille CSS mise en cache, et le HTML ne porte qu'une classe courte.
 *
 * Les positions sont déterministes (même générateur que l'ancien composant) :
 * le rendu reste un ciel d'étoiles équivalent, sans aléatoire ni mismatch
 * d'hydratation. Les plages d'indices sont réparties par section pour que
 * deux blocs d'une même page n'aient pas les mêmes étoiles :
 *   0-199 hero · 200-289 services/contact/détail · 290-369 réalisations ·
 *   370-439 témoignages · 440-494 bandeau CTA.
 *
 * Usage : `node scripts/generate-stars.mjs` (le fichier généré est commité).
 */
import { writeFileSync } from "node:fs";

const seed = (n) => {
  const x = Math.sin(n + 1) * 10000;
  return x - Math.floor(x);
};
// 2 décimales : la position d'une étoile décorative n'a pas besoin de plus.
const r = (n, d = 2) => parseFloat(n.toFixed(d));

const TOTAL = 495;

const out = [
  "/* GÉNÉRÉ par scripts/generate-stars.mjs — ne pas modifier à la main. */",
  ".jt-stars {",
  "  position: absolute;",
  "  inset: 0;",
  "  overflow: hidden;",
  "  pointer-events: none;",
  "  z-index: 0;",
  "}",
  "",
  ".jt-star {",
  "  position: absolute;",
  "  border-radius: 50%;",
  "  background: rgba(255, 255, 255, 0.9);",
  "  box-shadow: 0 0 2px rgba(255, 255, 255, 0.3);",
  "  animation: jt-twinkle var(--dur, 3s) ease-in-out infinite;",
  "}",
  "",
  ".jt-star-medium {",
  "  background: rgba(255, 255, 255, 0.95);",
  "  box-shadow: 0 0 4px 1px rgba(255, 255, 255, 0.3);",
  "}",
  "",
  ".jt-star-bright {",
  "  background: var(--color-accent);",
  "  box-shadow:",
  "    0 0 6px 2px rgba(0, 180, 216, 0.5),",
  "    0 0 12px 4px rgba(0, 180, 216, 0.2);",
  "}",
  "",
];

for (let i = 0; i < TOTAL; i++) {
  const x = r(seed(i * 3.7) * 100);
  const y = r(seed(i * 7.3) * 100);
  const size = r(seed(i * 11.1) * 1.6 + 0.4);
  const dur = r(seed(i * 13.7) * 3 + 2);
  const delay = r(seed(i * 17.3) * 7);
  out.push(
    `.jt-s${i}{left:${x}%;top:${y}%;width:${size}px;height:${size}px;--dur:${dur}s;animation-delay:${delay}s}`,
  );
}

out.push(
  "",
  "@keyframes jt-twinkle {",
  "  0% {",
  "    opacity: 0.05;",
  "    transform: scale(0.8);",
  "  }",
  "  30% {",
  "    opacity: 0.6;",
  "    transform: scale(1.1);",
  "  }",
  "  60% {",
  "    opacity: 0.15;",
  "    transform: scale(0.9);",
  "  }",
  "  100% {",
  "    opacity: 0.05;",
  "    transform: scale(0.8);",
  "  }",
  "}",
  "",
);

const target = "src/components/accueil/stars.css";
writeFileSync(target, out.join("\n"), "utf8");
console.log(`${target} écrit : ${TOTAL} étoiles, ${(out.join("\n").length / 1024).toFixed(1)} Ko de CSS`);
