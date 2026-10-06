"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { addImagesAction } from "@/app/admin/actions";
import styles from "@/app/admin/admin.module.css";

type Pending = { file: File; alt: string };

export default function ImageUploader({ projectId }: { projectId: string }) {
  const [items, setItems] = useState<Pending[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onFiles(files: FileList | null) {
    if (!files) return;
    const next = Array.from(files).map((file) => ({
      file,
      alt: file.name
        .replace(/\.[^.]+$/, "")
        .replace(/[-_]+/g, " ")
        .trim(),
    }));
    setItems((prev) => [...prev, ...next]);
  }

  function setAlt(index: number, alt: string) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, alt } : it)));
  }

  async function upload() {
    setError(null);
    if (items.length === 0) return;
    if (items.some((it) => it.alt.trim() === "")) {
      setError("Un texte alternatif (alt) est obligatoire pour chaque image.");
      return;
    }

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase n'est pas configuré sur cet environnement.");
      return;
    }

    setBusy(true);
    const entries: { url: string; alt: string }[] = [];
    for (const it of items) {
      const safe = it.file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${projectId}/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}-${safe}`;
      const { error: upErr } = await supabase.storage
        .from("projects")
        .upload(path, it.file, { contentType: it.file.type, upsert: false });

      if (upErr) {
        setError(`Échec de l'envoi (${it.file.name}) : ${upErr.message}`);
        setBusy(false);
        return;
      }
      const { data } = supabase.storage.from("projects").getPublicUrl(path);
      entries.push({ url: data.publicUrl, alt: it.alt.trim() });
    }

    const formData = new FormData();
    formData.set("project_id", projectId);
    formData.set("entries", JSON.stringify(entries));
    await addImagesAction(formData);
  }

  return (
    <div className={styles.uploader}>
      <label className={styles.field}>
        <span className={styles.fieldLabel}>Ajouter des images</span>
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
