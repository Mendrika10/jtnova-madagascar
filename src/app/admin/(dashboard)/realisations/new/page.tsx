import type { Metadata } from "next";
import Link from "next/link";
import ProjectForm from "@/components/admin/ProjectForm";
import styles from "../../../admin.module.css";

export const metadata: Metadata = {
  title: "Nouvelle réalisation | Administration Jtnova",
  robots: { index: false, follow: false },
};

export default function NewProjectPage() {
  return (
    <>
      <p className={styles.breadcrumb}>
        <Link href="/admin/realisations">← Réalisations</Link>
      </p>
      <h1 className={styles.pageTitle}>Nouvelle réalisation</h1>
      <ProjectForm
        initial={{
          title: "",
          slug: "",
          tag: "",
          category: "",
          year: "",
          description: "",
          presentation: "",
          explication: "",
          security: "",
          performance: "",
          client_name: "",
          live_url: "",
          repo_url: "",
          video_url: "",
          video_poster: "",
          published: false,
          tech: "",
          highlights: "",
        }}
      />
    </>
  );
}
