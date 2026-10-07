/**
 * F7.4 — helpers d'images « client-safe » (module pur).
 */

/** Hôtes distants déclarés dans `next.config.ts` (`images.remotePatterns`). */
const OPTIMIZABLE_REMOTE_HOSTS = ["ik.imagekit.io", "images.unsplash.com"];

/**
 * Indique s'il faut désactiver l'optimiseur pour ce `src`.
 *
 * Un `src` local (`/images/...`) est toujours optimisable. Un `src` distant
 * dont l'hôte n'est pas déclaré dans `next.config.ts` ne doit **pas** passer
 * par `_next/image` (Next lèverait une erreur « hostname is not configured ») :
 * on le rend alors brut pour ne jamais casser la page.
 */
export function shouldSkipOptimizer(src: string): boolean {
  if (!/^https?:\/\//i.test(src)) return false;
  try {
    const { hostname } = new URL(src);
    return !OPTIMIZABLE_REMOTE_HOSTS.includes(hostname);
  } catch {
    return true;
  }
}
