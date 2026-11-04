"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";

/** Resolves stored image values: empty, legacy disk paths (/uploads/...), and unknown hosts fall back to the placeholder. */
export function resolveImageSrc(src: string | null | undefined): string {
  if (!src || typeof src !== "string") return PLACEHOLDER_IMAGE;
  const v = src.trim();
  if (!v) return PLACEHOLDER_IMAGE;
  if (v.startsWith("/uploads/")) return PLACEHOLDER_IMAGE; // legacy local-disk uploads are not served in production
  if (v.startsWith("/api/uploads/") || v.startsWith("/brand/") || /^\/images\/[a-z0-9-]+\.webp$/.test(v)) return v;
  if (v.startsWith("https://images.unsplash.com/")) return v;
  return PLACEHOLDER_IMAGE;
}

type Props = Omit<ImageProps, "src" | "alt"> & { src?: string | null; alt: string };

/**
 * next/image wrapper that never renders a broken image and never loops:
 * on error it swaps once to the bundled placeholder and stops.
 */
export default function SafeImage({ src, alt, ...rest }: Props) {
  const resolved = resolveImageSrc(src);
  const [current, setCurrent] = useState(resolved);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setCurrent(resolved);
    setFailed(false);
  }, [resolved]);

  const isSvg = current.endsWith(".svg");
  return (
    <Image
      {...rest}
      src={current}
      alt={alt}
      unoptimized={isSvg || rest.unoptimized}
      onError={() => {
        if (!failed && current !== PLACEHOLDER_IMAGE) {
          setFailed(true);
          setCurrent(PLACEHOLDER_IMAGE);
        }
      }}
    />
  );
}
