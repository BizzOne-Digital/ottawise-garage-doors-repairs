import { ContactEnquiry } from "@/lib/models";
import { handlePublicSubmit } from "@/lib/publicSubmit";
import { contactSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function POST(req: Request) {
  return handlePublicSubmit(req, "contact", contactSchema, (d) => ContactEnquiry.create({ ...d, status: "New" }));
}
