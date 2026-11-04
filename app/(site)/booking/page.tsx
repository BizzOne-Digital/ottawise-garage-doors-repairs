import { Info } from "lucide-react";
import ContactCards from "@/components/site/ContactCards";
import { PageHero } from "@/components/site/Blocks";
import RequestForm from "@/components/site/RequestForm";
import { getPage, getServices, getSettings, list, s } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 600;

export async function generateMetadata() {
  const p = await getPage("booking");
  return pageMetadata({ title: p.seoTitle, description: p.seoDescription, path: "/booking" });
}

export default async function BookingPage({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const [page, services, settings, sp] = await Promise.all([getPage("booking"), getServices(), getSettings(), searchParams]);
  const d = page.data;
  return (
    <>
      <PageHero eyebrow={s(d, "eyebrow")} title={s(d, "title")} description={s(d, "description")}>
        <p className="mt-6 flex items-start gap-3 rounded-lg border border-gold/40 bg-sand px-4 py-3 text-[0.95rem] font-semibold text-navy">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden />{s(d, "notice")}
        </p>
      </PageHero>
      <section aria-label="Booking request form" className="bg-warm py-12 md:py-16">
        <div className="container-site grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:gap-10">
          <RequestForm
            mode="booking"
            services={services.map((x) => x.title)}
            areas={settings.serviceAreas}
            successMessage={s(d, "successMessage")}
            initialService={typeof sp.service === "string" ? sp.service.slice(0, 120) : undefined}
          />
          <aside aria-labelledby="next-heading" className="space-y-4">
            <div className="card p-6">
              <h2 id="next-heading" className="text-lg">{s(d, "sideTitle")}</h2>
              <ol className="mt-4 space-y-4">
                {list(d, "steps").map((step, i) => (
                  <li key={step} className="flex gap-3 text-[0.95rem]">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sand text-sm font-bold text-gold-dark">{i + 1}</span>
                    <span className="pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
            <ContactCards s={settings} />
          </aside>
        </div>
      </section>
    </>
  );
}
