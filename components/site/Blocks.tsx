import Link from "next/link";
import { ArrowRight, Check, MapPin, Phone } from "lucide-react";
import SafeImage from "@/components/SafeImage";
import type { ServiceT, SiteSettingsT } from "@/lib/defaults";

export function Eyebrow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <p className={`eyebrow ${className}`}>{children}</p>;
}

export function CheckList({ items, className = "" }: { items: string[]; className?: string }) {
  return (
    <ul className={`space-y-2.5 ${className}`}>
      {items.map((i) => (
        <li key={i} className="flex items-start gap-3 text-[0.95rem] text-navy">
          <Check className="mt-0.5 h-[18px] w-[18px] shrink-0 text-gold" strokeWidth={2.5} aria-hidden />
          <span>{i}</span>
        </li>
      ))}
    </ul>
  );
}

/** Compact page header used on inner pages. */
export function PageHero({ eyebrow, title, description, image, imageAlt, children }: {
  eyebrow: string; title: string; description?: string; image?: string; imageAlt?: string; children?: React.ReactNode;
}) {
  return (
    <section className="bg-white">
      <div className={`container-site grid items-center gap-8 py-12 md:py-16 ${image ? "lg:grid-cols-[1.05fr_1fr] lg:gap-14" : ""}`}>
        <div className="max-w-2xl">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="mt-4 text-[2.1rem] leading-[1.08] sm:text-5xl">{title}</h1>
          {description && <p className="mt-5 text-lg leading-relaxed">{description}</p>}
          {children}
        </div>
        {image && (
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-sand">
            <SafeImage src={image} alt={imageAlt || ""} fill priority sizes="(min-width: 1024px) 560px, 100vw" className="object-cover" />
          </div>
        )}
      </div>
    </section>
  );
}

export function ServiceCard({ s, headingLevel = 3 }: { s: ServiceT; headingLevel?: 2 | 3 }) {
  const H = `h${headingLevel}` as "h2" | "h3";
  return (
    <article className="group card flex flex-col overflow-hidden transition-shadow duration-200 hover:shadow-card">
      <div className="relative aspect-[16/9.5] overflow-hidden bg-sand">
        <SafeImage
          src={s.image}
          alt={s.imageAlt || s.title}
          fill
          sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transform-none"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <H className="text-xl">{s.cardTitle || s.title}</H>
        <p className="mt-2 flex-1 text-[0.94rem] leading-relaxed">{s.summary}</p>
        <Link href={`/services/${s.slug}`} className="mt-4 inline-flex items-center gap-2 font-semibold text-gold-dark hover:text-navy">
          Learn more <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          <span className="sr-only">about {s.title}</span>
        </Link>
      </div>
    </article>
  );
}

export function AreasBand({ title, areas }: { title: string; areas: string[] }) {
  return (
    <section aria-labelledby="areas-heading" className="container-site">
      <div className="flex flex-col gap-5 rounded-2xl border border-line bg-sand px-6 py-6 md:flex-row md:items-center md:gap-8 md:px-8">
        <h2 id="areas-heading" className="text-xl sm:text-2xl md:shrink-0 md:border-r md:border-line md:pr-8">{title}</h2>
        <ul className="flex flex-wrap gap-2.5">
          {areas.map((a) => (
            <li key={a} className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-sm font-semibold text-navy">
              <MapPin className="h-3.5 w-3.5 text-gold" aria-hidden />{a}
            </li>
          ))}
          <li className="inline-flex items-center rounded-full bg-white px-3.5 py-1.5 text-sm font-semibold text-navy">&amp; surrounding areas</li>
        </ul>
      </div>
    </section>
  );
}

export function CtaBand({ title, body, buttonLabel = "Get a Free Quote", s }: { title: string; body?: string; buttonLabel?: string; s: SiteSettingsT }) {
  return (
    <section aria-label="Request a quote" className="container-site py-12 md:py-14">
      <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between md:gap-10">
        <div className="md:max-w-md md:border-r md:border-gold/60 md:pr-10">
          <h2 className="text-[1.75rem] leading-tight sm:text-[2rem]">{title}</h2>
          {body && <p className="mt-2">{body}</p>}
        </div>
        <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:items-center sm:gap-10">
          <Link href="/booking" className="btn-gold min-w-[200px] px-8 text-base">{buttonLabel}</Link>
          <a href={s.phoneLink} className="flex items-center gap-3 text-xl font-bold text-navy hover:text-gold-dark">
            <Phone className="h-6 w-6 text-gold" aria-hidden />{s.phoneDisplay}
          </a>
        </div>
      </div>
    </section>
  );
}
