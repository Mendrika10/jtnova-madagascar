import type { Metadata } from "next";
import Link from "next/link";
import { FilePlus } from "@deemlol/next-icons";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { listTechLabels } from "@/lib/admin-projects";
import ProjectForm from "@/components/admin/ProjectForm";
import styles from "../../../admin.module.css";

export const metadata: Metadata = {
  title: "Nouvelle réalisation | Administration Jtnova",
  robots: { index: false, follow: false },
};

export default async function NewProjectPage() {
  // Propositions du sélecteur de technologies : celles déjà utilisées. Sans
  // banque configurée, le sélecteur garde sa liste de base.
  const supabase = await createSupabaseServerClient();
  const techOptions = supabase ? await listTechLabels(supabase) : [];

  return (
    <div className={styles.panel}>
      <p className={styles.breadcrumb}>
        <Link href="/admin/realisations">← Réalisations</Link>
      </p>
      <div className={styles.titleRow}>
        <span className={styles.titleIcon} aria-hidden>
          <FilePlus size={18} strokeWidth={2} />
        </span>
        <span className={styles.titleBlock}>
          <h1 className={styles.pageTitle}>Nouvelle réalisation</h1>
          <p className={styles.subtitle}>
            Renseignez les informations puis enregistrez : elle apparaîtra sur le
            site dès qu&apos;elle sera publiée.
          </p>
        </span>
      </div>
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
        techOptions={techOptions}
        imagesPanel={
          <p className={styles.placeholder}>
            Les images s&apos;ajoutent après l&apos;enregistrement : créez la
            réalisation, puis ouvrez l&apos;onglet « Images » de sa fiche pour
            envoyer la galerie.
          </p>
        }
      />
    </div>
  );
}
