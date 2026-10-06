import type { Metadata } from "next";
import styles from "../../admin.module.css";

export const metadata: Metadata = {
  title: "Réalisations | Administration Jtnova",
  robots: { index: false, follow: false },
};

export default function AdminRealisationsPage() {
  return (
    <>
      <h1 className={styles.pageTitle}>Réalisations</h1>
      <p className={styles.placeholder}>
        Gestion des réalisations — livrée en&nbsp;S4 (liste et réordonnancement,
        création, édition, upload d&apos;images, brouillon/publié).
      </p>
    </>
  );
}
