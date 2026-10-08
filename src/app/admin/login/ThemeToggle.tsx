"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "@deemlol/next-icons";
import styles from "../admin.module.css";

const COOKIE = "jtnova-admin-theme";
const LIGHT = "light";
const DARK = "dark";

/** Le conteneur de la page de connexion porte le thème (`data-theme`). */
function themeRoot(): HTMLElement | null {
  return document.querySelector<HTMLElement>("[data-login-root]");
}

/**
 * Thème résolu : le choix explicite (attribut rendu par le serveur depuis le
 * cookie) prime, sinon on suit la préférence système — exactement la même règle
 * que le CSS, qui la traduit en `color-scheme` puis en `light-dark()`.
 */
function isLight(): boolean {
  const explicit = themeRoot()?.dataset.theme;
  if (explicit === LIGHT) return true;
  if (explicit === DARK) return false;
  return window.matchMedia("(prefers-color-scheme: light)").matches;
}

/** L'état vit dans le DOM (attribut + préférence système) : on l'observe plutôt
 *  que de le dupliquer dans un `useState` — la source de vérité reste unique. */
function subscribe(onStoreChange: () => void) {
  const element = themeRoot();
  const media = window.matchMedia("(prefers-color-scheme: light)");
  const observer = new MutationObserver(onStoreChange);
  if (element) {
    observer.observe(element, { attributes: true, attributeFilter: ["data-theme"] });
  }
  media.addEventListener("change", onStoreChange);
  return () => {
    observer.disconnect();
    media.removeEventListener("change", onStoreChange);
  };
}

const getSnapshot = () => isLight();
const getServerSnapshot = () => false;

/**
 * UI-ADMIN — bascule clair/sombre de la page de connexion.
 *
 * Aucun script inline : le choix de l'utilisateur est écrit dans un cookie, que
 * la page (composant serveur) relit pour rendre `data-theme` dès le premier
 * rendu — donc sans flash, et sans le `<script>` que React n'exécuterait pas
 * lors d'un rendu client. Sans cookie, le thème suit la préférence système, en
 * CSS pur.
 *
 * Les deux icônes sont rendues et leur visibilité est pilotée en CSS par
 * l'attribut `data-theme` : le HTML serveur et le HTML hydraté restent
 * identiques.
 */
export default function ThemeToggle() {
  const light = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = () => {
    const next = light ? DARK : LIGHT;
    const element = themeRoot();
    if (element) element.dataset.theme = next;
    document.cookie = `${COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
  };

  return (
    <button
      type="button"
      className={styles.loginThemeToggle}
      onClick={toggle}
      aria-pressed={light}
      aria-label="Basculer entre le thème clair et le thème sombre"
      title="Thème clair / sombre"
    >
      <span className={styles.loginThemeIconDark}>
        <Moon size={18} strokeWidth={2} />
      </span>
      <span className={styles.loginThemeIconLight}>
        <Sun size={18} strokeWidth={2} />
      </span>
    </button>
  );
}
