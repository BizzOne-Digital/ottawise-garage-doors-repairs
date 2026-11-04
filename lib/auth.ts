import "server-only";
import crypto from "node:crypto";
import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { connectDB } from "./db";
import { AdminSession, AdminUser } from "./models";

export const SESSION_COOKIE = "ow_admin";
const SESSION_DAYS = 7;

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET must be set to at least 32 characters");
  return s;
}

const sha256 = (v: string) => crypto.createHash("sha256").update(v).digest("hex");

/** CSRF token bound to the session token (HMAC), sent by the admin UI in the x-csrf-token header. */
export function csrfFor(sessionToken: string) {
  return crypto.createHmac("sha256", secret()).update(`csrf:${sessionToken}`).digest("hex");
}

export type AdminIdentity = { userId: string; email: string; name: string; csrf: string };

export async function createSession(userId: string, userAgent: string) {
  await connectDB();
  const token = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400_000);
  await AdminSession.create({ tokenHash: sha256(token), userId, expiresAt, userAgent: userAgent.slice(0, 300) });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    expires: expiresAt,
  });
}

/** Validates the session cookie against the database. Never trust cookie presence alone. */
export async function getAdmin(): Promise<AdminIdentity | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token || token.length > 100) return null;
  await connectDB();
  const sess = await AdminSession.findOne({ tokenHash: sha256(token), expiresAt: { $gt: new Date() } }).lean<{ userId: string }>();
  if (!sess) return null;
  const user = await AdminUser.findById(sess.userId).lean<{ _id: unknown; email: string; name: string }>();
  if (!user) return null;
  return { userId: String(user._id), email: user.email, name: user.name, csrf: csrfFor(token) };
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await connectDB();
    await AdminSession.deleteOne({ tokenHash: sha256(token) });
  }
  jar.delete(SESSION_COOKIE);
}

/** Same-origin check for state-changing requests (defence in depth alongside SameSite + CSRF token). */
export async function sameOrigin() {
  const h = await headers();
  const origin = h.get("origin");
  const host = h.get("x-forwarded-host") || h.get("host");
  if (!origin) return h.get("sec-fetch-site") === "same-origin";
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export const jsonError = (status: number, error: string, extra: Record<string, unknown> = {}) =>
  NextResponse.json({ success: false, error, ...extra }, { status });

/**
 * Guard for every admin API mutation. Returns the admin or a ready-made error response.
 * Usage: const g = await requireAdmin(req); if (g instanceof Response) return g;
 */
export async function requireAdmin(req: Request, { mutation = true } = {}): Promise<AdminIdentity | Response> {
  let admin: AdminIdentity | null = null;
  try {
    admin = await getAdmin();
  } catch (e) {
    console.error("[auth] session lookup failed:", (e as Error).message);
    return jsonError(503, "Service temporarily unavailable");
  }
  if (!admin) return jsonError(401, "Authentication required");
  if (mutation && req.method !== "GET" && req.method !== "HEAD") {
    if (!(await sameOrigin())) return jsonError(403, "Cross-origin request rejected");
    const sent = req.headers.get("x-csrf-token") || "";
    const a = Buffer.from(sent);
    const b = Buffer.from(admin.csrf);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return jsonError(403, "Invalid CSRF token");
  }
  return admin;
}
