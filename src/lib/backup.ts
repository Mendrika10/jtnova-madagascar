/**
 * F7.7 — sauvegarde des contenus publics : export JSON + script SQL **rejouable**.
 *
 * Ce module est la source unique de vérité : l'API (`/api/export`) l'utilise
 * côté serveur pour produire la sauvegarde, et `scripts/backup-content.mjs`
 * se contente de télécharger le résultat (aucun identifiant Supabase n'est
 * donc nécessaire dans la CI).
 *
 * Périmètre : uniquement les **contenus publics** (réalisations, services,
 * témoignages, FAQ, technologies, réglages du site). Les messages de contact
 * (données de visiteurs) et les comptes ne sont volontairement pas exportés.
 */

export type ColumnType = "uuid" | "text" | "int" | "bool" | "json" | "ts";

export type TableSpec = {
  name: string;
  /** Colonnes dans l'ordre d'insertion. */
  columns: { name: string; type: ColumnType }[];
  /** Colonne de tri de lecture (pour un export stable et lisible dans un diff). */
  order: string;
  /**
   * Portée du rejeu : `published` = seules les lignes publiées exportées sont
   * remplacées (les brouillons éventuels sont conservés) ; `all` = table
   * entièrement contenue dans la sauvegarde.
   */
  scope: "published" | "all";
  /** Table enfant : lignes limitées aux projets publiés (clé étrangère). */
  childOfProjects?: boolean;
};

export const BACKUP_TABLES: TableSpec[] = [
  {
    name: "projects",
    order: "sort_order,slug",
    scope: "published",
    columns: [
      { name: "id", type: "uuid" },
      { name: "slug", type: "text" },
      { name: "title", type: "text" },
      { name: "tag", type: "text" },
      { name: "category", type: "text" },
      { name: "year", type: "text" },
      { name: "description", type: "text" },
      { name: "presentation", type: "text" },
      { name: "explication", type: "text" },
      { name: "security", type: "text" },
      { name: "performance", type: "text" },
      { name: "cover_image", type: "text" },
      { name: "video_url", type: "text" },
      { name: "video_poster", type: "text" },
      { name: "live_url", type: "text" },
      { name: "repo_url", type: "text" },
      { name: "client_name", type: "text" },
      { name: "featured", type: "bool" },
      { name: "published", type: "bool" },
      { name: "sort_order", type: "int" },
      { name: "created_at", type: "ts" },
      { name: "updated_at", type: "ts" },
    ],
  },
  {
    name: "project_images",
    order: "project_id,sort_order",
    scope: "published",
    childOfProjects: true,
    columns: [
      { name: "id", type: "uuid" },
      { name: "project_id", type: "uuid" },
      { name: "url", type: "text" },
      { name: "alt", type: "text" },
      { name: "sort_order", type: "int" },
    ],
  },
  {
    name: "project_highlights",
    order: "project_id,sort_order",
    scope: "published",
    childOfProjects: true,
    columns: [
      { name: "id", type: "uuid" },
      { name: "project_id", type: "uuid" },
      { name: "text", type: "text" },
      { name: "sort_order", type: "int" },
    ],
  },
  {
    name: "project_tech",
    order: "project_id,sort_order",
    scope: "published",
    childOfProjects: true,
    columns: [
      { name: "id", type: "uuid" },
      { name: "project_id", type: "uuid" },
      { name: "label", type: "text" },
      { name: "sort_order", type: "int" },
    ],
  },
  {
    name: "services",
    order: "sort_order,title",
    scope: "published",
    columns: [
      { name: "id", type: "uuid" },
      { name: "title", type: "text" },
      { name: "description", type: "text" },
      { name: "icon", type: "text" },
      { name: "sort_order", type: "int" },
      { name: "published", type: "bool" },
    ],
  },
  {
    name: "testimonials",
    order: "sort_order,name",
    scope: "published",
    columns: [
      { name: "id", type: "uuid" },
      { name: "name", type: "text" },
      { name: "role", type: "text" },
      { name: "avatar_text", type: "text" },
      { name: "text", type: "text" },
      { name: "linkedin_url", type: "text" },
      { name: "sort_order", type: "int" },
      { name: "published", type: "bool" },
    ],
  },
  {
    name: "faq_items",
    order: "sort_order,question",
    scope: "published",
    columns: [
      { name: "id", type: "uuid" },
      { name: "question", type: "text" },
      { name: "answer", type: "text" },
      { name: "sort_order", type: "int" },
      { name: "published", type: "bool" },
    ],
  },
  {
    name: "tech_banner",
    order: "sort_order,name",
    scope: "all",
    columns: [
      { name: "id", type: "uuid" },
      { name: "name", type: "text" },
      { name: "image_url", type: "text" },
      { name: "sort_order", type: "int" },
    ],
  },
  {
    name: "site_settings",
    order: "key",
    scope: "all",
    columns: [
      { name: "key", type: "text" },
      { name: "value", type: "json" },
      { name: "updated_at", type: "ts" },
    ],
  },
];

