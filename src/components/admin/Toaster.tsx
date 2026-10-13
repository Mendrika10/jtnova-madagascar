"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle, Info, X } from "@deemlol/next-icons";
import styles from "@/app/admin/admin.module.css";

/**
 * ADMIN-UI — notifications du back-office.
 *
 * Deux entrées pour un seul canal d'affichage :
 *
 * 1. **Les mutations sans navigation** (réordonnancement, envoi d'images,
 *    bascule d'un statut) appellent `useToast()` directement — la réponse
 *    arrive dans la promesse, le toast part à cet instant.
 * 2. **Les mutations qui redirigent** (`?saved=1`, `?deleted=1`, `?error=save`…)
 *    ne peuvent rien renvoyer au client : `FlashToasts` relit les codes de
 *    résultat de l'URL après la navigation, affiche le toast correspondant,
 *    puis retire ces codes de l'URL — sans navigation supplémentaire, pour
 *    qu'un rafraîchissement ne rejoue pas le message.
 *
 * Les bandeaux « enregistré » posés en tête des pages ont été remplacés par
 * ces toasts ; les erreurs de champ restent sous leur champ, où elles servent.
 */

export type ToastTone = "success" | "error" | "info";

export type ToastInput = {
  tone?: ToastTone;
  title: string;
  description?: string;
  /** Durée d'affichage en millisecondes (par défaut selon la tonalité). */
  duration?: number;
};

type Toast = {
  id: number;
  tone: ToastTone;
  title: string;
  description?: string;
  duration: number;
};

const TONE_ICON = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
} as const;

const TONE_CLASS = {
  success: styles.toastSuccess,
  error: styles.toastError,
  info: styles.toastInfo,
} as const;

const TONE_DURATION: Record<ToastTone, number> = {
  success: 4800,
  error: 8000,
  info: 6000,
};

/** Au-delà, les plus anciens laissent la place : la pile ne mange pas l'écran. */
const MAX_VISIBLE = 4;

/** Attente avant retrait, le temps de l'animation de sortie (`toastOut`). */
const LEAVE_MS = 220;

type ToastApi = {
  push: (input: ToastInput) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const push = useCallback((input: ToastInput) => {
    const tone = input.tone ?? "success";
    const toast: Toast = {
      id: (nextId.current += 1),
      tone,
      title: input.title,
      description: input.description,
      duration: input.duration ?? TONE_DURATION[tone],
    };
    // `slice(-(MAX_VISIBLE - 1))` : le nouveau toast prend la dernière place.
    setToasts((current) => [...current.slice(-(MAX_VISIBLE - 1)), toast]);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      push,
      success: (title, description) => push({ tone: "success", title, description }),
      error: (title, description) => push({ tone: "error", title, description }),
      info: (title, description) => push({ tone: "info", title, description }),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      {/* Région live permanente : les lecteurs d'écran annoncent chaque toast
          dès son apparition, sans déplacer le focus. */}
      <div className={styles.toastViewport}>
        <div className={styles.toastStack}>
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) {
    throw new Error("useToast() doit être appelé sous <ToastProvider>.");
  }
  return api;
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: number) => void;
}) {
  const [leaving, setLeaving] = useState(false);
  const [reading, setReading] = useState(false);

  // Une durée nulle vaut « ne se ferme pas tout seul » : le toast reste tant
  // que l'utilisateur ne le ferme pas.
  const sticky = toast.duration <= 0;

  useEffect(() => {
    if (sticky || reading) return;
    const timer = window.setTimeout(() => setLeaving(true), toast.duration);
    return () => window.clearTimeout(timer);
  }, [sticky, reading, toast.duration]);

  useEffect(() => {
    if (!leaving) return;
    const timer = window.setTimeout(() => onDismiss(toast.id), LEAVE_MS);
    return () => window.clearTimeout(timer);
  }, [leaving, onDismiss, toast.id]);

  const Icon = TONE_ICON[toast.tone];

  return (
    <div
      className={`${styles.toast} ${TONE_CLASS[toast.tone]} ${
        leaving ? styles.toastOut : ""
      }`}
      style={{ "--toastTtl": `${toast.duration}ms` } as React.CSSProperties}
      role={toast.tone === "error" ? "alert" : "status"}
      data-paused={reading ? "true" : undefined}
      // Le compte à rebours s'arrête pendant la lecture (survol au pointeur,
      // focus au clavier) et repart à la sortie : on ne perd pas le message
      // qu'on était en train de lire.
      onMouseEnter={() => setReading(true)}
      onMouseLeave={() => setReading(false)}
      onFocusCapture={() => setReading(true)}
      onBlurCapture={() => setReading(false)}
    >
      <span className={styles.toastIcon} aria-hidden>
        <Icon size={17} strokeWidth={2.1} />
      </span>

      <span className={styles.toastBody}>
        <span className={styles.toastTitle}>{toast.title}</span>
        {toast.description ? (
          <span className={styles.toastText}>{toast.description}</span>
        ) : null}
      </span>

      <button
        type="button"
        className={styles.toastClose}
        onClick={() => setLeaving(true)}
        aria-label="Fermer la notification"
      >
        <X size={14} strokeWidth={2.2} aria-hidden />
      </button>

      {/* Compte à rebours : la barre se vide à la durée du toast et se fige
          pendant la lecture (survol ou focus). */}
      {!sticky && <span className={styles.toastTimer} aria-hidden />}
    </div>
  );
}

