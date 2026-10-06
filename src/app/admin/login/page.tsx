import type { Metadata } from "next";
import { loginAction } from "./actions";
import styles from "../admin.module.css";

export const metadata: Metadata = {
  title: "Connexion | Administration Jtnova",
  robots: { index: false, follow: false },
};

const ERROR_MESSAGES: Record<string, string> = {
  required: "Renseignez votre e-mail et votre mot de passe.",
  invalid: "Identifiants invalides.",
  config: "Supabase n'est pas configuré sur cet environnement.",
  forbidden: "Ce compte n'a pas les droits d'administration.",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}) {
  const params = await searchParams;
  const redirectTo = params.redirect ?? "/admin";
  const error = params.error ? ERROR_MESSAGES[params.error] : null;

  return (
    <main className={styles.loginPage}>
      <form action={loginAction} className={styles.loginCard}>
        <h1 className={styles.loginTitle}>Administration</h1>
        <p className={styles.loginSub}>Connectez-vous pour gérer le site.</p>

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <input type="hidden" name="redirect" value={redirectTo} />

        <label className={styles.label}>
          E-mail
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className={styles.input}
          />
        </label>

        <label className={styles.label}>
          Mot de passe
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className={styles.input}
          />
        </label>

        <button type="submit" className={styles.submit}>
          Se connecter
        </button>
      </form>
    </main>
  );
}
