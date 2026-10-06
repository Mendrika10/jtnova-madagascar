import Link from "next/link";
import styles from "./Footer.module.css";
import type { SocialLink } from "@/lib/site-settings";

export default function Footer({
  logoUrl,
  socials,
}: {
  logoUrl?: string;
  socials?: SocialLink[];
}) {
  const year = new Date().getFullYear();
  // F5.6 — les réseaux sociaux saisis dans l'admin alimentent le pied de page.
  // Un lien vide masque l'entrée (l'admin peut donc n'en garder qu'un).
  const links = (socials ?? []).filter((s) => s.label && s.href);

  return (
    <footer className={styles.footer}>
      {/* Bottom bar */}
      <div className={styles.bottomBar}>
        <div className={styles.bottomInner}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoBadge}>
              <img
                src={logoUrl || "/images/logo.png"}
                alt="Jtnova"
                className={styles.logoImg}
              />
            </span>
          </Link>
          {links.length > 0 && (
            <nav className={styles.nav} aria-label="Réseaux sociaux">
              {links.map((s) => (
                <a
                  key={`${s.label}-${s.href}`}
                  href={s.href}
                  className={styles.navLink}
                  target={s.href.startsWith("http") ? "_blank" : undefined}
                  rel={
                    s.href.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                >
                  {s.label}
                </a>
              ))}
            </nav>
          )}
          <p className={styles.copy}>© {year} Jtnova | Agence Web & Digital</p>
        </div>
      </div>
    </footer>
  );
}
