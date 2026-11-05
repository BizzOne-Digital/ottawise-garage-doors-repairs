import Configurator from "@/components/door/Configurator";
import { PageHero } from "@/components/site/Blocks";
import { getSettings } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 600;

export function generateMetadata() {
  return pageMetadata({
    title: "Design Your Garage Door | Ottawise Garage Doors",
    description: "Choose a garage door style, colour, windows, and glass, preview your door, and request a free quote from Ottawise Garage Doors in Ottawa.",
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
        description="Pick a style, colour, and windows, see a preview, and send your selections for a free quote. Canadian-made insulated doors, installed by a local team."
      />
      <section aria-label="Garage door configurator" className="bg-warm py-10 md:py-14">
        <div className="container-site">
          <Configurator areas={settings.serviceAreas} initialStyle={typeof sp.style === "string" ? sp.style : undefined} />
        </div>
      </section>
    </>
  );
}
