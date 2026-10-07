/**
 * F7.3 — helpers de liens « client-safe » (module pur, sans dépendance
 * serveur : importable aussi bien par un composant client que serveur).
 */

/**
 * Un `href` réellement utilisable : non vide et différent de `#`.
 * Les maquettes historiques utilisaient `href="#"` comme bouchon ; un tel
 * lien est mort (il ramène en haut de page) : on préfère alors rendre un
 * simple libellé non cliquable plutôt qu'un faux lien.
 */
export function isUsableHref(href?: string | null): href is string {
  const value = href?.trim();
  return Boolean(value) && value !== "#";
}
