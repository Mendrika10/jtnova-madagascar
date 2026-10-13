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
 *
 * ADMIN-UI — l'action **renvoie son résultat** au lieu de rediriger : le
 * bouton est un composant client qui affiche une notification (succès ou
 * échec) et laisse la revalidation rafraîchir le tableau. Un `redirect` ici
 * ferait recharger tout l'écran pour un simple changement de statut.
 */
export async function toggleErrorResolvedAction(
  id: string,
  resolved: boolean,
): Promise<{ ok: boolean; message?: string }> {
  const errorId = String(id ?? "").trim();
  if (!errorId) return { ok: false, message: "Erreur introuvable." };

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { ok: false, message: "Supabase n'est pas configuré." };
  }

  const result = await setErrorResolved(supabase, errorId, resolved);
  if (!result.ok) {
    await logError({
      message: `Marquage d'une erreur impossible : ${errorMessage(result.error)}`,
      source: "admin-sante",
    });
    return {
      ok: false,
      message: "Le marquage a échoué. Merci de réessayer.",
    };
  }

  revalidatePath("/admin/sante");
  return { ok: true };
}
