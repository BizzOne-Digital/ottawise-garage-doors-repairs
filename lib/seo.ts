import type { Metadata } from "next";
import { absUrl } from "./site";

export function pageMetadata({ title, description, path, image }: { title: string; description: string; path: string; image?: string }): Metadata {
  const img = image && (image.startsWith("https://") || image.startsWith("/api/uploads/") || image.startsWith("/images/")) ? absUrl(image) : undefined;
  return {
    title,
    description,
    alternates: { canonical: absUrl(path) },
    openGraph: { title, description, url: absUrl(path), ...(img ? { images: [{ url: img }] } : {}) },
    twitter: { title, description, ...(img ? { images: [img] } : {}) },
  };
}
