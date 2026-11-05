# Ottawise Garage Doors — Website & Admin

Next.js 15 (App Router) · TypeScript · Tailwind CSS · MongoDB/Mongoose · secure admin sessions.

## 1. Setup

```bash
npm install
cp .env.example .env        # then fill in the values
npm run seed                # load starting content (safe to re-run)
ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='a-long-passphrase' npm run create-admin
npm run dev                 # http://localhost:3000, admin at /admin
```

Requirements: Node 20+ and a MongoDB 6+ database (MongoDB Atlas is recommended).

### Environment variables

| Variable | Purpose |
|---|---|
| `MONGODB_URI` | MongoDB connection string. Server-only. |
| `SESSION_SECRET` | 32+ random characters. Signs CSRF tokens. Generate: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `NEXT_PUBLIC_SITE_URL` | Public URL used for canonical links, the sitemap, and Open Graph. |
| `NEXT_PUBLIC_UPLOAD_DIRECT_LIMIT` | Largest single upload request the host accepts, in bytes (default 4,000,000). |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` | Used only by `npm run create-admin`. Remove them from the environment afterwards. |

## 2. MongoDB

1. Create an Atlas cluster and a database user with read/write access to one database (for example, `ottawise`).
2. Under Network Access, allow your host. For Vercel, allow `0.0.0.0/0` or use Atlas private networking.
3. Put the connection string in `MONGODB_URI`.

The connection is cached on `globalThis`, so warm serverless invocations reuse it. Indexes, including the TTL indexes for sessions, rate limits and upload chunks, are created automatically by Mongoose. The seed and create-admin scripts also sync them.

Collections: `adminusers`, `adminsessions`, `ratelimits`, `sitesettings`, `pagecontents`, `services`, `testimonials`, `contactenquiries`, `bookingrequests`, `storeduploads`, `uploadsessions`, `uploadchunks`.

## 3. Admin

- **Creating admins:** `npm run create-admin` creates an admin, or resets an existing admin's password and signs out all of that admin's sessions. The password must be at least 12 characters. There is no public registration page.
- **Sessions:** a random 256-bit token is set in an HttpOnly, `SameSite=Strict` cookie (also `Secure` in production). Only a SHA-256 hash of the token is stored in MongoDB, and sessions expire after 7 days.
- **CSRF:** every admin mutation needs an `x-csrf-token` header (an HMAC tied to the session) plus a same-origin check.
- **Authorization:** each admin API route checks the session against the database on its own. The middleware is only a fast redirect for pages.
- **Login throttling:** 5 failed attempts per account and 20 per IP in any 15 minutes. Limits are stored in MongoDB, so they hold across serverless instances.
- **Public forms:** server-side validation (zod), a honeypot field, a minimum time to fill the form, a same-origin check, and a limit of 5 submissions per IP every 10 minutes.

Admin sections: Dashboard (live counts), Contact enquiries, Booking requests, Services, Page content, Testimonials, Media library, Website settings.
Statuses for enquiries and booking requests: New, Contacted, Scheduled, Completed, Archived.

## 4. Content and seeding

- `npm run seed` only *inserts* records that are missing (`$setOnInsert`). It never overwrites admin edits, so it is safe to run on every deploy.
- Testimonials are deliberately not seeded. Publish only genuine customer feedback.
- Saving in the admin calls `revalidateTag` and `revalidatePath`, so the public site updates immediately. Pages also revalidate every 10 minutes as a fallback.
- If the database is unreachable, public pages fall back to the built-in default content. The testimonials page shows its empty state.

## 5. Image uploads (MongoDB storage)

Uploads never touch the filesystem, so they work on read-only serverless hosts and survive redeploys.

| Endpoint | Purpose |
|---|---|
| `POST /api/upload` | Admin only. FormData `file` + `folder` (`products`, `gallery`, `pages`, `misc`). Checks the MIME type, the real file signature (magic bytes), and the 8 MB limit. Returns `{ success, url, filename, size, folder }`. |
| `POST /api/upload/chunked` | Admin only. Fallback for files above the host's request limit (`init` → `chunk` × N → `complete`). Chunks are stored in MongoDB with a 30-minute TTL and tied to the admin who started the upload. Sequence, size, and the final signature are checked again before saving. |
| `GET /api/uploads/{folder}/{filename}` | Public, served from MongoDB with `Cache-Control: public, max-age=31536000, immutable` and `nosniff`. Path traversal and malformed names return 404. |
| `DELETE /api/admin/media` | Admin only. Refuses to delete images that are still in use. |

Filenames follow `${Date.now()}-${16 hex chars}.${ext}`. The random part uses `crypto.randomBytes`, and the extension comes from the detected format, not the uploaded filename. Content documents store only the URL string.

**Replacement order:** upload the new image, save the document, then delete the old image if nothing else references it. A failed save never deletes the existing image.
**Removal:** the field is saved as `""`, which means no image, then the old upload is deleted if unused. A removed logo falls back to the bundled logo.

**Upload transport and host limits:** Vercel Functions reject request bodies over **4.5 MB** with HTTP 413. Check your plan's current limit, because it can change. The admin image field sends files up to `NEXT_PUBLIC_UPLOAD_DIRECT_LIMIT` (4 MB) as one FormData request. Larger files, up to 8 MB, are sent automatically through the chunked endpoint in 2 MB pieces. A 413 from the host is shown as a clear error message.

**Legacy and fallback images:** `SafeImage` shows `/brand/placeholder.svg` for empty values, legacy `/uploads/...` paths, unknown hosts, and images that fail to load. It swaps to the placeholder only once, so it cannot loop.

**next/image:** `remotePatterns` allows `images.unsplash.com`, and `localPatterns` allows `/api/uploads/**`, `/brand/**`, and `/images/**`. Image optimization stays on.

> Note: when running `next start` locally, route-handler responses are streamed, so the explicit `Content-Length` header on images may be replaced by chunked transfer encoding. The image bytes are unaffected. This was verified with a 6 MB file.

## 6. Deployment (Vercel)

1. Import the repository and set the environment variables (Production and Preview).
2. Build command: `npm run build`. Optionally run `npm run seed` once against the production database.
3. Run `npm run create-admin` from your machine with the production `MONGODB_URI`.
4. After deploying, sign in, upload an image, sign out, and confirm the image still loads at its public URL.

## 7. Brand assets

`public/brand/logo.png` (the original Ottawise logo), `favicon.svg`, and `placeholder.svg`.
The logo can be changed in **Admin → Website settings → Logo**, or by replacing `public/brand/logo.png`. In the navy footer it sits on a white tile so the navy lettering stays readable.

The 14 illustrative website photos were created using the built-in image generation tool and are bundled as optimized WebP files in `public/images/`. They do not show actual Ottawise staff or completed projects. Prompts and asset paths are recorded in `scripts/generated-image-prompts.json`. Original seeded stock-photo URLs resolve to the matching bundled photo through `lib/imageDefaults.ts`; custom uploads and deliberately empty image fields remain editable. Replace illustrative photos with real project photos from the admin when available.

## 8. Scripts

| Command | Description |
|---|---|
| `npm run dev` / `build` / `start` | Next.js |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run seed` | Idempotent content seed |
| `npm run create-admin` | Admin bootstrap or password reset |

## 9. Door configurator (`/design-your-door`)

Customers choose a **door style** (Classic 300, Coach House 400, Heritage 500, Carriage 600, Modern Flush 800, Modern Grooved 800), a **colour** (8 options), a **window pattern** (9 patterns or none), an optional **decorative top-row design** (10 designs), and **glass** (clear, frosted, tinted). A live SVG preview updates with every choice. They then submit their details for a free quote.

- **Catalogue:** `lib/doorCatalog.ts` is the single source of truth for options, validation, admin display, and email content. Edit it to add or rename options.
- **Preview:** `components/door/DoorPreview.tsx` draws the door as SVG. Illustrations are indicative, and the page says so.
- **Saving:** `POST /api/door-quote` validates every option against the catalogue on the server, saves a `DoorQuote` record (with a readable snapshot of the choices), then sends the email. The request is saved even if the email fails.
- **Admin:** **Door quotes** shows each request with a door preview, the selections, the email delivery status, notes, statuses, search, and filters.
- **Email:** set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `NOTIFY_EMAIL`, and `MAIL_FROM` (see `.env.example`). For Gmail, use an App Password: turn on 2-Step Verification, then go to Google Account → Security → App passwords. If SMTP is not set, the admin shows "Email notification: not configured". User input is HTML-escaped in emails, and line breaks are stripped from headers.