/**
 * Codes de résultat des Server Actions présents dans l'URL. Ils sont affichés
 * puis retirés de l'URL — `kept` conserve les paramètres de travail (l'onglet
 * ouvert, la section éditée, la recherche) qui, eux, doivent rester.
 */
const FLASH_KEYS = [
  "saved",
  "created",
  "deleted",
  "moved",
  "noted",
  "uploaded",
  "image_deleted",
  "image_error",
  "error",
  "images_error",
] as const;

/** Le sens du message dépend de l'écran : « saved » ne dit pas la même chose
 *  sur la liste des réalisations, la personnalisation et la boîte de réception. */
function screenOf(pathname: string): "messages" | "sections" | "projects" {
  if (pathname.startsWith("/admin/messages")) return "messages";
  if (pathname.startsWith("/admin/personnalisation")) return "sections";
  return "projects";
}

const ERROR_LABELS: Record<string, string> = {
  invalid: "Requête invalide — l'opération a été refusée.",
  save: "L'enregistrement a échoué. Merci de réessayer.",
  unavailable: "Service indisponible sur cet environnement.",
  config: "Configuration incomplète côté serveur.",
  required: "Des champs obligatoires sont vides.",
  forbidden: "Accès refusé : ce compte n'est pas administrateur.",
};

function describeFlash(params: URLSearchParams, pathname: string): ToastInput[] {
  const out: ToastInput[] = [];
  const screen = screenOf(pathname);

  if (params.get("created")) {
    out.push({
      tone: "success",
      title: "Réalisation créée.",
      description: "Elle apparaît dans la liste des réalisations.",
    });
  }

  if (params.get("saved")) {
    if (screen === "messages") {
      out.push({ tone: "success", title: "Statut mis à jour." });
    } else if (screen === "sections") {
      out.push({
        tone: "success",
        title: "Section enregistrée.",
        description: "Le site public est à jour.",
      });
    } else {
      out.push({ tone: "success", title: "Modifications enregistrées." });
    }
  }

  if (params.get("moved")) {
    out.push({ tone: "success", title: "Ordre enregistré." });
  }

  if (params.get("noted")) {
    out.push({ tone: "success", title: "Note interne enregistrée." });
  }

  if (params.get("uploaded")) {
    out.push({
      tone: "success",
      title: "Images ajoutées.",
      description: "Elles apparaissent sur le site dès maintenant.",
    });
  }

  if (params.get("image_deleted")) {
    out.push({ tone: "success", title: "Image supprimée." });
  }

  if (params.get("deleted")) {
    out.push({
      tone: "success",
      title: "Réalisation supprimée.",
      description: "Elle et ses images ont été retirées du site.",
    });
  }

  if (params.get("image_error")) {
    out.push({
      tone: "error",
      title: "Suppression impossible.",
      description: "L'image est toujours dans la galerie. Réessayez.",
    });
  }

  if (params.get("images_error")) {
    out.push({
      tone: "error",
      title: "Envoi des images refusé.",
      description: "Aucune image n'a été enregistrée. Réessayez.",
    });
  }

  const error = params.get("error");
  if (error) {
    out.push({
      tone: "error",
      title: ERROR_LABELS[error] ?? "Une erreur est survenue.",
      description: ERROR_LABELS[error] ? undefined : `Code : ${error}`,
    });
  }

  return out;
}

/**
 * Pont entre les redirections des Server Actions et les toasts. Monté une fois
 * dans la coquille : il survit aux navigations, donc le message déclenché par
 * l'action s'affiche bien sur la page d'arrivée.
 */
export default function FlashToasts() {
  const params = useSearchParams();
  const pathname = usePathname();
  const toast = useToast();
  const seen = useRef<string | null>(null);

  useEffect(() => {
    const key = `${pathname}?${params.toString()}`;
    if (seen.current === key) return;
    seen.current = key;

    const flashes = describeFlash(new URLSearchParams(params.toString()), pathname);
    if (flashes.length === 0) return;
    for (const flash of flashes) toast.push(flash);

    // Nettoyage sans navigation : l'API History native est gérée par le
    // routeur, la page n'est pas re-rendue et l'onglet ouvert ne se referme pas.
    const kept = new URLSearchParams();
    params.forEach((value, name) => {
      if (!(FLASH_KEYS as readonly string[]).includes(name)) kept.set(name, value);
    });
    const query = kept.toString();
    window.history.replaceState(null, "", query ? `${pathname}?${query}` : pathname);
  }, [params, pathname, toast]);

  return null;
}

/**
 * Toast d'erreur pour les formulaires à `useActionState` : l'action renvoie
 * ses erreurs au lieu de rediriger, donc le message part d'ici. Le premier
 * rendu ne déclenche rien (aucune réponse d'action n'a encore eu lieu).
 */
export function useActionFeedback(state: { errors: Record<string, string> }) {
  const toast = useToast();
  const previous = useRef(state);

  useEffect(() => {
    if (previous.current === state) return;
    previous.current = state;
    const keys = Object.keys(state.errors ?? {});
    if (keys.length === 0) return;
    const fields = keys.filter((key) => key !== "_");
    toast.error(
      state.errors._ ?? "Le formulaire contient des erreurs.",
      fields.length > 0
        ? `${fields.length} champ${fields.length > 1 ? "s" : ""} à corriger.`
        : undefined,
    );
  }, [state, toast]);
}
