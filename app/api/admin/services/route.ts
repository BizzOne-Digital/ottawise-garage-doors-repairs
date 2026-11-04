import { NextResponse } from "next/server";
import { jsonError, requireAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Service } from "@/lib/models";
import { revalidateContent } from "@/lib/revalidate";
import { fieldErrors, serviceSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const admin = await requireAdmin(req);
  if (admin instanceof Response) return admin;
  const parsed = serviceSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError(422, "Please fix the highlighted fields", { fields: fieldErrors(parsed.error) });
  try {
    await connectDB();
    if (await Service.exists({ slug: parsed.data.slug })) return jsonError(409, "That slug is already in use", { fields: { slug: "Slug already in use" } });
    const doc = await Service.create(parsed.data);
    revalidateContent("services");
    return NextResponse.json({ success: true, id: String(doc._id) }, { status: 201 });
  } catch (e) {
    console.error("[admin:services]", (e as Error).message);
    return jsonError(500, "Could not create service");
  }
}
