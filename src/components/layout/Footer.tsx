import Link from "next/link";
import Image from "next/image";
import styles from "./Footer.module.css";
import type { SocialLink } from "@/lib/site-settings";
import { isUsableHref } from "@/lib/links";
import { shouldSkipOptimizer } from "@/lib/images";

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
  // F7.3 — un `href` de bouchon (`#`) n'est pas un lien : le libellé reste
  // affiché mais n'est plus cliquable (0 lien mort).
  const links = (socials ?? []).filter((s) => s.label && s.href);

  return (
    <footer className={styles.footer}>
      {/* Bottom bar */}
      <div className={styles.bottomBar}>
        <div className={styles.bottomInner}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoBadge}>
              {/* F7.4 — logo optimisé (WebP + largeur adaptée). */}
              <Image
                src={logoUrl || "/images/logo.png"}
                alt="Jtnova"
                className={styles.logoImg}
                width={732}
                height={231}
                sizes="120px"
                unoptimized={shouldSkipOptimizer(logoUrl || "/images/logo.png")}
              />
            </span>
          </Link>
          {links.length > 0 && (
            <nav className={styles.nav} aria-label="Réseaux sociaux">
              {links.map((s) =>
                isUsableHref(s.href) ? (
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
                ) : (
                  <span key={`${s.label}-${s.href}`} className={styles.navLink}>
                    {s.label}
                  </span>
                ),
              )}
            </nav>
          )}
          <p className={styles.copy}>© {year} Jtnova | Agence Web & Digital</p>
        </div>
      </div>
    </footer>
  );
}
