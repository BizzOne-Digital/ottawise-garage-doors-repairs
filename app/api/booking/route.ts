import { TIMEZONE } from "@/lib/constants";
import { BookingRequest } from "@/lib/models";
import { handlePublicSubmit } from "@/lib/publicSubmit";
import { bookingSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function POST(req: Request) {
  return handlePublicSubmit(req, "booking", bookingSchema, (d) =>
    BookingRequest.create({ ...d, timezone: TIMEZONE, status: "New" })
  );
}
