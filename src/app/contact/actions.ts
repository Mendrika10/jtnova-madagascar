"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { getSupabasePublicClient } from "@/lib/supabase/server";
import { contactMessageSchema } from "@/lib/validation";
import { sendContactAutoreply, sendContactNotification } from "@/lib/email";

export type ContactFormState = { ok: boolean; error: string | null };

/**
 * S6 — soumission publique du formulaire de contact.
 *
 * Chaîne : honeypot (F6.7) → validation Zod (contraintes alignées sur la
 * politique RLS) → limitation de débit par IP hachée (F6.7) → insertion via
 * le client **public** (la politique RLS « insertion publique contrôlée »
 * autorise l'écriture anonyme, F6.1) → e-mails (F6.5 notification admin,
 * F6.6 accusé de réception — jamais bloquants).
 */

/* ── F6.7 : limitation de débit en mémoire process ─────────────────────────
 * La RLS interdit le comptage anonyme en base (une lecture anon renverrait
 * 0 ligne) : la fenêtre est donc tenue dans le process serveur. Sur Vercel
 * le compteur vaut par instance — suffisant contre un script simple, pas
 * contre un réseau distribué (consigné dans docs/STATUS.md). */
const RATE_LIMIT_MAX = Number(process.env.CONTACT_RATE_LIMIT_MAX ?? 5);
const RATE_WINDOW_MS =
  Number(process.env.CONTACT_RATE_LIMIT_WINDOW_MIN ?? 15) * 60 * 1000;

const attempts = new Map<string, number[]>();

function registerAndCheckRateLimit(key: string): boolean {
  const now = Date.now();
  const recent = (attempts.get(key) ?? []).filter(
    (t) => now - t < RATE_WINDOW_MS,
  );
  if (recent.length >= RATE_LIMIT_MAX) {
    attempts.set(key, recent);
    return false;
  }
  recent.push(now);
  attempts.set(key, recent);
  // Hygiène mémoire : purge des clés dont toute la fenêtre est expirée.
  if (attempts.size > 1000) {
    for (const [k, timestamps] of attempts) {
      if (timestamps.every((t) => now - t >= RATE_WINDOW_MS)) attempts.delete(k);
    }
  }
  return true;
}

function clientIp(h: Headers): string {
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return h.get("x-real-ip") ?? "inconnue";
}

/**
 * F6.7 — IP pseudonymisée : SHA-256(salt | ip | jour), tronqué à 16
 * caractères hexadécimaux. Le salt (`CONTACT_IP_SALT`, sinon dérivé du jour)
 * et la fenêtre quotidienne font qu'un hachage ne ré-identifie pas une IP
 * au-delà du jour courant.
 */
function hashIp(ip: string): string {
  const day = new Date().toISOString().slice(0, 10);
  const salt = process.env.CONTACT_IP_SALT || `jtnova-${day}`;
  return createHash("sha256")
    .update(`${salt}|${ip}|${day}`)
    .digest("hex")
    .slice(0, 16);
}

export async function submitContactAction(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  // F6.7 — honeypot : champ « website » caché. Rempli = robot → succès
  // factice (aucune insertion, rien dans le HTML ne trahit le piège).
  if (String(formData.get("website") ?? "").trim() !== "") {
    return { ok: true, error: null };
  }

  const parsed = contactMessageSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    message: String(formData.get("message") ?? ""),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Formulaire invalide.",
    };
  }

  const h = await headers();
  const ipKey = hashIp(clientIp(h));
  if (!registerAndCheckRateLimit(ipKey)) {
    return {
      ok: false,
      error:
        "Trop de messages envoyés depuis cette connexion. Merci de réessayer dans un quart d'heure.",
    };
  }

  const supabase = getSupabasePublicClient();
  if (!supabase) {
    return {
      ok: false,
      error:
        "Le service de messages est indisponible. Merci de réessayer plus tard.",
    };
  }

  // SANS `.select()` : avec `return=representation`, PostgREST devrait relire
  // la ligne insérée — or la politique SELECT est réservée aux admins (RLS),
  // ce qui ferait échouer toute insertion anonyme. L'id n'est pas nécessaire
  // (les e-mails ne portent pas de lien de détail).
  const { error } = await supabase
    .from("contact_messages")
    .insert({
      name: parsed.data.name,
      email: parsed.data.email,
      message: parsed.data.message,
      ip_hash: ipKey,
      user_agent: (h.get("user-agent") ?? "").slice(0, 300),
    });

  if (error) {
    console.error("[contact] insertion refusée :", error.message);
    return {
      ok: false,
      error: "Votre message n'a pas pu être enregistré. Merci de réessayer.",
    };
  }

  // F6.5/F6.6 — e-mails : un échec est journalisé mais ne remet jamais en
  // cause la soumission (le message est déjà en base : rien n'est perdu).
  await sendContactNotification({ ...parsed.data });
  await sendContactAutoreply({
    name: parsed.data.name,
    email: parsed.data.email,
  });

  return { ok: true, error: null };
}
