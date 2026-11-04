import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession, jsonError, sameOrigin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { AdminUser } from "@/lib/models";
import { clearRateLimit, clientIp, rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({ email: z.string().trim().toLowerCase().email().max(200), password: z.string().min(1).max(200) });
// Used to keep response timing similar when the email does not exist.
let dummyHash: string | null = null;
const getDummyHash = () => (dummyHash ??= bcrypt.hashSync("timing-equaliser", 12));

export async function POST(req: Request) {
  if (!(await sameOrigin())) return jsonError(403, "Cross-origin request rejected");
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError(400, "Enter your email and password");
  const { email, password } = parsed.data;

  try {
    await connectDB();
    const ip = await clientIp();
    const ipOk = await rateLimit(`login-ip:${ip}`, 20, 900);
    const acctOk = await rateLimit(`login-acct:${email}`, 5, 900);
    if (!ipOk || !acctOk) return jsonError(429, "Too many login attempts. Please wait 15 minutes and try again.");

    const user = await AdminUser.findOne({ email }).lean<{ _id: unknown; passwordHash: string }>();
    const ok = await bcrypt.compare(password, user?.passwordHash || getDummyHash());
    if (!user || !ok) return jsonError(401, "Incorrect email or password");

    await clearRateLimit(`login-acct:${email}`);
    await createSession(String(user._id), req.headers.get("user-agent") || "");
    await AdminUser.updateOne({ _id: user._id }, { $set: { lastLoginAt: new Date() } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[login] failed:", (e as Error).message);
    return jsonError(503, "Login is temporarily unavailable");
  }
}
