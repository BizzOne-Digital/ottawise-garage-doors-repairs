"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, Loader2, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import SafeImage from "@/components/SafeImage";
import { useAdmin } from "@/components/admin/AdminProvider";
import { AdminHeader } from "@/components/admin/ui";
import { ACCEPTED, uploadImage } from "@/components/admin/uploadClient";

export type MediaItem = { url: string; folder: string; filename: string; size: number; mimeType: string; createdAt: string; inUse: boolean };

export default function MediaGrid({ items, page, pages, total }: { items: MediaItem[]; page: number; pages: number; total: number }) {
  const { api, csrf, toast, confirm } = useAdmin();
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      await uploadImage(file, "gallery", csrf);
      toast("success", "Image uploaded");
      router.refresh();
    } catch (err) {
      toast("error", (err as Error).message);
    }
    setBusy(false);
  }

  async function remove(m: MediaItem) {
    if (!(await confirm({ title: "Delete this image?", body: "It will be permanently removed from storage.", confirmLabel: "Delete image", danger: true }))) return;
    const r = await api("/api/admin/media", { method: "DELETE", json: { url: m.url } });
    if (r.ok) { toast("success", "Image deleted"); router.refresh(); } else toast("error", r.data.error || "Could not delete");
  }

  return (
    <>
      <AdminHeader title="Media library" description={`${total} image${total === 1 ? "" : "s"} stored in MongoDB. Images in use cannot be deleted here.`}>
        <input ref={input} type="file" accept={ACCEPTED.join(",")} className="sr-only" onChange={onFile} aria-label="Upload image" />
        <button type="button" className="btn-navy" disabled={busy} onClick={() => input.current?.click()}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Upload className="h-4 w-4" aria-hidden />}{busy ? "Uploading..." : "Upload image"}
        </button>
      </AdminHeader>
      {items.length === 0 ? (
        <div className="card p-10 text-center"><p className="font-semibold text-navy">No uploads yet</p><p className="mt-1 text-sm">Images you upload in any editor appear here.</p></div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((m) => (
            <li key={m.url} className="card overflow-hidden">
              <div className="relative aspect-[4/3] bg-sand"><SafeImage src={m.url} alt={m.filename} fill sizes="300px" className="object-cover" /></div>
              <div className="space-y-2 p-3 text-xs">
                <p className="truncate font-semibold text-navy" title={m.filename}>{m.folder}/{m.filename}</p>
                <p>{(m.size / 1024).toFixed(0)} KB &middot; {m.mimeType.replace("image/", "").toUpperCase()}</p>
                <span className={`inline-block rounded-full px-2 py-0.5 font-semibold ${m.inUse ? "bg-green-50 text-green-800" : "bg-gray-100 text-gray-700"}`}>{m.inUse ? "In use" : "Not used"}</span>
                <div className="flex gap-2 pt-1">
                  <button type="button" className="btn-outline min-h-[32px] flex-1 px-2 text-xs" onClick={() => navigator.clipboard.writeText(m.url).then(() => toast("success", "URL copied"), () => toast("error", "Copy failed"))}>
                    <Copy className="h-3.5 w-3.5" aria-hidden />Copy URL
                  </button>
                  <button type="button" disabled={m.inUse} title={m.inUse ? "Replace it on the page first" : undefined} className="btn min-h-[32px] border border-line bg-white px-2 text-xs text-red-700 hover:bg-red-50" onClick={() => remove(m)} aria-label={`Delete ${m.filename}`}>
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {pages > 1 && (
        <nav aria-label="Pagination" className="mt-6 flex items-center justify-between text-sm">
          {page > 1 ? <Link className="btn-outline min-h-[38px] px-4" href={`/admin/media?page=${page - 1}`}>Previous</Link> : <span />}
          <span>Page {page} of {pages}</span>
          {page < pages ? <Link className="btn-outline min-h-[38px] px-4" href={`/admin/media?page=${page + 1}`}>Next</Link> : <span />}
        </nav>
      )}
    </>
  );
}
