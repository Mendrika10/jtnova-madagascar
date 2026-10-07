"use client";

import React, { useState } from "react";
import Image from "next/image";
import styles from "./TechBannerImages.module.css";
import ImageLightbox from "./ImageLightbox";
import { shouldSkipOptimizer } from "@/lib/images";

export default function TechBannerImages({
  images = [],
  title,
}: {
  images?: string[];
  title?: string;
}) {
  // Les hooks doivent être appelés inconditionnellement : jamais après un return.
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);

  if (!images || images.length === 0) return null;

  // Duplicate images to create an infinite marquee effect
  const items =
    images.length > 1
      ? [...images, ...images]
      : [...images, ...images, ...images];

  function openAt(i: number) {
    setStartIndex(i % images.length);
    setLightboxOpen(true);
  }

  return (
    <>
      <div
        className={styles.wrapper}
        aria-label={title ? `Galerie ${title}` : "Galerie"}
      >
        <div className={styles.track}>
          {items.map((src, i) => (
            <div key={`${src}-${i}`} className={styles.item}>
              <div
                className={styles.thumbWrap}
                onClick={() => openAt(i)}
                onKeyDown={(e) => {
                  if ((e as React.KeyboardEvent).key === "Enter") openAt(i);
                }}
                role="button"
                tabIndex={0}
                aria-label={
                  title ? `${title} — capture ${i + 1}` : `capture ${i + 1}`
                }
              >
                {/* F7.4 — vignette optimisée (WebP + bonne largeur) : les
                    captures font ~500 Ko en PNG, 20-40 Ko en WebP. */}
                <Image
                  src={src}
                  alt={
                    title ? `${title} — capture ${i + 1}` : `capture ${i + 1}`
                  }
                  className={styles.thumb}
                  fill
                  sizes="(max-width: 560px) 78vw, 426px"
                  unoptimized={shouldSkipOptimizer(src)}
                  onError={(e) =>
                    ((e.target as HTMLImageElement).style.display = "none")
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {lightboxOpen && (
        <ImageLightbox
          images={images}
          startIndex={startIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}
