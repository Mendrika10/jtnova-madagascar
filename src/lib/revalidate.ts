import { revalidatePath } from "next/cache";

/**
 * Revalide à la demande les pages publiques impactées par une mutation de
 * contenu. À appeler depuis une Server Action ou un Route Handler, juste après
 * l'écriture en base, pour qu'une édition soit visible en quelques secondes
 * sans attendre la fenêtre ISR (`revalidate = 60`).
 *
 * Les mutations de contenu arrivent en S4 (/admin) ; d'ici là, les pages
 * publiques restent rafraîchies par l'ISR.
 */
export function revalidateProjectPaths(slug?: string): void {
  revalidatePath("/");
  revalidatePath("/projets");
  if (slug) revalidatePath(`/projects/${slug}`);
}

/** Revalide les pages qui affichent des contenus éditoriaux globaux. */
export function revalidateContentPaths(): void {
  revalidatePath("/");
  revalidatePath("/projets");
}
