export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://ottawisegaragedoors.ca").replace(/\/$/, "");
export const absUrl = (path: string) => (path.startsWith("http") ? path : `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`);
