import Link from "next/link";
import { ArrowRight, CalendarDays, Check, ChevronDown, MapPin, OctagonX, Phone, RadioTower, Scale, ShieldAlert, Tag, Volume2, Wind } from "lucide-react";
import SafeImage from "@/components/SafeImage";
import { AreasBand, CheckList, CtaBand, Eyebrow, ServiceCard } from "@/components/site/Blocks";
import MapleLeaf from "@/components/site/MapleLeaf";
import { getPage, getServices, getSettings, list, s } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 600;

export async function generateMetadata() {
  const p = await getPage("home");
  return pageMetadata({ title: p.seoTitle, description: p.seoDescription, path: "/", image: s(p.data, "heroImage") });
}

const TRUST_ICONS = [MapPin, MapleLeaf, Tag, CalendarDays] as const;
const PROBLEM_ICONS = [Volume2, OctagonX, Scale, RadioTower, ShieldAlert, Wind] as const;

/** Parses admin list items written as "Title | Body | extra". */
function splitList(items: string[]) {
  return items.map((item) => {
    const [title = "", body = "", extra = ""] = item.split("|").map((x) => x.trim());
    return { title, body, extra };
  }).filter((x) => x.title);
}

export default async function HomePage() {
  const [page, settings, services] = await Promise.all([getPage("home"), getSettings(), getServices()]);
  const d = page.data;
  const featured = (services.filter((x) => x.featured).length ? services.filter((x) => x.featured) : services).slice(0, 3);
  const others = services.filter((x) => !featured.some((f) => f.slug === x.slug));
  const problems = splitList(list(d, "problems")).map((p) => ({ ...p, href: p.extra.startsWith("/") ? p.extra : "" }));
  const steps = splitList(list(d, "steps"));
  const faqs = splitList(list(d, "faqs")).filter((f) => f.body);
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.title, acceptedAnswer: { "@type": "Answer", text: f.body } })),
  };

  return (
    <>
      {/* Hero */}
      <section className="bg-warm">
        <div className="container-site grid items-center gap-10 pb-10 pt-10 md:pt-14 lg:grid-cols-[0.95fr_1.15fr] lg:gap-8 lg:pb-4">
          <div className="max-w-xl">
            <Eyebrow>{s(d, "heroEyebrow")}</Eyebrow>
            <h1 className="mt-5 text-[2.35rem] leading-[1.04] sm:text-[3.1rem] lg:text-[3.35rem] xl:text-[3.6rem]" style={{ letterSpacing: "-0.035em" }}>
              {s(d, "heroTitle")} <span className="text-gold">{s(d, "heroHighlight")}</span>
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed sm:text-[1.2rem]">{s(d, "heroDescription")}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Link href={s(d, "heroPrimaryHref") || "/booking"} className="btn-gold px-7 text-base">{s(d, "heroPrimaryLabel")}</Link>
              <Link href={s(d, "heroSecondaryHref") || "/services"} className="btn-outline px-7 text-base">{s(d, "heroSecondaryLabel")}</Link>
            </div>
            <CheckList items={list(d, "heroChecks")} className="mt-7 flex flex-wrap gap-x-9 gap-y-2.5 space-y-0" />
          </div>

          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-sand sm:aspect-[16/11] lg:aspect-[1.4/1]">
              <SafeImage
                src={s(d, "heroImage")}
                alt={s(d, "heroImageAlt")}
                fill
                priority
                sizes="(min-width: 1280px) 640px, (min-width: 1024px) 55vw, 100vw"
                className="object-cover object-center"
              />
            </div>
            {s(d, "heroBadge") && (
              <div className="absolute bottom-4 right-4 flex items-center gap-4 rounded-lg bg-white px-5 py-3.5 shadow-card sm:bottom-6 sm:right-6">
                <MapleLeaf className="h-8 w-8 text-gold" filled strokeWidth={1} />
                <span className="h-9 w-px bg-line" aria-hidden />
                <span className="max-w-[9rem] text-[0.95rem] font-bold leading-snug text-navy">{s(d, "heroBadge")}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section aria-label="Why homeowners choose us" className="border-y border-line bg-white">
        <ul className="container-site grid grid-cols-2 gap-y-6 py-7 md:grid-cols-4 md:py-8">
          {list(d, "trustItems").slice(0, 4).map((label, i) => {
            const Icon = TRUST_ICONS[i] ?? MapPin;
            return (
              <li key={label} className={`flex items-center justify-center gap-4 px-2 md:px-4 ${i > 0 ? "md:border-l md:border-line" : ""}`}>
                <Icon className="h-8 w-8 shrink-0 text-navy" strokeWidth={1.5} />
                <span className="max-w-[8.5rem] text-[0.98rem] font-semibold leading-snug text-navy">{label}</span>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Services preview */}
      <section aria-labelledby="services-heading" className="bg-warm py-14 md:py-16">
        <div className="container-site">
          <Eyebrow>{s(d, "servicesEyebrow")}</Eyebrow>
          <h2 id="services-heading" className="mt-3 text-[2rem] leading-tight sm:text-[2.4rem]">{s(d, "servicesTitle")}</h2>
          <p className="mt-3 max-w-3xl text-[1.02rem]">{s(d, "servicesDescription")}</p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((svc) => <ServiceCard key={svc.slug} s={svc} />)}
          </div>
          {others.length > 0 && (
            <div className="mt-8 flex flex-col gap-4 rounded-xl border border-line bg-white p-5 md:flex-row md:items-center md:justify-between">
              <ul className="flex flex-wrap gap-2">
                {others.map((svc) => (
                  <li key={svc.slug}>
                    <Link href={`/services/${svc.slug}`} className="inline-flex rounded-full border border-line px-3.5 py-1.5 text-sm font-semibold text-navy transition-colors hover:border-gold hover:text-gold-dark">
                      {svc.cardTitle || svc.title}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href="/services" className="inline-flex shrink-0 items-center gap-2 font-semibold text-gold-dark hover:text-navy">
                {s(d, "servicesAllLabel")} <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Common problems */}
      {problems.length > 0 && (
        <section aria-labelledby="problems-heading" className="bg-sand py-14 md:py-16">
          <div className="container-site">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <Eyebrow>{s(d, "problemsEyebrow")}</Eyebrow>
                <h2 id="problems-heading" className="mt-3 text-[2rem] leading-tight sm:text-[2.4rem]">{s(d, "problemsTitle")}</h2>
                <p className="mt-3 text-[1.02rem]">{s(d, "problemsDescription")}</p>
              </div>
              <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                <Link href="/booking" className="btn-navy px-6">{s(d, "problemsCtaLabel")}</Link>
                <a href={settings.phoneLink} className="btn-outline px-6"><Phone className="h-4 w-4" aria-hidden />{settings.phoneDisplay}</a>
              </div>
            </div>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {problems.map((p, i) => {
                const Icon = PROBLEM_ICONS[i % PROBLEM_ICONS.length];
                const inner = (
                  <>
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-sand text-gold"><Icon className="h-5 w-5" aria-hidden /></span>
                    <span className="min-w-0">
                      <span className="block font-bold text-navy">{p.title}</span>
                      {p.body && <span className="mt-1 block text-[0.93rem] leading-relaxed">{p.body}</span>}
                    </span>
                  </>
                );
                return (
                  <li key={p.title}>
                    {p.href ? (
                      <Link href={p.href} className="card flex h-full gap-4 p-5 transition-colors hover:border-gold">{inner}</Link>
                    ) : (
                      <div className="card flex h-full gap-4 p-5">{inner}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {/* About preview */}
      <section aria-labelledby="about-heading" className="bg-warm py-14 md:py-16">
        <div className="container-site grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
          <figure className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-sand lg:aspect-[1.72/1]">
            <SafeImage src={s(d, "aboutImage")} alt={s(d, "aboutImageAlt")} fill sizes="(min-width: 1024px) 560px, 100vw" className="object-cover" />
            {s(d, "aboutCaption") && (
              <figcaption className="absolute bottom-4 left-4 rounded-md bg-gold px-4 py-2 text-sm font-semibold text-white">{s(d, "aboutCaption")}</figcaption>
            )}
          </figure>
          <div>
            <Eyebrow>{s(d, "aboutEyebrow")}</Eyebrow>
            <h2 id="about-heading" className="mt-3 text-[2rem] leading-[1.1] sm:text-[2.35rem]">{s(d, "aboutTitle")}</h2>
            <p className="mt-4 leading-relaxed">{s(d, "aboutBody")}</p>
            <CheckList items={list(d, "aboutChecks")} className="mt-5" />
            <Link href="/about" className="btn-navy mt-7 px-7">{s(d, "aboutButtonLabel")}</Link>
          </div>
        </div>
      </section>

      {/* New door upgrade */}
      <section aria-labelledby="upgrade-heading" className="bg-navy-deep text-white/80">
        <div className="container-site grid items-center gap-10 py-14 md:py-16 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
          <div>
            <p className="eyebrow text-gold-champagne">{s(d, "upgradeEyebrow")}</p>
            <h2 id="upgrade-heading" className="mt-3 text-[2rem] leading-[1.1] text-white sm:text-[2.35rem]">{s(d, "upgradeTitle")}</h2>
            <p className="mt-4 leading-relaxed">{s(d, "upgradeBody")}</p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {list(d, "upgradeFeatures").map((f) => (
                <li key={f} className="flex items-start gap-3 text-[0.95rem] text-white">
                  <Check className="mt-0.5 h-[18px] w-[18px] shrink-0 text-gold-champagne" strokeWidth={2.5} aria-hidden />{f}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/design-your-door" className="btn-gold px-7">{s(d, "upgradeButtonLabel")}</Link>
              <Link href="/services/new-garage-door-installation" className="btn border-[1.5px] border-white/40 px-7 text-white hover:bg-white hover:text-navy">Learn more</Link>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-navy lg:aspect-[1.3/1]">
            <SafeImage src={s(d, "upgradeImage")} alt={s(d, "upgradeImageAlt")} fill sizes="(min-width: 1024px) 580px, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      {/* How it works */}
      {steps.length > 0 && (
        <section aria-labelledby="steps-heading" className="bg-white py-14 md:py-16">
          <div className="container-site">
            <Eyebrow>{s(d, "stepsEyebrow")}</Eyebrow>
            <h2 id="steps-heading" className="mt-3 text-[2rem] leading-tight sm:text-[2.4rem]">{s(d, "stepsTitle")}</h2>
            <ol className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((st, i) => (
                <li key={st.title} className="relative rounded-lg border border-line bg-warm p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-navy text-base font-extrabold text-white">{i + 1}</span>
                  <h3 className="mt-4 text-lg">{st.title}</h3>
                  {st.body && <p className="mt-2 text-[0.94rem] leading-relaxed">{st.body}</p>}
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* FAQ */}
      {faqs.length > 0 && (
        <section aria-labelledby="faq-heading" className="bg-warm py-14 md:py-16">
          <div className="container-site grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
            <div>
              <Eyebrow>{s(d, "faqEyebrow")}</Eyebrow>
              <h2 id="faq-heading" className="mt-3 text-[2rem] leading-tight sm:text-[2.4rem]">{s(d, "faqTitle")}</h2>
              <p className="mt-4">Have a different question? Call us at{" "}
                <a href={settings.phoneLink} className="font-bold text-navy underline decoration-gold underline-offset-4">{settings.phoneDisplay}</a>.
              </p>
            </div>
            <div className="card divide-y divide-line">
              {faqs.map((f) => (
                <details key={f.title} className="group p-5 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-navy">
                    {f.title}
                    <ChevronDown className="h-5 w-5 shrink-0 text-gold transition-transform group-open:rotate-180" aria-hidden />
                  </summary>
                  <p className="mt-3 leading-relaxed">{f.body}</p>
                </details>
              ))}
            </div>
          </div>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd).replace(/</g, "\\u003c") }} />
        </section>
      )}

      <div className="bg-warm pb-2"><AreasBand title={s(d, "areasTitle")} areas={settings.serviceAreas} /></div>
      <CtaBand title={s(d, "ctaTitle")} buttonLabel={s(d, "ctaButtonLabel")} s={settings} />
    </>
  );
}
