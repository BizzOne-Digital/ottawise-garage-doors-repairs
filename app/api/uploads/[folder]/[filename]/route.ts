import { connectDB } from "@/lib/db";
import { StoredUpload } from "@/lib/models";
import { FILENAME_RE, isFolder } from "@/lib/uploads";

export const runtime = "nodejs";

const notFound = () => new Response("Not found", { status: 404, headers: { "X-Content-Type-Options": "nosniff" } });

/** Public image delivery. No authentication: these URLs are embedded on the public site. */
export async function GET(_req: Request, ctx: { params: Promise<{ folder: string; filename: string }> }) {
  const { folder, filename } = await ctx.params;
  if (!isFolder(folder)) return notFound();
  if (filename.includes("..") || filename.includes("/") || filename.includes("\\") || !FILENAME_RE.test(filename)) return notFound();

  try {
    await connectDB();
    const doc = await StoredUpload.findOne({ folder, filename }).lean<{ data: { buffer?: ArrayBuffer } | Buffer; mimeType: string; size: number }>();
    if (!doc) return notFound();
    // lean() returns a BSON Binary; normalise to a Buffer.
    const raw = doc.data as unknown as { buffer: Buffer } | Buffer;
    const body = Buffer.isBuffer(raw) ? raw : Buffer.from((raw as { buffer: Buffer }).buffer);
    return new Response(new Uint8Array(body), {
      status: 200,
      headers: {
        "Content-Type": doc.mimeType,
        "Content-Length": String(body.length),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; sandbox",
      },
    });
  } catch (e) {
    console.error("[uploads] read failed:", (e as Error).message);
    return new Response("Temporarily unavailable", { status: 503 });
  }
}
