"use client";

import { useActionState, useState } from "react";
import {
  saveProjectAction,
  type ProjectFormState,
} from "@/app/admin/actions";
import styles from "@/app/admin/admin.module.css";

export type ProjectFormInitial = {
  id?: string;
  title: string;
  slug: string;
  tag: string;
  category: string;
  year: string;
  description: string;
  presentation: string;
  explication: string;
  security: string;
  performance: string;
  client_name: string;
  live_url: string;
  repo_url: string;
  video_url: string;
  video_poster: string;
  published: boolean;
  tech: string;
  highlights: string;
};

const INITIAL_STATE: ProjectFormState = { errors: {}, values: {} };

/** Champs texte (tout sauf la case « Publiée » et l'identifiant caché). */
const TEXT_FIELDS = [
  "title",
  "slug",
  "tag",
  "category",
  "year",
  "description",
  "presentation",
  "explication",
  "security",
  "performance",
  "client_name",
  "live_url",
  "repo_url",
  "video_url",
  "video_poster",
  "tech",
  "highlights",
] as const;

type TextFieldName = (typeof TEXT_FIELDS)[number];

type TabId = "essentiel" | "details" | "liens";

/**
 * Découpage du formulaire en onglets. L'ordre des `fields` sert aussi à
 * retrouver l'onglet à ouvrir quand l'enregistrement est refusé.
 */
const TABS: {
  id: TabId;
  label: string;
  intro: string;
  fields: TextFieldName[];
}[] = [
  {
    id: "essentiel",
    label: "Essentiel",
    intro:
      "Ce qui identifie la réalisation : son titre, son URL et le résumé affiché sur la carte.",
    fields: ["title", "slug", "description"],
  },
  {
    id: "details",
    label: "Détails",
    intro:
      "Le contenu détaillé présenté sur la page du projet : classement, textes longs, technologies et points forts.",
    fields: [
      "tag",
      "category",
      "year",
      "client_name",
      "presentation",
      "explication",
      "security",
      "performance",
      "tech",
      "highlights",
    ],
  },
  {
    id: "liens",
    label: "Liens",
    intro:
      "Les liens à ouvrir depuis le projet, puis la visibilité sur le site public.",
    fields: ["live_url", "repo_url", "video_url", "video_poster"],
  },
];

function initialValues(initial: ProjectFormInitial): Record<TextFieldName, string> {
  const values = {} as Record<TextFieldName, string>;
  for (const name of TEXT_FIELDS) values[name] = initial[name] ?? "";
  return values;
}

function Field({
  name,
  label,
  value,
  onChange,
  error,
  textarea,
  hint,
  placeholder,
}: {
  name: TextFieldName;
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error?: string;
  textarea?: boolean;
  hint?: string;
  placeholder?: string;
}) {
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      {textarea ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          rows={4}
          placeholder={placeholder}
          className={styles.textarea}
        />
      ) : (
        <input
          name={name}
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={styles.input}
        />
      )}
      {hint && <span className={styles.fieldHint}>{hint}</span>}
      {error && <span className={styles.fieldError}>{error}</span>}
    </label>
  );
}

