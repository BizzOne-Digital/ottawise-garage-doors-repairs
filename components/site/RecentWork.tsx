import Link from "next/link";
import { Quote } from "lucide-react";
import SafeImage from "@/components/SafeImage";
import { Eyebrow } from "@/components/site/Blocks";
import type { TestimonialT } from "@/lib/content";

/** Real Ottawise installations supplied by the business (house numbers blurred for the homeowners' privacy). */
export const PROJECT_PHOTOS = [
  { src: "/images/project-modern-flush-black.webp", alt: "Black modern flush double garage door with a vertical stack of windows on the left", caption: "Modern flush, black, side windows" },
  { src: "/images/project-white-long-panel.webp", alt: "White long-panel garage door with grid windows in the top section", caption: "Long panel, white, Stockton windows" },
  { src: "/images/project-woodgrain-long-panel.webp", alt: "Dark woodgrain long-panel garage door with grid windows in the top section", caption: "Long panel, dark woodgrain" },
  { src: "/images/project-white-arched-windows.webp", alt: "White carriage-style garage door with arched and straight grid windows", caption: "Carriage style, arched windows" },
  { src: "/images/project-black-short-panel.webp", alt: "Black short-panel garage door with long grid windows in the second section", caption: "Short panel, black, mid-row windows" },
  { src: "/images/project-white-short-panel.webp", alt: "White short-panel garage door with grid windows in the top section", caption: "Short panel, white, top-row windows" },
];

export default function RecentWork({ testimonials = [], heading = "Recent garage doors we've installed" }: { testimonials?: TestimonialT[]; heading?: string }) {
  return (
    <section aria-labelledby="work-heading" className="bg-white py-14 md:py-16">
      <div className="container-site">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Eyebrow>Our work</Eyebrow>
            <h2 id="work-heading" className="mt-3 text-[2rem] leading-[1.1] sm:text-[2.35rem]">{heading}</h2>
            <p className="mt-3 max-w-2xl leading-relaxed">Real doors installed by Ottawise Garage Doors for homeowners in Ottawa and nearby areas.</p>
          </div>
          <Link href="/design-your-door" className="btn-gold shrink-0 px-6">Design Your Door</Link>
        </div>
        <ul className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
          {PROJECT_PHOTOS.map((p) => (
            <li key={p.src}>
              <figure className="group relative aspect-[4/5] overflow-hidden rounded-xl bg-sand sm:aspect-[4/3]">
                <SafeImage src={p.src} alt={p.alt} fill sizes="(min-width: 768px) 33vw, 50vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-deep/85 to-transparent px-3 pb-2.5 pt-8 text-xs font-semibold text-white sm:text-sm">{p.caption}</figcaption>
              </figure>
            </li>
          ))}
        </ul>

        {testimonials.length > 0 && (
          <div className="mt-12">
            <h3 className="text-xl">What our customers say</h3>
            <ul className="mt-5 grid gap-4 md:grid-cols-3">
              {testimonials.slice(0, 3).map((t) => (
                <li key={t.id} className="card flex flex-col p-6">
                  <Quote className="h-6 w-6 text-gold" aria-hidden />
                  <blockquote className="mt-3 flex-1 leading-relaxed">&ldquo;{t.quote}&rdquo;</blockquote>
                  <p className="mt-4 text-sm font-bold text-navy">{t.name}{t.service && <span className="block font-normal text-body">{t.service}</span>}</p>
                </li>
              ))}
            </ul>
            <Link href="/testimonials" className="mt-5 inline-block font-semibold text-gold-dark hover:text-navy">Read all reviews</Link>
          </div>
        )}
      </div>
    </section>
  );
}
