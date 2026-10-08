"use client";

import { useFormStatus } from "react-dom";
import styles from "../admin.module.css";

/**
 * UI-ADMIN — bouton « Se connecter » avec état de chargement.
 *
 * L'état vient de `useFormStatus` : il reflète l'exécution réelle de la Server
 * Action du formulaire parent (`loginAction`), sans `useState` ni logique
 * dupliquée. Rendu identique en SSR (pending = false), donc pas de saut
 * d'hydratation.
 */
export default function LoginSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className={`${styles.loginSubmit} ${pending ? styles.loginSubmitPending : ""}`}
      disabled={pending}
      aria-busy={pending}
    >
      <span aria-live="polite">
        {pending ? "Connexion…" : "Se connecter"}
      </span>

      {pending ? (
        <span className={styles.loginSpinner} aria-hidden="true" />
      ) : (
        <svg
          className={styles.loginArrow}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M5 12h14M13 6l6 6-6 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
