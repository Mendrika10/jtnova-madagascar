"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  Edit,
  Eye,
  Menu,
  Trash,
} from "@deemlol/next-icons";
import {
  deleteProjectAction,
  moveProjectAction,
  reorderProjectsAction,
} from "@/app/admin/actions";
import ConfirmButton from "@/components/admin/ConfirmButton";
import styles from "../../admin.module.css";

export type OrderableProject = {
  id: string;
  title: string;
  slug: string;
  published: boolean;
};

/**
 * Liste des réalisations, réordonnable par glisser-déposer.
 *
 * L'ordre vit en local pour être immédiat, puis l'ordre complet est envoyé à
 * `reorderProjectsAction` ; en cas d'échec la liste revient à son état d'avant.
 * Trois voies d'accès au même réordonnancement : la souris (glisser-déposer),
 * le clavier (flèches haut/bas sur la poignée) et le tactile (repli ↑/↓, seul
 * moyen sans souris ni clavier).
 */
export default function OrderableProjects({
  projects,
}: {
  projects: OrderableProject[];
}) {
  const listKey = projects
    .map((project) => project.id)
    .sort()
    .join("|");
  const [order, setOrder] = useState<string[]>(() =>
    projects.map((project) => project.id),
  );
  const [seenListKey, setSeenListKey] = useState(listKey);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropAt, setDropAt] = useState<number | null>(null);
  const [status, setStatus] = useState("");
  const [pending, startTransition] = useTransition();

  // Réajustement pendant le rendu (motif documenté par React) : quand la
  // composition de la liste change côté serveur (création, suppression),
  // l'ordre local reprend celui de la base. Tant que la composition est la
  // même, l'ordre affiché reste celui de l'utilisateur — un rendu serveur
  // encore périmé ne peut donc pas annuler un déplacement en cours.
  if (seenListKey !== listKey) {
    setSeenListKey(listKey);
    setOrder(projects.map((project) => project.id));
  }

  const byId = new Map(projects.map((project) => [project.id, project]));
  const rows = order
    .map((id) => byId.get(id))
    .filter((project): project is OrderableProject => Boolean(project));

  const fromIndex = draggedId ? order.indexOf(draggedId) : -1;
  const lastIndex = rows.length - 1;

  // Trait d'insertion : `dropAt` est un index « avant retrait » (0 → devant la
  // première ligne, length → derrière la dernière).
  const dropTarget =
    draggedId !== null && dropAt !== null && fromIndex >= 0
      ? (() => {
          const target = dropAt > fromIndex ? dropAt - 1 : dropAt;
          if (target === fromIndex) return null;
          return {
            row: dropAt === order.length ? lastIndex : dropAt,
            after: dropAt === order.length,
          };
        })()
      : null;

  function announceMove(id: string, position: number) {
    const title = byId.get(id)?.title ?? "Réalisation";
    setStatus(`« ${title} » est maintenant en position ${position}.`);
  }

  function commit(next: string[], id: string, position: number) {
    const previous = order;
    setOrder(next);
    announceMove(id, position);
    startTransition(async () => {
      const result = await reorderProjectsAction(next);
      if (!result.ok) {
        setOrder(previous);
        setStatus(result.message ?? "L'ordre n'a pas pu être enregistré.");
      }
    });
  }

  function applyMove(id: string, insertAt: number) {
    const from = order.indexOf(id);
    if (from < 0 || insertAt < 0) return;
    const to = insertAt > from ? insertAt - 1 : insertAt;
    if (to === from || to >= order.length) return;
    const next = [...order];
    next.splice(from, 1);
    next.splice(to, 0, id);
    commit(next, id, to + 1);
  }

  function handleDragStart(event: React.DragEvent<HTMLButtonElement>, id: string) {
    setDraggedId(id);
    setDropAt(order.indexOf(id));
    const row = event.currentTarget.closest("tr");
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", id);
      if (row) event.dataTransfer.setDragImage(row, 20, 16);
    }
  }

  function handleDragOver(event: React.DragEvent<HTMLTableRowElement>, index: number) {
    if (draggedId === null) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
    const rect = event.currentTarget.getBoundingClientRect();
    const after = event.clientY > rect.top + rect.height / 2;
    const next = after ? index + 1 : index;
    setDropAt((current) => (current === next ? current : next));
  }

  function handleDrop(event: React.DragEvent<HTMLTableRowElement>) {
    event.preventDefault();
    const id = draggedId;
    const target = dropAt;
    setDraggedId(null);
    setDropAt(null);
    if (id !== null && target !== null) applyMove(id, target);
  }

  function handleDragEnd() {
    setDraggedId(null);
    setDropAt(null);
  }

  function handleOrderKeyDown(
    event: React.KeyboardEvent<HTMLButtonElement>,
    id: string,
    index: number,
  ) {
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
    event.preventDefault();
    if (event.key === "ArrowUp") {
      if (index === 0) return;
      applyMove(id, index - 1);
      return;
    }
    if (index === lastIndex) return;
    applyMove(id, index + 2);
  }

  return (
    <>
      <p className={styles.orderHint}>
        Changer l&apos;ordre des éléments avec le drag &amp; drop : attrapez la
        poignée à gauche d&apos;une ligne, déplacez-la, relâchez.
        <span className={styles.srOnly} role="status" aria-live="polite">
          {status}
        </span>
        {pending ? <span className={styles.orderSaving}>Enregistrement…</span> : null}
      </p>

      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Ordre</th>
              <th>Titre</th>
              <th>Slug</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((project, index) => {
              const rowClass = [
                project.id === draggedId ? styles.rowDragging : "",
                dropTarget?.row === index
                  ? dropTarget.after
                    ? styles.rowDropAfter
                    : styles.rowDropBefore
                  : "",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <tr
                  key={project.id}
                  className={rowClass || undefined}
                  onDragOver={(event) => handleDragOver(event, index)}
                  onDrop={handleDrop}
                >
                  <td className={styles.orderCell}>
                    <button
                      type="button"
                      className={styles.dragHandle}
                      draggable
                      aria-label={`Réordonner « ${project.title} » (glisser-déposer, ou flèches haut et bas au clavier)`}
                      title="Glisser pour changer l'ordre"
                      onDragStart={(event) => handleDragStart(event, project.id)}
                      onDragEnd={handleDragEnd}
                      onKeyDown={(event) => handleOrderKeyDown(event, project.id, index)}
                    >
                      <Menu size={15} strokeWidth={2} aria-hidden />
                    </button>
                    <span className={styles.orderIndex} aria-hidden>
                      {index + 1}
                    </span>
                    <span className={styles.orderFallback}>
                      <form action={moveProjectAction}>
                        <input type="hidden" name="id" value={project.id} />
                        <input type="hidden" name="direction" value="up" />
                        <button
                          type="submit"
                          className={styles.iconAction}
                          disabled={index === 0}
                          aria-label={`Monter « ${project.title} »`}
                          title="Monter"
                        >
                          <ChevronUp size={14} strokeWidth={2.2} aria-hidden />
                        </button>
                      </form>
                      <form action={moveProjectAction}>
                        <input type="hidden" name="id" value={project.id} />
                        <input type="hidden" name="direction" value="down" />
                        <button
                          type="submit"
                          className={styles.iconAction}
                          disabled={index === lastIndex}
                          aria-label={`Descendre « ${project.title} »`}
                          title="Descendre"
                        >
                          <ChevronDown size={14} strokeWidth={2.2} aria-hidden />
                        </button>
                      </form>
                    </span>
                  </td>
                  <td>{project.title}</td>
                  <td>
                    <code className={styles.code}>{project.slug}</code>
                  </td>
                  <td>
                    {project.published ? (
                      <span className={styles.badgeOk}>Publiée</span>
                    ) : (
                      <span className={styles.badgeDraft}>Brouillon</span>
                    )}
                  </td>
                  <td className={styles.actionsCell}>
                    <Link
                      href={`/admin/realisations/${project.id}`}
                      className={styles.iconAction}
                      aria-label={`Éditer « ${project.title} »`}
                      title="Éditer"
                    >
                      <Edit size={15} strokeWidth={2} aria-hidden />
                    </Link>
                    <Link
                      href={`/admin/realisations/${project.id}/apercu`}
                      className={styles.iconAction}
                      aria-label={`Aperçu de « ${project.title} »`}
                      title="Aperçu"
                    >
                      <Eye size={15} strokeWidth={2} aria-hidden />
                    </Link>
                    <form action={deleteProjectAction}>
                      <input type="hidden" name="id" value={project.id} />
                      <ConfirmButton
                        message={`Supprimer « ${project.title} » et tout son contenu ?`}
                        className={`${styles.iconAction} ${styles.iconActionDanger}`}
                      >
                        <Trash size={15} strokeWidth={2} aria-hidden />
                        <span className={styles.srOnly}>
                          Supprimer « {project.title} »
                        </span>
                      </ConfirmButton>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
