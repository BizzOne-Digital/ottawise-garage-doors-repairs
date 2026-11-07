import Configurator from "@/components/door/Configurator";
import { PageHero } from "@/components/site/Blocks";
import RecentWork from "@/components/site/RecentWork";
import { getSettings } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 600;

export function generateMetadata() {
  return pageMetadata({
    title: "Design Your Garage Door | Ottawise Garage Doors",
    description: "Design your garage door online: choose the style, size, and colour, insert windows, preview it live, and request a free quote from Ottawise Garage Doors in Ottawa.",
    path: "/design-your-door",
  });
}

export default async function DesignYourDoorPage({ searchParams }: { searchParams: Promise<{ style?: string }> }) {
  const [settings, sp] = await Promise.all([getSettings(), searchParams]);
  return (
    <>
      <PageHero
        eyebrow="Door configurator"
        title="Design your garage door"
        description="Choose your door style, size, and colour, then insert windows exactly where you want them. See your door update live and send your design for a free quote."
      />
      <section aria-label="Garage door configurator" className="bg-warm py-10 md:py-14">
        <div className="container-site">
          <Configurator areas={settings.serviceAreas} initialStyle={typeof sp.style === "string" ? sp.style : undefined} />
        </div>
      </section>
      <RecentWork heading="Need ideas? See doors we've installed" />
    </>
  );
}
