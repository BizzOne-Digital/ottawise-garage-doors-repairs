/**
 * Canonical site origin. The live site is served on www (the bare domain 308-redirects to it),
 * so a bare-domain value from the environment is normalised to www to keep canonicals,
 * the sitemap, robots.txt, and Open Graph URLs consistent.
 */
const RAW_SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.ottawisegaragedoors.ca").replace(/\/$/, "");
export const SITE_URL = RAW_SITE_URL.replace(/^https?:\/\/ottawisegaragedoors\.ca$/i, "https://www.ottawisegaragedoors.ca");
export const absUrl = (path: string) => (path.startsWith("http") ? path : `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`);
