import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { jsonError, requireAdmin } from "@/lib/auth";
import { CHUNK_BYTES, MAX_UPLOAD_BYTES } from "@/lib/constants";
import { connectDB } from "@/lib/db";
import { UploadChunk, UploadSession } from "@/lib/models";
import { ALLOWED_MIME, isFolder, storeImage, UploadError } from "@/lib/uploads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TTL_MS = 30 * 60 * 1000;
const ID_RE = /^[a-f0-9]{32}$/;

/**
 * Chunked upload fallback for hosts whose request-body limit is below 8 MB.
 *  1. POST ?action=init      JSON { folder, size, mimeType }      -> { uploadId, chunkSize, totalChunks }
 *  2. POST ?action=chunk&uploadId=..&index=N   raw bytes (octet-stream, <= chunkSize)
 *  3. POST ?action=complete  JSON { uploadId }                    -> same response as /api/upload
 * Chunks live in MongoDB with a TTL index; nothing touches disk.
 */
export async function POST(req: Request) {
  const admin = await requireAdmin(req);
  if (admin instanceof Response) return admin;
  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  try {
    await connectDB();

    if (action === "init") {
      const body = (await req.json().catch(() => null)) as { folder?: unknown; size?: unknown; mimeType?: unknown } | null;
      if (!body || !isFolder(body.folder)) return jsonError(400, "Invalid upload folder");
      const size = Number(body.size);
      if (!Number.isInteger(size) || size <= 0) return jsonError(400, "Invalid file size");
      if (size > MAX_UPLOAD_BYTES) return jsonError(413, "File exceeds the 8 MB limit");
      if (typeof body.mimeType !== "string" || !(ALLOWED_MIME as readonly string[]).includes(body.mimeType))
        return jsonError(415, "Only PNG, JPEG, WebP, and GIF images are allowed");
      const uploadId = crypto.randomBytes(16).toString("hex");
      const totalChunks = Math.ceil(size / CHUNK_BYTES);
      await UploadSession.create({
        uploadId, userId: admin.userId, folder: body.folder, totalSize: size, totalChunks,
        expiresAt: new Date(Date.now() + TTL_MS),
      });
      return NextResponse.json({ success: true, uploadId, chunkSize: CHUNK_BYTES, totalChunks });
    }

    const uploadId = action === "complete"
      ? String(((await req.clone().json().catch(() => ({}))) as { uploadId?: string }).uploadId || "")
      : url.searchParams.get("uploadId") || "";
    if (!ID_RE.test(uploadId)) return jsonError(400, "Invalid upload ID");
    const sess = await UploadSession.findOne({ uploadId, expiresAt: { $gt: new Date() } }).lean<{
      userId: unknown; folder: string; totalSize: number; totalChunks: number; _id: unknown;
    }>();
    if (!sess) return jsonError(404, "Upload session not found or expired");
    if (String(sess.userId) !== admin.userId) return jsonError(403, "Upload session belongs to another user");

    if (action === "chunk") {
      const index = Number(url.searchParams.get("index"));
      if (!Number.isInteger(index) || index < 0 || index >= sess.totalChunks) return jsonError(400, "Invalid chunk index");
      const buf = Buffer.from(await req.arrayBuffer());
      const expected = index === sess.totalChunks - 1 ? sess.totalSize - CHUNK_BYTES * (sess.totalChunks - 1) : CHUNK_BYTES;
      if (buf.length !== expected) return jsonError(400, "Chunk size does not match the declared file size");
      await UploadChunk.updateOne(
        { uploadId, index },
        { $set: { data: buf, expiresAt: new Date(Date.now() + TTL_MS) } },
        { upsert: true }
      );
      return NextResponse.json({ success: true, index });
    }

    if (action === "complete") {
      const chunks = await UploadChunk.find({ uploadId }).sort({ index: 1 }).lean<{ index: number; data: { buffer: Buffer } | Buffer }[]>();
      if (chunks.length !== sess.totalChunks || chunks.some((c, i) => c.index !== i))
        return jsonError(400, "Upload is incomplete or out of sequence");
      const buf = Buffer.concat(chunks.map((c) => (Buffer.isBuffer(c.data) ? c.data : Buffer.from(c.data.buffer))));
      if (buf.length !== sess.totalSize) return jsonError(400, "Assembled size does not match the declared size");
      if (!isFolder(sess.folder)) return jsonError(400, "Invalid upload folder");
      const result = await storeImage(buf, sess.folder); // re-validates signature and size
      await Promise.all([UploadChunk.deleteMany({ uploadId }), UploadSession.deleteOne({ uploadId })]);
      return NextResponse.json(result, { status: 201 });
    }

    return jsonError(400, "Unknown action");
  } catch (e) {
    if (e instanceof UploadError) return jsonError(e.status, e.message);
    console.error("[upload:chunked] failed:", (e as Error).message);
    return jsonError(500, "Upload failed. Please try again.");
  }
}
