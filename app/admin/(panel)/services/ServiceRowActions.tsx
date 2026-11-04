"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAdmin } from "@/components/admin/AdminProvider";

export default function ServiceRowActions({ id, title }: { id: string; title: string }) {
  const { api, confirm, toast } = useAdmin();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    const ok = await confirm({ title: `Delete "${title}"?`, body: "The service page will be removed from the website. This cannot be undone.", confirmLabel: "Delete service", danger: true });
    if (!ok) return;
    setBusy(true);
    const r = await api(`/api/admin/services/${id}`, { method: "DELETE" });
    setBusy(false);
    if (r.ok) { toast("success", "Service deleted"); router.refresh(); }
    else toast("error", r.data.error || "Could not delete");
  }

  return (
    <div className="flex gap-2">
      <Link href={`/admin/services/${id}`} className="btn-outline min-h-[38px] px-4 text-sm">Edit</Link>
      <button type="button" onClick={remove} disabled={busy} className="btn min-h-[38px] border border-line bg-white px-4 text-sm text-red-700 hover:bg-red-50">{busy ? "Deleting..." : "Delete"}</button>
    </div>
  );
}
