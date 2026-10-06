"use client";

import { useActionState } from "react";
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

function Field({
  name,
  label,
  initial,
  error,
  textarea,
  hint,
  type = "text",
}: {
  name: keyof ProjectFormInitial;
  label: string;
  initial: string;
  error?: string;
  textarea?: boolean;
  hint?: string;
  type?: string;
}) {
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      {textarea ? (
        <textarea
          name={name}
          defaultValue={initial}
          rows={4}
          className={styles.textarea}
        />
      ) : (
        <input
          name={name}
          type={type}
          defaultValue={initial}
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

  return (
    <form action={formAction} className={styles.form}>
      {initial.id && <input type="hidden" name="id" value={initial.id} />}

      {state.errors._ && (
        <p className={styles.error} role="alert">
          {state.errors._}
        </p>
      )}

      <div className={styles.formGrid}>
        <Field name="title" label="Titre" initial={initial.title} error={state.errors.title} />
        <Field
          name="slug"
          label="Slug (URL)"
          initial={initial.slug}
          error={state.errors.slug}
          hint="Minuscules, chiffres et tirets. Sert d'URL : /projects/<slug>"
        />
        <Field name="tag" label="Étiquette (tag)" initial={initial.tag} error={state.errors.tag} />
        <Field name="category" label="Catégorie" initial={initial.category} error={state.errors.category} />
        <Field name="year" label="Année" initial={initial.year} error={state.errors.year} />
        <Field name="client_name" label="Client (optionnel)" initial={initial.client_name} error={state.errors.client_name} />
      </div>

      <Field name="description" label="Description (résumé, 10–600 car.)" initial={initial.description} error={state.errors.description} textarea />
      <Field name="presentation" label="Présentation" initial={initial.presentation} error={state.errors.presentation} textarea />
      <Field name="explication" label="Explication" initial={initial.explication} error={state.errors.explication} textarea />

      <div className={styles.formGrid}>
        <Field name="security" label="Sécurité" initial={initial.security} error={state.errors.security} textarea />
        <Field name="performance" label="Performance" initial={initial.performance} error={state.errors.performance} textarea />
      </div>

      <div className={styles.formGrid}>
        <Field name="live_url" label="Lien du site" initial={initial.live_url} error={state.errors.live_url} />
        <Field name="repo_url" label="Lien du code" initial={initial.repo_url} error={state.errors.repo_url} />
        <Field name="video_url" label="Vidéo (URL)" initial={initial.video_url} error={state.errors.video_url} />
        <Field name="video_poster" label="Vignette vidéo (URL)" initial={initial.video_poster} error={state.errors.video_poster} />
      </div>

      <Field
        name="tech"
        label="Technologies (une par ligne)"
        initial={initial.tech}
        error={state.errors.tech}
        textarea
      />
      <Field
        name="highlights"
        label="Points forts (un par ligne)"
        initial={initial.highlights}
        error={state.errors.highlights}
        textarea
      />

      <label className={styles.checkboxRow}>
        <input type="checkbox" name="published" defaultChecked={initial.published} />
        <span>Publiée (visible sur le site public)</span>
      </label>

      <div className={styles.formActions}>
        <button type="submit" className={styles.submit} disabled={pending}>
          {pending ? "Enregistrement…" : initial.id ? "Enregistrer" : "Créer la réalisation"}
        </button>
      </div>
    </form>
  );
}
