"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { projectFormSchema, parseLines } from "@/lib/validation";
import { recordSlugChange } from "@/lib/slug-history";

export type ProjectFormState = {
  errors: Record<string, string>;
  values: Record<string, string>;
};

const ADMIN_LIST = "/admin/realisations";

function revalidateProject(slug?: string | null) {
  revalidatePath("/");
  revalidatePath("/projets");
  revalidatePath(ADMIN_LIST);
  if (slug) revalidatePath(`/projects/${slug}`);
}

function emptyToNull(value: string): string | null {
  const v = value.trim();
  return v === "" ? null : v;
}

export async function saveProjectAction(
  _prev: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  const raw: Record<string, string> = {
    title: String(formData.get("title") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    tag: String(formData.get("tag") ?? ""),
    category: String(formData.get("category") ?? ""),
    year: String(formData.get("year") ?? ""),
    description: String(formData.get("description") ?? ""),
    presentation: String(formData.get("presentation") ?? ""),
    explication: String(formData.get("explication") ?? ""),
    security: String(formData.get("security") ?? ""),
    performance: String(formData.get("performance") ?? ""),
    client_name: String(formData.get("client_name") ?? ""),
    live_url: String(formData.get("live_url") ?? ""),
    repo_url: String(formData.get("repo_url") ?? ""),
    video_url: String(formData.get("video_url") ?? ""),
    video_poster: String(formData.get("video_poster") ?? ""),
  };

  const parsed = projectFormSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "_");
      if (!errors[key]) errors[key] = issue.message;
    }
    return { errors, values: raw };
  }

  const data = parsed.data;
  const id = String(formData.get("id") ?? "").trim();
  const published = formData.get("published") === "on";
  const tech = parseLines(formData.get("tech"));
  const highlights = parseLines(formData.get("highlights"));

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { errors: { _: "Supabase n'est pas configuré." }, values: raw };
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { errors: { _: "Session expirée, reconnectez-vous." }, values: raw };
  }

  const payload = {
    title: data.title,
    slug: data.slug,
    tag: emptyToNull(data.tag),
    category: emptyToNull(data.category),
    year: emptyToNull(data.year),
    description: data.description,
    presentation: emptyToNull(data.presentation),
    explication: emptyToNull(data.explication),
    security: emptyToNull(data.security),
    performance: emptyToNull(data.performance),
    client_name: emptyToNull(data.client_name),
    live_url: emptyToNull(data.live_url),
    repo_url: emptyToNull(data.repo_url),
    video_url: emptyToNull(data.video_url),
    video_poster: emptyToNull(data.video_poster),
    published,
  };

  if (id) {
    const { data: existing } = await supabase
      .from("projects")
      .select("slug")
      .eq("id", id)
      .maybeSingle();

    const { error } = await supabase.from("projects").update(payload).eq("id", id);
    if (error) return { errors: { _: error.message }, values: raw };

    if (existing && existing.slug !== data.slug) {
      await recordSlugChange(supabase, existing.slug, data.slug);
    }

    await supabase.from("project_tech").delete().eq("project_id", id);
    await supabase.from("project_highlights").delete().eq("project_id", id);
    await replaceChildren(supabase, id, tech, highlights);

    revalidateProject(data.slug);
    if (existing) revalidateProject(existing.slug);
    redirect(`${ADMIN_LIST}/${id}?saved=1`);
  }

  const { data: maxRow } = await supabase
    .from("projects")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: created, error } = await supabase
    .from("projects")
    .insert({ ...payload, sort_order: (maxRow?.sort_order ?? 0) + 1 })
    .select("id")
    .single();

  if (error || !created) {
    return { errors: { _: error?.message ?? "Création impossible." }, values: raw };
  }

  await replaceChildren(supabase, created.id, tech, highlights);
  revalidateProject(data.slug);
  redirect(`${ADMIN_LIST}/${created.id}?created=1`);
}

async function replaceChildren(
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>,
  projectId: string,
  tech: string[],
  highlights: string[],
) {
  if (tech.length > 0) {
    await supabase
      .from("project_tech")
      .insert(tech.map((label, i) => ({ project_id: projectId, label, sort_order: i })));
  }
  if (highlights.length > 0) {
    await supabase.from("project_highlights").insert(
      highlights.map((text, i) => ({ project_id: projectId, text, sort_order: i })),
    );
  }
}

export async function deleteProjectAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "").trim();
  const supabase = await createSupabaseServerClient();
  if (supabase && id) {
    const { data: project } = await supabase
      .from("projects")
      .select("slug")
      .eq("id", id)
      .maybeSingle();
    await supabase.from("projects").delete().eq("id", id);
    revalidateProject(project?.slug);
  }
  redirect(`${ADMIN_LIST}?deleted=1`);
}

export async function moveProjectAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "").trim();
  const direction = String(formData.get("direction") ?? "");
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect(ADMIN_LIST);

  const { data: list } = await supabase
    .from("projects")
    .select("id")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (list) {
    const ordered = list.map((p) => p.id);
    const index = ordered.indexOf(id);
    const target = direction === "up" ? index - 1 : index + 1;
    if (index >= 0 && target >= 0 && target < ordered.length) {
      const [moved] = ordered.splice(index, 1);
      ordered.splice(target, 0, moved);
      await Promise.all(
        ordered.map((projectId, i) =>
          supabase.from("projects").update({ sort_order: i + 1 }).eq("id", projectId),
        ),
      );
      revalidateProject();
    }
  }
  redirect(ADMIN_LIST);
}

export async function addImagesAction(formData: FormData): Promise<void> {
  const projectId = String(formData.get("project_id") ?? "").trim();
  let entries: { url: string; alt: string }[] = [];
  try {
    entries = JSON.parse(String(formData.get("entries") ?? "[]"));
  } catch {
    entries = [];
  }

  const supabase = await createSupabaseServerClient();
  if (supabase && projectId) {
    const { data: maxRow } = await supabase
      .from("project_images")
      .select("sort_order")
      .eq("project_id", projectId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    let order = maxRow?.sort_order ?? 0;
    const rows = entries
      .filter((e) => e && typeof e.url === "string" && e.url && e.alt?.trim())
      .map((e) => ({
        project_id: projectId,
        url: e.url,
        alt: e.alt.trim(),
        sort_order: ++order,
      }));

    if (rows.length > 0) {
      await supabase.from("project_images").insert(rows);
      const { data: project } = await supabase
        .from("projects")
        .select("slug")
        .eq("id", projectId)
        .maybeSingle();
      revalidateProject(project?.slug);
    }
  }
  redirect(`${ADMIN_LIST}/${projectId}?images=1`);
}

export async function deleteImageAction(formData: FormData): Promise<void> {
  const imageId = String(formData.get("image_id") ?? "").trim();
  const projectId = String(formData.get("project_id") ?? "").trim();
  const supabase = await createSupabaseServerClient();
  if (supabase && imageId) {
    await supabase.from("project_images").delete().eq("id", imageId);
    const { data: project } = await supabase
      .from("projects")
      .select("slug")
      .eq("id", projectId)
      .maybeSingle();
    revalidateProject(project?.slug);
  }
  redirect(`${ADMIN_LIST}/${projectId}?images=1`);
}
