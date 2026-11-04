import { NextResponse } from "next/server";
import { destroySession, requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const admin = await requireAdmin(req);
  if (admin instanceof Response) return admin;
  await destroySession();
  return NextResponse.json({ success: true });
}
