"use client";

import type { ComponentType } from "react";
import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart,
  Folder,
  MessageSquare,
  Shield,
  Sparkles,
} from "@deemlol/next-icons";
import styles from "../admin.module.css";

/**
 * UI-ADMIN — navigation de la barre latérale.
 *
 * Seul morceau client de la coquille : l'entrée active dépend du chemin
 * courant, que seul le navigateur connaît. Les icônes sont importées ici
 * (jamais passées en propriété depuis le composant serveur, un composant
 * non-client n'étant pas sérialisable à travers la frontière RSC).
 */

type IconType = ComponentType<{ size?: number; strokeWidth?: number }>;

type NavItem = {
  href: string;
  label: string;
  Icon: IconType;
  badge?: number;
};

const GROUPS: { title?: string; items: NavItem[] }[] = [
  {
    items: [
      { href: "/admin", label: "Tableau de bord", Icon: BarChart },
      { href: "/admin/realisations", label: "Réalisations", Icon: Folder },
      { href: "/admin/personnalisation", label: "Personnalisation", Icon: Sparkles },
    ],
  },
  {
    title: "Suivi",
    items: [
      { href: "/admin/messages", label: "Messages", Icon: MessageSquare },
      { href: "/admin/sante", label: "Santé", Icon: Shield },
    ],
  },
];

function isActive(pathname: string, href: string): boolean {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

/**
 * Point d'attente de l'entrée en cours de chargement.
 *
 * `useLinkStatus` doit être appelé **dans** le `<Link>` : il ne renseigne que
 * la navigation déclenchée par ce lien-là. Le retour est donc immédiat, avant
 * même que le serveur ait répondu — le voile de `loading.tsx`, lui, n'apparaît
 * qu'après un court délai pour ne pas clignoter sur une réponse rapide.
 */
function NavPending() {
  const { pending } = useLinkStatus();
  return (
    <span
      className={styles.sidePending}
      data-on={pending ? "true" : undefined}
      aria-hidden
    />
  );
}

export default function SidebarNav({
  unreadMessages,
  unresolvedErrors,
}: {
  unreadMessages: number;
  unresolvedErrors: number;
}) {
  const pathname = usePathname();

  return (
    <>
      {GROUPS.map((group, index) => (
        <div key={group.title ?? index} className={styles.sideGroup}>
          {group.title ? (
            <p className={styles.sideGroupTitle}>{group.title}</p>
          ) : null}
          <ul className={styles.sideList}>
            {group.items.map(({ href, label, Icon }) => {
              const count =
                href === "/admin/messages"
                  ? unreadMessages
                  : href === "/admin/sante"
                    ? unresolvedErrors
                    : 0;
              const active = isActive(pathname, href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={active ? styles.sideLinkOn : styles.sideLink}
                    aria-current={active ? "page" : undefined}
                  >
                    <span className={styles.sideIcon} aria-hidden>
                      <Icon size={16} strokeWidth={2} />
                    </span>
                    <span className={styles.sideLabel}>{label}</span>
                    {count > 0 ? (
                      <span
                        className={styles.sideCount}
                        aria-label={`${count} à traiter`}
                      >
                        {count}
                      </span>
                    ) : null}
                    <NavPending />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </>
  );
}
