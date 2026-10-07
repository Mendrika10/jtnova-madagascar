import { NextResponse } from "next/server";
import { logError } from "@/lib/observability";
import { errorLogSchema } from "@/lib/validation";

/**
 * F7.8 — remontée d'erreur depuis le navigateur (frontière d'erreur
 * `src/app/error.tsx`). Le corps est validé par Zod (mêmes bornes que la
 * politique RLS d'insertion), puis journalisé dans `error_logs`.
 *
 * Réponse 204 dans tous les cas « normaux » : la remontée ne doit jamais
 * gêner l'expérience de l'utilisateur qui voit déjà une page d'erreur.
 */
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON invalide" }, { status: 400 });
  }

  const parsed = errorLogSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Requête invalide" },
      { status: 400 },
    );
  }

  await logError({
    ...parsed.data,
    userAgent: request.headers.get("user-agent") ?? undefined,
  });

  return new NextResponse(null, { status: 204 });
}
