import Link from "next/link";
import { MessageSquareQuote, Quote } from "lucide-react";
import { CtaBand, PageHero } from "@/components/site/Blocks";
import { getPage, getSettings, getTestimonials, s } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 600;

export async function generateMetadata() {
  const p = await getPage("testimonials");
  return pageMetadata({ title: p.seoTitle, description: p.seoDescription, path: "/testimonials" });
}

export default async function TestimonialsPage() {
  const [page, items, settings] = await Promise.all([getPage("testimonials"), getTestimonials(), getSettings()]);
  const d = page.data;
  return (
    <>
      <PageHero eyebrow={s(d, "eyebrow")} title={s(d, "title")} description={s(d, "description")} />
      <section aria-label="Customer testimonials" className="bg-warm py-12 md:py-16">
        <div className="container-site">
          {items.length === 0 ? (
            <div className="card mx-auto flex max-w-2xl flex-col items-center px-6 py-12 text-center sm:px-12">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-sand text-gold"><MessageSquareQuote className="h-7 w-7" aria-hidden /></span>
              <h2 className="mt-5 text-2xl">{s(d, "emptyTitle")}</h2>
              <p className="mt-3 leading-relaxed">{s(d, "emptyBody")}</p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link href="/contact" className="btn-gold px-7">Contact Us</Link>
                <a href={settings.phoneLink} className="btn-outline px-7">{settings.phoneDisplay}</a>
              </div>
            </div>
          ) : (
            <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {items.map((t) => (
                <li key={t.id}>
                  <figure className="card flex h-full flex-col p-6">
                    <Quote className="h-7 w-7 text-gold" aria-hidden />
                    <blockquote className="mt-4 flex-1 leading-relaxed text-navy">{t.quote}</blockquote>
                    <figcaption className="mt-5 border-t border-line pt-4 text-sm">
                      <span className="font-bold text-navy">{t.name}</span>
                      {(t.area || t.service) && <span className="block">{[t.area, t.service].filter(Boolean).join(" • ")}</span>}
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
      <div className="bg-white"><CtaBand title={"Let’s get your garage door working beautifully."} s={settings} /></div>
    </>
  );
}
