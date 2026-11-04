import { NextResponse } from "next/server";
import { jsonError, requireAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { PAGE_KEYS, type PageKey } from "@/lib/defaults";
import { PageContent } from "@/lib/models";
import { PAGE_FIELDS } from "@/lib/pageFields";
import { revalidateContent } from "@/lib/revalidate";
import { cleanupReplaced, collectUploadUrls } from "@/lib/uploads";
import { fieldErrors, imageValue, pageSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function PUT(req: Request, ctx: { params: Promise<{ key: string }> }) {
  const admin = await requireAdmin(req);
  if (admin instanceof Response) return admin;
  const { key } = await ctx.params;
  if (!(PAGE_KEYS as readonly string[]).includes(key)) return jsonError(404, "Unknown page");

  const parsed = pageSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError(422, "Please fix the highlighted fields", { fields: fieldErrors(parsed.error) });

  // Whitelist keys and enforce field types from the page definition.
  const data: Record<string, string | string[]> = {};
  for (const f of PAGE_FIELDS[key as PageKey].flatMap((g) => g.fields)) {
    const v = parsed.data.data[f.name];
    if (v === undefined) continue;
    if (f.type === "list") data[f.name] = (Array.isArray(v) ? v : [v]).map((x) => x.trim()).filter(Boolean);
    else if (typeof v === "string") {
      if (f.type === "image" && !imageValue.safeParse(v).success) return jsonError(422, `Invalid image for ${f.label}`);
      data[f.name] = v;
    }
  }

  try {
    await connectDB();
    const old = await PageContent.findOne({ key }).lean<{ data?: unknown }>();
    await PageContent.updateOne(
      { key },
      { $set: { seoTitle: parsed.data.seoTitle, seoDescription: parsed.data.seoDescription, data } },
      { upsert: true }
    );
    await cleanupReplaced(collectUploadUrls(old?.data), collectUploadUrls(data));
    revalidateContent("pages");
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[admin:pages]", (e as Error).message);
    return jsonError(500, "Could not save page content");
  }
}
