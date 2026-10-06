import type { Metadata } from "next";
import styles from "../../admin.module.css";

export const metadata: Metadata = {
  title: "Personnalisation | Administration Jtnova",
  robots: { index: false, follow: false },
};

export default function AdminPersonnalisationPage() {
  return (
    <>
      <h1 className={styles.pageTitle}>Personnalisation</h1>
      <p className={styles.placeholder}>
        Édition du contenu du site (Hero, À propos, Services, Témoignages, FAQ,
        CTA, SEO, identité) — livrée en&nbsp;S5.
      </p>
    </>
  );
}
