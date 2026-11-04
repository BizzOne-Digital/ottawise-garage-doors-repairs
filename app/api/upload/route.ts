import { NextResponse } from "next/server";
import { jsonError, requireAdmin } from "@/lib/auth";
import { MAX_UPLOAD_BYTES } from "@/lib/constants";
import { isFolder, storeImage, UploadError } from "@/lib/uploads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST multipart FormData { file, folder } -> stores the image in MongoDB. */
export async function POST(req: Request) {
  const admin = await requireAdmin(req);
  if (admin instanceof Response) return admin;

  const len = Number(req.headers.get("content-length") || 0);
  if (len > MAX_UPLOAD_BYTES + 64 * 1024) return jsonError(413, "File exceeds the 8 MB limit");

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return jsonError(400, "Expected multipart form data");
  }
  const folder = form.get("folder");
  const file = form.get("file");
  if (!isFolder(folder)) return jsonError(400, "Invalid upload folder");
  if (!(file instanceof File)) return jsonError(400, "No file was provided");
  if (file.size > MAX_UPLOAD_BYTES) return jsonError(413, "File exceeds the 8 MB limit");

  try {
    const buf = Buffer.from(await file.arrayBuffer());
    const result = await storeImage(buf, folder, file.type);
    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    if (e instanceof UploadError) return jsonError(e.status, e.message);
    console.error("[upload] failed:", (e as Error).message);
    return jsonError(500, "Upload failed. Please try again.");
  }
}
