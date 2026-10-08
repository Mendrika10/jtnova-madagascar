import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getProjectForEdit } from "@/lib/admin-projects";
import { toProjectDetail } from "@/lib/content";
import ProjectDetail from "@/components/projets/ProjectDetail";
import styles from "../../../../admin.module.css";

export const metadata: Metadata = {
  title: "Aperçu | Administration Jtnova",
  robots: { index: false, follow: false },
};

export default async function PreviewProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  if (!supabase) notFound();

  const data = await getProjectForEdit(supabase, id);
  if (!data) notFound();

  const detail = toProjectDetail(
    data.project,
    data.images,
    data.tech,
    data.highlights,
  );

  return (
    <div className={styles.previewPage}>
      <div className={styles.previewBar}>
        <span>Aperçu — {data.project.published ? "publiée" : "brouillon"}</span>
        <Link href={`/admin/realisations/${id}`} className={styles.linkBtn}>
          Retour à l&apos;édition
        </Link>
      </div>
      <div className={styles.previewSurface}>
        <ProjectDetail data={detail} />
      </div>
    </div>
  );
}
