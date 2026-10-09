"use client";

import {
  useActionState,
  useState,
  type ComponentType,
  type ReactNode,
  type SVGAttributes,
} from "react";
import {
  AlignLeft,
  BookOpen,
  Calendar,
  Cpu,
  Eye,
  FileText,
  Filter,
  Folder,
  Globe,
  GitHub,
  Hash,
  Image as ImageIcon,
  Layers,
  Layout,
  Link as LinkIcon,
  MessageSquare,
  Shield,
  Sliders,
  Sparkles,
  Star,
  Tag,
  Type as TypeIcon,
  User,
  Video,
  Zap,
} from "@deemlol/next-icons";
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

/** Icônes du paquet @deemlol/next-icons (mêmes props que celles déjà utilisées). */
type IconProps = SVGAttributes<SVGElement> & {
  size?: string | number;
  strokeWidth?: string | number;
};
type FieldIcon = ComponentType<IconProps>;

type FieldSpec = {
  name: TextFieldName;
  label: string;
  /** Icône affichée devant le libellé, choisie pour correspondre au champ. */
  icon: FieldIcon;
  placeholder?: string;
  hint?: string;
  textarea?: boolean;
  /** Occupe toute la largeur, sous la grille (textes longs). */
  wide?: boolean;
};

type FieldGroup = {
  title: string;
  icon: FieldIcon;
  fields: FieldSpec[];
};

type TabId = "essentiel" | "details" | "liens" | "images";

type TabSpec = {
  id: TabId;
  label: string;
  icon: FieldIcon;
  intro: string;
  /** Regroupements de champs ; l'onglet « Images » n'en porte aucun. */
  groups: FieldGroup[];
};

/**
 * Découpage du formulaire en onglets, eux-mêmes découpés en groupes de champs
 * (même logique de champs d'un groupe à l'autre : classement, récit, etc.).
 * L'ordre des champs sert aussi à retrouver l'onglet à ouvrir quand
 * l'enregistrement est refusé. Le dernier onglet (Images) ne porte aucun champ
 * du formulaire : son contenu est fourni par la page via `imagesPanel`.
 */
