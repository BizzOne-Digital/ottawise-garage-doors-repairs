import { NextResponse } from "next/server";
import { jsonError, requireAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { StoredUpload } from "@/lib/models";
import { isUploadReferenced, parseUploadUrl } from "@/lib/uploads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Authenticated delete. Refuses to delete media that is still referenced by content. */
export async function DELETE(req: Request) {
  const admin = await requireAdmin(req);
  if (admin instanceof Response) return admin;
  const body = (await req.json().catch(() => null)) as { url?: string } | null;
  const parsed = parseUploadUrl(body?.url);
  if (!parsed || !body?.url) return jsonError(400, "Invalid upload URL");
  try {
    await connectDB();
    if (await isUploadReferenced(body.url)) return jsonError(409, "This image is still used on the website. Replace it there first.");
    const r = await StoredUpload.deleteOne(parsed);
    if (!r.deletedCount) return jsonError(404, "Image not found");
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[admin:media]", (e as Error).message);
    return jsonError(500, "Could not delete image");
  }
}
