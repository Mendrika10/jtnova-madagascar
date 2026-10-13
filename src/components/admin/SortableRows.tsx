"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp, Menu, Trash } from "@deemlol/next-icons";
import styles from "@/app/admin/admin.module.css";

export type SortableRow = { key: string };

/**
 * Liste réordonnable par glisser-déposer, partagée par les éditeurs de listes
 * de la page Personnalisation (services, témoignages, FAQ).
 *
 * Même geste et mêmes repères que la galerie d'une réalisation et la liste des
 * réalisations : poignée à gauche de chaque ligne, ligne d'origine atténuée,
 * trait d'insertion sur la ligne visée, puis ligne déplacée mise en avant une
 * fois (surbrillance + glissement).
 *
 * Trois voies d'accès au même réordonnancement : la souris (glisser-déposer),
 * le clavier (flèches haut/bas sur la poignée) et le tactile (repli ↑/↓, seul
 * moyen sans souris ni clavier).
 *
 * **L'ordre n'est pas envoyé au serveur ici** : les champs de ces formulaires
 * sont nommés par position (`rows_0_title`…), donc l'ordre affiché est celui
 * qui part à l'enregistrement. Le bouton « Enregistrer » de l'éditeur s'en
 * charge, et le formulaire signale déjà « modifications non enregistrées ».
 */
