"use client";

import { CHUNK_BYTES, MAX_UPLOAD_BYTES, type UploadFolder } from "@/lib/constants";

export const ACCEPTED = ["image/png", "image/jpeg", "image/webp", "image/gif"];
/** Largest single multipart request the host accepts (Vercel Functions: 4.5 MB). Configurable per deployment. */
const DIRECT_LIMIT = Number(process.env.NEXT_PUBLIC_UPLOAD_DIRECT_LIMIT || 4_000_000);

export type UploadOk = { success: true; url: string; filename: string; size: number; folder: UploadFolder };

async function readJson(res: Response) {
  if (res.status === 413) throw new Error("The server rejected the file as too large. Try a smaller image.");
  const j = await res.json().catch(() => null);
  if (!res.ok || !j?.success) throw new Error(j?.error || `Upload failed (${res.status})`);
  return j;
}

/**
 * Uploads an image and resolves to the saved public URL.
 * Small files use the standard FormData POST /api/upload. Files above the host limit
 * transparently use the chunked fallback, which returns the same URL format.
 */
export async function uploadImage(file: File, folder: UploadFolder, csrf: string, onProgress?: (pct: number) => void): Promise<UploadOk> {
  if (!ACCEPTED.includes(file.type)) throw new Error("Please choose a PNG, JPEG, WebP, or GIF image.");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("Images must be 8 MB or smaller.");
  const headers = { "x-csrf-token": csrf };

  if (file.size <= DIRECT_LIMIT) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", folder);
    onProgress?.(10);
    const res = await fetch("/api/upload", { method: "POST", body: fd, headers, credentials: "same-origin" });
    const j = await readJson(res);
    onProgress?.(100);
    return j;
  }

  const init = await readJson(await fetch("/api/upload/chunked?action=init", {
    method: "POST", credentials: "same-origin",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ folder, size: file.size, mimeType: file.type }),
  }));
  const { uploadId, totalChunks } = init as { uploadId: string; totalChunks: number };
  for (let i = 0; i < totalChunks; i++) {
    const blob = file.slice(i * CHUNK_BYTES, Math.min(file.size, (i + 1) * CHUNK_BYTES));
    await readJson(await fetch(`/api/upload/chunked?action=chunk&uploadId=${uploadId}&index=${i}`, {
      method: "POST", credentials: "same-origin",
      headers: { ...headers, "Content-Type": "application/octet-stream" },
      body: blob,
    }));
    onProgress?.(Math.round(((i + 1) / (totalChunks + 1)) * 100));
  }
  const done = await readJson(await fetch("/api/upload/chunked?action=complete", {
    method: "POST", credentials: "same-origin",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ uploadId }),
  }));
  onProgress?.(100);
  return done;
}
