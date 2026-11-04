"use client";

import { useRouter } from "next/navigation";
import { CalendarDays, ChevronDown, Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { STATUSES } from "@/lib/constants";
import { useAdmin } from "./AdminProvider";
import { STATUS_STYLES } from "./ui";

export type ReqItem = {
  id: string; name: string; email: string; phone: string; service: string; area: string; message: string;
  status: string; adminNotes: string; createdAt: string; preferredDate?: string; timeWindow?: string;
};

const fmtDateTime = (iso: string) => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto", dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
/** preferredDate is a calendar date in Ottawa; format it without shifting timezones. */
const fmtDay = (ymd: string) => new Intl.DateTimeFormat("en-CA", { timeZone: "UTC", weekday: "short", month: "short", day: "numeric", year: "numeric" }).format(new Date(`${ymd}T12:00:00Z`));

export default function RequestRow({ item, kind }: { item: ReqItem; kind: "enquiries" | "bookings" }) {
  const { api, toast, confirm } = useAdmin();
  const router = useRouter();
  const [open, setOpen] = useState(item.status === "New");
  const [status, setStatus] = useState(item.status);
  const [notes, setNotes] = useState(item.adminNotes);
  const [busy, setBusy] = useState(false);

  async function patch(body: Record<string, string>, msg: string) {
    setBusy(true);
    const r = await api(`/api/admin/${kind}/${item.id}`, { method: "PATCH", json: body });
    setBusy(false);
    if (r.ok) { toast("success", msg); router.refresh(); return true; }
    toast("error", r.data.error || "Could not update");
    return false;
  }

  async function changeStatus(s: string) {
    const prev = status;
    setStatus(s);
    if (!(await patch({ status: s }, `Marked as ${s}`))) setStatus(prev);
  }

  async function remove() {
    if (!(await confirm({ title: "Delete this record permanently?", body: "Consider archiving instead. Deleting cannot be undone.", confirmLabel: "Delete", danger: true }))) return;
    setBusy(true);
    const r = await api(`/api/admin/${kind}/${item.id}`, { method: "DELETE" });
    setBusy(false);
    if (r.ok) { toast("success", "Deleted"); router.refresh(); } else toast("error", r.data.error || "Could not delete");
  }

  return (
    <li className="card">
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <button type="button" className="flex min-w-0 flex-1 items-center gap-3 text-left" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
          <span className="min-w-0">
            <span className="block truncate font-bold text-navy">{item.name} <span className="font-normal text-body">&middot; {item.service || "General enquiry"}</span></span>
            <span className="block text-xs">Received {fmtDateTime(item.createdAt)}{item.preferredDate ? ` · Wants ${fmtDay(item.preferredDate)}` : ""}</span>
          </span>
        </button>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[status] || ""}`}>{status}</span>
          <label className="sr-only" htmlFor={`st-${item.id}`}>Status</label>
          <select id={`st-${item.id}`} value={status} disabled={busy} onChange={(e) => changeStatus(e.target.value)} className="input w-36 py-1.5 text-sm">
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      {open && (
        <div className="grid gap-5 border-t border-line p-4 md:grid-cols-2">
          <div className="space-y-2 text-sm">
            <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-gold" aria-hidden /><a href={`tel:${item.phone.replace(/[^\d+]/g, "")}`} className="font-semibold text-navy">{item.phone}</a></p>
            <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-gold" aria-hidden /><a href={`mailto:${item.email}`} className="break-all font-semibold text-navy">{item.email}</a></p>
            {item.area && <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gold" aria-hidden />{item.area}</p>}
            {item.preferredDate && (
              <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-gold" aria-hidden />{fmtDay(item.preferredDate)} &middot; {item.timeWindow} <span className="text-xs">(Ottawa time, requested, not confirmed)</span></p>
            )}
            {item.message && <p className="whitespace-pre-wrap rounded-md bg-sand p-3 text-navy">{item.message}</p>}
          </div>
          <div>
            <label htmlFor={`n-${item.id}`} className="label">Internal notes</label>
            <textarea id={`n-${item.id}`} rows={4} maxLength={2000} value={notes} onChange={(e) => setNotes(e.target.value)} className="input" />
            <div className="mt-2 flex flex-wrap justify-between gap-2">
              <button type="button" disabled={busy} onClick={remove} className="btn min-h-[38px] border border-line bg-white px-3 text-sm text-red-700 hover:bg-red-50">Delete</button>
              <div className="flex gap-2">
                {status !== "Archived" && <button type="button" disabled={busy} className="btn-outline min-h-[38px] px-3 text-sm" onClick={() => changeStatus("Archived")}>Archive</button>}
                <button type="button" disabled={busy || notes === item.adminNotes} className="btn-navy min-h-[38px] px-3 text-sm" onClick={() => patch({ adminNotes: notes }, "Notes saved")}>Save notes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </li>
  );
}
