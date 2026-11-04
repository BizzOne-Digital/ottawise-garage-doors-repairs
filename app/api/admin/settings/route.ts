import { NextResponse } from "next/server";
import { jsonError, requireAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { SiteSettings } from "@/lib/models";
import { revalidateContent } from "@/lib/revalidate";
import { cleanupReplaced } from "@/lib/uploads";
import { fieldErrors, settingsSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function PUT(req: Request) {
  const admin = await requireAdmin(req);
  if (admin instanceof Response) return admin;
  const parsed = settingsSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError(422, "Please fix the highlighted fields", { fields: fieldErrors(parsed.error) });

  try {
    await connectDB();
    const old = await SiteSettings.findOne({ key: "main" }).lean<{ logoUrl?: string; faviconUrl?: string }>();
    await SiteSettings.updateOne({ key: "main" }, { $set: parsed.data }, { upsert: true, runValidators: true });
    // Only after the save succeeded: remove replaced uploads that are no longer referenced.
    await cleanupReplaced([old?.logoUrl, old?.faviconUrl], [parsed.data.logoUrl, parsed.data.faviconUrl]);
    revalidateContent("settings");
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[admin:settings]", (e as Error).message);
    return jsonError(500, "Could not save settings");
  }
}
