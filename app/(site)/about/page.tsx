import Link from "next/link";
import { ArrowRight, Hammer, HandCoins, MessagesSquare, Ruler } from "lucide-react";
import SafeImage from "@/components/SafeImage";
import { AreasBand, CtaBand, Eyebrow } from "@/components/site/Blocks";
import { getPage, getServices, getSettings, list, s } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 600;

export async function generateMetadata() {
  const p = await getPage("about");
  return pageMetadata({ title: p.seoTitle, description: p.seoDescription, path: "/about", image: s(p.data, "image") });
}

const VALUE_ICONS = [Hammer, HandCoins, MessagesSquare, Ruler];

export default async function AboutPage() {
  const [page, services, settings] = await Promise.all([getPage("about"), getServices(), getSettings()]);
  const d = page.data;
  const values = list(d, "values").map((v) => {
    const [title, ...rest] = v.split("|");
    return { title: title.trim(), body: rest.join("|").trim() };
  });

  return (
    <>
      <section className="bg-white">
        <div className="container-site grid items-center gap-10 py-12 md:py-16 lg:grid-cols-2 lg:gap-14">
          <div>
            <Eyebrow>{s(d, "eyebrow")}</Eyebrow>
            <h1 className="mt-4 text-[2.1rem] leading-[1.08] sm:text-5xl">{s(d, "title")}</h1>
            <p className="mt-5 text-lg leading-relaxed text-navy">{s(d, "intro")}</p>
            <p className="mt-4 leading-relaxed">{s(d, "body")}</p>
            <Link href="/booking" className="btn-gold mt-7 px-7">Get Your Free Quote</Link>
          </div>
          <div className="grid grid-cols-[1.5fr_1fr] gap-4">
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-sand">
              <SafeImage src={s(d, "image")} alt={s(d, "imageAlt")} fill priority sizes="(min-width: 1024px) 340px, 60vw" className="object-cover" />
            </div>
            <div className="relative mt-12 aspect-[3/4] overflow-hidden rounded-2xl bg-sand">
              <SafeImage src={s(d, "secondaryImage")} alt={s(d, "secondaryImageAlt")} fill sizes="(min-width: 1024px) 220px, 40vw" className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="values-heading" className="bg-sand py-14 md:py-16">
        <div className="container-site">
          <Eyebrow>{s(d, "valuesEyebrow")}</Eyebrow>
          <h2 id="values-heading" className="mt-3 text-[2rem] sm:text-[2.35rem]">{s(d, "valuesTitle")}</h2>
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => {
              const Icon = VALUE_ICONS[i % VALUE_ICONS.length];
              return (
                <li key={v.title} className="card p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-md bg-sand text-gold"><Icon className="h-5 w-5" aria-hidden /></span>
                  <h3 className="mt-4 text-lg">{v.title}</h3>
                  {v.body && <p className="mt-2 text-[0.94rem] leading-relaxed">{v.body}</p>}
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section aria-labelledby="about-services-heading" className="bg-warm py-14 md:py-16">
        <div className="container-site">
          <h2 id="about-services-heading" className="text-[2rem] sm:text-[2.35rem]">{s(d, "servicesTitle")}</h2>
          <ul className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((svc) => (
              <li key={svc.slug}>
                <Link href={`/services/${svc.slug}`} className="group card flex min-h-[64px] items-center justify-between gap-4 px-5 py-4 font-semibold text-navy transition-colors hover:border-gold">
                  {svc.title}
                  <ArrowRight className="h-4 w-4 shrink-0 text-gold transition-transform group-hover:translate-x-0.5" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="bg-warm pb-4">
        <div className="container-site mb-5"><p className="max-w-2xl">{s(d, "areasBody")}</p></div>
        <AreasBand title={s(d, "areasTitle")} areas={settings.serviceAreas} />
      </div>
      <CtaBand title={s(d, "ctaTitle")} body={s(d, "ctaBody")} s={settings} />
    </>
  );
}
