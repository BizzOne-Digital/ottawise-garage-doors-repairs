// Note: no "server-only" import here so the CLI scripts (seed, create-admin) can reuse these models.
import { Schema, model, models, type Model } from "mongoose";
import { STATUSES, UPLOAD_FOLDERS } from "../constants";

/* eslint-disable @typescript-eslint/no-explicit-any */
function getModel(name: string, schema: Schema): Model<any> {
  return (models[name] as Model<any>) || model(name, schema);
}

/* ---------- Admin ---------- */
const AdminUserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 200 },
    name: { type: String, default: "Administrator", maxlength: 120 },
    passwordHash: { type: String, required: true },
    lastLoginAt: Date,
  },
  { timestamps: true }
);
export const AdminUser = getModel("AdminUser", AdminUserSchema);

const AdminSessionSchema = new Schema(
  {
    tokenHash: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "AdminUser", required: true, index: true },
    expiresAt: { type: Date, required: true },
    userAgent: { type: String, maxlength: 300 },
  },
  { timestamps: true }
);
AdminSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export const AdminSession = getModel("AdminSession", AdminSessionSchema);

const RateLimitSchema = new Schema({
  key: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
});
RateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export const RateLimit = getModel("RateLimit", RateLimitSchema);

/* ---------- Content ---------- */
const LinkSchema = new Schema(
  { label: { type: String, maxlength: 60 }, href: { type: String, maxlength: 300 } },
  { _id: false }
);

const SiteSettingsSchema = new Schema(
  {
    key: { type: String, default: "main", unique: true },
    businessName: String,
    contactPerson: String,
    logoUrl: String,
    faviconUrl: String,
    phoneDisplay: String,
    phoneLink: String,
    email: String,
    websiteUrl: String,
    instagramUrl: String,
    facebookUrl: String,
    whatsappUrl: String,
    hoursShort: String,
    hoursLong: String,
    utilityLeft: String,
    utilityRight: String,
    serviceAreas: [String],
    nav: [LinkSchema],
    footerLinks: [LinkSchema],
    footerTagline: String,
    headerCtaLabel: String,
  },
  { timestamps: true }
);
export const SiteSettings = getModel("SiteSettings", SiteSettingsSchema);

const PageContentSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    seoTitle: { type: String, maxlength: 120 },
    seoDescription: { type: String, maxlength: 320 },
    data: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, minimize: false }
);
export const PageContent = getModel("PageContent", PageContentSchema);

const ServiceSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, maxlength: 80 },
    title: { type: String, required: true, maxlength: 120 },
    cardTitle: { type: String, maxlength: 60 },
    summary: { type: String, maxlength: 300 },
    description: { type: String, maxlength: 3000 },
    reasons: [{ type: String, maxlength: 200 }],
    image: { type: String, default: "" },
    imageAlt: { type: String, maxlength: 200 },
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    seoTitle: { type: String, maxlength: 120 },
    seoDescription: { type: String, maxlength: 320 },
  },
  { timestamps: true }
);
ServiceSchema.index({ published: 1, order: 1 });
ServiceSchema.index({ image: 1 });
export const Service = getModel("Service", ServiceSchema);

const TestimonialSchema = new Schema(
  {
    name: { type: String, required: true, maxlength: 100 },
    area: { type: String, maxlength: 100 },
    service: { type: String, maxlength: 120 },
    quote: { type: String, required: true, maxlength: 1500 },
    published: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);
TestimonialSchema.index({ published: 1, order: 1 });
export const Testimonial = getModel("Testimonial", TestimonialSchema);

/* ---------- Requests ---------- */
const requestFields = {
  name: { type: String, required: true, maxlength: 100 },
  email: { type: String, required: true, maxlength: 200 },
  phone: { type: String, required: true, maxlength: 40 },
  area: { type: String, maxlength: 100 },
  message: { type: String, maxlength: 3000 },
  status: { type: String, enum: STATUSES, default: "New" },
  adminNotes: { type: String, maxlength: 2000, default: "" },
};

const ContactEnquirySchema = new Schema(
  { ...requestFields, service: { type: String, maxlength: 120 } },
  { timestamps: true }
);
ContactEnquirySchema.index({ status: 1, createdAt: -1 });
ContactEnquirySchema.index({ createdAt: -1 });
export const ContactEnquiry = getModel("ContactEnquiry", ContactEnquirySchema);

const BookingRequestSchema = new Schema(
  {
    ...requestFields,
    service: { type: String, required: true, maxlength: 120 },
    // Calendar date (YYYY-MM-DD) interpreted in the America/Toronto timezone.
    preferredDate: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    timeWindow: { type: String, required: true, maxlength: 60 },
    timezone: { type: String, default: "America/Toronto" },
  },
  { timestamps: true }
);
BookingRequestSchema.index({ status: 1, createdAt: -1 });
BookingRequestSchema.index({ createdAt: -1 });
BookingRequestSchema.index({ preferredDate: 1 });
export const BookingRequest = getModel("BookingRequest", BookingRequestSchema);

const DoorQuoteSchema = new Schema(
  {
    ...requestFields,
    service: { type: String, maxlength: 120 },
    doorSize: { type: String, maxlength: 80 },
    config: {
      style: { type: String, required: true, maxlength: 40 },
      colour: { type: String, required: true, maxlength: 40 },
      width: Number,
      height: Number,
      quantity: Number,
      windowType: { type: String, maxlength: 40 },
      windows: [{ type: String, maxlength: 5 }],
      glass: { type: String, required: true, maxlength: 40 },
      frame: { type: String, maxlength: 40 },
      // Legacy fields from the first configurator version.
      pattern: { type: String, maxlength: 40 },
      decor: { type: String, maxlength: 40 },
    },
    // Human-readable snapshot, so records stay meaningful if the catalogue changes later.
    summary: {
      style: String, colour: String, size: String, quantity: String, windows: String, glass: String, frame: String,
    },
    emailStatus: { type: String, enum: ["sent", "failed", "not-configured"], default: "not-configured" },
  },
  { timestamps: true }
);
DoorQuoteSchema.index({ status: 1, createdAt: -1 });
DoorQuoteSchema.index({ createdAt: -1 });
export const DoorQuote = getModel("DoorQuote", DoorQuoteSchema);

/* ---------- Uploads (binary documents kept separate from content) ---------- */
const StoredUploadSchema = new Schema(
  {
    folder: { type: String, enum: UPLOAD_FOLDERS, required: true },
    filename: { type: String, required: true, match: /^\d{13}-[a-f0-9]{16}\.(jpg|png|webp|gif)$/ },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    data: { type: Buffer, required: true },
  },
  { timestamps: true }
);
StoredUploadSchema.index({ folder: 1, filename: 1 }, { unique: true });
StoredUploadSchema.index({ createdAt: -1 });
export const StoredUpload = getModel("StoredUpload", StoredUploadSchema);

const UploadSessionSchema = new Schema(
  {
    uploadId: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, required: true },
    folder: { type: String, enum: UPLOAD_FOLDERS, required: true },
    totalSize: { type: Number, required: true },
    totalChunks: { type: Number, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);
UploadSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export const UploadSession = getModel("UploadSession", UploadSessionSchema);

const UploadChunkSchema = new Schema({
  uploadId: { type: String, required: true },
  index: { type: Number, required: true },
  data: { type: Buffer, required: true },
  expiresAt: { type: Date, required: true },
});
UploadChunkSchema.index({ uploadId: 1, index: 1 }, { unique: true });
UploadChunkSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export const UploadChunk = getModel("UploadChunk", UploadChunkSchema);
