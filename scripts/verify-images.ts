import assert from "node:assert/strict";
import fs from "node:fs";
import sharp from "sharp";
import { DEFAULT_SERVICES, IMAGES } from "../lib/defaults";
import { pageImageDefaults, serviceImageDefaults } from "../lib/imageDefaults";
import { imageValue } from "../lib/validation";

async function main() {
  for (const path of Object.values(IMAGES)) {
    assert(fs.existsSync(`public${path}`), `Missing ${path}`);
    assert(imageValue.safeParse(path).success, `Rejected ${path}`);
    const metadata = await sharp(`public${path}`).metadata();
    assert.equal(metadata.format, "webp");
    assert(metadata.width && metadata.width >= 1000);
  }
  const legacy = "https://images.unsplash.com/photo-1696992812596-3c0d4d2d1299?auto=format";
  for (const service of DEFAULT_SERVICES) {
    assert.deepEqual(serviceImageDefaults(service.slug, legacy, "old alt"), {
      image: service.image, imageAlt: service.imageAlt,
    });
  }
  const custom = "/api/uploads/products/custom.webp";
  assert.equal(serviceImageDefaults("spring-replacement", custom, "custom").image, custom);
  assert.equal(serviceImageDefaults("spring-replacement", "", "removed").image, "");
  assert.equal(pageImageDefaults("home", { heroImage: legacy }).heroImage, IMAGES.hero);
  assert.equal(pageImageDefaults("home", { heroImage: "" }).heroImage, "");
  assert.equal(pageImageDefaults("home", { heroImage: custom }).heroImage, custom);
  assert.equal(pageImageDefaults("home", { heroImage: "https://images.unsplash.com/photo-custom" }).heroImage, "https://images.unsplash.com/photo-custom");
  console.log("PASS: 14 WebP assets, valid paths, all 9 service mappings, page mapping, custom photos, and removed images.");
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
