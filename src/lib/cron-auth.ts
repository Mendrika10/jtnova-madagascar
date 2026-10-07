import { NextResponse } from "next/server";

/**
 * F7.6/F7.7 — contrôle d'accès des points d'entrée d'exploitation
 * (`/api/cron/keep-alive`, `/api/export`).
 *
 * Le jeton circule dans l'en-tête `Authorization: Bearer …` et est comparé à
 * `CRON_SECRET` (jamais dans l'URL : une URL finit dans les logs). Renvoie une
 * réponse d'erreur à retourner telle quelle, ou `null` si l'appel est autorisé.
 */
export function requireCronSecret(request: Request): NextResponse | null {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "CRON_SECRET non configuré" },
      { status: 503 },
    );
  }
  const header = request.headers.get("authorization") ?? "";
  if (header !== `Bearer ${secret}`) {
    return NextResponse.json(
      { ok: false, error: "Non autorisé" },
      { status: 401 },
    );
  }
  return null;
}
