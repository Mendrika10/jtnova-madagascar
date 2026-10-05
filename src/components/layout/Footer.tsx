import Link from "next/link";
import styles from "./Footer.module.css";

const navLinks = [
  { label: "Accueil", href: "/" },
  { label: "A propos", href: "/a-propos" },
  { label: "Projets", href: "/projets" },
  { label: "Competences", href: "/competences" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      {/* CTA centré principal */}
      {/* <div className={styles.ctaSection}>
        <div className={styles.availableBadge}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--color-accent)" aria-hidden="true">
            <path d="M13 2L4.5 13.5H11L10 22L20.5 10H14L13 2Z"/>
          </svg>
          Disponible pour des projets
        </div>
        <h2 className={styles.ctaTitle}>
          Créons votre prochaine<br />grande idée.
        </h2>
        <Link href="/contact" className={styles.ctaBtn}>
          Me contacter
        </Link>
      </div> */}

      {/* Bottom bar */}
      <div className={styles.bottomBar}>
        <div className={styles.bottomInner}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoBadge}>
              <img
                src="/images/logo.png"
                alt="Jtnova"
                className={styles.logoImg}
              />
            </span>
          </Link>
          {/* <nav className={styles.nav}>
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} className={styles.navLink}>
                {l.label}
              </Link>
            ))}
          </nav> */}
          <p className={styles.copy}>© {year} Jtnova | Agence Web & Digital</p>
        </div>
      </div>
    </footer>
  );
}
