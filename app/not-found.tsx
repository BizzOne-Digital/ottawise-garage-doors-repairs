import Footer from "@/components/site/Footer";
import Header from "@/components/site/Header";
import SiteNotFound from "./(site)/not-found";
import { getSettings } from "@/lib/content";

export default async function NotFound() {
  const s = await getSettings();
  return (
    <>
      <Header s={s} />
      <main id="main"><SiteNotFound /></main>
      <Footer s={s} />
    </>
  );
}