export type BackupPayload = {
  generatedAt: string;
  source: string;
  /** Révision du format, pour faire évoluer le rejeu sans ambiguïté. */
  format: 1;
  /** Toujours `published` : l'export ne contient que les contenus publics. */
  scope: "published";
  tables: Record<string, Record<string, unknown>[]>;
};

export type RawRow = Record<string, unknown>;

/** Échappe une valeur textuelle pour un littéral SQL `'...'`. */
function sqlText(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

function sqlValue(value: unknown, type: ColumnType): string {
  if (value === null || value === undefined) return "null";
  switch (type) {
    case "int":
      return String(Number(value));
    case "bool":
      return value ? "true" : "false";
    case "json":
      return `${sqlText(JSON.stringify(value))}::jsonb`;
    case "ts":
      return `${sqlText(String(value))}::timestamptz`;
    default:
      return sqlText(String(value));
  }
}

/**
 * Produit un script SQL **rejouable** : il remplace les contenus publics dans
 * une transaction (les brouillons éventuels sont conservés). Rejeu :
 * `psql "$DATABASE_URL" -f restore.sql` (rôle disposant des droits d'écriture,
 * par exemple l'éditeur SQL Supabase ou la connexion `postgres`).
 */
export function buildRestoreSql(payload: BackupPayload): string {
  const lines: string[] = [
    "-- F7.7 — restauration des contenus publics (script généré).",
    `-- Généré le ${payload.generatedAt} depuis ${payload.source}`,
    "-- Portée : lignes PUBLIÉES uniquement. Les brouillons existants ne sont pas touchés.",
    "-- Rejeu : psql \"$DATABASE_URL\" -f restore.sql",
    "begin;",
    "",
    "-- Suppression des seules lignes publiées (enfants avant parents).",
  ];

  // Enfants d'abord : leurs lignes sont rattachées aux projets publiés.
  for (const table of BACKUP_TABLES) {
    if (table.childOfProjects) {
      lines.push(
        `delete from public.${table.name} where project_id in (select id from public.projects where published = true);`,
      );
    }
  }
  for (const table of BACKUP_TABLES) {
    if (table.childOfProjects) continue;
    lines.push(
      table.scope === "published"
        ? `delete from public.${table.name} where published = true;`
        : `delete from public.${table.name};`,
    );
  }
  lines.push("");

  for (const table of BACKUP_TABLES) {
    const rows = payload.tables[table.name] ?? [];
    if (rows.length === 0) {
      lines.push(`-- ${table.name} : aucune ligne dans la sauvegarde.`);
      lines.push("");
      continue;
    }
    const cols = table.columns.map((c) => c.name).join(", ");
    lines.push(`-- ${table.name} : ${rows.length} ligne(s)`);
    lines.push(`insert into public.${table.name} (${cols}) values`);
    const tuples = rows.map((row) => {
      const values = table.columns
        .map((c) => sqlValue(row[c.name], c.type))
        .join(", ");
      return `  (${values})`;
    });
    lines.push(tuples.join(",\n") + ";");
    lines.push("");
  }

  lines.push("commit;", "");
  return lines.join("\n");
}
