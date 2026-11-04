"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useAdmin } from "@/components/admin/AdminProvider";
import { AdminHeader, Panel, TextField, Toggle } from "@/components/admin/ui";

export type TItem = { id?: string; name: string; area: string; service: string; quote: string; published: boolean; order: number };
const EMPTY: TItem = { name: "", area: "", service: "", quote: "", published: false, order: 0 };

export default function TestimonialsManager({ items }: { items: TItem[] }) {
  const { api, toast, confirm } = useAdmin();
  const router = useRouter();
  const [editing, setEditing] = useState<TItem | null>(null);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setBusy(true);
    const { id, ...body } = editing;
    const r = await api(id ? `/api/admin/testimonials/${id}` : "/api/admin/testimonials", { method: id ? "PUT" : "POST", json: { ...body, order: Number(body.order) || 0 } });
    setBusy(false);
    if (r.ok) { toast("success", "Testimonial saved"); setEditing(null); setErrors({}); router.refresh(); }
    else { setErrors(r.data.fields || {}); toast("error", r.data.error || "Could not save"); }
  }

  async function togglePublish(t: TItem) {
    const { id, ...body } = t;
    const r = await api(`/api/admin/testimonials/${id}`, { method: "PUT", json: { ...body, published: !t.published } });
    if (r.ok) { toast("success", t.published ? "Unpublished" : "Published"); router.refresh(); }
    else toast("error", r.data.error || "Could not update");
  }

  async function remove(t: TItem) {
    if (!(await confirm({ title: "Delete this testimonial?", body: `From ${t.name}. This cannot be undone.`, confirmLabel: "Delete", danger: true }))) return;
    const r = await api(`/api/admin/testimonials/${t.id}`, { method: "DELETE" });
    if (r.ok) { toast("success", "Deleted"); router.refresh(); } else toast("error", r.data.error || "Could not delete");
  }

  const set = <K extends keyof TItem>(k: K, v: TItem[K]) => setEditing((p) => (p ? { ...p, [k]: v } : p));

  return (
    <>
      <AdminHeader title="Testimonials" description="Only add genuine feedback from real customers, with their permission. Only published items appear on the website.">
        <button type="button" className="btn-navy" onClick={() => { setErrors({}); setEditing({ ...EMPTY }); }}><Plus className="h-4 w-4" aria-hidden />Add testimonial</button>
      </AdminHeader>

      {editing && (
        <form onSubmit={save} className="mb-6">
          <Panel title={editing.id ? "Edit testimonial" : "New testimonial"}>
            <div className="grid gap-5 sm:grid-cols-3">
              <TextField label="Customer name" required value={editing.name} onChange={(v) => set("name", v)} error={errors.name} help="e.g. first name and last initial" />
              <TextField label="Area" value={editing.area} onChange={(v) => set("area", v)} />
              <TextField label="Service" value={editing.service} onChange={(v) => set("service", v)} />
            </div>
            <TextField label="Quote" required multiline value={editing.quote} onChange={(v) => set("quote", v)} error={errors.quote} />
            <div className="flex flex-wrap items-center gap-6">
              <Toggle label="Published" checked={editing.published} onChange={(v) => set("published", v)} />
              <div className="w-32"><TextField label="Order" type="number" value={String(editing.order)} onChange={(v) => set("order", Number(v))} /></div>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" className="btn-outline" onClick={() => setEditing(null)}>Cancel</button>
              <button type="submit" className="btn-navy" disabled={busy}>{busy ? "Saving..." : "Save"}</button>
            </div>
          </Panel>
        </form>
      )}

      {items.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="font-semibold text-navy">No testimonials yet</p>
          <p className="mt-1 text-sm">The public page shows a friendly empty state until you publish one.</p>
        </div>
      ) : (
        <ul className="card divide-y divide-line">
          {items.map((t) => (
            <li key={t.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start">
              <div className="min-w-0 flex-1">
                <p className="font-bold text-navy">{t.name} <span className="font-normal text-body">{[t.area, t.service].filter(Boolean).join(" • ")}</span></p>
                <p className="mt-1 line-clamp-2 text-sm">{t.quote}</p>
                <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${t.published ? "bg-green-50 text-green-800" : "bg-gray-100 text-gray-700"}`}>{t.published ? "Published" : "Hidden"}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn-outline min-h-[38px] px-3 text-sm" onClick={() => togglePublish(t)}>{t.published ? "Unpublish" : "Publish"}</button>
                <button type="button" className="btn-outline min-h-[38px] px-3 text-sm" onClick={() => { setErrors({}); setEditing({ ...t }); }}>Edit</button>
                <button type="button" className="btn min-h-[38px] border border-line bg-white px-3 text-sm text-red-700 hover:bg-red-50" onClick={() => remove(t)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
