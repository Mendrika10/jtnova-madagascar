"use client";

import { useId, useMemo, useRef, useState } from "react";
import { Plus, X } from "@deemlol/next-icons";
import styles from "@/app/admin/admin.module.css";

/**
 * Technologies proposées d'office, en plus de celles déjà utilisées dans les
 * réalisations (transmises par la page via `extraOptions`).
 */
const BASE_OPTIONS = [
  "Next.js",
  "React",
  "TypeScript",
  "JavaScript",
  "Tailwind CSS",
  "Node.js",
  "Supabase",
  "PostgreSQL",
  "Prisma",
  "Laravel",
  "PHP",
  "MySQL",
  "REST API",
  "Vercel",
  "Stripe",
  "Framer Motion",
  "Figma",
];

type Props = {
  /** Liste sélectionnée, un libellé par ligne (format attendu par l'action). */
  value: string;
  onChange: (next: string) => void;
  /** Technologies déjà utilisées ailleurs, pour alimenter les propositions. */
  extraOptions?: string[];
  error?: string;
};

function splitLines(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

const sameLabel = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

/**
 * Sélecteur multiple de technologies : on choisit dans les propositions ou on
 * saisit un nom, on en coche autant qu'on veut, chaque pastille se retire
 * individuellement. La valeur transmise reste **un libellé par ligne** dans un
 * champ caché nommé `tech` : la Server Action et la base ne changent pas.
 */
export default function TechPicker({
  value,
  onChange,
  extraOptions = [],
  error,
}: Props) {
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const selected = splitLines(value);

  // Technologies déjà en base d'abord : ce sont les plus pertinentes.
  const options = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const raw of [...extraOptions, ...BASE_OPTIONS]) {
      const label = raw.trim();
      if (label === "" || seen.has(label.toLowerCase())) continue;
      seen.add(label.toLowerCase());
      out.push(label);
    }
    return out;
  }, [extraOptions]);

  const free = options.filter((o) => !selected.some((s) => sameLabel(s, o)));
  const trimmed = query.trim();
  const filtered =
    trimmed === ""
      ? free
      : free.filter((o) => o.toLowerCase().includes(trimmed.toLowerCase()));
  // Entrée « ajouter ce que je viens d'écrire » : proposée quand le texte n'est
  // ni déjà sélectionné, ni une proposition existante.
  const canCreate =
    trimmed !== "" &&
    !selected.some((s) => sameLabel(s, trimmed)) &&
    !free.some((o) => sameLabel(o, trimmed));
  const suggestions = [
    ...(canCreate ? [trimmed] : []),
    ...filtered,
  ].slice(0, 8);
  const activeIndex = Math.min(active, Math.max(0, suggestions.length - 1));

  function add(label: string) {
    const clean = label.trim();
    setQuery("");
    setActive(0);
    setOpen(false);
    if (clean === "" || selected.some((s) => sameLabel(s, clean))) {
      inputRef.current?.focus();
      return;
    }
    onChange([...selected, clean].join("\n"));
    inputRef.current?.focus();
  }

  function remove(label: string) {
    onChange(selected.filter((s) => !sameLabel(s, label)).join("\n"));
    setActive(0);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      add(open && suggestions[activeIndex] ? suggestions[activeIndex] : query);
      return;
    }
    if (event.key === "Backspace" && query === "" && selected.length > 0) {
      event.preventDefault();
      remove(selected[selected.length - 1]);
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive(
        Math.max(0, Math.min(suggestions.length - 1, activeIndex + step)),
      );
      return;
    }
    if (event.key === "Escape") setOpen(false);
  }

  const listOpen = open && suggestions.length > 0;

  return (
    <div className={styles.techPicker}>
      <div className={styles.techAnchor}>
        <div
          className={styles.techField}
          onClick={() => inputRef.current?.focus()}
        >
          {selected.map((label) => (
            <span key={label} className={styles.techChip}>
              {label}
              <button
                type="button"
                className={styles.techChipRemove}
                aria-label={`Retirer ${label}`}
                onClick={(event) => {
                  event.stopPropagation();
                  remove(label);
                }}
              >
                <X size={11} strokeWidth={2.5} aria-hidden />
              </button>
            </span>
          ))}
          <input
            ref={inputRef}
            className={styles.techInput}
            value={query}
            placeholder={
              selected.length === 0
                ? "Choisissez ou saisissez une technologie…"
                : "Ajouter…"
            }
            role="combobox"
            aria-expanded={listOpen}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={
              listOpen ? `${listId}-${activeIndex}` : undefined
            }
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
              setOpen(true);
            }}
            onKeyDown={onKeyDown}
            onFocus={() => setOpen(true)}
            // Léger délai : sans lui, le clic sur une proposition serait perdu
            // (le `blur` de l'input ferme la liste avant le `mouseup`).
            onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          />
        </div>

        {listOpen && (
          <ul
            className={styles.techSuggest}
            role="listbox"
            id={listId}
            aria-label="Technologies proposées"
          >
            {suggestions.map((label, index) => {
              const isNew = canCreate && index === 0;
              return (
                <li
                  key={label}
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={index === activeIndex}
                  className={`${styles.techSuggestItem} ${
                    index === activeIndex ? styles.techSuggestItemActive : ""
                  } ${isNew ? styles.techSuggestNew : ""}`}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    add(label);
                  }}
                  onMouseEnter={() => setActive(index)}
                >
                  {isNew ? (
                    <>
                      <Plus size={13} strokeWidth={2} aria-hidden />
                      Ajouter «&nbsp;{label}&nbsp;»
                    </>
                  ) : (
                    label
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <p className={styles.techHint}>
        Cliquez dans la liste ou saisissez un nom puis <kbd>Entrée</kbd> — les
        technologies déjà utilisées dans vos réalisations sont proposées en
        premier.
        {selected.length > 0 &&
          ` ${selected.length} sélectionnée${selected.length > 1 ? "s" : ""}.`}
      </p>
      {error && <span className={styles.fieldError}>{error}</span>}
      {/* Le contrat de la Server Action ne change pas : un libellé par ligne. */}
      <input type="hidden" name="tech" value={value} />
    </div>
  );
}
