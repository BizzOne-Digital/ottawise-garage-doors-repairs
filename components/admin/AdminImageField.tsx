"use client";

import { ImagePlus, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { useId, useRef, useState } from "react";
import SafeImage from "@/components/SafeImage";
import { EMPTY_IMAGE, type UploadFolder } from "@/lib/constants";
import { useAdmin } from "./AdminProvider";
import { ACCEPTED, uploadImage } from "./uploadClient";

type Props = {
  label: string;
  value: string;
  /** Receives the saved public URL, or EMPTY_IMAGE ("") when removed. */
  onChange: (url: string) => void;
  folder?: UploadFolder;
  help?: string;
  aspect?: string;
  onBusyChange?: (busy: boolean) => void;
};

/**
 * Reusable admin image field. Uploading only stores the file and returns its URL;
 * the old image is removed server-side only after the parent document saves successfully.
 */
export default function AdminImageField({ label, value, onChange, folder = "pages", help, aspect = "aspect-[16/10]", onBusyChange }: Props) {
  const { csrf, toast } = useAdmin();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState(0);
  const id = useId();

  const setBusyAll = (b: boolean) => { setBusy(b); onBusyChange?.(b); };

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow selecting the same file again (e.g. after an error)
    if (!file) return;
    setBusyAll(true);
    setPct(0);
    try {
      const r = await uploadImage(file, folder, csrf, setPct);
      onChange(r.url);
      toast("success", "Image uploaded. Save to apply the change.");
    } catch (err) {
      toast("error", (err as Error).message);
    } finally {
      setBusyAll(false);
    }
  }

  return (
    <div>
      <p className="label" id={`${id}-label`}>{label}</p>
      <div className={`relative ${aspect} w-full max-w-md overflow-hidden rounded-lg border border-line bg-sand`}>
        {value ? (
          <SafeImage src={value} alt={`${label} preview`} fill sizes="448px" className="object-cover" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-sm"><ImagePlus className="h-6 w-6 text-gold" aria-hidden />No image</div>
        )}
        {busy && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/80 text-sm font-semibold text-navy" role="status">
            <Loader2 className="h-6 w-6 animate-spin text-gold" aria-hidden />Uploading{pct ? ` ${pct}%` : "..."}
          </div>
        )}
      </div>
      <div className="mt-2.5 flex flex-wrap gap-2">
        <input ref={inputRef} id={id} type="file" accept={ACCEPTED.join(",")} className="sr-only" onChange={onFile} disabled={busy} aria-labelledby={`${id}-label`} />
        <button type="button" className="btn-outline min-h-[38px] px-3.5 text-sm" disabled={busy} onClick={() => inputRef.current?.click()}>
          {value ? <RefreshCw className="h-4 w-4" aria-hidden /> : <ImagePlus className="h-4 w-4" aria-hidden />}{value ? "Replace" : "Upload"}
        </button>
        {value && (
          <button type="button" className="btn min-h-[38px] border border-line bg-white px-3.5 text-sm text-red-700 hover:bg-red-50" disabled={busy} onClick={() => onChange(EMPTY_IMAGE)}>
            <Trash2 className="h-4 w-4" aria-hidden />Remove
          </button>
        )}
      </div>
      <p className="mt-1.5 text-xs">{help || "PNG, JPEG, WebP, or GIF up to 8 MB."}</p>
    </div>
  );
}
