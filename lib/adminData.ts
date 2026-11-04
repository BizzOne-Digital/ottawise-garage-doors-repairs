import "server-only";
import { connectDB } from "./db";
import { DEFAULT_PAGES, DEFAULT_SETTINGS, type PageKey, type PageT, type SiteSettingsT } from "./defaults";
import { PageContent, SiteSettings } from "./models";
import { pageImageDefaults } from "./imageDefaults";

/* eslint-disable @typescript-eslint/no-explicit-any */
/** Uncached reads for admin editors so they always show the latest saved values. */
export async function getSettingsFresh(): Promise<SiteSettingsT> {
  await connectDB();
  const d: any = await SiteSettings.findOne({ key: "main" }).lean();
  const out: any = { ...DEFAULT_SETTINGS };
  if (d) for (const k of Object.keys(DEFAULT_SETTINGS)) if (d[k] !== undefined && d[k] !== null) out[k] = d[k];
  out.nav = (out.nav || []).map((l: any) => ({ label: l.label || "", href: l.href || "" }));
  out.footerLinks = (out.footerLinks || []).map((l: any) => ({ label: l.label || "", href: l.href || "" }));
  out.serviceAreas = [...(out.serviceAreas || [])];
  return out;
}

export async function getPageFresh(key: PageKey): Promise<PageT> {
  await connectDB();
  const d: any = await PageContent.findOne({ key }).lean();
  const def = DEFAULT_PAGES[key];
  return {
    key,
    seoTitle: d?.seoTitle ?? def.seoTitle,
    seoDescription: d?.seoDescription ?? def.seoDescription,
    data: pageImageDefaults(key, { ...def.data, ...(d?.data || {}) }),
  };
}

/** Escapes user input before using it inside a MongoDB $regex. */
export const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
