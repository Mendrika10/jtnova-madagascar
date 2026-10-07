import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * F6.8 — export CSV de la boîte de réception. Route handler sous `/admin/**`
 * (protégée par le middleware), mais un layout ne s'applique pas aux route
 * handlers : la session **et** le rôle `admin` sont donc vérifiés ici,
 * comme sur `/api/imagekit/auth`. Anonyme → 401 · non-admin → 403.
 *
 * Format : UTF-8 avec BOM (lisible par Excel et LibreOffice), champs
 * quotés, formules neutralisées (anti CSV-injection).
 */

const HEADER =
  "id,created_at,name,email,status,subject,message,notes";

function csvCell(value: string | null): string {
  const raw = value ?? "";
  // Un champ commençant par = + - @ pourrait être interprété comme une
  // formule par un tableur : on préfixe d'une apostrophe (convention Excel).
  const safe = /^[=+\-@]/.test(raw) ? `'${raw}` : raw;
  return `"${safe.replace(/"/g, '""')}"`;
}

export async function GET() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return new NextResponse("Supabase n'est pas configuré sur cet environnement.", {
      status: 503,
    });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new NextResponse("Session absente ou expirée. Reconnectez-vous.", {
      status: 401,
    });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") {
    return new NextResponse("Accès réservé aux administrateurs.", {
      status: 403,
    });
  }

  const { data, error } = await supabase
    .from("contact_messages")
    .select("id,created_at,name,email,status,subject,message,notes")
    .order("created_at", { ascending: false })
    .limit(5000);
  if (error) {
    console.error("[export-csv] lecture impossible :", error.message);
    return new NextResponse("Export impossible pour le moment.", {
      status: 500,
    });
  }

  const rows = (data ?? []).map((m) =>
    [
      m.id,
      m.created_at,
      m.name,
      m.email,
      m.status,
      m.subject ?? "",
      m.message,
      m.notes ?? "",
    ]
      .map(csvCell)
      .join(","),
  );
  const csv = `\uFEFF${[HEADER, ...rows].join("\r\n")}`;
  const filename = `messages-contact-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
