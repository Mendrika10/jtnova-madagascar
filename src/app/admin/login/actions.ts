"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** N'accepte qu'un chemin interne à /admin (protection contre l'open redirect). */
function safeAdminPath(value: string): string {
  return value.startsWith("/admin") ? value : "/admin";
}

export async function loginAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = safeAdminPath(String(formData.get("redirect") ?? "/admin"));

  if (!email || !password) {
    redirect("/admin/login?error=required");
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect("/admin/login?error=config");
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect("/admin/login?error=invalid");
  }

  redirect(redirectTo);
}

export async function logoutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}
