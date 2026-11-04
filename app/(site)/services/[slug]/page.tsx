import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Phone } from "lucide-react";
import SafeImage from "@/components/SafeImage";
import { CheckList, CtaBand, Eyebrow, ServiceCard } from "@/components/site/Blocks";
import { getServiceBySlug, getServices, getSettings } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { absUrl } from "@/lib/site";

export const revalidate = 600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const services = await getServices();
  return services.map((x) => ({ slug: x.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const svc = await getServiceBySlug(slug);
  if (!svc) return { title: "Service not found", robots: { index: false } };
  return pageMetadata({
    title: svc.seoTitle || `${svc.title} | Ottawise Garage Doors`,
    description: svc.seoDescription || svc.summary,
    path: `/services/${svc.slug}`,
    image: svc.image,
  });
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const [svc, all, settings] = await Promise.all([getServiceBySlug(slug), getServices(), getSettings()]);
  if (!svc) notFound();
  const related = all.filter((x) => x.slug !== svc.slug).slice(0, 3);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: svc.title,
    description: svc.description,
    url: absUrl(`/services/${svc.slug}`),
    areaServed: settings.serviceAreas,
    provider: { "@type": "HomeAndConstructionBusiness", name: settings.businessName, telephone: settings.phoneLink.replace("tel:", "") },
  };

  return (
    <>
      <section className="bg-white">
        <div className="container-site py-10 md:py-14">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li><Link href="/" className="hover:text-navy">Home</Link></li>
              <li aria-hidden><ChevronRight className="h-3.5 w-3.5" /></li>
              <li><Link href="/services" className="hover:text-navy">Services</Link></li>
              <li aria-hidden><ChevronRight className="h-3.5 w-3.5" /></li>
              <li aria-current="page" className="font-semibold text-navy">{svc.title}</li>
            </ol>
          </nav>
          <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
            <div>
              <Eyebrow>Service</Eyebrow>
              <h1 className="mt-4 text-[2.1rem] leading-[1.08] sm:text-[2.8rem]">{svc.title}</h1>
              <p className="mt-5 text-lg leading-relaxed">{svc.description}</p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link href={`/booking?service=${encodeURIComponent(svc.title)}`} className="btn-gold px-7">Request this service</Link>
                <a href={settings.phoneLink} className="btn-outline px-7"><Phone className="h-4 w-4" aria-hidden />{settings.phoneDisplay}</a>
              </div>
              <p className="mt-5 text-sm">Contact for pricing. Free quotes and no call-out fees. We explain the work and price before we begin.</p>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-sand">
              <SafeImage src={svc.image} alt={svc.imageAlt || svc.title} fill priority sizes="(min-width: 1024px) 560px, 100vw" className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {svc.reasons.length > 0 && (
        <section aria-labelledby="reasons-heading" className="bg-sand py-12 md:py-14">
          <div className="container-site grid gap-8 md:grid-cols-[1fr_1.4fr] md:items-start">
            <h2 id="reasons-heading" className="text-[1.75rem] leading-tight sm:text-[2rem]">Common reasons homeowners call us</h2>
            <div className="card p-6 sm:p-8"><CheckList items={svc.reasons} /></div>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="bg-warm py-12 md:py-14">
          <div className="container-site">
            <Eyebrow>More services</Eyebrow>
            <h2 id="related-heading" className="mt-3 text-[1.75rem] sm:text-[2rem]">Related services</h2>
            <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => <ServiceCard key={r.slug} s={r} />)}
            </div>
          </div>
        </section>
      )}

      <div className="bg-white"><CtaBand title="Ready to get your door sorted?" body="Send a booking request and we'll contact you to confirm availability." buttonLabel="Book This Service" s={settings} /></div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </>
  );
}
