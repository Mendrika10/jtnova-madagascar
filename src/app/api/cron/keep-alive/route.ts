import { NextResponse } from "next/server";
import { requireCronSecret } from "@/lib/cron-auth";
import { getSupabasePublicClient } from "@/lib/supabase/server";

/**
 * F7.6 — keep-alive Supabase.
 *
 * Un projet Supabase gratuit est mis en pause après ~7 jours sans requête.
 * Ce point d'entrée déclenche une requête triviale (lecture d'une ligne) qui
 * compte comme de l'activité : appelé tous les 3 jours par GitHub Actions
 * (`.github/workflows/keep-alive.yml`), il empêche la mise en pause.
 *
 * Protection : jeton `Bearer` comparé à `CRON_SECRET` (jamais de secret dans
 * l'URL, jamais d'accès anonyme). Absence de configuration → 503 explicite
 * plutôt qu'un faux succès silencieux.
 */
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = requireCronSecret(request);
  if (denied) return denied;

  const supabase = getSupabasePublicClient();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: "Supabase non configuré" },
      { status: 503 },
    );
  }

  const startedAt = Date.now();
  const { error } = await supabase
    .from("site_settings")
    .select("key", { count: "exact", head: true });

  if (error) {
    console.error("[keep-alive] échec de la requête Supabase :", error.message);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    checkedAt: new Date().toISOString(),
    latencyMs: Date.now() - startedAt,
  });
}
