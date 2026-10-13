"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { ChevronDown, ChevronUp, Menu, Trash } from "@deemlol/next-icons";
import { deleteImageAction, reorderImagesAction } from "@/app/admin/actions";
import ConfirmButton from "@/components/admin/ConfirmButton";
import styles from "@/app/admin/admin.module.css";

export type GalleryImage = {
  id: string;
  url: string;
  alt: string;
};

/**
 * Galerie d'une réalisation : liste de lignes réordonnables.
 *
 * Une ligne = une poignée de glisser-déposer, la position, la vignette, le
 * texte alternatif et une suppression discrète. L'ordre vit en local pour être
 * immédiat, puis l'ordre complet est envoyé à `reorderImagesAction` ; en cas
 * d'échec la liste revient à son état d'avant. Trois voies d'accès au même
 * réordonnancement : la souris (glisser-déposer), le clavier (flèches haut/bas
 * sur la poignée) et le tactile (repli ↑/↓, seul moyen sans souris ni clavier).
 *
 * Après un déplacement, la ligne concernée est mise en avant une fois
 * (surbrillance + glissement, cf. `admin.module.css`) : le changement de place
 * reste visible même quand les vignettes se ressemblent.
 */
export default function ImageGallery({
  projectId,
  images,
}: {
  projectId: string;
  images: GalleryImage[];
}) {
  const listKey = images
    .map((image) => image.id)
    .sort()
    .join("|");
  const [order, setOrder] = useState<string[]>(() =>
    images.map((image) => image.id),
  );
  const [seenListKey, setSeenListKey] = useState(listKey);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropAt, setDropAt] = useState<number | null>(null);
  const [status, setStatus] = useState("");
  const [moved, setMoved] = useState<{
    id: string;
    direction: "up" | "down";
    nonce: number;
  } | null>(null);
  const [pending, startTransition] = useTransition();
  const rowRefs = useRef(new Map<string, HTMLLIElement>());

  // Relance l'animation de la ligne déplacée après chaque déplacement : React
  // ne remet pas la classe si elle est déjà posée (même ligne déplacée deux
  // fois de suite), on force donc un redémarrage via l'animation en ligne,
  // avant de lever la mise en avant.
  useEffect(() => {
    if (!moved) return;
    const row = rowRefs.current.get(moved.id);
    if (row) {
      row.style.animation = "none";
      void row.offsetWidth;
      row.style.animation = "";
    }
    const timer = window.setTimeout(() => setMoved(null), 950);
    return () => window.clearTimeout(timer);
  }, [moved]);

  // Réajustement pendant le rendu (motif documenté par React) : quand la
  // composition de la galerie change côté serveur (ajout, suppression),
  // l'ordre local reprend celui de la base. Tant que la composition est la
  // même, l'ordre affiché reste celui de l'utilisateur.
  if (seenListKey !== listKey) {
    setSeenListKey(listKey);
    setOrder(images.map((image) => image.id));
  }

  const byId = new Map(images.map((image) => [image.id, image]));
  const rows = order
    .map((id) => byId.get(id))
    .filter((image): image is GalleryImage => Boolean(image));

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

  function commit(next: string[], id: string, position: number) {
    const previous = order;
    const from = previous.indexOf(id);
    const to = next.indexOf(id);
    setOrder(next);
    setStatus(`Image « ${byId.get(id)?.alt ?? ""} » en position ${position}.`);
    // Mise en avant immédiate (l'ordre affiché change tout de suite) ; annulée
    // avec le retour à l'état précédent si l'enregistrement échoue.
    setMoved((current) => ({
      id,
      direction: to > from ? "down" : "up",
      nonce: (current?.nonce ?? 0) + 1,
    }));
    startTransition(async () => {
      const result = await reorderImagesAction(projectId, next);
      if (!result.ok) {
        setOrder(previous);
        setMoved(null);
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

  function handleDragStart(
    event: React.DragEvent<HTMLButtonElement>,
    id: string,
  ) {
    setDraggedId(id);
    setDropAt(order.indexOf(id));
    const row = event.currentTarget.closest("li");
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", id);
      if (row) event.dataTransfer.setDragImage(row, 20, 16);
    }
  }

  function handleDragOver(event: React.DragEvent<HTMLLIElement>, index: number) {
    if (draggedId === null) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
    const rect = event.currentTarget.getBoundingClientRect();
    const after = event.clientY > rect.top + rect.height / 2;
    const next = after ? index + 1 : index;
    setDropAt((current) => (current === next ? current : next));
  }

  function handleDrop(event: React.DragEvent<HTMLLIElement>) {
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
        Changer l&apos;ordre des images avec le drag &amp; drop : attrapez la
        poignée à gauche d&apos;une ligne, déplacez-la, relâchez.
        <span className={styles.srOnly} role="status" aria-live="polite">
          {status}
        </span>
        {pending ? (
          <span className={styles.orderSaving}>Enregistrement…</span>
        ) : null}
      </p>

      <ul className={styles.imageList}>
        {rows.map((image, index) => {
          const isMoved = moved?.id === image.id;
          const rowClass = [
            styles.imageRow,
            image.id === draggedId ? styles.imageRowDragging : "",
            dropTarget?.row === index
              ? dropTarget.after
                ? styles.imageRowDropAfter
                : styles.imageRowDropBefore
              : "",
            isMoved ? styles.imageRowMoved : "",
            isMoved
              ? moved.direction === "down"
                ? styles.imageRowMovedDown
                : styles.imageRowMovedUp
              : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <li
              key={image.id}
              ref={(node) => {
                if (node) rowRefs.current.set(image.id, node);
                else rowRefs.current.delete(image.id);
              }}
              className={rowClass}
              onDragOver={(event) => handleDragOver(event, index)}
              onDrop={handleDrop}
            >
              <span className={styles.imageGrip}>
                <button
                  type="button"
                  className={styles.dragHandle}
                  draggable
                  aria-label={`Réordonner « ${image.alt} » (glisser-déposer, ou flèches haut et bas au clavier)`}
                  title="Glisser pour changer l'ordre"
                  onDragStart={(event) => handleDragStart(event, image.id)}
                  onDragEnd={handleDragEnd}
                  onKeyDown={(event) =>
                    handleOrderKeyDown(event, image.id, index)
                  }
                >
                  <Menu size={15} strokeWidth={2} aria-hidden />
                </button>
                <span className={styles.imageNumber} aria-hidden>
                  {index + 1}
                </span>
              </span>

              <span className={styles.imageThumbBox}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt={image.alt}
                  className={styles.imageThumb}
                />
              </span>

              <span className={styles.imageText}>
                <span className={styles.imageAlt} title={image.alt}>
                  {image.alt}
                </span>
                <span className={styles.imagePosition}>
                  Position {index + 1} sur {rows.length}
                </span>
              </span>

              {/* Repli sans souris : flèches ↑/↓, comme la liste des réalisations. */}
              <span className={styles.imageFallback}>
                <button
                  type="button"
                  className={styles.iconAction}
                  disabled={index === 0}
                  aria-label={`Monter l'image « ${image.alt} »`}
                  title="Monter"
                  onClick={() => applyMove(image.id, index - 1)}
                >
                  <ChevronUp size={14} strokeWidth={2.2} aria-hidden />
                </button>
                <button
                  type="button"
                  className={styles.iconAction}
                  disabled={index === lastIndex}
                  aria-label={`Descendre l'image « ${image.alt} »`}
                  title="Descendre"
                  onClick={() => applyMove(image.id, index + 2)}
                >
                  <ChevronDown size={14} strokeWidth={2.2} aria-hidden />
                </button>
              </span>

              <span className={styles.imageActions}>
                <form action={deleteImageAction}>
                  <input type="hidden" name="image_id" value={image.id} />
                  <input type="hidden" name="project_id" value={projectId} />
                  <ConfirmButton
                    message={`Supprimer l'image « ${image.alt} » ?`}
                    className={styles.imageDelete}
                  >
                    <Trash size={15} strokeWidth={2} aria-hidden />
                    <span className={styles.srOnly}>
                      Supprimer l&apos;image « {image.alt} »
                    </span>
                  </ConfirmButton>
                </form>
              </span>
            </li>
          );
        })}
      </ul>
    </>
  );
}
