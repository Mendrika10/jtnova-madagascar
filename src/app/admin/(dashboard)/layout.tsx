import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronUp, LogOut, Plus, Search, User } from "@deemlol/next-icons";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDashboardCounts } from "@/lib/admin-data";
import { syncContactReadStatuses } from "@/lib/mail-sync";
import { logoutAction } from "../login/actions";
import SidebarNav from "./SidebarNav";
import styles from "../admin.module.css";

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

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.sideHead}>
          <span className={styles.sideMark} aria-hidden>
            JT
          </span>
          <span className={styles.sideIdent}>
            <span className={styles.sideBrand}>Jtnova</span>
            <span className={styles.sideRole}>Administration</span>
          </span>
          <span className={styles.sideCaret} aria-hidden>
            <ChevronUp size={14} strokeWidth={2} />
          </span>
        </div>

        <Link href="/admin/realisations/new" className={styles.sidePrimary}>
          <Plus size={16} strokeWidth={2.2} aria-hidden />
          Nouvelle réalisation
        </Link>

        <nav className={styles.sideNav} aria-label="Navigation administration">
          <SidebarNav
            unreadMessages={counts.unreadMessages}
            unresolvedErrors={counts.unresolvedErrors}
          />

          <div className={styles.sideGroup}>
            <p className={styles.sideGroupTitle}>Recherche</p>
            <form className={styles.sideSearch} action="/admin" method="get" role="search">
              <span className={styles.sideSearchIcon} aria-hidden>
                <Search size={14} strokeWidth={2} />
              </span>
              <input
                type="search"
                name="q"
                placeholder="Réalisation, message…"
                aria-label="Rechercher une réalisation ou un message"
                className={styles.sideSearchInput}
              />
            </form>
          </div>
        </nav>

        <div className={styles.sideFoot}>
          <div className={styles.sideUser}>
            <span className={styles.sideAvatar} aria-hidden>
              <User size={14} strokeWidth={2} />
            </span>
            <span className={styles.sideEmail} title={user.email ?? ""}>
              {profile.email ?? user.email}
            </span>
          </div>
          <form action={logoutAction}>
            <button type="submit" className={styles.sideLogout}>
              <LogOut size={14} strokeWidth={2} aria-hidden />
              Déconnexion
            </button>
          </form>
        </div>
      </aside>

      <div className={styles.main}>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
