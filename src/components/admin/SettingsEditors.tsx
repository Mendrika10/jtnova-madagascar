"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
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
import {
  PreviewPanel,
  HeroPreview,
  AboutPreview,
  CtaPreview,
  SeoPreview,
  IdentityPreview,
  ServicesPreview,
  TestimonialsPreview,
  FaqPreview,
} from "@/components/admin/SectionPreview";

/**
 * S5 — Éditeurs de la page Personnalisation. Chaque section est un formulaire
 * client adossé à une Server Action validée par Zod (même mécanique que les
 * réalisations en S4). Les listes (services, témoignages, FAQ) fonctionnent
 * par remplacement complet à l'enregistrement.
 *
 * Aperçu live : les champs restent **non contrôlés** (aucun `value`), et un
 * `onInput` sur le `<form>` relit les valeurs courantes via `FormData` pour
 * alimenter un panneau d'aperçu. Rien n'est envoyé au serveur tant que
 * l'utilisateur n'a pas cliqué « Enregistrer » : l'aperçu est purement local.
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

/**
 * Boutons d'un éditeur : enregistrer, ou revenir aux valeurs enregistrées.
 * Le bouton « Réinitialiser » est désactivé tant que rien n'a changé.
 */
function Actions({
  pending,
  dirty,
  onReset,
  label = "Enregistrer",
}: {
  pending: boolean;
  dirty: boolean;
  onReset: () => void;
  label?: string;
}) {
  return (
    <div className={styles.formActions}>
      <Submit pending={pending} label={label} />
      <button
        type="button"
        className={styles.secondaryBtn}
        onClick={onReset}
        disabled={pending || !dirty}
        title="Restaurer les valeurs enregistrées"
      >
        Réinitialiser
      </button>
    </div>
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

/* ── Aperçu live ─────────────────────────────────────────────────────────── */

function field(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "");
}

/**
 * Relit le formulaire à chaque saisie et met l'aperçu à jour sans enregistrer.
 * `build` doit être stable (défini au niveau module) pour éviter les boucles.
 */
function useLivePreview<T>(build: (formData: FormData) => T, initial: T) {
  const formRef = useRef<HTMLFormElement>(null);
  const [draft, setDraft] = useState<T>(initial);
  const refresh = useCallback(() => {
    const form = formRef.current;
    if (form) setDraft(build(new FormData(form)));
  }, [build]);
  /**
   * Restaure les champs du formulaire à leur valeur par défaut (celle rendue
   * par le serveur, donc « enregistrée ») puis relit l'aperçu. `form.reset()`
   * couvre aussi les cases à cocher (`defaultChecked`). Pour les éditeurs de
   * liste, l'appelant doit en plus restaurer les lignes (`useRows.reset`).
   */
  const resetForm = useCallback(() => {
    const form = formRef.current;
    if (!form) return;
    form.reset();
    setDraft(build(new FormData(form)));
  }, [build]);
  // Les formes sont construites de façon déterministe (mêmes clés, même ordre)
  // donc la comparaison JSON est fiable et sert d'indicateur « non enregistré ».
  const dirty = JSON.stringify(draft) !== JSON.stringify(initial);
  return { draft, dirty, formRef, refresh, resetForm };
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

const buildHero = (fd: FormData): HeroValues => ({
  badge: field(fd, "badge"),
  title: field(fd, "title"),
  title_accent: field(fd, "title_accent"),
  subtitle: field(fd, "subtitle"),
  cta_primary_label: field(fd, "cta_primary_label"),
  cta_primary_href: field(fd, "cta_primary_href"),
  cta_secondary_label: field(fd, "cta_secondary_label"),
  cta_secondary_href: field(fd, "cta_secondary_href"),
});

export function HeroEditor({ values }: { values: HeroValues }) {
  const [state, action, pending] = useActionState(saveHeroAction, INITIAL);
  const { draft, dirty, formRef, refresh, resetForm } = useLivePreview(buildHero, values);
  return (
    <div className={styles.editorSplit}>
      <form ref={formRef} onInput={refresh} action={action} className={styles.form}>
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
        <Actions pending={pending} dirty={dirty} onReset={resetForm} />
      </form>
      <PreviewPanel title="Hero" dirty={dirty}>
        <HeroPreview values={draft} />
      </PreviewPanel>
    </div>
  );
}

export type AboutValues = {
  mission_title: string;
  mission_text: string;
  vision_title: string;
  vision_text: string;
  stats_lines: string;
};

const buildAbout = (fd: FormData): AboutValues => ({
  mission_title: field(fd, "mission_title"),
  mission_text: field(fd, "mission_text"),
  vision_title: field(fd, "vision_title"),
  vision_text: field(fd, "vision_text"),
  stats_lines: field(fd, "stats"),
});

export function AboutEditor({ values }: { values: AboutValues }) {
  const [state, action, pending] = useActionState(saveAboutAction, INITIAL);
  const { draft, dirty, formRef, refresh, resetForm } = useLivePreview(buildAbout, values);
  return (
    <div className={styles.editorSplit}>
      <form ref={formRef} onInput={refresh} action={action} className={styles.form}>
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
        <Actions pending={pending} dirty={dirty} onReset={resetForm} />
      </form>
      <PreviewPanel title="À propos" dirty={dirty}>
        <AboutPreview values={draft} />
      </PreviewPanel>
    </div>
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

const buildCta = (fd: FormData): CtaValues => ({
  badge: field(fd, "badge"),
  title_line1: field(fd, "title_line1"),
  title_line2: field(fd, "title_line2"),
  button_label: field(fd, "button_label"),
  button_href: field(fd, "button_href"),
  socials_lines: field(fd, "socials"),
});

export function CtaEditor({ values }: { values: CtaValues }) {
  const [state, action, pending] = useActionState(saveCtaAction, INITIAL);
  const { draft, dirty, formRef, refresh, resetForm } = useLivePreview(buildCta, values);
  return (
    <div className={styles.editorSplit}>
      <form ref={formRef} onInput={refresh} action={action} className={styles.form}>
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
        <Actions pending={pending} dirty={dirty} onReset={resetForm} />
      </form>
      <PreviewPanel title="CTA & réseaux" dirty={dirty}>
        <CtaPreview values={draft} />
      </PreviewPanel>
    </div>
  );
}

export type SeoValues = {
  site_name: string;
  title: string;
  description: string;
  locale: string;
  og_image: string;
};

const buildSeo = (fd: FormData): SeoValues => ({
  site_name: field(fd, "site_name"),
  title: field(fd, "title"),
  description: field(fd, "description"),
  locale: field(fd, "locale"),
  og_image: field(fd, "og_image"),
});

export function SeoEditor({ values }: { values: SeoValues }) {
  const [state, action, pending] = useActionState(saveSeoAction, INITIAL);
  const { draft, dirty, formRef, refresh, resetForm } = useLivePreview(buildSeo, values);
  return (
    <div className={styles.editorSplit}>
      <form ref={formRef} onInput={refresh} action={action} className={styles.form}>
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
        <Actions pending={pending} dirty={dirty} onReset={resetForm} />
      </form>
      <PreviewPanel title="SEO" dirty={dirty}>
        <SeoPreview values={draft} />
      </PreviewPanel>
    </div>
  );
}

export type IdentityValues = {
  logo_url: string;
  favicon_url: string;
  accent_color: string;
};

const buildIdentity = (fd: FormData): IdentityValues => ({
  logo_url: field(fd, "logo_url"),
  favicon_url: field(fd, "favicon_url"),
  accent_color: field(fd, "accent_color"),
});

export function IdentityEditor({ values }: { values: IdentityValues }) {
  const [state, action, pending] = useActionState(saveIdentityAction, INITIAL);
  const { draft, dirty, formRef, refresh, resetForm } = useLivePreview(buildIdentity, values);
  return (
    <div className={styles.editorSplit}>
      <form ref={formRef} onInput={refresh} action={action} className={styles.form}>
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
        <Actions pending={pending} dirty={dirty} onReset={resetForm} />
      </form>
      <PreviewPanel title="Identité" dirty={dirty}>
        <IdentityPreview values={draft} />
      </PreviewPanel>
    </div>
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
  // Liste « enregistrée » de référence : si la base est vide, l'éditeur
  // affiche quand même une ligne vide. Elle sert aussi de comparaison pour
  // l'indicateur « non enregistré » (sinon une liste vide paraîtrait modifiée).
  const initialRows = initial.length > 0 ? initial : [empty()];
  const [rows, setRows] = useState<Row<T>[]>(() =>
    initialRows.map((data, i) => ({
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
  /** Restaure la liste initiale (ajouts/retraits/ordre annulés). */
  function reset() {
    setRows(initialRows.map((data, i) => ({ key: `init-${i}`, data })));
  }
  return { rows, add, remove, move, reset, initialRows };
}

/**
 * Dans les éditeurs de liste, l'ajout / le retrait / le réordonnancement ne
 * déclenchent pas d'événement `input` : l'aperçu est rafraîchi après chaque
 * changement de lignes (la relecture se fait sur le DOM déjà à jour).
 */
function useRowsPreviewRefresh(
  rows: unknown,
  refresh: () => void,
): void {
  useEffect(() => {
    refresh();
  }, [rows, refresh]);
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

const buildServices = (fd: FormData): ServiceRow[] => {
  const count = Number(fd.get("count") ?? "0");
  const out: ServiceRow[] = [];
  for (let i = 0; i < count; i += 1) {
    out.push({
      title: field(fd, `rows_${i}_title`),
      description: field(fd, `rows_${i}_description`),
      icon: field(fd, `rows_${i}_icon`),
    });
  }
  return out;
};

export function ServicesEditor({ initial }: { initial: ServiceRow[] }) {
  const [state, action, pending] = useActionState(saveServicesAction, INITIAL);
  const { rows, add, remove, move, reset: resetRows, initialRows } = useRows<ServiceRow>(
    initial,
    () => ({ title: "", description: "", icon: "" }),
  );
  const { draft, dirty, formRef, refresh, resetForm } = useLivePreview(buildServices, initialRows);
  useRowsPreviewRefresh(rows, refresh);
  const handleReset = useCallback(() => {
    resetForm();
    resetRows();
  }, [resetForm, resetRows]);

  return (
    <div className={styles.editorSplit}>
      <form ref={formRef} onInput={refresh} action={action} className={styles.form}>
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
        <Actions pending={pending} dirty={dirty} onReset={handleReset} label="Enregistrer les services" />
      </form>
      <PreviewPanel title="Services" dirty={dirty}>
        <ServicesPreview rows={draft} />
      </PreviewPanel>
    </div>
  );
}

export type TestimonialRow = {
  name: string;
  role: string;
  text: string;
  linkedin_url: string;
  published: boolean;
};

const buildTestimonials = (fd: FormData): TestimonialRow[] => {
  const count = Number(fd.get("count") ?? "0");
  const out: TestimonialRow[] = [];
  for (let i = 0; i < count; i += 1) {
    out.push({
      name: field(fd, `rows_${i}_name`),
      role: field(fd, `rows_${i}_role`),
      text: field(fd, `rows_${i}_text`),
      linkedin_url: field(fd, `rows_${i}_linkedin_url`),
      published: fd.get(`published_${i}`) === "on",
    });
  }
  return out;
};

export function TestimonialsEditor({ initial }: { initial: TestimonialRow[] }) {
  const [state, action, pending] = useActionState(saveTestimonialsAction, INITIAL);
  const { rows, add, remove, move, reset: resetRows, initialRows } = useRows<TestimonialRow>(
    initial,
    () => ({ name: "", role: "", text: "", linkedin_url: "", published: true }),
  );
  const { draft, dirty, formRef, refresh, resetForm } = useLivePreview(buildTestimonials, initialRows);
  useRowsPreviewRefresh(rows, refresh);
  const handleReset = useCallback(() => {
    resetForm();
    resetRows();
  }, [resetForm, resetRows]);

  return (
    <div className={styles.editorSplit}>
      <form ref={formRef} onInput={refresh} action={action} className={styles.form}>
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
        <Actions pending={pending} dirty={dirty} onReset={handleReset} label="Enregistrer les témoignages" />
      </form>
      <PreviewPanel title="Témoignages" dirty={dirty}>
        <TestimonialsPreview rows={draft} />
      </PreviewPanel>
    </div>
  );
}

export type FaqRow = { question: string; answer: string };

const buildFaqs = (fd: FormData): FaqRow[] => {
  const count = Number(fd.get("count") ?? "0");
  const out: FaqRow[] = [];
  for (let i = 0; i < count; i += 1) {
    out.push({
      question: field(fd, `rows_${i}_question`),
      answer: field(fd, `rows_${i}_answer`),
    });
  }
  return out;
};

export function FaqEditor({ initial }: { initial: FaqRow[] }) {
  const [state, action, pending] = useActionState(saveFaqsAction, INITIAL);
  const { rows, add, remove, move, reset: resetRows, initialRows } = useRows<FaqRow>(
    initial,
    () => ({ question: "", answer: "" }),
  );
  const { draft, dirty, formRef, refresh, resetForm } = useLivePreview(buildFaqs, initialRows);
  useRowsPreviewRefresh(rows, refresh);
  const handleReset = useCallback(() => {
    resetForm();
    resetRows();
  }, [resetForm, resetRows]);

  return (
    <div className={styles.editorSplit}>
      <form ref={formRef} onInput={refresh} action={action} className={styles.form}>
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
        <Actions pending={pending} dirty={dirty} onReset={handleReset} label="Enregistrer la FAQ" />
      </form>
      <PreviewPanel title="FAQ" dirty={dirty}>
        <FaqPreview rows={draft} />
      </PreviewPanel>
    </div>
  );
}
