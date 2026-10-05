"use client";

import React, { useState } from "react";
import styles from "./TechBannerImages.module.css";
import ImageLightbox from "./ImageLightbox";

export default function TechBannerImages({
  images = [],
  title,
}: {
  images?: string[];
  title?: string;
}) {
  if (!images || images.length === 0) return null;

  // Duplicate images to create an infinite marquee effect
  const items =
    images.length > 1
      ? [...images, ...images]
      : [...images, ...images, ...images];

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);

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
                <img
                  src={src}
                  alt={
                    title ? `${title} — capture ${i + 1}` : `capture ${i + 1}`
                  }
                  className={styles.thumb}
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