const TABS: TabSpec[] = [
  {
    id: "essentiel",
    label: "Essentiel",
    icon: Sparkles,
    intro:
      "Ce qui identifie la réalisation : son titre, son URL et le résumé affiché sur la carte.",
    groups: [
      {
        title: "Identité du projet",
        icon: Layout,
        fields: [
          {
            name: "title",
            label: "Titre",
            icon: TypeIcon,
            placeholder: "Refonte du site vitrine",
          },
          {
            name: "slug",
            label: "Slug (URL)",
            icon: Hash,
            placeholder: "refonte-site-vitrine",
            hint: "Minuscules, chiffres et tirets. Sert d'URL : /projects/<slug>",
          },
          {
            name: "description",
            label: "Description (résumé, 10–600 car.)",
            icon: AlignLeft,
            placeholder: "Ce que le projet apporte, en une ou deux phrases.",
            textarea: true,
            wide: true,
          },
        ],
      },
    ],
  },
  {
    id: "details",
    label: "Détails",
    icon: FileText,
    intro:
      "Le contenu détaillé présenté sur la page du projet : classement, textes longs, technologies et points forts.",
    groups: [
      {
        title: "Classement",
        icon: Filter,
        fields: [
          {
            name: "tag",
            label: "Étiquette (tag)",
            icon: Tag,
            placeholder: "Design · Développement",
          },
          {
            name: "category",
            label: "Catégorie",
            icon: Folder,
            placeholder: "Site web",
          },
          {
            name: "year",
            label: "Année",
            icon: Calendar,
            placeholder: "2026",
          },
          {
            name: "client_name",
            label: "Client (optionnel)",
            icon: User,
            placeholder: "Nom du client",
          },
        ],
      },
      {
        title: "Récit du projet",
        icon: BookOpen,
        fields: [
          {
            name: "presentation",
            label: "Présentation",
            icon: FileText,
            placeholder: "Le contexte et le besoin du client.",
            textarea: true,
            wide: true,
          },
          {
            name: "explication",
            label: "Explication",
            icon: MessageSquare,
            placeholder: "La solution proposée et les choix techniques.",
            textarea: true,
            wide: true,
          },
        ],
      },
      {
        title: "Qualité technique",
        icon: Sliders,
        fields: [
          {
            name: "security",
            label: "Sécurité",
            icon: Shield,
            placeholder: "Mesures de sécurité mises en place.",
            textarea: true,
          },
          {
            name: "performance",
            label: "Performance",
            icon: Zap,
            placeholder: "Résultats mesurés et optimisations.",
            textarea: true,
          },
        ],
      },
      {
        title: "Contenus de la page",
        icon: Layers,
        fields: [
          {
            name: "tech",
            label: "Technologies (une par ligne)",
            icon: Cpu,
            placeholder: "Next.js\nTypeScript\nSupabase",
            textarea: true,
            wide: true,
          },
          {
            name: "highlights",
            label: "Points forts (un par ligne)",
            icon: Star,
            placeholder: "Chargement divisé par deux\nParcours mobile repensé",
            textarea: true,
            wide: true,
          },
        ],
      },
    ],
  },
  {
    id: "liens",
    label: "Liens",
    icon: LinkIcon,
    intro:
      "Les liens à ouvrir depuis le projet, puis la visibilité sur le site public.",
    groups: [
      {
        title: "Adresses du projet",
        icon: LinkIcon,
        fields: [
          {
            name: "live_url",
            label: "Lien du site",
            icon: Globe,
            placeholder: "https://exemple.mg",
          },
          {
            name: "repo_url",
            label: "Lien du code",
            icon: GitHub,
            placeholder: "https://github.com/…",
          },
          {
            name: "video_url",
            label: "Vidéo (URL)",
            icon: Video,
            placeholder: "https://…/presentation.mp4",
          },
          {
            name: "video_poster",
            label: "Vignette vidéo (URL)",
            icon: ImageIcon,
            placeholder: "https://…/vignette.jpg",
          },
        ],
      },
    ],
  },
  {
    id: "images",
    label: "Images",
    icon: ImageIcon,
    intro:
      "La galerie du projet. Chaque image doit porter un texte alternatif (alt) ; les images ajoutées apparaissent sur le site dès l'envoi, sans réenregistrer le projet.",
    groups: [],
  },
];

/** Tous les champs d'un onglet, groupes confondus. */
function tabFields(tab: TabSpec): FieldSpec[] {
  return tab.groups.flatMap((group) => group.fields);
}

function initialValues(initial: ProjectFormInitial): Record<TextFieldName, string> {
  const values = {} as Record<TextFieldName, string>;
  for (const name of TEXT_FIELDS) values[name] = initial[name] ?? "";
  return values;
}

function Field({
  spec,
  value,
  onChange,
  error,
}: {
  spec: FieldSpec;
  value: string;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  error?: string;
}) {
  const Icon = spec.icon;
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>
        <span className={styles.fieldIcon} aria-hidden>
          <Icon size={13} strokeWidth={2} />
        </span>
        {spec.label}
      </span>
      {spec.textarea ? (
        <textarea
          name={spec.name}
          value={value}
          onChange={onChange}
          rows={4}
          placeholder={spec.placeholder}
          className={styles.textarea}
        />
      ) : (
        <input
          name={spec.name}
          type="text"
          value={value}
          onChange={onChange}
          placeholder={spec.placeholder}
          className={styles.input}
        />
      )}
      {spec.hint && <span className={styles.fieldHint}>{spec.hint}</span>}
      {error && <span className={styles.fieldError}>{error}</span>}
    </label>
  );
}

