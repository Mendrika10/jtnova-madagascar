"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { setErrorResolved } from "@/lib/admin-health";
import { logError } from "@/lib/observability";
import { errorMessage } from "@/lib/observability";

/**
 * F7.8 — marque une erreur comme traitée (ou la rouvre). Même garde que le
 * reste de l'admin : session + rôle vérifiés par la RLS (politique `update`
 * réservée au rôle admin).
 */
export async function toggleErrorResolvedAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const resolved = formData.get("resolved") === "1";
  if (!id) return;

  const supabase = await createSupabaseServerClient();
  if (!supabase) return;

  const result = await setErrorResolved(supabase, id, resolved);
  if (!result.ok) {
    await logError({
      message: `Marquage d'une erreur impossible : ${errorMessage(result.error)}`,
      source: "admin-sante",
    });
  }
  revalidatePath("/admin/sante");
}
