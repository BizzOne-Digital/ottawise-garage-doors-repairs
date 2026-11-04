import type { MetadataRoute } from "next";
import { getServices } from "@/lib/content";
import { absUrl } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const services = await getServices();
  const fixed = ["/", "/services", "/about", "/testimonials", "/contact", "/booking"].map((p) => ({
    url: absUrl(p),
    changeFrequency: "monthly" as const,
    priority: p === "/" ? 1 : 0.8,
  }));
  return [
    ...fixed,
    ...services.map((s) => ({ url: absUrl(`/services/${s.slug}`), changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
