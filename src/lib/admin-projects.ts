import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];

export type AdminProjectListItem = Pick<
  ProjectRow,
  "id" | "slug" | "title" | "year" | "category" | "published" | "sort_order"
>;

export type ProjectImageRow = Database["public"]["Tables"]["project_images"]["Row"];
export type ProjectTechRow = Database["public"]["Tables"]["project_tech"]["Row"];
export type ProjectHighlightRow =
  Database["public"]["Tables"]["project_highlights"]["Row"];

export type ProjectWithChildren = {
  project: ProjectRow;
  images: ProjectImageRow[];
  tech: ProjectTechRow[];
  highlights: ProjectHighlightRow[];
};

/** Toutes les réalisations (brouillons compris), ordonnées. */
export async function listAllProjects(
  supabase: SupabaseClient<Database>,
): Promise<AdminProjectListItem[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("id, slug, title, year, category, published, sort_order")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return data;
}

/** Une réalisation complète (projet + images, technologies, points forts). */
export async function getProjectForEdit(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<ProjectWithChildren | null> {
  const { data: project, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !project) return null;

  const [images, tech, highlights] = await Promise.all([
    supabase
      .from("project_images")
      .select("*")
      .eq("project_id", id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("project_tech")
      .select("*")
      .eq("project_id", id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("project_highlights")
      .select("*")
      .eq("project_id", id)
      .order("sort_order", { ascending: true }),
  ]);

  return {
    project,
    images: images.data ?? [],
    tech: tech.data ?? [],
    highlights: highlights.data ?? [],
  };
}
