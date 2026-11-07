import Link from "next/link";
import { toConfig } from "@/lib/doorCatalog";
import type { Model } from "mongoose";
import { Search } from "lucide-react";
import { escapeRegex } from "@/lib/adminData";
import { STATUSES } from "@/lib/constants";
import { connectDB } from "@/lib/db";
import RequestRow, { type ReqItem } from "./RequestRow";

const PAGE_SIZE = 20;

/* eslint-disable @typescript-eslint/no-explicit-any */
/** Server-rendered list with search, status filter, and pagination (shared by enquiries and bookings). */
export default async function RequestsTable({ model, kind, basePath, title, sp }: {
  model: Model<any>; kind: "enquiries" | "bookings" | "quotes"; basePath: string; title: string;
  sp: { q?: string; status?: string; page?: string };
}) {
  const q = (sp.q || "").trim().slice(0, 100);
  const status = (STATUSES as readonly string[]).includes(sp.status || "") ? sp.status! : "";
  const page = Math.max(1, Number(sp.page) || 1);
  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  else filter.status = { $ne: "Archived" };
  if (q) {
    const rx = new RegExp(escapeRegex(q), "i");
    filter.$or = [{ name: rx }, { email: rx }, { phone: rx }, { service: rx }, { area: rx }, { message: rx }];
  }

  let rows: ReqItem[] = [];
  let total = 0;
  let failed = false;
  try {
    await connectDB();
    const [docs, count] = await Promise.all([
      model.find(filter).sort({ createdAt: -1 }).skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE).lean<any[]>(),
      model.countDocuments(filter),
    ]);
    total = count;
    rows = docs.map((d) => ({
      id: String(d._id), name: d.name, email: d.email, phone: d.phone, service: d.service || "", area: d.area || "",
      message: d.message || "", status: d.status, adminNotes: d.adminNotes || "", createdAt: new Date(d.createdAt).toISOString(),
      preferredDate: d.preferredDate, timeWindow: d.timeWindow,
      doorSize: d.doorSize, emailStatus: d.emailStatus, summary: d.summary, config: d.config ? toConfig(d.config) : undefined,
    }));
  } catch (e) {
    console.error(`[admin:${kind}]`, (e as Error).message);
    failed = true;
  }
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const href = (p: Record<string, string | number>) => {
    const u = new URLSearchParams();
    const merged = { q, status, page, ...p };
    for (const [k, v] of Object.entries(merged)) if (v && !(k === "page" && v === 1)) u.set(k, String(v));
    const s = u.toString();
    return s ? `${basePath}?${s}` : basePath;
  };

  return (
    <>
      <h1 className="text-2xl sm:text-[1.75rem]">{title}</h1>
      <p className="mt-1 text-sm">{total} {status ? status.toLowerCase() : "active"} record{total === 1 ? "" : "s"}. Archived items are hidden unless you filter for them.</p>
      <form method="get" action={basePath} className="mt-6 flex flex-col gap-3 sm:flex-row" role="search">
        <label className="sr-only" htmlFor="q">Search</label>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" aria-hidden />
          <input id="q" name="q" defaultValue={q} placeholder="Search name, email, phone, service..." className="input pl-9" />
        </div>
        <label className="sr-only" htmlFor="status">Status</label>
        <select id="status" name="status" defaultValue={status} className="input sm:w-48">
          <option value="">All active</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button type="submit" className="btn-navy">Filter</button>
      </form>

      <div className="mt-6">
        {failed ? (
          <p role="alert" className="card p-6 text-red-800">Could not load records. Check the database connection.</p>
        ) : rows.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="font-semibold text-navy">{q || status ? "No matching records" : "Nothing here yet"}</p>
            <p className="mt-1 text-sm">{q || status ? "Try a different search or filter." : "New submissions from the website will appear here."}</p>
          </div>
        ) : (
          <ul className="space-y-3">{rows.map((r) => <RequestRow key={r.id} item={r} kind={kind} />)}</ul>
        )}
      </div>

      {pages > 1 && (
        <nav aria-label="Pagination" className="mt-6 flex items-center justify-between text-sm">
          {page > 1 ? <Link href={href({ page: page - 1 })} className="btn-outline min-h-[38px] px-4">Previous</Link> : <span />}
          <span>Page {page} of {pages}</span>
          {page < pages ? <Link href={href({ page: page + 1 })} className="btn-outline min-h-[38px] px-4">Next</Link> : <span />}
        </nav>
      )}
    </>
  );
}
