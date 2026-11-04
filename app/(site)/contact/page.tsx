import ContactCards from "@/components/site/ContactCards";
import { PageHero } from "@/components/site/Blocks";
import RequestForm from "@/components/site/RequestForm";
import { getPage, getServices, getSettings, s } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 600;

export async function generateMetadata() {
  const p = await getPage("contact");
  return pageMetadata({ title: p.seoTitle, description: p.seoDescription, path: "/contact" });
}

export default async function ContactPage() {
  const [page, services, settings] = await Promise.all([getPage("contact"), getServices(), getSettings()]);
  const d = page.data;
  return (
    <>
      <PageHero eyebrow={s(d, "eyebrow")} title={s(d, "title")} description={s(d, "description")} />
      <section aria-labelledby="form-heading" className="bg-warm py-12 md:py-16">
        <div className="container-site grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:gap-10">
          <div>
            <h2 id="form-heading" className="text-2xl sm:text-[1.75rem]">{s(d, "formTitle")}</h2>
            <p className="mb-6 mt-2">{s(d, "formIntro")}</p>
            <RequestForm mode="contact" services={services.map((x) => x.title)} areas={settings.serviceAreas} successMessage={s(d, "successMessage")} />
          </div>
          <aside aria-label="Contact details"><ContactCards s={settings} /></aside>
        </div>
      </section>
    </>
  );
}
