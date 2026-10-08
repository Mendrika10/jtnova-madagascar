import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import Image from "next/image";
import { Outfit } from "next/font/google";
import {
  BarChart,
  Folder,
  MessageSquare,
  Shield,
  Sparkles,
} from "@deemlol/next-icons";
import StarField from "@/components/accueil/StarField";
import FloatingLogos from "@/components/accueil/FloatingLogos";
import LoginSubmitButton from "./SubmitButton";
import ThemeToggle from "./ThemeToggle";
import { loginAction } from "./actions";
import styles from "../admin.module.css";

/**
 * Sections réellement présentes dans l'espace d'administration (mêmes entrées
 * que la navigation du layout admin). Chacune porte une icône et sa teinte,
 * affichées dans la bande défilante de la colonne marque.
 */
/**
 * Police de la page de connexion, reprise de la capture de référence :
 * Outfit (géométrique) — identifiée par comparaison de glyphes avec la capture
 * (voir le rapport de séance). Chargée par `next/font` (auto-hébergée, aucune
 * requête externe) et appliquée au seul périmètre de cette page : le reste du
 * site continue d'utiliser Satoshi via `--font-heading`.
 */
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-outfit",
  display: "swap",
});

const ADMIN_SECTIONS = [
  { label: "Tableau de bord", Icon: BarChart, tone: "#22d3ee" },
  { label: "Réalisations", Icon: Folder, tone: "#a78bfa" },
  { label: "Personnalisation", Icon: Sparkles, tone: "#fbbf24" },
  { label: "Messages", Icon: MessageSquare, tone: "#ff7ab6" },
  { label: "Santé", Icon: Shield, tone: "#34d399" },
];

export const metadata: Metadata = {
  title: "Connexion | Administration Jtnova",
  robots: { index: false, follow: false },
};

/** Cookie du choix de thème, partagé avec `ThemeToggle`. */
const THEME_COOKIE = "jtnova-admin-theme";

const ERROR_MESSAGES: Record<string, string> = {
  required: "Renseignez votre e-mail et votre mot de passe.",
  invalid: "Identifiants invalides.",
  config: "Supabase n'est pas configuré sur cet environnement.",
  forbidden: "Ce compte n'a pas les droits d'administration.",
};

/**
 * UI-ADMIN — décor repris de la landing publique : nébuleuses + grille (pseudo-
 * éléments de `.loginPage`), le champ d'étoiles public `<StarField />` et les
 * logos tech flottants `<FloatingLogos />` (dérive sur tout le fond).
 * Le site public n'est pas modifié : son composant est seulement réutilisé.
 * Le formulaire et la logique de connexion restent inchangés.
 */
export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}) {
  const params = await searchParams;
  const redirectTo = params.redirect ?? "/admin";
  const error = params.error ? ERROR_MESSAGES[params.error] : null;

  // Choix explicite de thème, lu dans le cookie et rendu ici : le thème est donc
  // déjà appliqué au premier octet de HTML (aucun flash), sans script inline —
  // un `<script>` rendu par un composant React ne s'exécute pas côté client.
  // Sans cookie, aucun attribut : le thème suit alors la préférence système,
  // en CSS pur (voir `admin.module.css`).
  const storedTheme = (await cookies()).get(THEME_COOKIE)?.value;
  const explicitTheme =
    storedTheme === "light" || storedTheme === "dark" ? storedTheme : undefined;

  return (
    <main
      className={`${outfit.variable} ${styles.loginPage}`}
      data-theme={explicitTheme}
      data-login-root=""
    >
      <div className={styles.loginDecor} aria-hidden="true">
        <StarField />
        <FloatingLogos />
      </div>

      <ThemeToggle />

      <div className={styles.loginInner}>
        {/* Colonne marque (gauche) — structure de la capture de référence. */}
        <div className={styles.loginBrandCol}>
          {/* Logo réel du site (wordmark sombre) sur pastille claire — même
              traitement que la navbar. F5.8 : le logo est un réglage ; ici on
              affiche l'actif par défaut pour rester hors des requêtes (DATA). */}
          <span className={styles.loginLogoBadge}>
            <Image
              src="/images/logo.png"
              alt="Jtnova"
              className={styles.loginLogoImg}
              width={732}
              height={231}
              sizes="150px"
              priority
            />
          </span>

          <p className={styles.loginEyebrow}>Plateforme éditoriale</p>

          <p className={styles.loginHeadline}>
            Publiez{" "}
            <span className={styles.loginHeadlineAccent}>vos réalisations</span>
            , ajustez chaque texte et répondez à{" "}
            <span className={styles.loginHeadlineAccent}>vos messages</span>{" "}
            depuis un seul endroit.
          </p>

          {/* Bande défilante : les 5 sections de l'admin, chacune précédée de
              son icône colorée. Le groupe est dupliqué pour un défilement
              continu sans saut (le second est masqué aux lecteurs d'écran). */}
          <div className={styles.loginMarquee}>
            <div className={styles.loginMarqueeTrack}>
              {[0, 1].map((group) => (
                <ul
                  key={group}
                  className={styles.loginMarqueeGroup}
                  aria-hidden={group === 1 ? true : undefined}
                >
                  {ADMIN_SECTIONS.map(({ label, Icon, tone }) => (
                    <li
                      key={label}
                      className={styles.loginPill}
                      style={{ "--tone": tone } as CSSProperties}
                    >
                      <span className={styles.loginPillIcon} aria-hidden="true">
                        <Icon size={15} strokeWidth={2.4} />
                      </span>
                      {label}
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        </div>

        {/* Carte de connexion (droite) — mêmes champs, mêmes boutons. */}
        <form action={loginAction} className={styles.loginCard}>
          <h1 className={styles.loginTitle}>Connexion</h1>
          <p className={styles.loginSub}>Connectez-vous pour gérer le site.</p>

          {error && (
            <p className={`${styles.error} ${styles.loginError}`} role="alert">
              {error}
            </p>
          )}

          <input type="hidden" name="redirect" value={redirectTo} />

          <label className={styles.loginLabel}>
            Adresse e-mail
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="vous@jtnova.mg"
              className={styles.loginInput}
            />
          </label>

          <label className={styles.loginLabel}>
            Mot de passe
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className={styles.loginInput}
            />
          </label>

          <LoginSubmitButton />

          <p className={styles.loginFootnote}>
            Accès réservé à l&apos;administration Jtnova.
          </p>
        </form>
      </div>

      {/* Pied de page minimal — remplace la bande défilante du bas. */}
      <footer className={styles.loginFooter}>
        © {new Date().getFullYear()} Jtnova
      </footer>
    </main>
  );
}
