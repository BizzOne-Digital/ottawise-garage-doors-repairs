import { z } from "zod";
import { STATUSES, TIME_WINDOWS } from "./constants";
import { isValidConfig, type DoorConfig } from "./doorCatalog";

const phoneRe = /^[+()\-.\s\d]{7,25}$/;
const clean = (max: number) => z.string().trim().max(max);

export const contactSchema = z.object({
  name: clean(100).min(2, "Please enter your name"),
  email: clean(200).email("Please enter a valid email address"),
  phone: clean(25).regex(phoneRe, "Please enter a valid phone number"),
  service: clean(120).min(1, "Please choose a service"),
  area: clean(100).min(1, "Please choose your area"),
  message: clean(3000).min(10, "Please add a few details (at least 10 characters)"),
});
export type ContactInput = z.infer<typeof contactSchema>;

/** Today's date (YYYY-MM-DD) in Ottawa, regardless of server or browser timezone. */
export function todayInToronto(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

export const bookingSchema = z.object({
  name: clean(100).min(2, "Please enter your full name"),
  email: clean(200).email("Please enter a valid email address"),
  phone: clean(25).regex(phoneRe, "Please enter a valid phone number"),
  service: clean(120).min(1, "Please choose a service"),
  area: clean(100).min(1, "Please choose your area"),
  preferredDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Please choose a date")
    .refine((d) => d >= todayInToronto(), "Please choose today or a future date")
    .refine((d) => {
      const max = new Date(Date.now() + 365 * 86400_000);
      return d <= todayInToronto(max);
    }, "Please choose a date within the next 12 months"),
  timeWindow: z.enum(TIME_WINDOWS, { message: "Please choose a time window" }),
  message: clean(3000).optional().default(""),
});
export type BookingInput = z.infer<typeof bookingSchema>;

export const doorQuoteSchema = z.object({
  name: clean(100).min(2, "Please enter your name"),
  email: clean(200).email("Please enter a valid email address"),
  phone: clean(25).regex(phoneRe, "Please enter a valid phone number"),
  area: clean(100).min(1, "Please choose your area"),
  message: clean(3000).optional().default(""),
  config: z.object({
    style: z.string().max(40), colour: z.string().max(40),
    width: z.number().int(), height: z.number().int(), quantity: z.number().int(),
    windowType: z.string().max(40), windows: z.array(z.string().max(5)).max(64),
    glass: z.string().max(40), frame: z.string().max(40),
  }).refine((c) => isValidConfig(c as DoorConfig), "Please choose valid door options"),
});
export type DoorQuoteInput = z.infer<typeof doorQuoteSchema>;

export const statusSchema = z.enum(STATUSES);

/** Turns zod issues into { field: message } for form display. */
export function fieldErrors(err: z.ZodError) {
  const out: Record<string, string> = {};
  for (const i of err.issues) {
    const k = String(i.path[0] ?? "form");
    if (!out[k]) out[k] = i.message;
  }
  return out;
}

const link = z.object({ label: clean(60).min(1), href: clean(300).regex(/^(\/|https?:\/\/|tel:|mailto:)/, "Links must start with /, http(s)://, tel: or mailto:") });
/** Image values: "" (empty), a managed upload, a bundled asset, or an https URL. */
export const imageValue = z.string().trim().max(500).refine(
  (v) => v === "" || v.startsWith("/api/uploads/") || v.startsWith("/brand/") || /^\/images\/[a-z0-9-]+\.webp$/.test(v) || /^https:\/\//.test(v),
  "Invalid image URL"
);

const optionalHttpsUrl = clean(300).refine((v) => v === "" || /^https:\/\/\S+$/.test(v), "Use a full https:// link, or leave this empty");

export const settingsSchema = z.object({
  businessName: clean(120).min(1),
  contactPerson: clean(120),
  logoUrl: imageValue,
  faviconUrl: imageValue,
  phoneDisplay: clean(40).min(1),
  phoneLink: clean(40).regex(/^tel:\+?\d{7,15}$/, "Use the format tel:+13432092317"),
  email: clean(200).email(),
  websiteUrl: clean(300).url(),
  instagramUrl: optionalHttpsUrl,
  facebookUrl: optionalHttpsUrl,
  whatsappUrl: optionalHttpsUrl,
  hoursShort: clean(120),
  hoursLong: clean(200),
  utilityLeft: clean(120),
  utilityRight: clean(120),
  serviceAreas: z.array(clean(60).min(1)).max(30),
  nav: z.array(link).max(10),
  footerLinks: z.array(link).max(12),
  footerTagline: clean(300),
  headerCtaLabel: clean(40).min(1),
});

export const serviceSchema = z.object({
  slug: clean(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and single hyphens"),
  title: clean(120).min(2),
  cardTitle: clean(60),
  summary: clean(300),
  description: clean(3000),
  reasons: z.array(clean(200).min(1)).max(12),
  image: imageValue,
  imageAlt: clean(200),
  featured: z.boolean(),
  published: z.boolean(),
  order: z.coerce.number().int().min(0).max(1000),
  seoTitle: clean(120),
  seoDescription: clean(320),
});

export const testimonialSchema = z.object({
  name: clean(100).min(1),
  area: clean(100),
  service: clean(120),
  quote: clean(1500).min(5),
  published: z.boolean(),
  order: z.coerce.number().int().min(0).max(1000),
});

export const pageSchema = z.object({
  seoTitle: clean(120),
  seoDescription: clean(320),
  data: z.record(z.string(), z.union([clean(3000), z.array(clean(500)).max(30)])),
});
