import { NextResponse } from "next/server";
import { requireCronSecret } from "@/lib/cron-auth";
import {
  BACKUP_TABLES,
  buildRestoreSql,
  type BackupPayload,
  type RawRow,
} from "@/lib/backup";
import { getSupabasePublicClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/database.types";

/**
 * F7.7 — sauvegarde des contenus publics.
 *
 * `GET /api/export` → JSON complet (réalisations, services, témoignages, FAQ,
 * technologies, réglages) ; `GET /api/export?format=sql` → script SQL
 * rejouable. Les deux sont protégés par `Authorization: Bearer CRON_SECRET`.
 *
 * L'export s'exécute côté serveur avec les identifiants du site : la CI n'a
 * donc aucun identifiant Supabase à stocker, seulement le jeton.
 */
export const dynamic = "force-dynamic";

type TableName = keyof Database["public"]["Tables"];

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

  const tables: Record<string, RawRow[]> = {};
  for (const table of BACKUP_TABLES) {
    let query = supabase.from(table.name as TableName).select("*");
    for (const column of table.order.split(",")) {
      query = query.order(column, { ascending: true });
    }
    const { data, error } = await query;
    if (error) {
      console.error(`[export] ${table.name} :`, error.message);
      return NextResponse.json(
        { ok: false, error: `${table.name} : ${error.message}` },
        { status: 502 },
      );
    }
    tables[table.name] = (data ?? []) as RawRow[];
  }

  const payload: BackupPayload = {
    generatedAt: new Date().toISOString(),
    source: new URL(request.url).origin,
    format: 1,
    scope: "published",
    tables,
  };

  const format = new URL(request.url).searchParams.get("format") ?? "json";
  if (format === "sql") {
    return new Response(buildRestoreSql(payload), {
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "content-disposition": 'attachment; filename="restore.sql"',
        "cache-control": "no-store",
      },
    });
  }

  return NextResponse.json(payload, {
    headers: {
      "content-disposition": 'attachment; filename="content.json"',
      "cache-control": "no-store",
    },
  });
}
