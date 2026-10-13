"use client";

import { useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  ImagePlus,
  Info,
  Loader,
  UploadCloud,
  X,
} from "@deemlol/next-icons";
import { addImagesAction } from "@/app/admin/actions";
import { useToast } from "@/components/admin/Toaster";
import styles from "@/app/admin/admin.module.css";

type PendingStatus = "ready" | "uploading" | "done" | "error";

type Pending = {
  id: string;
  file: File;
  alt: string;
  /** Aperçu local (URL d'objet, libérée au retrait de la ligne). */
  preview: string;
  status: PendingStatus;
  progress: number;
  error?: string;
};

type ImageKitAuth = {
  token: string;
  expire: number;
  signature: string;
  publicKey: string;
  urlEndpoint: string;
};

// F4bis.3 : envoi DIRECT navigateur → ImageKit (aucun fichier ne traverse le
// serveur, donc aucune limite liée à une fonction serverless).
// Endpoint public de l'API d'envoi ImageKit (v1).
const IMAGEKIT_UPLOAD_URL = "https://upload.imagekit.io/api/v1/files/upload";

// F4bis.4 : garde-fou volontaire. ImageKit ne limite pas la taille, mais 2 Mo
// suffit largement pour des images de portfolio et protège le stockage du plan
// gratuit (~3 Go). Formats : PNG, JPEG, WebP ou GIF.
const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

/**
 * Une Server Action qui appelle `redirect()` **rejette** sa promesse avec une
 * erreur de contrôle, sans résultat à lire : la navigation est déjà faite par
 * le routeur. Ce n'est donc pas un échec d'envoi. On relit la cible dans le
 * digest (`NEXT_REDIRECT;<type>;<cible>;<statut>;`) pour distinguer un ajout
 * réussi (`uploaded=1`) d'un refus côté base (`images_error=1`).
 *
 * Bornes `slice(2, -2)` comme le parseur de Next : la cible peut contenir des
 * « ; ». Renvoie `null` si l'erreur n'est pas une redirection.
 */
function redirectTarget(error: unknown): string | null {
  const digest =
    typeof error === "object" && error !== null
      ? (error as { digest?: unknown }).digest
      : undefined;
  if (typeof digest !== "string" || !digest.startsWith("NEXT_REDIRECT;")) {
    return null;
  }

  const parts = digest.split(";");
  const type = parts[1];
  const status = parts.at(-2);
  if ((type !== "push" && type !== "replace") || Number.isNaN(Number(status))) {
    return null;
  }

  return parts.slice(2, -2).join(";");
}

function formatSize(bytes: number): string {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} Ko`
    : `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

/** Retourne un message d'erreur si le fichier est refusé, sinon null. */
function rejectReason(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return `${file.name} : format non pris en charge (PNG, JPEG, WebP ou GIF).`;
  }
  if (file.size > MAX_BYTES) {
    return `${file.name} : ${formatSize(file.size)} dépasse la limite de 2 Mo.`;
  }
  return null;
}

const STATUS_LABELS: Record<PendingStatus, string> = {
  ready: "Prêt",
  uploading: "Envoi…",
  done: "Envoyée",
  error: "Échec",
};

