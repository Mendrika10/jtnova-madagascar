"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import { Menu, Sidebar, X } from "@deemlol/next-icons";
import styles from "../admin.module.css";

/**
 * UI-ADMIN — coquille de l'espace admin.
 *
 * Deux comportements client :
 *
 * **Mobile (< 900 px)** — la barre latérale devient un **tiroir** : un bouton
 * hamburger l'ouvre, la fermeture se fait par le bouton ✕, l'overlay, la
 * touche `Échap` ou le clic sur un lien de navigation.
 *
 * **Bureau (≥ 900 px)** — la barre latérale peut être **réduite en rail
 * d'icônes** (bouton de bascule en tête de barre) : les libellés disparaissent,
 * les compteurs passent en pastille sur le coin de l'icône et le nom de
 * l'écran s'affiche en info-bulle native (`title`). La préférence est retenue
 * dans `localStorage` (`admin.sidebar.collapsed`) et lue via
 * `useSyncExternalStore` — le motif prévu par React pour un état externe :
 * aucun écart d'hydratation (le rendu serveur part de « déplié »), aucun
 * `setState` dans un effet.
 *
 * Le contenu (sidebar + zone principale) reste rendu côté serveur : il est
 * seulement reçu comme propriété de ce composant client, la frontière RSC
 * sérialise le rendu, pas les composants.
 */

const BREAKPOINT = "(max-width: 900px)";
const STORAGE_KEY = "admin.sidebar.collapsed";

/* ── Store de la préférence « réduit » ──────────────────────────────────────
   `localStorage` n'émet pas d'événement dans l'onglet qui écrit : ce petit
   pub-sub maison notifie les abonnés du même onglet, l'événement `storage`
   (ajouté ici) couvre les autres onglets de la même origine. */

const collapsedListeners = new Set<() => void>();

function subscribeCollapsed(onChange: () => void): () => void {
  collapsedListeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    collapsedListeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** Instantané client : la préférence rangée, « déplié » sinon. */
function readCollapsed(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

/** Instantané serveur : la barre est toujours dépliée au premier rendu. */
function readCollapsedServer(): boolean {
  return false;
}

function writeCollapsed(next: boolean): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
  } catch {
    // Stockage indisponible (navigation privée stricte) : la préférence
    // reste valable pour la session en cours seulement.
  }
  for (const listener of collapsedListeners) listener();
}

export default function AdminShell({
  sidebar,
  children,
}: {
  sidebar: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const collapsed = useSyncExternalStore(
    subscribeCollapsed,
    readCollapsed,
    readCollapsedServer,
  );
  const burgerRef = useRef<HTMLButtonElement>(null);

  const toggleCollapsed = useCallback(() => {
    writeCollapsed(!readCollapsed());
  }, []);

  // `Échap` referme le tiroir ; le défilement de la page est gelé pendant
  // qu'il est ouvert (uniquement sur mobile : le hamburger n'existe pas
  // au-delà de 900 px, on ne risque donc pas de bloquer le bureau).
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);

    const mobile = window.matchMedia(BREAKPOINT);
    if (mobile.matches) {
      const previous = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", onKeyDown);
        document.body.style.overflow = previous;
      };
    }
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Un clic sur un lien du tiroir le referme : la navigation cliente change
  // la page mais le tiroir, monté une fois dans le layout, resterait ouvert.
  const onSidebarClick = useCallback(
    (event: ReactMouseEvent<HTMLElement>) => {
      if ((event.target as HTMLElement).closest('a, button[type="submit"]')) {
        setOpen(false);
      }
    },
    [],
  );

  return (
    <div
      className={styles.shell}
      data-menu-open={open ? "true" : undefined}
      data-collapsed={collapsed ? "true" : undefined}
    >
      {/* Barre de titre mobile : hamburger + marque. Invisible ≥ 900 px. */}
      <div className={styles.mobileBar}>
        <button
          ref={burgerRef}
          type="button"
          className={styles.burgerBtn}
          aria-expanded={open}
          aria-controls="admin-sidebar"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? (
            <X size={20} strokeWidth={2} />
          ) : (
            <Menu size={20} strokeWidth={2} />
          )}
        </button>
        <span className={styles.mobileBrand}>
          Jtnova <em>Administration</em>
        </span>
      </div>

      {/* Overlay : clic = fermeture */}
      <button
        type="button"
        className={styles.scrim}
        tabIndex={-1}
        aria-label="Fermer le menu"
        onClick={() => setOpen(false)}
        aria-hidden={open ? undefined : "true"}
      />

      <aside
        id="admin-sidebar"
        className={styles.sidebar}
        onClick={onSidebarClick}
        aria-label="Navigation administration"
      >
        {/* Bascule bureau : en tête de barre. Le libellé visible accompagne
            l'état déplié ; dans le rail, il est masqué (icône seule). */}
        <button
          type="button"
          className={styles.collapseBtn}
          onClick={toggleCollapsed}
          aria-pressed={collapsed}
          title={collapsed ? "Déplier le menu" : "Réduire le menu"}
        >
          <Sidebar size={16} strokeWidth={2} aria-hidden />
          <span className={styles.collapseLabel}>Réduire le menu</span>
        </button>
        {sidebar}
      </aside>

      <div className={styles.main}>{children}</div>
    </div>
  );
}
