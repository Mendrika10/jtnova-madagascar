import { getSupabasePublicClient } from "./supabase/server";
import type { Json } from "./database.types";
import type { ErrorLevel } from "./validation";

export type LogErrorInput = {
  message: string;
  level?: ErrorLevel;
  source?: string;
  stack?: string;
  path?: string;
  userAgent?: string;
  context?: Record<string, unknown>;
};

/**
 * F7.8 — journalise une erreur applicative dans `error_logs`.
 *
 * Cette fonction ne lève **jamais** : une panne de journalisation ne doit pas
 * casser la fonctionnalité qui l'appelle. Sans Supabase configuré (ou si la
 * table n'existe pas encore), l'erreur part dans les logs serveur.
 *
 * Remarque : insertion **sans `.select()`** — demander la ligne en retour
 * ferait échouer la politique RLS de lecture (cf. bug corrigé en S6).
 */
export async function logError(input: LogErrorInput): Promise<void> {
  const level: ErrorLevel = input.level ?? "error";
  const source = (input.source ?? "server").slice(0, 40);
  const message = input.message.slice(0, 2000);

  console.error(`[${level}] ${source} — ${message}`);

  const supabase = getSupabasePublicClient();
  if (!supabase) return;

  try {
    const { error } = await supabase.from("error_logs").insert({
      level,
      source,
      message,
      stack: input.stack ? input.stack.slice(0, 8000) : null,
      path: input.path ? input.path.slice(0, 500) : null,
      user_agent: input.userAgent ? input.userAgent.slice(0, 500) : null,
      context: (input.context ?? null) as Json,
    });
    if (error) {
      console.error("[observabilité] insertion impossible :", error.message);
    }
  } catch (error) {
    console.error(
      "[observabilité] erreur inattendue :",
      error instanceof Error ? error.message : error,
    );
  }
}

/** Message d'erreur lisible depuis n'importe quelle valeur attrapée. */
export function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Erreur inconnue";
}
