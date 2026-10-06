import type { Metadata } from "next";
import styles from "../../admin.module.css";

export const metadata: Metadata = {
  title: "Messages | Administration Jtnova",
  robots: { index: false, follow: false },
};

export default function AdminMessagesPage() {
  return (
    <>
      <h1 className={styles.pageTitle}>Messages</h1>
      <p className={styles.placeholder}>
        Boîte de réception des demandes de contact — livrée en&nbsp;S6.
      </p>
    </>
  );
}
