import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getImageKitConfig, signImageKitUpload } from "@/lib/imagekit";

export const dynamic = "force-dynamic";

/**
 * F4bis.2 — délivre les paramètres d'authentification d'un envoi navigateur →
 * ImageKit (`token`, `expire`, `signature` + les deux valeurs publiques).
 *
 * Le service externe n'est PAS couvert par la RLS Supabase : c'est CETTE route
 * qui fait le contrôle d'accès. Elle n'est pas sous `/admin/**` (le middleware
 * ne la protège donc pas) → la session **et** le rôle `admin` sont vérifiés ici.
 *
 * Anonyme → 401 · non-admin → 403 · ImageKit non configuré → 503 · succès → 200.
 * La clé privée n'apparaît jamais dans la réponse.
 */
export async function GET() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase n'est pas configuré sur cet environnement." },
      { status: 503 },
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: "Session absente ou expirée. Reconnectez-vous." },
      { status: 401 },
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") {
    return NextResponse.json(
      { error: "Accès réservé aux administrateurs." },
      { status: 403 },
    );
  }

  const config = getImageKitConfig();
  if (!config) {
    return NextResponse.json(
      {
        error:
          "ImageKit n'est pas configuré sur cet environnement (variables manquantes).",
      },
      { status: 503 },
    );
  }

  const auth = signImageKitUpload(config.privateKey);

  return NextResponse.json({
    token: auth.token,
    expire: auth.expire,
    signature: auth.signature,
    publicKey: config.publicKey,
    urlEndpoint: config.urlEndpoint,
  });
}