export default function ImageUploader({ projectId }: { projectId: string }) {
  const toast = useToast();
  const [items, setItems] = useState<Pending[]>([]);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);

  const ready = items.filter((it) => it.status === "ready");
  const doneCount = items.filter((it) => it.status === "done").length;
  const overall =
    items.length === 0
      ? 0
      : Math.round(items.reduce((sum, it) => sum + it.progress, 0) / items.length);

  function patch(id: string, changes: Partial<Pending>) {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...changes } : it)),
    );
  }

  function onFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const rejected: string[] = [];
    const next: Pending[] = [];
    for (const file of Array.from(files)) {
      const reason = rejectReason(file);
      if (reason) {
        rejected.push(reason);
        continue;
      }
      next.push({
        id: crypto.randomUUID(),
        file,
        alt: file.name
          .replace(/\.[^.]+$/, "")
          .replace(/[-_]+/g, " ")
          .trim(),
        preview: URL.createObjectURL(file),
        status: "ready",
        progress: 0,
      });
    }
    // Un refus de fichier est signalé par un toast : le bandeau en bas de
    // carte a laissé la place aux notifications.
    for (const reason of rejected) toast.error("Fichier refusé.", reason);
    if (next.length > 0) setItems((prev) => [...prev, ...next]);
  }

  function remove(id: string) {
    setItems((prev) => {
      const target = prev.find((it) => it.id === id);
      if (target) URL.revokeObjectURL(target.preview);
      return prev.filter((it) => it.id !== id);
    });
  }

  /**
   * Après un envoi réussi, la galerie relue du serveur affiche déjà les
   * images : la file d'envoi doit se vider au même instant et le bouton
   * reprendre la main. Sans ce nettoyage, la navigation RSC conserve cette
   * instance (donc les lignes « Envoyée » et `busy`) et l'écran reste figé
   * sur « Envoi en cours… » alors que tout est enregistré.
   */
  function clearQueue() {
    setItems((prev) => {
      for (const it of prev) URL.revokeObjectURL(it.preview);
      return [];
    });
    setBusy(false);
  }

  /**
   * F4bis.2 : le serveur signe l'envoi. Le token doit être unique par envoi
   * (exigence ImageKit) → une signature demandée **par fichier**.
   */
  async function requestAuthParams(): Promise<ImageKitAuth> {
    const res = await fetch("/api/imagekit/auth");
    const body = (await res.json().catch(() => null)) as
      | (ImageKitAuth & { error?: string })
      | null;
    if (!res.ok || !body) {
      throw new Error(body?.error ?? "Impossible d'obtenir la signature d'upload.");
    }
    return body;
  }

  /**
   * Envoi d'un fichier avec **progression réelle** : `fetch` n'expose pas
   * l'avancement du corps de la requête, `XMLHttpRequest` si
   * (`upload.onprogress`). Rien d'autre ne change : même URL, mêmes champs.
   */
  function uploadOne(
    file: File,
    auth: ImageKitAuth,
    onProgress: (percent: number) => void,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.set("file", file);
      form.set("fileName", file.name);
      form.set("publicKey", auth.publicKey);
      form.set("signature", auth.signature);
      form.set("expire", String(auth.expire));
      form.set("token", auth.token);
      // ⚠️ Pas de paramètre `folder` : l'API d'envoi le refuse (« invalid value
      // for folder parameter »), même pour un dossier à un seul niveau (vérifié
      // contre le compte). Les fichiers arrivent donc à la racine de la
      // médiathèque — l'appartenance à une réalisation reste portée par
      // project_images en base.
      form.set("useUniqueFileName", "true");
      form.set("overwriteFile", "false");

      const xhr = new XMLHttpRequest();
      xhr.open("POST", IMAGEKIT_UPLOAD_URL);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      };

      xhr.onload = () => {
        let body: { url?: string; message?: string } | null = null;
        try {
          body = JSON.parse(xhr.responseText) as { url?: string; message?: string };
        } catch {
          body = null;
        }
        if (xhr.status < 200 || xhr.status >= 300 || !body?.url) {
          reject(
            new Error(
              body?.message ?? `ImageKit a répondu avec le code ${xhr.status}.`,
            ),
          );
          return;
        }
        onProgress(100);
        resolve(body.url);
      };

      xhr.onerror = () =>
        reject(new Error("Échec réseau pendant l'envoi vers ImageKit."));
      xhr.onabort = () => reject(new Error("Envoi interrompu."));

      xhr.send(form);
    });
  }  async function upload() {
    if (items.length === 0) return;
    const invalid = items.map((it) => rejectReason(it.file)).find(Boolean);
    if (invalid) {
      toast.error("Envoi refusé.", invalid);
      return;
    }

    if (items.some((it) => it.alt.trim() === "")) {
      toast.error(
        "Texte alternatif manquant.",
        "Chaque image doit porter un texte alternatif avant l'envoi.",
      );
      return;
    }

    setBusy(true);
    setItems((prev) =>
      prev.map((it) => ({
        ...it,
        status: "uploading" as PendingStatus,
        progress: 0,
        error: undefined,
      })),
    );

    const entries: { url: string; alt: string }[] = [];
    for (const it of items) {
      try {
        const auth = await requestAuthParams();
        const url = await uploadOne(it.file, auth, (percent) =>
          patch(it.id, { progress: percent }),
        );
        patch(it.id, { status: "done", progress: 100 });
        entries.push({ url, alt: it.alt.trim() });
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Échec de l'envoi vers ImageKit.";
        patch(it.id, { status: "error", error: message });
        toast.error("Envoi interrompu.", message);
        setBusy(false);
        return;
      }
    }

    const formData = new FormData();
    formData.set("project_id", projectId);
    formData.set("entries", JSON.stringify(entries));

    try {
      await addImagesAction(formData);
    } catch (error) {
      const target = redirectTarget(error);

      // Erreur réelle (réseau, action absente…) : la file reste en place pour
      // pouvoir réessayer, et l'échec est annoncé.
      if (target === null) {
        toast.error(
          "Enregistrement impossible.",
          error instanceof Error ? error.message : "Réessayez dans un instant.",
        );
        setBusy(false);
        return;
      }

      // Ajout refusé côté base : les fichiers sont déjà sur ImageKit, on garde
      // donc la file (déjà marquée « Envoyée ») pour pouvoir renvoyer sans
      // rechoisir les images ; l'erreur est signalée par le toast de la page.
      if (target.includes("images_error=1")) {
        setBusy(false);
        return;
      }
    }

    clearQueue();
  }

  return (
    <div className={styles.uploader}>
      <div className={styles.uploaderHead}>
        <span className={styles.uploaderHeadIcon} aria-hidden>
          <ImagePlus size={16} strokeWidth={2} />
        </span>
        <div className={styles.uploaderHeadText}>
          <p className={styles.uploaderTitle}>Ajouter des images</p>
          <p className={styles.uploaderSubtitle}>
            Elles apparaissent sur le site dès l&apos;envoi, sans réenregistrer
            le projet.
          </p>
        </div>
      </div>

      <label
        className={`${styles.dropZone} ${dragging ? styles.dropZoneActive : ""}`}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          onFiles(event.dataTransfer.files);
        }}
      >
        <input
          className={styles.dropInput}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          multiple
          disabled={busy}
          onChange={(event) => {
            onFiles(event.target.files);
            event.target.value = "";
          }}
        />
        <span className={styles.dropIcon} aria-hidden>
          <UploadCloud size={26} strokeWidth={1.7} />
        </span>
        <span className={styles.dropTitle}>
          {dragging ? "Déposez vos images ici" : "Glissez vos images dans cette zone"}
        </span>
        <span className={styles.dropText}>
          ou <span className={styles.dropBrowse}>parcourez vos fichiers</span>
        </span>
        <span className={styles.dropMeta}>
          PNG · JPEG · WebP · GIF — 2 Mo maximum par image
        </span>
      </label>

      {items.length > 0 && (
        <ul className={styles.pendingList}>
          {items.map((it) => (
            <li
              key={it.id}
              className={`${styles.pendingItem} ${
                it.status === "error" ? styles.pendingItemError : ""
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={it.preview} alt="" className={styles.pendingThumb} />

              <div className={styles.pendingBody}>
                <div className={styles.pendingHead}>
                  <span className={styles.pendingName} title={it.file.name}>
                    {it.file.name}
                  </span>
                  <span className={styles.pendingSize}>
                    {formatSize(it.file.size)}
                  </span>
                  <span
                    className={`${styles.pendingStatus} ${
                      it.status === "done"
                        ? styles.pendingStatusDone
                        : it.status === "error"
                          ? styles.pendingStatusError
                          : ""
                    }`}
                  >
                    {it.status === "uploading" ? (
                      <Loader
                        size={12}
                        strokeWidth={2}
                        className={styles.pendingSpin}
                        aria-hidden
                      />
                    ) : it.status === "done" ? (
                      <CheckCircle size={12} strokeWidth={2} aria-hidden />
                    ) : it.status === "error" ? (
                      <AlertCircle size={12} strokeWidth={2} aria-hidden />
                    ) : null}
                    {STATUS_LABELS[it.status]}
                  </span>
                  <button
                    type="button"
                    className={styles.pendingRemove}
                    aria-label={`Retirer ${it.file.name}`}
                    disabled={busy}
                    onClick={() => remove(it.id)}
                  >
                    <X size={13} strokeWidth={2.2} aria-hidden />
                  </button>
                </div>

                <label className={styles.pendingAlt}>
                  <span className={styles.srOnly}>
                    Texte alternatif de {it.file.name}
                  </span>
                  <input
                    value={it.alt}
                    onChange={(event) =>
                      patch(it.id, { alt: event.target.value })
                    }
                    placeholder="Texte alternatif (obligatoire)"
                    className={styles.input}
                    disabled={busy || it.status === "done"}
                  />
                </label>

                {it.status !== "ready" && (
                  <div
                    className={`${styles.progress} ${
                      it.status === "error" ? styles.progressError : ""
                    }`}
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={it.progress}
                    aria-label={`Envoi de ${it.file.name}`}
                  >
                    <span className={styles.progressTrack}>
                      <span
                        className={styles.progressBar}
                        style={{ width: `${it.progress}%` }}
                      />
                    </span>
                    <span className={styles.progressPct}>{it.progress}%</span>
                  </div>
                )}

                {it.error && <p className={styles.pendingError}>{it.error}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className={styles.uploaderFoot}>
        <p className={styles.uploaderHint} role="status" aria-live="polite">
          {busy
            ? `Envoi ${Math.min(doneCount + 1, items.length)} sur ${items.length} — ${overall} %`
            : ready.length > 0
              ? `${ready.length} image${ready.length > 1 ? "s" : ""} prête${ready.length > 1 ? "s" : ""} à envoyer.`
              : "Aucune image en attente."}
        </p>
        <button
          type="button"
          className={styles.submit}
          disabled={busy || items.length === 0}
          onClick={upload}
        >
          {busy
            ? "Envoi en cours…"
            : items.length > 0
              ? `Envoyer ${items.length} image${items.length > 1 ? "s" : ""}`
              : "Envoyer"}
        </button>
      </div>

      <p className={styles.uploaderNotice}>
        <Info size={13} strokeWidth={2} aria-hidden />
        Le texte alternatif (alt) est obligatoire : il est lu par les lecteurs
        d&apos;écran et par les moteurs de recherche.
      </p>
    </div>
  );
}
