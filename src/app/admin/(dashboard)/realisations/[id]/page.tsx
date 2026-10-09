import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Eye, FileText, Folder, Trash } from "@deemlol/next-icons";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getProjectForEdit, listTechLabels } from "@/lib/admin-projects";
import { deleteImageAction } from "@/app/admin/actions";
import ProjectForm from "@/components/admin/ProjectForm";
import ImageUploader from "@/components/admin/ImageUploader";
import ConfirmButton from "@/components/admin/ConfirmButton";
import styles from "../../../admin.module.css";

export const metadata: Metadata = {
  title: "Éditer une réalisation | Administration Jtnova",
  robots: { index: false, follow: false },
};

export default async function EditProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    saved?: string;
    created?: string;
    images?: string;
    images_error?: string;
  }>;
}) {
  const { id } = await params;
  const flags = await searchParams;

  const supabase = await createSupabaseServerClient();
  if (!supabase) notFound();
  const [data, techOptions] = await Promise.all([
    getProjectForEdit(supabase, id),
    listTechLabels(supabase),
  ]);
  if (!data) notFound();

  const p = data.project;

  return (
    <div className={styles.panel}>
      <p className={styles.breadcrumb}>
        <Link href="/admin/realisations">← Réalisations</Link>
      </p>
      <div className={styles.pageHeader}>
        <div className={styles.titleRow}>
          <span className={styles.titleIcon} aria-hidden>
            <Folder size={18} strokeWidth={2} />
          </span>
          <span className={styles.titleBlock}>
            <h1 className={styles.pageTitle}>{p.title}</h1>
            <p className={styles.subtitle}>
              {p.slug} · {p.published ? "publiée" : "brouillon"}
            </p>
          </span>
        </div>
        <Link
          href={`/admin/realisations/${p.id}/apercu`}
          className={styles.secondaryBtn}
        >
          <Eye size={14} strokeWidth={2} aria-hidden />
          Aperçu
        </Link>
      </div>

      {flags.created && <p className={styles.notice}>Réalisation créée.</p>}
      {flags.saved && <p className={styles.notice}>Modifications enregistrées.</p>}
      {flags.images && <p className={styles.notice}>Images mises à jour.</p>}
      {flags.images_error && (
        <p className={styles.error} role="alert">
          L&apos;enregistrement des images a échoué. Réessayez.
        </p>
      )}

      <ProjectForm
        initial={{
          id: p.id,
          title: p.title,
          slug: p.slug,
          tag: p.tag ?? "",
          category: p.category ?? "",
          year: p.year ?? "",
          description: p.description,
          presentation: p.presentation ?? "",
          explication: p.explication ?? "",
          security: p.security ?? "",
          performance: p.performance ?? "",
          client_name: p.client_name ?? "",
          live_url: p.live_url ?? "",
          repo_url: p.repo_url ?? "",
          video_url: p.video_url ?? "",
          video_poster: p.video_poster ?? "",
          published: p.published,
          tech: data.tech.map((t) => t.label).join("\n"),
          highlights: data.highlights.map((h) => h.text).join("\n"),
        }}
        initialTab={flags.images || flags.images_error ? "images" : undefined}
        techOptions={techOptions}
        imagesPanel={
          <section className={styles.section}>
            <div className={styles.sectionTitleRow}>
              <span className={styles.sectionIcon} aria-hidden>
                <FileText size={15} strokeWidth={2} />
              </span>
              <h2 className={styles.sectionTitle}>Images ({data.images.length})</h2>
            </div>

            {data.images.length === 0 ? (
              <p className={styles.placeholder}>Aucune image pour l&apos;instant.</p>
            ) : (
              <ul className={styles.imageList}>
                {data.images.map((img) => (
                  <li key={img.id} className={styles.imageItem}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={img.alt} className={styles.imageThumb} />
                    <div className={styles.imageMeta}>
                      <code className={styles.code}>{img.alt}</code>
                      <form action={deleteImageAction}>
                        <input type="hidden" name="image_id" value={img.id} />
                        <input type="hidden" name="project_id" value={p.id} />
                        <ConfirmButton
                          message="Supprimer cette image ?"
                          className={`${styles.iconAction} ${styles.iconActionDanger}`}
                        >
                          <Trash size={15} strokeWidth={2} aria-hidden />
                          <span className={styles.srOnly}>
                            Supprimer l&apos;image « {img.alt} »
                          </span>
                        </ConfirmButton>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <ImageUploader projectId={p.id} />
          </section>
        }
      />
    </div>
  );
}
