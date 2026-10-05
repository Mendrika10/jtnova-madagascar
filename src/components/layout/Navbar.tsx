"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, cubicBezier, type Variants } from "framer-motion";
import { PiSun, PiMoon } from "react-icons/pi";
import styles from "./Navbar.module.css";

const expo = cubicBezier(0.16, 1, 0.3, 1);

// Entrée initiale — descend depuis le haut
const navbarVariant: Variants = {
  hidden: { y: -80, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.8, ease: expo, delay: 0.1 },
  },
};

// Stagger des liens
const linksWrap: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.4 } },
};

const linkItem: Variants = {
  hidden: { opacity: 0, y: -10, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.45, ease: expo },
  },
};

// CTA — fade depuis la droite
const ctaVariant: Variants = {
  hidden: { opacity: 0, x: 16 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.55, ease: expo, delay: 0.75 },
  },
};

const navLinks = [
  { label: "Accueil", href: "/" },
  { label: "À propos", href: "/a-propos" },
  { label: "Services", href: "/services" },
  { label: "Réalisations", href: "/projets" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      dark ? "dark" : "light",
    );
  }, [dark]);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <motion.nav
      className={`${styles.navbar} ${scrolled ? styles.scrolled : ""}`}
      variants={navbarVariant}
      initial="hidden"
      animate="show"
    >
      <div className={styles.inner}>
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: expo, delay: 0.2 }}
        >
          <Link href="/" className={styles.logo}>
            <span className={styles.logoBadge}>
              <img
                src="/images/logo.png"
                alt="Jtnova"
                className={styles.logoImg}
              />
            </span>
          </Link>
        </motion.div>

        {/* Desktop links */}
        <motion.ul
          className={styles.links}
          variants={linksWrap}
          initial="hidden"
          animate="show"
        >
          {navLinks.map((link) => (
            <motion.li key={link.href} variants={linkItem}>
              <Link
                href={link.href}
                className={`${styles.link} ${pathname === link.href ? styles.active : ""}`}
              >
                {link.label}
              </Link>
            </motion.li>
          ))}
        </motion.ul>

        {/* Bouton thème */}
        {/* <motion.div
          className={styles.ctaWrap}
          variants={ctaVariant}
          initial="hidden"
          animate="show"
        >
          <button
            className={styles.themeBtn}
            onClick={() => setDark((d) => !d)}
            aria-label={dark ? "Passer en mode clair" : "Passer en mode sombre"}
          >
            <motion.span
              key={dark ? "moon" : "sun"}
              initial={{ opacity: 0, rotate: -30, scale: 0.7 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 30, scale: 0.7 }}
              transition={{ duration: 0.3, ease: expo }}
            >
              {dark ? <PiMoon size={20} /> : <PiSun size={20} />}
            </motion.span>
          </button>
        </motion.div> */}

        {/* Burger mobile */}
        <button
          className={`${styles.burger} ${open ? styles.burgerOpen : ""}`}
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`${styles.mobileMenu} ${open ? styles.mobileOpen : ""}`}>
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`${styles.mobileLink} ${pathname === link.href ? styles.active : ""}`}
          >
            {link.label}
          </Link>
        ))}
        <Link href="/contact" className={styles.mobileCta}>
          Me contacter
        </Link>
      </div>
    </motion.nav>
  );
}
