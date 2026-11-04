export const UPLOAD_FOLDERS = ["products", "gallery", "pages", "misc"] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
/** Each chunk request stays well under serverless request-body limits. */
export const CHUNK_BYTES = 2 * 1024 * 1024;
export const STATUSES = ["New", "Contacted", "Scheduled", "Completed", "Archived"] as const;
export type RequestStatus = (typeof STATUSES)[number];
export const TIME_WINDOWS = [
  "Morning (7:00 AM - 11:00 AM)",
  "Midday (11:00 AM - 3:00 PM)",
  "Afternoon (3:00 PM - 7:00 PM)",
  "Evening (7:00 PM - 11:00 PM)",
  "Flexible",
] as const;
export const TIMEZONE = "America/Toronto";
export const PLACEHOLDER_IMAGE = "/brand/placeholder.svg";
/** Empty-value convention: a removed image is stored as an empty string "". */
export const EMPTY_IMAGE = "";
