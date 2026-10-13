"use client";

import { useTransition } from "react";
import { toggleErrorResolvedAction } from "./actions";
import { useToast } from "@/components/admin/Toaster";
import styles from "../../admin.module.css";

/**
 * ADMIN-UI — bouton « Marquer traité » / « Rouvrir » du journal d'erreurs.
 *
 * Composant client pour une seule raison : l'action renvoie son résultat, ce
 * qui permet de notifier l'utilisateur (succès ou échec) sans recharger
 * l'écran. La revalidation déclenchée par l'action rafraîchit la ligne.
 */
export default function ResolveButton({
  id,
  resolved,
}: {
  id: string;
  resolved: boolean;
}) {
  const toast = useToast();
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      const result = await toggleErrorResolvedAction(id, !resolved);
      if (!result.ok) {
        toast.error(
          resolved ? "Impossible de rouvrir l'erreur." : "Marquage impossible.",
          result.message ?? "Réessayez dans un instant.",
        );
        return;
      }
      if (resolved) {
        toast.info("Erreur rouverte.", "Elle réapparaît dans les erreurs à traiter.");
        return;
      }
      toast.success("Erreur marquée comme traitée.", "Elle quitte la liste à traiter.");
    });
  }

  return (
    <button
      type="button"
      className={styles.secondaryBtn}
      onClick={toggle}
      disabled={pending}
      aria-busy={pending || undefined}
    >
      {pending ? "Traitement…" : resolved ? "Rouvrir" : "Marquer traité"}
    </button>
  );
}
