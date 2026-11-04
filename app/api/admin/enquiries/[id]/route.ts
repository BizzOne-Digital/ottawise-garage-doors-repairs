import { ContactEnquiry } from "@/lib/models";
import { requestHandlers } from "@/lib/requestRoutes";

export const runtime = "nodejs";
export const { PATCH, DELETE } = requestHandlers(ContactEnquiry, "Enquiry");
