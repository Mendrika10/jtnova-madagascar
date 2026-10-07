"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { messageNoteSchema, messageStatusSchema } from "@/lib/validation";

/**
 * S6 — Server Actions de la boîte de réception (F6.3 statuts, F6.4 notes).
 * Contrat projet : validation Zod côté serveur, écritures via le client lié
 * à la session (RLS : les admins seuls écrivent), revalidation des vues de
 * l'admin puis redirection avec code de résultat (`?saved=1`).
 */

function revalidateInbox(id?: string): void {
  revalidatePath("/admin/messages");
  if (id) revalidatePath(`/admin/messages/${id}`);
  revalidatePath("/admin");
}

/** F6.3 — changement de statut (nouveau / lu / répondu / archivé). */
export async function setMessageStatusAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const parsed = messageStatusSchema.safeParse(
    String(formData.get("status") ?? ""),
  );
  if (!id || !parsed.success) {
    redirect("/admin/messages?error=invalid");
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect("/admin/messages?error=unavailable");
  }

  const { error } = await supabase
    .from("contact_messages")
    .update({ status: parsed.data })
    .eq("id", id);

  revalidateInbox(id);
  redirect(
    error ? `/admin/messages/${id}?error=save` : `/admin/messages/${id}?saved=1`,
  );
}

/** F6.4 — note interne (enregistrée puis rechargée). */
export async function saveMessageNoteAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const parsed = messageNoteSchema.safeParse({
    notes: String(formData.get("notes") ?? ""),
  });
  if (!id || !parsed.success) {
    redirect(`/admin/messages/${id || ""}?error=invalid`);
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect(`/admin/messages/${id}?error=unavailable`);
  }

  const notes = parsed.data.notes === "" ? null : parsed.data.notes;
  const { error } = await supabase
    .from("contact_messages")
    .update({ notes })
    .eq("id", id);

  revalidateInbox(id);
  redirect(
    error ? `/admin/messages/${id}?error=save` : `/admin/messages/${id}?noted=1`,
  );
}