function Group({
  group,
  values,
  errors,
  onChange,
}: {
  group: FieldGroup;
  values: Record<TextFieldName, string>;
  errors: ProjectFormState["errors"];
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
}) {
  const Icon = group.icon;
  // Champs courts côte à côte, textes longs empilés sous la grille.
  const inline = group.fields.filter((field) => !field.wide);
  const wide = group.fields.filter((field) => field.wide);

  return (
    <div className={styles.fieldGroup}>
      <p className={styles.fieldGroupTitle}>
        <span className={styles.fieldGroupIcon} aria-hidden>
          <Icon size={14} strokeWidth={2} />
        </span>
        {group.title}
      </p>
      {inline.length > 0 && (
        <div
          className={`${styles.formGrid} ${
            inline.length >= 4 ? styles.formGridWide : ""
          }`}
        >
          {inline.map((spec) => (
            <Field
              key={spec.name}
              spec={spec}
              value={values[spec.name]}
              onChange={onChange}
              error={errors[spec.name]}
            />
          ))}
        </div>
      )}
      {wide.map((spec) => (
        <Field
          key={spec.name}
          spec={spec}
          value={values[spec.name]}
          onChange={onChange}
          error={errors[spec.name]}
        />
      ))}
    </div>
  );
}

export default function ProjectForm({
  initial,
  imagesPanel,
  initialTab,
}: {
  initial: ProjectFormInitial;
  /** Contenu de l'onglet « Images », rendu par la page (liste, suppression, envoi). */
  imagesPanel?: ReactNode;
  /** Onglet ouvert au chargement (sert à revenir sur « Images » après un envoi). */
  initialTab?: TabId;
}) {
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
  const [tab, setTab] = useState<TabId>(initialTab ?? "essentiel");
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
    const errorTab = TABS.find((t) =>
      tabFields(t).some((field) => state.errors[field.name]),
    );
    if (errorTab) setTab(errorTab.id);
  }

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  }

  function errorsIn(fields: FieldSpec[]) {
    return fields.filter((field) => state.errors[field.name]).length;
  }

  const textTabs = TABS.filter((t) => t.groups.length > 0);

  // La barre d'onglets et le panneau « Images » sont volontairement **frères**
  // du `<form>`, pas ses enfants : la liste des images porte ses propres
  // formulaires (suppression d'une image), et un `<form>` imbriqué dans un
  // autre est interdit en HTML.
  return (
    <>
      {state.errors._ && (
        <p className={styles.error} role="alert">
          {state.errors._}
        </p>
      )}

      <div
        role="tablist"
        aria-label="Sections de la réalisation"
        className={`${styles.tabs} ${styles.formTabs}`}
      >
        {TABS.map((t) => {
          const Icon = t.icon;
          const count = errorsIn(tabFields(t));
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={active}
              aria-controls={`panel-${t.id}`}
              className={`${styles.tab} ${active ? styles.tabActive : ""}`}
              onClick={() => setTab(t.id)}
            >
              <Icon size={14} strokeWidth={2} aria-hidden />
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

      <form
        action={formAction}
        className={`${styles.form} ${styles.formCard}`}
        hidden={tab === "images"}
      >
        {initial.id && <input type="hidden" name="id" value={initial.id} />}

        {textTabs.map((t) => (
          <div
            key={t.id}
            role="tabpanel"
            id={`panel-${t.id}`}
            aria-labelledby={`tab-${t.id}`}
            hidden={tab !== t.id}
          >
            <p className={styles.tabIntro}>{t.intro}</p>
            {t.groups.map((group) => (
              <Group
                key={group.title}
                group={group}
                values={values}
                errors={state.errors}
                onChange={handleChange}
              />
            ))}
            {t.id === "liens" && (
              <label className={`${styles.checkboxRow} ${styles.checkboxCard}`}>
                <input
                  key={generation}
                  type="checkbox"
                  name="published"
                  defaultChecked={published}
                  onChange={(event) => setPublished(event.target.checked)}
                />
                <span className={styles.fieldIcon} aria-hidden>
                  <Eye size={13} strokeWidth={2} />
                </span>
                <span>Publiée (visible sur le site public)</span>
              </label>
            )}
          </div>
        ))}

        <div className={styles.formActions}>
          <button type="submit" className={styles.submit} disabled={pending}>
            {pending ? "Enregistrement…" : initial.id ? "Enregistrer" : "Créer la réalisation"}
          </button>
        </div>
      </form>

      <div
        role="tabpanel"
        id="panel-images"
        aria-labelledby="tab-images"
        hidden={tab !== "images"}
        className={`${styles.formCard} ${styles.imagesCard}`}
      >
        <p className={styles.tabIntro}>{TABS[3].intro}</p>
        {imagesPanel}
      </div>
    </>
  );
}
