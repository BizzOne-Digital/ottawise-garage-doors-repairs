import { DoorQuote } from "@/lib/models";
import { requestHandlers } from "@/lib/requestRoutes";

export const runtime = "nodejs";
export const { PATCH, DELETE } = requestHandlers(DoorQuote, "Door quote");
