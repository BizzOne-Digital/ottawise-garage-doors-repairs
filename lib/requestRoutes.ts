import "server-only";
import { isValidObjectId, type Model } from "mongoose";
import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, requireAdmin } from "./auth";
import { connectDB } from "./db";
import { statusSchema } from "./validation";

const patchSchema = z.object({ status: statusSchema.optional(), adminNotes: z.string().trim().max(2000).optional() });
type Ctx = { params: Promise<{ id: string }> };

/* eslint-disable @typescript-eslint/no-explicit-any */
/** PATCH (status / notes) and DELETE handlers shared by enquiries and booking requests. */
export function requestHandlers(M: Model<any>, label: string) {
  return {
    async PATCH(req: Request, ctx: Ctx) {
      const admin = await requireAdmin(req);
      if (admin instanceof Response) return admin;
      const { id } = await ctx.params;
      if (!isValidObjectId(id)) return jsonError(404, `${label} not found`);
      const parsed = patchSchema.safeParse(await req.json().catch(() => null));
      if (!parsed.success) return jsonError(422, "Invalid status or notes");
      try {
        await connectDB();
        const r = await M.updateOne({ _id: id }, { $set: parsed.data }, { runValidators: true });
        if (!r.matchedCount) return jsonError(404, `${label} not found`);
        return NextResponse.json({ success: true });
      } catch (e) {
        console.error(`[admin:${label}]`, (e as Error).message);
        return jsonError(500, "Could not update");
      }
    },
    async DELETE(req: Request, ctx: Ctx) {
      const admin = await requireAdmin(req);
      if (admin instanceof Response) return admin;
      const { id } = await ctx.params;
      if (!isValidObjectId(id)) return jsonError(404, `${label} not found`);
      try {
        await connectDB();
        const r = await M.deleteOne({ _id: id });
        if (!r.deletedCount) return jsonError(404, `${label} not found`);
        return NextResponse.json({ success: true });
      } catch (e) {
        console.error(`[admin:${label}]`, (e as Error).message);
        return jsonError(500, "Could not delete");
      }
    },
  };
}
