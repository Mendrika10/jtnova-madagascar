"use client";

import { useEffect } from "react";

/**
 * F7.8 — frontière d'erreur de l'application : toute erreur de rendu non
 * rattrapée est affichée proprement **et** remontée à `/api/log-error` pour
 * apparaître dans la page admin « Santé ».
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    void fetch("/api/log-error", {
      method: "POST",
      headers: { "content-type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        level: "error",
        source: "client",
        message: error.message || "Erreur de rendu",
        stack: error.stack,
        path: window.location.pathname,
        context: { digest: error.digest ?? null },
      }),
    }).catch(() => {
      // La remontée ne doit jamais gêner l'utilisateur.
    });
  }, [error]);

  return (
    <main
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        padding: "4rem 1.5rem",
        textAlign: "center",
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: "0.8rem",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--color-accent)",
        }}
      >
        Erreur inattendue
      </p>
      <h1 style={{ margin: 0, fontSize: "clamp(1.6rem, 4vw, 2.4rem)" }}>
        Quelque chose s&apos;est mal passé.
      </h1>
      <p style={{ margin: 0, maxWidth: "46ch", opacity: 0.75 }}>
        L&apos;incident a été enregistré. Vous pouvez réessayer — si le problème
        persiste, revenez plus tard ou utilisez la page contact.
      </p>
      <button
        type="button"
        onClick={reset}
        style={{
          marginTop: "0.5rem",
          padding: "0.75rem 1.4rem",
          borderRadius: "999px",
          border: "1px solid var(--color-accent)",
          background: "transparent",
          color: "inherit",
          cursor: "pointer",
          font: "inherit",
        }}
      >
        Réessayer
      </button>
    </main>
  );
}
