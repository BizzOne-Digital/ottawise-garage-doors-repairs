import "server-only";
import { NextResponse } from "next/server";
import type { z } from "zod";
import { sameOrigin } from "./auth";
import { connectDB } from "./db";
import { clientIp, rateLimit } from "./rateLimit";
import { fieldErrors } from "./validation";

/**
 * Shared handler for public form submissions:
 * same-origin check, honeypot + minimum fill time, rate limit, server validation, DB write.
 * Success is only returned after the database write resolves.
 */
export async function handlePublicSubmit<S extends z.ZodTypeAny>(
  req: Request,
  kind: string,
  schema: S,
  save: (data: z.infer<S>) => Promise<unknown>
) {
  if (!(await sameOrigin())) return NextResponse.json({ success: false, error: "Request rejected" }, { status: 403 });

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body !== "object") return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });

  // Spam traps: a hidden "website" field humans never fill, and a form that was submitted too fast.
  const startedAt = Number(body._t);
  const tooFast = !Number.isFinite(startedAt) || Date.now() - startedAt < 2500;
  if ((typeof body.website === "string" && body.website.trim() !== "") || tooFast) {
    return NextResponse.json({ success: false, error: "Your submission could not be processed. Please call us instead." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Please check the highlighted fields.", fields: fieldErrors(parsed.error) }, { status: 422 });
  }

  try {
    await connectDB();
    const ip = await clientIp();
    if (!(await rateLimit(`${kind}:${ip}`, 5, 600))) {
      return NextResponse.json({ success: false, error: "Too many submissions. Please wait a few minutes or call us." }, { status: 429 });
    }
    await save(parsed.data);
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (e) {
    console.error(`[${kind}] save failed:`, (e as Error).message);
    return NextResponse.json({ success: false, error: "We couldn't send your request right now. Please try again or call us." }, { status: 500 });
  }
}
