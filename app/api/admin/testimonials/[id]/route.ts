import { isValidObjectId } from "mongoose";
import { NextResponse } from "next/server";
import { jsonError, requireAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Testimonial } from "@/lib/models";
import { revalidateContent } from "@/lib/revalidate";
import { fieldErrors, testimonialSchema } from "@/lib/validation";

export const runtime = "nodejs";
type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, ctx: Ctx) {
  const admin = await requireAdmin(req);
  if (admin instanceof Response) return admin;
  const { id } = await ctx.params;
  if (!isValidObjectId(id)) return jsonError(404, "Testimonial not found");
  const parsed = testimonialSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError(422, "Please fix the highlighted fields", { fields: fieldErrors(parsed.error) });
  try {
    await connectDB();
    const r = await Testimonial.updateOne({ _id: id }, { $set: parsed.data }, { runValidators: true });
    if (!r.matchedCount) return jsonError(404, "Testimonial not found");
    revalidateContent("testimonials");
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[admin:testimonials]", (e as Error).message);
    return jsonError(500, "Could not save testimonial");
  }
}

export async function DELETE(req: Request, ctx: Ctx) {
  const admin = await requireAdmin(req);
  if (admin instanceof Response) return admin;
  const { id } = await ctx.params;
  if (!isValidObjectId(id)) return jsonError(404, "Testimonial not found");
  try {
    await connectDB();
    const r = await Testimonial.deleteOne({ _id: id });
    if (!r.deletedCount) return jsonError(404, "Testimonial not found");
    revalidateContent("testimonials");
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[admin:testimonials]", (e as Error).message);
    return jsonError(500, "Could not delete testimonial");
  }
}
