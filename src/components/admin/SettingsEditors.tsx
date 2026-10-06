"use client";

import { useActionState, useRef, useState } from "react";
import {
  saveHeroAction,
  saveAboutAction,
  saveCtaAction,
  saveSeoAction,
  saveIdentityAction,
  saveServicesAction,
  saveTestimonialsAction,
  saveFaqsAction,
  type SettingsFormState,
} from "@/app/admin/site-actions";
import styles from "@/app/admin/admin.module.css";

/**
 * S5 — Éditeurs de la page Personnalisation. Chaque section est un formulaire
 * client adossé à une Server Action validée par Zod (même mécanique que les
 * réalisations en S4). Les listes (services, témoignages, FAQ) fonctionnent
 * par remplacement complet à l'enregistrement.
 */

const INITIAL: SettingsFormState = { errors: {}, values: {} };

function Notice({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <p className={styles.error} role="alert">
      {error}
    </p>
  );
}

function Submit({ pending, label = "Enregistrer" }: { pending: boolean; label?: string }) {
  return (
    <button type="submit" className={styles.submit} disabled={pending}>
      {pending ? "Enregistrement…" : label}
    </button>
  );
}

function TextField({
  name,
  label,
  defaultValue,
  hint,
  error,
  textarea,
  placeholder,
}: {
  name: string;
  label: string;
  defaultValue: string;
  hint?: string;
  error?: string;
  textarea?: boolean;
  placeholder?: string;
}) {
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      {textarea ? (
        <textarea
          name={name}
          defaultValue={defaultValue}
          rows={3}
          className={styles.textarea}
          placeholder={placeholder}
        />
      ) : (
        <input
          name={name}
          defaultValue={defaultValue}
          className={styles.input}
          placeholder={placeholder}
        />
      )}
      {hint && <span className={styles.fieldHint}>{hint}</span>}
      {error && <span className={styles.fieldError}>{error}</span>}
    </label>
  );
}

export type HeroValues = {
  badge: string;
  title: string;
  title_accent: string;
  subtitle: string;
  cta_primary_label: string;
  cta_primary_href: string;
  cta_secondary_label: string;
  cta_secondary_href: string;
};

export function HeroEditor({ values }: { values: HeroValues }) {
  const [state, action, pending] = useActionState(saveHeroAction, INITIAL);
  return (
    <form action={action} className={styles.form}>
      <Notice error={state.errors._} />
      <TextField name="badge" label="Badge" defaultValue={values.badge} error={state.errors.badge} />
      <TextField
        name="title"
        label="Titre principal"
        defaultValue={values.title}
        hint="Mots séparés par des espaces ; la casse des mots accentués est préservée."
        error={state.errors.title}
      />
      <TextField
        name="title_accent"
        label="Mots en couleur d'accent"
        defaultValue={values.title_accent}
        hint="Liste de mots du titre (ex. « expériences digitales »)."
        error={state.errors.title_accent}
      />
      <TextField name="subtitle" label="Sous-titre" defaultValue={values.subtitle} textarea error={state.errors.subtitle} />
      <div className={styles.formGrid}>
        <TextField name="cta_primary_label" label="Bouton principal — libellé" defaultValue={values.cta_primary_label} error={state.errors.cta_primary_label} />
        <TextField name="cta_primary_href" label="Bouton principal — lien" defaultValue={values.cta_primary_href} error={state.errors.cta_primary_href} />
        <TextField name="cta_secondary_label" label="Bouton secondaire — libellé" defaultValue={values.cta_secondary_label} error={state.errors.cta_secondary_label} />
        <TextField name="cta_secondary_href" label="Bouton secondaire — lien" defaultValue={values.cta_secondary_href} error={state.errors.cta_secondary_href} />
      </div>
      <Submit pending={pending} />
    </form>
  );
}

export type AboutValues = {
  mission_title: string;
  mission_text: string;
  vision_title: string;
  vision_text: string;
  stats_lines: string;
};

