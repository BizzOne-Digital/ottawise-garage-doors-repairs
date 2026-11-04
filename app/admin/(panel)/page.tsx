import Link from "next/link";
import { CalendarCheck, Image as ImageIcon, Inbox, MessageSquareQuote, Wrench } from "lucide-react";
import { connectDB } from "@/lib/db";
import { BookingRequest, ContactEnquiry, Service, StoredUpload, Testimonial } from "@/lib/models";

export const dynamic = "force-dynamic";

type Recent = { _id: unknown; name: string; service?: string; createdAt: Date; status: string };

export default async function Dashboard() {
  let data: {
    counts: { newEnq: number; enq: number; newBook: number; book: number; services: number; published: number; testimonials: number; publishedT: number; media: number };
    recentEnq: Recent[]; recentBook: Recent[];
  } | null = null;
  try {
    await connectDB();
    const [newEnq, enq, newBook, book, services, published, testimonials, publishedT, media, recentEnq, recentBook] = await Promise.all([
      ContactEnquiry.countDocuments({ status: "New" }), ContactEnquiry.countDocuments(),
      BookingRequest.countDocuments({ status: "New" }), BookingRequest.countDocuments(),
      Service.countDocuments(), Service.countDocuments({ published: true }),
      Testimonial.countDocuments(), Testimonial.countDocuments({ published: true }),
      StoredUpload.countDocuments(),
      ContactEnquiry.find({}, { name: 1, service: 1, createdAt: 1, status: 1 }).sort({ createdAt: -1 }).limit(5).lean<Recent[]>(),
      BookingRequest.find({}, { name: 1, service: 1, createdAt: 1, status: 1 }).sort({ createdAt: -1 }).limit(5).lean<Recent[]>(),
    ]);
    data = { counts: { newEnq, enq, newBook, book, services, published, testimonials, publishedT, media }, recentEnq, recentBook };
  } catch (e) {
    console.error("[admin:dashboard]", (e as Error).message);
  }

  if (!data) return <p role="alert" className="card p-6 text-red-800">Could not load dashboard data. Check the database connection.</p>;
  const c = data.counts;
  const tiles = [
    { href: "/admin/enquiries?status=New", label: "New enquiries", value: c.newEnq, sub: `${c.enq} total`, Icon: Inbox, alert: c.newEnq > 0 },
    { href: "/admin/bookings?status=New", label: "New booking requests", value: c.newBook, sub: `${c.book} total`, Icon: CalendarCheck, alert: c.newBook > 0 },
    { href: "/admin/services", label: "Published services", value: c.published, sub: `${c.services} total`, Icon: Wrench },
    { href: "/admin/testimonials", label: "Published testimonials", value: c.publishedT, sub: `${c.testimonials} total`, Icon: MessageSquareQuote },
    { href: "/admin/media", label: "Uploaded images", value: c.media, sub: "Stored in MongoDB", Icon: ImageIcon },
  ];
  const fmt = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto", dateStyle: "medium", timeStyle: "short" }).format(new Date(d));

  return (
    <>
      <h1 className="text-2xl sm:text-[1.75rem]">Dashboard</h1>
      <p className="mt-1 text-sm">Live counts from the database. Times shown in Ottawa time.</p>
      <ul className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {tiles.map(({ href, label, value, sub, Icon, alert }) => (
          <li key={label}>
            <Link href={href} className={`card block p-5 transition-colors hover:border-gold ${alert ? "border-gold" : ""}`}>
              <Icon className="h-5 w-5 text-gold" aria-hidden />
              <p className="mt-3 text-3xl font-extrabold text-navy">{value}</p>
              <p className="text-sm font-semibold text-navy">{label}</p>
              <p className="text-xs">{sub}</p>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {[{ title: "Latest enquiries", rows: data.recentEnq, href: "/admin/enquiries" }, { title: "Latest booking requests", rows: data.recentBook, href: "/admin/bookings" }].map((b) => (
          <section key={b.title} className="card p-5">
            <div className="flex items-center justify-between"><h2 className="text-lg">{b.title}</h2><Link href={b.href} className="text-sm font-semibold text-gold-dark">View all</Link></div>
            {b.rows.length === 0 ? <p className="mt-4 text-sm">Nothing yet.</p> : (
              <ul className="mt-3 divide-y divide-line">
                {b.rows.map((r) => (
                  <li key={String(r._id)} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <span className="min-w-0"><span className="block truncate font-semibold text-navy">{r.name}</span><span className="block truncate text-xs">{r.service || "General"} &middot; {fmt(r.createdAt)}</span></span>
                    <span className="shrink-0 rounded-full bg-sand px-2.5 py-0.5 text-xs font-semibold text-navy">{r.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </>
  );
}