export default function SortableRows<T extends SortableRow>({
  rows,
  nameOf,
  onReorder,
  onRemove,
  canRemove,
  renderRow,
}: {
  rows: T[];
  /** Nom d'une ligne, pour les libellés accessibles et les annonces. */
  nameOf: (row: T, index: number) => string;
  onReorder: (from: number, to: number) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
  /** Contenu de la ligne (les champs), rendu sous la tête de ligne. */
  renderRow: (row: T, index: number) => ReactNode;
}) {
  const [dragged, setDragged] = useState<number | null>(null);
  const [dropAt, setDropAt] = useState<number | null>(null);
  const [status, setStatus] = useState("");
  const [moved, setMoved] = useState<{
    index: number;
    direction: "up" | "down";
    nonce: number;
  } | null>(null);
  const rowRefs = useRef(new Map<string, HTMLDivElement>());

  const lastIndex = rows.length - 1;

  // Relance l'animation de la ligne déplacée après chaque déplacement : React
  // ne remet pas la classe si elle est déjà posée (même ligne déplacée deux
  // fois de suite), on force donc un redémarrage de l'animation avant de lever
  // la mise en avant. `nonce` fait changer l'objet même quand l'index est
  // identique, ce qui relance l'effet.
  useEffect(() => {
    if (!moved) return;
    const row = rowRefs.current.get(rows[moved.index]?.key ?? "");
    if (row) {
      row.style.animation = "none";
      void row.offsetWidth;
      row.style.animation = "";
    }
    const timer = window.setTimeout(() => setMoved(null), 950);
    return () => window.clearTimeout(timer);
  }, [moved, rows]);

  // Trait d'insertion : `dropAt` est un index « avant retrait » (0 → devant la
  // première ligne, length → derrière la dernière).
  const dropTarget =
    dragged !== null && dropAt !== null
      ? (() => {
          const target = dropAt > dragged ? dropAt - 1 : dropAt;
          if (target === dragged) return null;
          return {
            row: dropAt === rows.length ? lastIndex : dropAt,
            after: dropAt === rows.length,
          };
        })()
      : null;

  function applyMove(from: number, insertAt: number) {
    if (from < 0 || insertAt < 0) return;
    const to = insertAt > from ? insertAt - 1 : insertAt;
    if (to === from || to >= rows.length) return;
    const name = nameOf(rows[from], from);
    onReorder(from, to);
    setStatus(`${name} est maintenant en position ${to + 1}.`);
    setMoved((current) => ({
      index: to,
      direction: to > from ? "down" : "up",
      nonce: (current?.nonce ?? 0) + 1,
    }));
  }

  function handleDragStart(
    event: React.DragEvent<HTMLButtonElement>,
    index: number,
  ) {
    setDragged(index);
    setDropAt(index);
    const row = event.currentTarget.closest("[data-sortable-row]");
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", String(index));
      if (row) event.dataTransfer.setDragImage(row, 24, 20);
    }
  }

  function handleDragOver(
    event: React.DragEvent<HTMLDivElement>,
    index: number,
  ) {
    if (dragged === null) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
    const rect = event.currentTarget.getBoundingClientRect();
    const after = event.clientY > rect.top + rect.height / 2;
    const next = after ? index + 1 : index;
    setDropAt((current) => (current === next ? current : next));
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const from = dragged;
    const target = dropAt;
    setDragged(null);
    setDropAt(null);
    if (from !== null && target !== null) applyMove(from, target);
  }

  function handleDragEnd() {
    setDragged(null);
    setDropAt(null);
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
    event.preventDefault();
    if (event.key === "ArrowUp") {
      if (index === 0) return;
      applyMove(index, index - 1);
      return;
    }
    if (index === lastIndex) return;
    applyMove(index, index + 2);
  }

  return (
    <>
      <p className={styles.orderHint}>
        Changer l&apos;ordre des éléments avec le drag &amp; drop : attrapez la
        poignée à gauche d&apos;une ligne, déplacez-la, relâchez.
        <span className={styles.srOnly} role="status" aria-live="polite">
          {status}
        </span>
      </p>

      {rows.map((row, index) => {
        const name = nameOf(row, index);
        const isMoved = moved?.index === index;
        const rowClass = [
          styles.section,
          index === dragged ? styles.listRowDragging : "",
          dropTarget?.row === index
            ? dropTarget.after
              ? styles.listRowDropAfter
              : styles.listRowDropBefore
            : "",
          isMoved ? styles.listRowMoved : "",
          isMoved
            ? moved.direction === "down"
              ? styles.listRowMovedDown
              : styles.listRowMovedUp
            : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <div
            key={row.key}
            data-sortable-row=""
            ref={(node) => {
              if (node) rowRefs.current.set(row.key, node);
              else rowRefs.current.delete(row.key);
            }}
            className={rowClass}
            onDragOver={(event) => handleDragOver(event, index)}
            onDrop={handleDrop}
          >
            <div className={styles.listRowHead}>
              <span className={styles.listRowGrip}>
                <button
                  type="button"
                  className={styles.dragHandle}
                  draggable
                  aria-label={`Réordonner ${name} (glisser-déposer, ou flèches haut et bas au clavier)`}
                  title="Glisser pour changer l'ordre"
                  onDragStart={(event) => handleDragStart(event, index)}
                  onDragEnd={handleDragEnd}
                  onKeyDown={(event) => handleKeyDown(event, index)}
                >
                  <Menu size={15} strokeWidth={2} aria-hidden />
                </button>
                <span className={styles.listRowNumber} aria-hidden>
                  {index + 1}
                </span>
              </span>

              <span className={styles.listRowActions}>
                {/* Repli sans souris : flèches ↑/↓, comme la galerie. */}
                <span className={styles.listRowFallback}>
                  <button
                    type="button"
                    className={styles.iconAction}
                    disabled={index === 0}
                    aria-label={`Monter ${name}`}
                    title="Monter"
                    onClick={() => applyMove(index, index - 1)}
                  >
                    <ChevronUp size={14} strokeWidth={2.2} aria-hidden />
                  </button>
                  <button
                    type="button"
                    className={styles.iconAction}
                    disabled={index === lastIndex}
                    aria-label={`Descendre ${name}`}
                    title="Descendre"
                    onClick={() => applyMove(index, index + 2)}
                  >
                    <ChevronDown size={14} strokeWidth={2.2} aria-hidden />
                  </button>
                </span>

                <button
                  type="button"
                  className={styles.listRemove}
                  disabled={!canRemove}
                  onClick={() => onRemove(index)}
                  aria-label={`Retirer ${name}`}
                  title="Retirer"
                >
                  <Trash size={15} strokeWidth={2} aria-hidden />
                  <span className={styles.srOnly}>Retirer {name}</span>
                </button>
              </span>
            </div>

            {renderRow(row, index)}
          </div>
        );
      })}
    </>
  );
}