export function AboutEditor({ values }: { values: AboutValues }) {
  const [state, action, pending] = useActionState(saveAboutAction, INITIAL);
  return (
    <form action={action} className={styles.form}>
      <Notice error={state.errors._} />
      <div className={styles.formGrid}>
        <TextField name="mission_title" label="Mission — titre" defaultValue={values.mission_title} error={state.errors.mission_title} />
        <TextField name="vision_title" label="Vision — titre" defaultValue={values.vision_title} error={state.errors.vision_title} />
      </div>
      <TextField name="mission_text" label="Mission — texte" defaultValue={values.mission_text} textarea error={state.errors.mission_text} />
      <TextField name="vision_text" label="Vision — texte" defaultValue={values.vision_text} textarea error={state.errors.vision_text} />
      <TextField
        name="stats"
        label="Chiffres clés"
        defaultValue={values.stats_lines}
        textarea
        hint="Une ligne par chiffre, format « 50+ | Projets livrés »."
        error={state.errors.stats}
      />
      <Submit pending={pending} />
    </form>
  );
}

export type CtaValues = {
  badge: string;
  title_line1: string;
  title_line2: string;
  button_label: string;
  button_href: string;
  socials_lines: string;
};

export function CtaEditor({ values }: { values: CtaValues }) {
  const [state, action, pending] = useActionState(saveCtaAction, INITIAL);
  return (
    <form action={action} className={styles.form}>
      <Notice error={state.errors._} />
      <TextField name="badge" label="Badge de disponibilité" defaultValue={values.badge} error={state.errors.badge} />
      <div className={styles.formGrid}>
        <TextField name="title_line1" label="Titre — ligne 1" defaultValue={values.title_line1} error={state.errors.title_line1} />
        <TextField name="title_line2" label="Titre — ligne 2 (en accent)" defaultValue={values.title_line2} error={state.errors.title_line2} />
      </div>
      <div className={styles.formGrid}>
        <TextField name="button_label" label="Bouton — libellé" defaultValue={values.button_label} error={state.errors.button_label} />
        <TextField name="button_href" label="Bouton — lien" defaultValue={values.button_href} error={state.errors.button_href} />
      </div>
      <TextField
        name="socials"
        label="Réseaux sociaux (liens Hero et CTA)"
        defaultValue={values.socials_lines}
        textarea
        hint="Une ligne par réseau, format « LINKEDIN | https://… ». Lien vide = réseau masqué."
        error={state.errors.socials}
      />
      <Submit pending={pending} />
    </form>
  );
}

export type SeoValues = {
  site_name: string;
  title: string;
  description: string;
  locale: string;
  og_image: string;
};

export function SeoEditor({ values }: { values: SeoValues }) {
  const [state, action, pending] = useActionState(saveSeoAction, INITIAL);
  return (
    <form action={action} className={styles.form}>
      <Notice error={state.errors._} />
      <div className={styles.formGrid}>
        <TextField name="site_name" label="Nom du site" defaultValue={values.site_name} error={state.errors.site_name} />
        <TextField name="locale" label="Locale" defaultValue={values.locale} hint="ex. fr, fr-FR" error={state.errors.locale} />
      </div>
      <TextField name="title" label="Titre (balise <title>)" defaultValue={values.title} error={state.errors.title} />
      <TextField name="description" label="Description (meta)" defaultValue={values.description} textarea error={state.errors.description} />
      <TextField
        name="og_image"
        label="Image de partage (Open Graph)"
        defaultValue={values.og_image}
        hint="Chemin interne (/images/…) ou URL https:// complète."
        error={state.errors.og_image}
      />
      <Submit pending={pending} />
    </form>
  );
}

export type IdentityValues = {
  logo_url: string;
  favicon_url: string;
  accent_color: string;
};

