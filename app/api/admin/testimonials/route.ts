import { NextResponse } from "next/server";
import { jsonError, requireAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Testimonial } from "@/lib/models";
import { revalidateContent } from "@/lib/revalidate";
import { fieldErrors, testimonialSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const admin = await requireAdmin(req);
  if (admin instanceof Response) return admin;
  const parsed = testimonialSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError(422, "Please fix the highlighted fields", { fields: fieldErrors(parsed.error) });
  try {
    await connectDB();
    const doc = await Testimonial.create(parsed.data);
    revalidateContent("testimonials");
    return NextResponse.json({ success: true, id: String(doc._id) }, { status: 201 });
  } catch (e) {
    console.error("[admin:testimonials]", (e as Error).message);
    return jsonError(500, "Could not create testimonial");
  }
}
