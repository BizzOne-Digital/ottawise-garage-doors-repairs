import { BadgeCheck } from "lucide-react";
import { CtaBand, PageHero, ServiceCard } from "@/components/site/Blocks";
import { getPage, getServices, getSettings, list, s } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 600;

export async function generateMetadata() {
  const p = await getPage("services");
  return pageMetadata({ title: p.seoTitle, description: p.seoDescription, path: "/services", image: s(p.data, "heroImage") });
}

export default async function ServicesPage() {
  const [page, services, settings] = await Promise.all([getPage("services"), getServices(), getSettings()]);
  const d = page.data;
  return (
    <>
      <PageHero eyebrow={s(d, "eyebrow")} title={s(d, "title")} description={s(d, "description")} image={s(d, "heroImage")} imageAlt={s(d, "heroImageAlt")} />

      <section aria-labelledby="promise-heading" className="border-y border-line bg-sand">
        <div className="container-site flex flex-col gap-5 py-7 lg:flex-row lg:items-center lg:gap-10">
          <h2 id="promise-heading" className="text-lg lg:shrink-0">{s(d, "promiseTitle")}</h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:flex lg:flex-wrap lg:gap-x-8">
            {list(d, "promiseItems").map((i) => (
              <li key={i} className="flex items-center gap-2.5 text-[0.95rem] font-semibold text-navy">
                <BadgeCheck className="h-5 w-5 text-gold" aria-hidden />{i}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-label="All services" className="bg-warm py-14 md:py-16">
        <div className="container-site">
          {services.length === 0 ? (
            <p className="card p-8 text-center">Service details are being updated. Please call us to discuss your garage door.</p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((svc) => <ServiceCard key={svc.slug} s={svc} headingLevel={2} />)}
            </div>
          )}
          <p className="mt-8 text-sm">Pricing depends on your door and the work involved. Contact us for pricing and a free quote.</p>
        </div>
      </section>

      <div className="bg-white"><CtaBand title={s(d, "ctaTitle")} body={s(d, "ctaBody")} buttonLabel={settings.headerCtaLabel} s={settings} /></div>
    </>
  );
}
