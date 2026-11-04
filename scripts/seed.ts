/**
 * Idempotent content seed. Inserts missing records only; never overwrites admin edits.
 * Usage: npm run seed
 */
import "dotenv/config";
import mongoose from "mongoose";
import { DEFAULT_PAGES, DEFAULT_SERVICES, DEFAULT_SETTINGS, PAGE_KEYS } from "../lib/defaults";
import { PageContent, Service, SiteSettings } from "../lib/models";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set (add it to .env)");
  await mongoose.connect(uri);
  await Promise.all([SiteSettings.syncIndexes(), PageContent.syncIndexes(), Service.syncIndexes()]);

  const s = await SiteSettings.updateOne({ key: "main" }, { $setOnInsert: { key: "main", ...DEFAULT_SETTINGS } }, { upsert: true });
  console.log(`Settings: ${s.upsertedCount ? "created" : "kept existing"}`);

  for (const key of PAGE_KEYS) {
    const p = DEFAULT_PAGES[key];
    const r = await PageContent.updateOne({ key }, { $setOnInsert: p }, { upsert: true });
    console.log(`Page ${key}: ${r.upsertedCount ? "created" : "kept existing"}`);
  }

  for (const svc of DEFAULT_SERVICES) {
    const r = await Service.updateOne({ slug: svc.slug }, { $setOnInsert: svc }, { upsert: true });
    console.log(`Service ${svc.slug}: ${r.upsertedCount ? "created" : "kept existing"}`);
  }
  // Testimonials are intentionally not seeded: only real, verified feedback should be published.
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error("Seed failed:", e.message);
  process.exit(1);
});
