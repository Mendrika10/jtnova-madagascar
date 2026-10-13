"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "@deemlol/next-icons";
import styles from "./Navbar.module.css";

/** Cookie du choix de thème du site public (même nom que dans le layout). */
const COOKIE = "jtnova-theme";
const LIGHT = "light";
const DARK = "dark";

/**
 * Le thème est porté par `<html data-theme>`. Par défaut (aucun cookie) le site
 * public est **sombre** : le clair n'apparaît que sur un choix explicite, donc
 * jamais par simple préférence système — c'est le comportement demandé.
 */
function isLight(): boolean {
  return document.documentElement.dataset.theme === LIGHT;
}

/** L'état vit dans le DOM : on l'observe plutôt que de le dupliquer. */
function subscribe(onStoreChange: () => void) {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

const getSnapshot = () => isLight();
const getServerSnapshot = () => false;

/**
 * UI-SITE — bascule clair/sombre de la navbar publique.
 *
 * Aucun état React dupliqué : le DOM fait foi (`data-theme` sur `<html>`), ce
 * qui garde la bascule cohérente avec le thème réellement affiché. Le choix est
 * écrit dans un cookie relu par le script du layout **avant le premier rendu**
 * (donc sans flash), et les deux icônes sont rendues — leur visibilité est
 * pilotée en CSS par l'attribut `data-theme`, ce qui laisse le HTML serveur et
 * le HTML hydraté identiques.
 */
export default function ThemeToggle({ className }: { className?: string }) {
  const light = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = () => {
    const next = light ? DARK : LIGHT;
    document.documentElement.dataset.theme = next;
    document.cookie = `${COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
  };

  return (
    <button
      type="button"
      className={className ?? styles.themeBtn}
      onClick={toggle}
      aria-pressed={light}
      aria-label="Basculer entre le thème clair et le thème sombre"
      title="Thème clair / sombre"
    >
      <span className={styles.themeIconDark} aria-hidden>
        <Moon size={18} strokeWidth={2} />
      </span>
      <span className={styles.themeIconLight} aria-hidden>
        <Sun size={18} strokeWidth={2} />
      </span>
    </button>
  );
}
