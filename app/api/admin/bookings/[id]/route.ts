import { BookingRequest } from "@/lib/models";
import { requestHandlers } from "@/lib/requestRoutes";

export const runtime = "nodejs";
export const { PATCH, DELETE } = requestHandlers(BookingRequest, "Booking request");
