import "server-only";
import { unstable_cache } from "next/cache";
import { connectDB } from "./db";
import { PageContent, Service, SiteSettings, Testimonial } from "./models";
import { pageImageDefaults, serviceImageDefaults } from "./imageDefaults";
import {
  DEFAULT_PAGES, DEFAULT_SETTINGS, DEFAULT_SERVICES,
  type PageKey, type PageT, type ServiceT, type SiteSettingsT,
} from "./defaults";

export const TAGS = { settings: "settings", pages: "pages", services: "services", testimonials: "testimonials" } as const;
const REVALIDATE = 600;

export type TestimonialT = { id: string; name: string; area: string; service: string; quote: string; published: boolean; order: number };

/* eslint-disable @typescript-eslint/no-explicit-any */
export function toService(d: any): ServiceT {
  return {
    id: String(d._id),
    slug: d.slug, title: d.title, cardTitle: d.cardTitle || d.title,
    summary: d.summary || "", description: d.description || "",
    reasons: d.reasons || [], ...serviceImageDefaults(d.slug, d.image || "", d.imageAlt || d.title),
    featured: !!d.featured, published: !!d.published, order: d.order ?? 0,
    seoTitle: d.seoTitle || "", seoDescription: d.seoDescription || "",
  };
}

/** Merges stored values over defaults so newly added fields always have a value. */
function mergeSettings(d: any): SiteSettingsT {
  const out: any = { ...DEFAULT_SETTINGS };
  if (d) for (const k of Object.keys(DEFAULT_SETTINGS)) if (d[k] !== undefined && d[k] !== null) out[k] = d[k];
  out.nav = (out.nav || []).map((l: any) => ({ label: l.label, href: l.href }));
  out.footerLinks = (out.footerLinks || []).map((l: any) => ({ label: l.label, href: l.href }));
  out.serviceAreas = [...(out.serviceAreas || [])];
  // Removed logo, or the retired placeholder SVG -> bundled logo.png
  if (!out.logoUrl || out.logoUrl.startsWith("/brand/logo")) out.logoUrl = DEFAULT_SETTINGS.logoUrl;
  return out;
}

/** DB errors are not cached (the cached fn throws); we fall back to defaults so the site stays up. */
async function safe<T>(fn: () => Promise<T>, fallback: T, label: string): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    console.error(`[content] ${label} failed, using defaults:`, (e as Error).message);
    return fallback;
  }
}

/** Caches only the stored record; defaults and fallbacks are applied on read. */
const cachedSettingsRecord = unstable_cache(
  async () => {
    await connectDB();
    const d = await SiteSettings.findOne({ key: "main" }).lean();
    return d ? JSON.parse(JSON.stringify(d)) : null;
  },
  ["site-settings-record"],
  { tags: [TAGS.settings], revalidate: REVALIDATE }
);
export const getSettings = async () => mergeSettings(await safe(cachedSettingsRecord, null, "settings"));

/** Caches only the stored record; defaults are merged on read so newly added fields appear immediately. */
const cachedPageRecord = unstable_cache(
  async (key: PageKey): Promise<{ seoTitle?: string; seoDescription?: string; data?: Record<string, unknown> } | null> => {
    await connectDB();
    const d: any = await PageContent.findOne({ key }).lean();
    return d ? { seoTitle: d.seoTitle, seoDescription: d.seoDescription, data: d.data || {} } : null;
  },
  ["page-record"],
  { tags: [TAGS.pages], revalidate: REVALIDATE }
);
export async function getPage(key: PageKey): Promise<PageT> {
  const def = DEFAULT_PAGES[key];
  const d = await safe(() => cachedPageRecord(key), null, `page:${key}`);
  return {
    key,
    seoTitle: d?.seoTitle || def.seoTitle,
    seoDescription: d?.seoDescription || def.seoDescription,
    data: pageImageDefaults(key, { ...def.data, ...((d?.data || {}) as PageT["data"]) }),
  };
}

const cachedServices = unstable_cache(
  async (): Promise<ServiceT[]> => {
    await connectDB();
    const list = await Service.find({ published: true }).sort({ order: 1, title: 1 }).lean();
    return list.map(toService);
  },
  ["services-published"],
  { tags: [TAGS.services], revalidate: REVALIDATE }
);
export const getServices = () => safe(cachedServices, DEFAULT_SERVICES, "services");

export async function getServiceBySlug(slug: string) {
  const all = await getServices();
  return all.find((s) => s.slug === slug) || null;
}

const cachedTestimonials = unstable_cache(
  async (): Promise<TestimonialT[]> => {
    await connectDB();
    const list: any[] = await Testimonial.find({ published: true }).sort({ order: 1, createdAt: -1 }).lean();
    return list.map((t) => ({
      id: String(t._id), name: t.name, area: t.area || "", service: t.service || "",
      quote: t.quote, published: t.published, order: t.order ?? 0,
    }));
  },
  ["testimonials-published"],
  { tags: [TAGS.testimonials], revalidate: REVALIDATE }
);
// No fabricated fallback: if the DB is unavailable, the empty state is shown.
export const getTestimonials = () => safe(cachedTestimonials, [], "testimonials");

/** Reads a string field from flexible page data. */
export const s = (d: PageT["data"], k: string) => {
  const v = d[k];
  return typeof v === "string" ? v : "";
};
export const list = (d: PageT["data"], k: string) => {
  const v = d[k];
  return Array.isArray(v) ? v.filter(Boolean) : [];
};