export function IdentityEditor({ values }: { values: IdentityValues }) {
  const [state, action, pending] = useActionState(saveIdentityAction, INITIAL);
  return (
    <form action={action} className={styles.form}>
      <Notice error={state.errors._} />
      <TextField
        name="logo_url"
        label="URL du logo"
        defaultValue={values.logo_url}
        hint="Chemin interne (/images/…) ou URL https:// complète. Affiché dans la navbar et le pied de page."
        error={state.errors.logo_url}
      />
      <TextField name="favicon_url" label="URL du favicon" defaultValue={values.favicon_url} error={state.errors.favicon_url} />
      <TextField
        name="accent_color"
        label="Couleur d'accent"
        defaultValue={values.accent_color}
        hint="Format #rrggbb (ex. #00b4d8)."
        error={state.errors.accent_color}
      />
      <Submit pending={pending} />
    </form>
  );
}

/* ── Listes (services, témoignages, FAQ) : lignes dynamiques ─────────── */

// Clé stable par ligne : le champ « name » est positionnel (rows_i_…) mais la
// clé React ne doit pas changer quand une ligne du milieu est retirée, sinon
// les inputs non contrôlés se décalent visuellement (React réutiliserait le
// DOM d'une autre ligne). Les lignes initiales sont indexées de façon
// déterministe (rendu serveur identique au client, pas de mismatch) ; les
// lignes ajoutées reçoivent une clé unique issue d'un compteur d'instance.
type Row<T> = { key: string; data: T };

