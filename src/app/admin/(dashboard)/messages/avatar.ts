/**
 * S6 — Avatars de la boîte de réception : initiales et teinte déterministes
 * par expéditeur. Aucune image, aucune table de correspondance — le même
 * message affiche toujours la même pastille, sur la liste comme sur la fiche.
 */

const TONES = [
  "toneBlue",
  "toneViolet",
  "toneTeal",
  "toneAmber",
  "toneRose",
  "toneSlate",
] as const;

export type AvatarTone = (typeof TONES)[number];

/** Initiales : première lettre du premier et du dernier mot, en majuscules. */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0]!.charAt(0);
  const last = parts.length > 1 ? parts[parts.length - 1]!.charAt(0) : "";
  return (first + last).toUpperCase();
}

/** Teinte stable : hachage FNV-1a du couple nom + e-mail → index de teinte. */
export function toneOf(seed: string): AvatarTone {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return TONES[hash % TONES.length]!;
}
