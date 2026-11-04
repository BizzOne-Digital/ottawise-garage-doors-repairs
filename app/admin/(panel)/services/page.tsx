import Link from "next/link";
import { Plus } from "lucide-react";
import SafeImage from "@/components/SafeImage";
import { toService } from "@/lib/content";
import { connectDB } from "@/lib/db";
import { Service } from "@/lib/models";
import ServiceRowActions from "./ServiceRowActions";

export const dynamic = "force-dynamic";

export default async function ServicesAdmin() {
  await connectDB();
  const services = (await Service.find().sort({ order: 1, title: 1 }).lean()).map(toService);
  return (
    <>
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-[1.75rem]">Services</h1>
          <p className="mt-1 text-sm">Featured services appear on the homepage (first three). Unpublished services are hidden from the website.</p>
        </div>
        <Link href="/admin/services/new" className="btn-navy"><Plus className="h-4 w-4" aria-hidden />New service</Link>
      </div>
      {services.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="font-semibold text-navy">No services yet</p>
          <p className="mt-1 text-sm">Run <code>npm run seed</code> or create your first service.</p>
        </div>
      ) : (
        <ul className="card divide-y divide-line">
          {services.map((s) => (
            <li key={s.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
              <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-md bg-sand">
                <SafeImage src={s.image} alt="" fill sizes="96px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-navy">{s.title}</p>
                <p className="truncate text-xs">/services/{s.slug} &middot; order {s.order}</p>
                <div className="mt-1.5 flex gap-2 text-xs font-semibold">
                  <span className={`rounded-full px-2 py-0.5 ${s.published ? "bg-green-50 text-green-800" : "bg-gray-100 text-gray-700"}`}>{s.published ? "Published" : "Draft"}</span>
                  {s.featured && <span className="rounded-full bg-gold/15 px-2 py-0.5 text-gold-dark">Featured</span>}
                </div>
              </div>
              <ServiceRowActions id={s.id!} title={s.title} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
