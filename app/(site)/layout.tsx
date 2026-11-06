import Footer from "@/components/site/Footer";
import Header from "@/components/site/Header";
import { getSettings } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

export const revalidate = 600;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  // LocalBusiness data built only from provided facts: no address, ratings, or credentials.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    name: s.businessName,
    url: SITE_URL,
    telephone: s.phoneLink.replace("tel:", ""),
    email: s.email,
    sameAs: [s.instagramUrl, s.facebookUrl].filter(Boolean),
    logo: `${SITE_URL}${s.logoUrl.startsWith("/") ? s.logoUrl : "/brand/logo.png"}`,
    areaServed: s.serviceAreas.map((a) => ({ "@type": "City", name: a })),
    openingHoursSpecification: [{
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "07:00",
      closes: "23:00",
    }],
  };
  return (
    <>
      <a href="#main" className="sr-only z-50 rounded bg-navy px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Skip to content</a>
      <Header s={s} />
      <main id="main">{children}</main>
      <Footer s={s} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </>
  );
}
