import "server-only";
import crypto from "node:crypto";
import { connectDB } from "./db";
import { PageContent, Service, SiteSettings, StoredUpload } from "./models";
import { MAX_UPLOAD_BYTES, UPLOAD_FOLDERS, type UploadFolder } from "./constants";

export const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
type Detected = { mime: (typeof ALLOWED_MIME)[number]; ext: "jpg" | "png" | "webp" | "gif" };

export const isFolder = (f: unknown): f is UploadFolder => typeof f === "string" && (UPLOAD_FOLDERS as readonly string[]).includes(f);
export const FILENAME_RE = /^\d{13}-[a-f0-9]{16}\.(jpg|png|webp|gif)$/;

/** Detects the real format from magic bytes; the client-declared MIME type is not trusted. */
export function sniffImage(buf: Buffer): Detected | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { mime: "image/jpeg", ext: "jpg" };
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return { mime: "image/png", ext: "png" };
  const head6 = buf.subarray(0, 6).toString("ascii");
  if (head6 === "GIF87a" || head6 === "GIF89a") return { mime: "image/gif", ext: "gif" };
  if (buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP") return { mime: "image/webp", ext: "webp" };
  return null;
}

export type UploadResult = { success: true; url: string; filename: string; size: number; folder: UploadFolder };
export class UploadError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

/** Validates and stores an image Buffer as one StoredUpload document. */
export async function storeImage(buf: Buffer, folder: UploadFolder, declaredMime?: string): Promise<UploadResult> {
  if (buf.length === 0) throw new UploadError(400, "The file is empty");
  if (buf.length > MAX_UPLOAD_BYTES) throw new UploadError(413, "File exceeds the 8 MB limit");
  if (declaredMime && !(ALLOWED_MIME as readonly string[]).includes(declaredMime))
    throw new UploadError(415, "Only PNG, JPEG, WebP, and GIF images are allowed");
  const det = sniffImage(buf);
  if (!det) throw new UploadError(415, "File content is not a valid PNG, JPEG, WebP, or GIF image");
  if (declaredMime && declaredMime !== det.mime) throw new UploadError(415, "File type does not match its contents");

  const filename = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}.${det.ext}`;
  await connectDB();
  await StoredUpload.create({ folder, filename, mimeType: det.mime, size: buf.length, data: buf });
  return { success: true, url: `/api/uploads/${folder}/${filename}`, filename, size: buf.length, folder };
}

/** Safely parses "/api/uploads/{folder}/{filename}". Returns null for anything else. */
export function parseUploadUrl(url: unknown): { folder: UploadFolder; filename: string } | null {
  if (typeof url !== "string" || !url.startsWith("/api/uploads/")) return null;
  const rest = url.slice("/api/uploads/".length).split(/[?#]/)[0];
  const parts = rest.split("/");
  if (parts.length !== 2) return null;
  const [folder, filename] = parts;
  if (!isFolder(folder) || !FILENAME_RE.test(filename)) return null;
  return { folder, filename };
}

/** True when any content document still references the URL. */
export async function isUploadReferenced(url: string) {
  await connectDB();
  const [svc, settings] = await Promise.all([
    Service.exists({ image: url }),
    SiteSettings.exists({ $or: [{ logoUrl: url }, { faviconUrl: url }] }),
  ]);
  if (svc || settings) return true;
  // Page content is flexible (Mixed); there are only a handful of page documents.
  const pages = await PageContent.find({}, { data: 1 }).lean();
  return pages.some((p) => JSON.stringify((p as { data?: unknown }).data ?? {}).includes(url));
}

/** Deletes an uploaded image if it is a managed upload and no longer referenced. Never throws. */
export async function deleteUploadIfUnreferenced(url: string | null | undefined) {
  const parsed = parseUploadUrl(url);
  if (!parsed || !url) return { deleted: false, reason: "not-managed" as const };
  try {
    if (await isUploadReferenced(url)) return { deleted: false, reason: "in-use" as const };
    const r = await StoredUpload.deleteOne(parsed);
    return { deleted: r.deletedCount === 1, reason: r.deletedCount ? ("ok" as const) : ("missing" as const) };
  } catch (e) {
    console.error("[uploads] cleanup failed:", (e as Error).message);
    return { deleted: false, reason: "error" as const };
  }
}

/** After a successful save, clean up any old image URLs that were replaced or removed. */
export async function cleanupReplaced(oldUrls: (string | undefined | null)[], newUrls: (string | undefined | null)[]) {
  const keep = new Set(newUrls.filter(Boolean));
  for (const u of new Set(oldUrls.filter(Boolean) as string[])) {
    if (!keep.has(u)) await deleteUploadIfUnreferenced(u);
  }
}

/** Collects every /api/uploads/ URL found inside a value (page data, arrays, etc.). */
export function collectUploadUrls(v: unknown): string[] {
  const out: string[] = [];
  const walk = (x: unknown) => {
    if (typeof x === "string") { if (parseUploadUrl(x)) out.push(x); }
    else if (Array.isArray(x)) x.forEach(walk);
    else if (x && typeof x === "object") Object.values(x).forEach(walk);
  };
  walk(v);
  return out;
}
