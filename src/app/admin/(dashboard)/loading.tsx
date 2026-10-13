import styles from "../admin.module.css";

/**
 * ADMIN-UI — attente entre deux écrans du back-office.
 *
 * Les pages admin interrogent toutes Supabase et lisent les cookies : Next les
 * rend à la demande, donc chaque navigation a un temps de réponse réel. Ce
 * fichier est le repli de Suspense de la coquille : il s'affiche pendant ce
 * temps-là, **dans la zone de contenu seulement** — la barre latérale reste
 * affichée et utilisable, on peut donc repartir vers une autre page sans
 * attendre.
 *
 * Deux garde-fous visuels : le voile ne devient visible qu'après un court
 * délai (une réponse instantanée ne produit pas de flash) et les animations
 * sont coupées sous `prefers-reduced-motion`.
 */
export default function AdminLoading() {
  return (
    <div
      className={styles.pageLoader}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className={styles.loaderRail} aria-hidden />

      <div className={styles.loaderCard} aria-hidden>
        <span className={styles.loaderMark}>JT</span>
        <span className={styles.loaderText}>Chargement</span>
        <span className={styles.loaderLines}>
          <i />
          <i />
          <i />
        </span>
      </div>
    </div>
  );
}
