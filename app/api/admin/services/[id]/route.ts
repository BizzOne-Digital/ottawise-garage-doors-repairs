import { isValidObjectId } from "mongoose";
import { NextResponse } from "next/server";
import { jsonError, requireAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Service } from "@/lib/models";
import { revalidateContent } from "@/lib/revalidate";
import { cleanupReplaced, deleteUploadIfUnreferenced } from "@/lib/uploads";
import { fieldErrors, serviceSchema } from "@/lib/validation";

export const runtime = "nodejs";
type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, ctx: Ctx) {
  const admin = await requireAdmin(req);
  if (admin instanceof Response) return admin;
  const { id } = await ctx.params;
  if (!isValidObjectId(id)) return jsonError(404, "Service not found");
  const parsed = serviceSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError(422, "Please fix the highlighted fields", { fields: fieldErrors(parsed.error) });
  try {
    await connectDB();
    const old = await Service.findById(id).lean<{ image?: string }>();
    if (!old) return jsonError(404, "Service not found");
    if (await Service.exists({ slug: parsed.data.slug, _id: { $ne: id } }))
      return jsonError(409, "That slug is already in use", { fields: { slug: "Slug already in use" } });
    await Service.updateOne({ _id: id }, { $set: parsed.data }, { runValidators: true });
    await cleanupReplaced([old.image], [parsed.data.image]);
    revalidateContent("services");
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[admin:services]", (e as Error).message);
    return jsonError(500, "Could not save service");
  }
}

export async function DELETE(req: Request, ctx: Ctx) {
  const admin = await requireAdmin(req);
  if (admin instanceof Response) return admin;
  const { id } = await ctx.params;
  if (!isValidObjectId(id)) return jsonError(404, "Service not found");
  try {
    await connectDB();
    const old = await Service.findByIdAndDelete(id).lean<{ image?: string }>();
    if (!old) return jsonError(404, "Service not found");
    await deleteUploadIfUnreferenced(old.image);
    revalidateContent("services");
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[admin:services]", (e as Error).message);
    return jsonError(500, "Could not delete service");
  }
}
