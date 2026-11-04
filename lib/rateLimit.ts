import "server-only";
import { headers } from "next/headers";
import { connectDB } from "./db";
import { RateLimit } from "./models";

/** Client IP from proxy headers (Vercel / most hosts set x-forwarded-for). */
export async function clientIp() {
  const h = await headers();
  const xff = h.get("x-forwarded-for");
  return (xff?.split(",")[0] || h.get("x-real-ip") || "unknown").trim().slice(0, 64);
}

/**
 * Fixed-window counter stored in MongoDB so limits hold across serverless instances.
 * Returns true when the request is allowed.
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number) {
  await connectDB();
  const now = new Date();
  // Reset an expired window first (TTL deletion can lag up to ~60s).
  await RateLimit.deleteOne({ key, expiresAt: { $lte: now } });
  const doc = await RateLimit.findOneAndUpdate(
    { key },
    { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date(now.getTime() + windowSeconds * 1000) } },
    { upsert: true, new: true }
  ).lean<{ count: number }>();
  return (doc?.count ?? 0) <= limit;
}

export async function clearRateLimit(key: string) {
  await connectDB();
  await RateLimit.deleteOne({ key });
}
