"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAdmin } from "./AdminProvider";

/** Shared save flow: tracks dirty/busy state, field errors, toasts, and warns before leaving with unsaved changes. */
export function useSave<T>(initial: T) {
  const { api, toast } = useAdmin();
  const router = useRouter();
  const [value, setValue] = useState<T>(initial);
  const [saved, setSaved] = useState(JSON.stringify(initial));
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const dirty = JSON.stringify(value) !== saved;

  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  async function save(url: string, method: "PUT" | "POST", body: unknown, okMsg = "Saved") {
    if (uploading) { toast("error", "Please wait for the image upload to finish."); return null; }
    setBusy(true);
    setErrors({});
    const r = await api<{ id?: string }>(url, { method, json: body });
    setBusy(false);
    if (r.ok) {
      setSaved(JSON.stringify(value));
      toast("success", okMsg);
      router.refresh();
      return r.data;
    }
    if (r.data.fields) setErrors(r.data.fields);
    toast("error", r.data.error || "Could not save");
    return null;
  }

  const set = <K extends keyof T>(k: K, v: T[K]) => setValue((p) => ({ ...p, [k]: v }));
  return { value, setValue, set, save, busy, dirty, errors, uploading, setUploading };
}