export default function ProjectForm({ initial }: { initial: ProjectFormInitial }) {
  const [state, formAction, pending] = useActionState<ProjectFormState, FormData>(
    saveProjectAction,
    INITIAL_STATE,
  );
  // Champs contrôlés : la saisie vit dans React, donc elle survit à la
  // réinitialisation que React 19 applique aux champs d'un `<form action>` à la
  // fin de l'action (sans cela, tout se vide même quand l'enregistrement est
  // refusé). Les valeurs renvoyées par l'action sont ensuite réappliquées.
  const [values, setValues] = useState<Record<TextFieldName, string>>(() =>
    initialValues(initial),
  );
  const [published, setPublished] = useState(initial.published);
  const [tab, setTab] = useState<TabId>("essentiel");
  const [seenState, setSeenState] = useState(state);
  // Incrémenté à chaque réponse de l'action : sert de clé de remontage à la
  // case « Publiée ». React réinitialise aussi les cases à cocher en fin
  // d'action, et comme aucun état ne change pour elles, le DOM repasserait à
  // « décoché » sans que React le rétablisse.
  const [generation, setGeneration] = useState(0);

  // Réajustement pendant le rendu (motif documenté par React) : à chaque
  // nouvelle réponse de l'action, on réapplique les valeurs renvoyées et on
  // ouvre l'onglet qui porte les erreurs, sinon elles resteraient cachées.
  if (seenState !== state) {
    setSeenState(state);
    setGeneration((current) => current + 1);
    if (Object.keys(state.values).length > 0) {
      setValues((current) => ({
        ...current,
        ...(state.values as Partial<Record<TextFieldName, string>>),
      }));
    }
    const errorTab = TABS.find((t) => t.fields.some((f) => state.errors[f]));
    if (errorTab) setTab(errorTab.id);
  }

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  }

  function errorsIn(tabFields: TextFieldName[]) {
    return tabFields.filter((f) => state.errors[f]).length;
  }

  return (
    <form action={formAction} className={styles.form}>
      {initial.id && <input type="hidden" name="id" value={initial.id} />}

      {state.errors._ && (
        <p className={styles.error} role="alert">
          {state.errors._}
        </p>
      )}

      <div
        role="tablist"
        aria-label="Sections de la réalisation"
        className={styles.tabs}
      >
        {TABS.map((t) => {
          const count = errorsIn(t.fields);
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={tab === t.id}
              aria-controls={`panel-${t.id}`}
              className={`${styles.tab} ${tab === t.id ? styles.tabActive : ""}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
              {count > 0 && (
                <span className={styles.tabCount} aria-label={`${count} à corriger`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id="panel-essentiel"
        aria-labelledby="tab-essentiel"
        hidden={tab !== "essentiel"}
      >
        <p className={styles.tabIntro}>{TABS[0].intro}</p>
        <div className={styles.formGrid}>
          <Field
            name="title"
            label="Titre"
            value={values.title}
            onChange={handleChange}
            error={state.errors.title}
            placeholder="Refonte du site vitrine"
          />
          <Field
            name="slug"
            label="Slug (URL)"
            value={values.slug}
            onChange={handleChange}
            error={state.errors.slug}
            placeholder="refonte-site-vitrine"
            hint="Minuscules, chiffres et tirets. Sert d'URL : /projects/<slug>"
          />
        </div>
        <Field
          name="description"
          label="Description (résumé, 10–600 car.)"
          value={values.description}
          onChange={handleChange}
          error={state.errors.description}
          placeholder="Ce que le projet apporte, en une ou deux phrases."
          textarea
        />
      </div>

      <div
        role="tabpanel"
        id="panel-details"
        aria-labelledby="tab-details"
        hidden={tab !== "details"}
      >
        <p className={styles.tabIntro}>{TABS[1].intro}</p>
        <div className={styles.formGrid}>
          <Field
            name="tag"
            label="Étiquette (tag)"
            value={values.tag}
            onChange={handleChange}
            error={state.errors.tag}
            placeholder="Design · Développement"
          />
          <Field
            name="category"
            label="Catégorie"
            value={values.category}
            onChange={handleChange}
            error={state.errors.category}
            placeholder="Site web"
          />
          <Field
            name="year"
            label="Année"
            value={values.year}
            onChange={handleChange}
            error={state.errors.year}
            placeholder="2026"
          />
          <Field
            name="client_name"
            label="Client (optionnel)"
            value={values.client_name}
            onChange={handleChange}
            error={state.errors.client_name}
            placeholder="Nom du client"
          />
        </div>
        <Field
          name="presentation"
          label="Présentation"
          value={values.presentation}
          onChange={handleChange}
          error={state.errors.presentation}
          placeholder="Le contexte et le besoin du client."
          textarea
        />
        <Field
          name="explication"
          label="Explication"
          value={values.explication}
          onChange={handleChange}
          error={state.errors.explication}
          placeholder="La solution proposée et les choix techniques."
          textarea
        />
        <div className={styles.formGrid}>
          <Field
            name="security"
            label="Sécurité"
            value={values.security}
            onChange={handleChange}
            error={state.errors.security}
            placeholder="Mesures de sécurité mises en place."
            textarea
          />
          <Field
            name="performance"
            label="Performance"
            value={values.performance}
            onChange={handleChange}
            error={state.errors.performance}
            placeholder="Résultats mesurés et optimisations."
            textarea
          />
        </div>
        <Field
          name="tech"
          label="Technologies (une par ligne)"
          value={values.tech}
          onChange={handleChange}
          error={state.errors.tech}
          placeholder={"Next.js\nTypeScript\nSupabase"}
          textarea
        />
        <Field
          name="highlights"
          label="Points forts (un par ligne)"
          value={values.highlights}
          onChange={handleChange}
          error={state.errors.highlights}
          placeholder={"Chargement divisé par deux\nParcours mobile repensé"}
          textarea
        />
      </div>

      <div
        role="tabpanel"
        id="panel-liens"
        aria-labelledby="tab-liens"
        hidden={tab !== "liens"}
      >
        <p className={styles.tabIntro}>{TABS[2].intro}</p>
        <div className={styles.formGrid}>
          <Field
            name="live_url"
            label="Lien du site"
            value={values.live_url}
            onChange={handleChange}
            error={state.errors.live_url}
            placeholder="https://exemple.mg"
          />
          <Field
            name="repo_url"
            label="Lien du code"
            value={values.repo_url}
            onChange={handleChange}
            error={state.errors.repo_url}
            placeholder="https://github.com/…"
          />
          <Field
            name="video_url"
            label="Vidéo (URL)"
            value={values.video_url}
            onChange={handleChange}
            error={state.errors.video_url}
            placeholder="https://…/presentation.mp4"
          />
          <Field
            name="video_poster"
            label="Vignette vidéo (URL)"
            value={values.video_poster}
            onChange={handleChange}
            error={state.errors.video_poster}
            placeholder="https://…/vignette.jpg"
          />
        </div>

        <label className={styles.checkboxRow}>
          <input
            key={generation}
            type="checkbox"
            name="published"
            defaultChecked={published}
            onChange={(event) => setPublished(event.target.checked)}
          />
          <span>Publiée (visible sur le site public)</span>
        </label>
      </div>

      <div className={styles.formActions}>
        <button type="submit" className={styles.submit} disabled={pending}>
          {pending ? "Enregistrement…" : initial.id ? "Enregistrer" : "Créer la réalisation"}
        </button>
      </div>
    </form>
  );
}
