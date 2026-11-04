import { connectDB } from "@/lib/db";
import { PageContent, Service, SiteSettings, StoredUpload } from "@/lib/models";
import { collectUploadUrls } from "@/lib/uploads";
import MediaGrid, { type MediaItem } from "./MediaGrid";

export const dynamic = "force-dynamic";

export default async function MediaPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const page = Math.max(1, Number((await searchParams).page) || 1);
  const PER = 48;
  await connectDB();
  // The binary `data` field is always excluded from listings.
  const [docs, total, services, settings, pages] = await Promise.all([
    StoredUpload.find({}, { data: 0 }).sort({ createdAt: -1 }).skip((page - 1) * PER).limit(PER)
      .lean<{ folder: string; filename: string; size: number; mimeType: string; createdAt: Date }[]>(),
    StoredUpload.countDocuments(),
    Service.find({}, { image: 1 }).lean<{ image?: string }[]>(),
    SiteSettings.findOne({ key: "main" }, { logoUrl: 1, faviconUrl: 1 }).lean<{ logoUrl?: string; faviconUrl?: string }>(),
    PageContent.find({}, { data: 1 }).lean<{ data?: unknown }[]>(),
  ]);
  const used = new Set<string>([
    ...services.map((s) => s.image || ""),
    settings?.logoUrl || "", settings?.faviconUrl || "",
    ...pages.flatMap((p) => collectUploadUrls(p.data)),
  ]);
  const items: MediaItem[] = docs.map((d) => {
    const url = `/api/uploads/${d.folder}/${d.filename}`;
    return { url, folder: d.folder, filename: d.filename, size: d.size, mimeType: d.mimeType, createdAt: new Date(d.createdAt).toISOString(), inUse: used.has(url) };
  });
  return <MediaGrid items={items} page={page} pages={Math.max(1, Math.ceil(total / PER))} total={total} />;
}
