"use client";

import { useState } from "react";
import { ImagePlus } from "@deemlol/next-icons";
import { addImagesAction } from "@/app/admin/actions";
import styles from "@/app/admin/admin.module.css";

type Pending = { file: File; alt: string };

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

function formatSize(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
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

export default function ImageUploader({ projectId }: { projectId: string }) {
  const [items, setItems] = useState<Pending[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onFiles(files: FileList | null) {
    if (!files) return;
    const rejected: string[] = [];
    const next: Pending[] = [];
    for (const file of Array.from(files)) {
      const reason = rejectReason(file);
      if (reason) {
        rejected.push(reason);
        continue;
      }
      next.push({
        file,
        alt: file.name
          .replace(/\.[^.]+$/, "")
          .replace(/[-_]+/g, " ")
          .trim(),
      });
    }
    setError(rejected.length > 0 ? rejected.join(" ") : null);
    if (next.length > 0) setItems((prev) => [...prev, ...next]);
  }

  function setAlt(index: number, alt: string) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, alt } : it)));
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

  async function uploadOne(file: File, auth: ImageKitAuth): Promise<string> {
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

    const res = await fetch(IMAGEKIT_UPLOAD_URL, { method: "POST", body: form });
    const body = (await res.json().catch(() => null)) as
      | { url?: string; message?: string }
      | null;
    if (!res.ok || !body?.url) {
      throw new Error(
        body?.message ?? `ImageKit a répondu avec le code ${res.status}.`,
      );
    }
    return body.url;
  }

  async function upload() {
    setError(null);
    if (items.length === 0) return;
    const invalid = items.map((it) => rejectReason(it.file)).find(Boolean);
    if (invalid) {
      setError(invalid);
      return;
    }
    if (items.some((it) => it.alt.trim() === "")) {
      setError("Un texte alternatif (alt) est obligatoire pour chaque image.");
      return;
    }

    setBusy(true);
    const entries: { url: string; alt: string }[] = [];
    try {
      for (const it of items) {
        const auth = await requestAuthParams();
        entries.push({
          url: await uploadOne(it.file, auth),
          alt: it.alt.trim(),
        });
      }
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Échec de l'envoi vers ImageKit.",
      );
      setBusy(false);
      return;
    }

    // addImagesAction redirige (NEXT_REDIRECT) : volontairement HORS du
    // try/catch pour ne pas intercepter la redirection.
    const formData = new FormData();
    formData.set("project_id", projectId);
    formData.set("entries", JSON.stringify(entries));
    await addImagesAction(formData);
  }

  return (
    <div className={styles.uploader}>
      <label className={styles.field}>
        <span className={styles.fieldLabel}>
          <span className={styles.fieldIcon} aria-hidden>
            <ImagePlus size={13} strokeWidth={2} />
          </span>
          Ajouter des images
        </span>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          multiple
          onChange={(e) => onFiles(e.target.files)}
          className={styles.input}
        />
        <span className={styles.fieldHint}>
          PNG, JPEG, WebP ou GIF · 2 Mo max par image. Le texte alternatif (alt)
          est obligatoire.
        </span>
      </label>

      {items.length > 0 && (
        <ul className={styles.pendingList}>
          {items.map((it, i) => (
            <li key={`${it.file.name}-${i}`} className={styles.pendingItem}>
              <span className={styles.pendingName}>{it.file.name}</span>
              <input
                value={it.alt}
                onChange={(e) => setAlt(i, e.target.value)}
                placeholder="Texte alternatif (obligatoire)"
                className={styles.input}
              />
              <button
                type="button"
                className={styles.linkBtn}
                onClick={() => setItems((prev) => prev.filter((_, k) => k !== i))}
              >
                Retirer
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <button
        type="button"
        className={styles.submit}
        disabled={busy || items.length === 0}
        onClick={upload}
      >
        {busy ? "Envoi en cours…" : `Uploader ${items.length || ""}`.trim()}
      </button>
    </div>
  );
}