function useRows<T>(
  initial: T[],
  empty: () => T,
) {
  const seq = useRef(0);
  const [rows, setRows] = useState<Row<T>[]>(() =>
    (initial.length > 0 ? initial : [empty()]).map((data, i) => ({
      key: `init-${i}`,
      data,
    })),
  );
  function add() {
    setRows((prev) => [...prev, { key: `new-${seq.current++}`, data: empty() }]);
  }
  function remove(index: number) {
    setRows((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  }
  function move(index: number, delta: number) {
    setRows((prev) => {
      const next = [...prev];
      const target = index + delta;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }
  return { rows, add, remove, move };
}

function RowActions({
  onUp,
  onDown,
  onRemove,
  canRemove,
}: {
  onUp: () => void;
  onDown: () => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  return (
    <div className={styles.formActions}>
      <button type="button" className={styles.linkBtn} onClick={onUp}>
        ↑
      </button>
      <button type="button" className={styles.linkBtn} onClick={onDown}>
        ↓
      </button>
      <button
        type="button"
        className={styles.linkBtn}
        onClick={onRemove}
        disabled={!canRemove}
      >
        Retirer
      </button>
    </div>
  );
}

export type ServiceRow = { title: string; description: string; icon: string };

export function ServicesEditor({ initial }: { initial: ServiceRow[] }) {
  const [state, action, pending] = useActionState(saveServicesAction, INITIAL);
  const { rows, add, remove, move } = useRows<ServiceRow>(
    initial,
    () => ({ title: "", description: "", icon: "" }),
  );

  return (
    <form action={action} className={styles.form}>
      <Notice error={state.errors._} />
      <input type="hidden" name="count" value={rows.length} />
      {rows.map((row, i) => (
        <div key={row.key} className={styles.section}>
          <TextField
            name={`rows_${i}_title`}
            label={`Service ${i + 1} — titre`}
            defaultValue={row.data.title}
            error={state.errors[`row_${i}_title`]}
          />
          <TextField
            name={`rows_${i}_description`}
            label="Description"
            defaultValue={row.data.description}
            textarea
            error={state.errors[`row_${i}_description`]}
          />
          <TextField
            name={`rows_${i}_icon`}
            label="Étiquette / icône (texte)"
            defaultValue={row.data.icon}
            hint="Texte court affiché sur la carte (ex. « UI/UX »)."
            error={state.errors[`row_${i}_icon`]}
          />
          <RowActions
            onUp={() => move(i, -1)}
            onDown={() => move(i, 1)}
            onRemove={() => remove(i)}
            canRemove={rows.length > 1}
          />
        </div>
      ))}
      <button type="button" className={styles.secondaryBtn} onClick={add}>
        + Ajouter un service
      </button>
      <Submit pending={pending} label="Enregistrer les services" />
    </form>
  );
}

export type TestimonialRow = {
  name: string;
  role: string;
  text: string;
  linkedin_url: string;
  published: boolean;
};

export function TestimonialsEditor({ initial }: { initial: TestimonialRow[] }) {
  const [state, action, pending] = useActionState(saveTestimonialsAction, INITIAL);
  const { rows, add, remove, move } = useRows<TestimonialRow>(
    initial,
    () => ({ name: "", role: "", text: "", linkedin_url: "", published: true }),
  );

  return (
    <form action={action} className={styles.form}>
      <Notice error={state.errors._} />
      <input type="hidden" name="count" value={rows.length} />
      {rows.map((row, i) => (
        <div key={row.key} className={styles.section}>
          <div className={styles.formGrid}>
            <TextField
              name={`rows_${i}_name`}
              label={`Témoignage ${i + 1} — nom`}
              defaultValue={row.data.name}
              error={state.errors[`row_${i}_name`]}
            />
            <TextField
              name={`rows_${i}_role`}
              label="Rôle / entreprise"
              defaultValue={row.data.role}
              error={state.errors[`row_${i}_role`]}
            />
          </div>
          <TextField
            name={`rows_${i}_text`}
            label="Témoignage"
            defaultValue={row.data.text}
            textarea
            error={state.errors[`row_${i}_text`]}
          />
          <div className={styles.formGrid}>
            <TextField
              name={`rows_${i}_linkedin_url`}
              label="LinkedIn (optionnel)"
              defaultValue={row.data.linkedin_url}
              error={state.errors[`row_${i}_linkedin_url`]}
            />
            <label className={styles.checkboxRow}>
              <input
                type="checkbox"
                name={`published_${i}`}
                defaultChecked={row.data.published}
              />
              Publié (visible dans le carrousel)
            </label>
          </div>
          <RowActions
            onUp={() => move(i, -1)}
            onDown={() => move(i, 1)}
            onRemove={() => remove(i)}
            canRemove={rows.length > 1}
          />
        </div>
      ))}
      <button type="button" className={styles.secondaryBtn} onClick={add}>
        + Ajouter un témoignage
      </button>
      <Submit pending={pending} label="Enregistrer les témoignages" />
    </form>
  );
}

export type FaqRow = { question: string; answer: string };

export function FaqEditor({ initial }: { initial: FaqRow[] }) {
  const [state, action, pending] = useActionState(saveFaqsAction, INITIAL);
  const { rows, add, remove, move } = useRows<FaqRow>(
    initial,
    () => ({ question: "", answer: "" }),
  );

  return (
    <form action={action} className={styles.form}>
      <Notice error={state.errors._} />
      <input type="hidden" name="count" value={rows.length} />
      {rows.map((row, i) => (
        <div key={row.key} className={styles.section}>
          <TextField
            name={`rows_${i}_question`}
            label={`Question ${i + 1}`}
            defaultValue={row.data.question}
            error={state.errors[`row_${i}_question`]}
          />
          <TextField
            name={`rows_${i}_answer`}
            label="Réponse"
            defaultValue={row.data.answer}
            textarea
            error={state.errors[`row_${i}_answer`]}
          />
          <RowActions
            onUp={() => move(i, -1)}
            onDown={() => move(i, 1)}
            onRemove={() => remove(i)}
            canRemove={rows.length > 1}
          />
        </div>
      ))}
      <button type="button" className={styles.secondaryBtn} onClick={add}>
        + Ajouter une question
      </button>
      <Submit pending={pending} label="Enregistrer la FAQ" />
    </form>
  );
}
