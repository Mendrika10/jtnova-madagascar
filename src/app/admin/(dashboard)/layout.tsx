import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDashboardCounts } from "@/lib/admin-data";
import { syncContactReadStatuses } from "@/lib/mail-sync";
import { logoutAction } from "../login/actions";
import styles from "../admin.module.css";

const NAV = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/realisations", label: "Réalisations" },
  { href: "/admin/personnalisation", label: "Personnalisation" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/sante", label: "Santé" },
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

  // F6.9 — compteur de messages non lus, affiché sur l'entrée « Messages »
  // de la navigation. Le layout étant dynamique (cookies), il est re-rendu
  // à chaque navigation : le badge suit l'état de la base.
  // F7.8 — même principe pour les erreurs non traitées (« Santé »).
  // S8 — avant de compter, on aligne les statuts sur la boîte mail : un
  // message dont l'e-mail a été lu passe automatiquement en « lu ». L'appel
  // est partagé avec la liste des messages (une seule connexion IMAP par
  // rendu) et limité dans le temps ; une boîte injoignable n'a aucun effet.
  await syncContactReadStatuses(supabase);
  const counts = await getDashboardCounts(supabase);

  const badgeFor = (href: string) =>
    href === "/admin/messages"
      ? { count: counts.unreadMessages, noun: "message" }
      : href === "/admin/sante"
        ? { count: counts.unresolvedErrors, noun: "erreur" }
        : null;

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          Jtnova <span className={styles.brandAccent}>Admin</span>
        </div>
        <nav className={styles.nav} aria-label="Navigation administration">
          {NAV.map((item) => {
            const badge = badgeFor(item.href);
            return (
              <Link key={item.href} href={item.href} className={styles.navLink}>
                {item.label}
                {badge && badge.count > 0 && (
                  <span
                    className={styles.navBadge}
                    aria-label={`${badge.count} ${badge.noun}${badge.count > 1 ? "s" : ""} à traiter`}
                  >
                    {badge.count}
                  </span>
                )}
              </Link>
            );
          })}
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
