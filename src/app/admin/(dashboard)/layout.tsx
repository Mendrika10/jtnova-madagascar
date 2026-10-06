import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { logoutAction } from "../login/actions";
import styles from "../admin.module.css";

const NAV = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/realisations", label: "Réalisations" },
  { href: "/admin/personnalisation", label: "Personnalisation" },
  { href: "/admin/messages", label: "Messages" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/admin/login");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  // F3.4 : seul un profil `admin` accède à l'espace ; la RLS bloque déjà
  // toute écriture d'un non-admin côté base.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, email")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") redirect("/admin/login?error=forbidden");

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          Jtnova <span className={styles.brandAccent}>Admin</span>
        </div>
        <nav className={styles.nav} aria-label="Navigation administration">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className={styles.navLink}>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className={styles.main}>
        <header className={styles.topbar}>
          <span className={styles.userEmail}>{user.email}</span>
          <form action={logoutAction}>
            <button type="submit" className={styles.logoutBtn}>
              Déconnexion
            </button>
          </form>
        </header>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
