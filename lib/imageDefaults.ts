import { DEFAULT_PAGES, DEFAULT_SERVICES, type PageData, type PageKey } from "./defaults";

// Recognize only the original bundled stock photos; custom photos stay editable.
const ORIGINAL_PHOTOS = [
  "1777106322601-578dc9213ace", "1722247523663-09f0325ef054",
  "1772652376695-6b3de826ff9f", "1734477127040-c5845f5af500",
  "1606676539940-12768ce0e762", "1779179256190-dfd7b680794e",
  "1770756051811-1612ac8bedfa", "1576765915042-d4746f8b7727",
  "1648941416478-319d8c2d06d4", "1518709414768-a88981a4515d",
  "1678728994157-0bcb3309200f", "1696992812596-3c0d4d2d1299",
];

export function isOriginalPhoto(value: unknown): boolean {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.origin === "https://images.unsplash.com" &&
      ORIGINAL_PHOTOS.some((id) => url.pathname === `/photo-${id}`);
  } catch {
    return false;
  }
}

export function serviceImageDefaults(slug: string, image: string, imageAlt: string) {
  const def = DEFAULT_SERVICES.find((service) => service.slug === slug);
  return def && isOriginalPhoto(image)
    ? { image: def.image, imageAlt: def.imageAlt }
    : { image, imageAlt };
}

export function pageImageDefaults(key: PageKey, data: PageData): PageData {
  const result = { ...data };
  const defaults = DEFAULT_PAGES[key].data;
  for (const [field, value] of Object.entries(result)) {
    if ((field === "image" || field.endsWith("Image")) && isOriginalPhoto(value) && typeof defaults[field] === "string") {
      result[field] = defaults[field];
      const alt = `${field}Alt`;
      if (typeof defaults[alt] === "string") result[alt] = defaults[alt];
    }
  }
  return result;
}
