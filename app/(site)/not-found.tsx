import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-site flex min-h-[50vh] flex-col items-start justify-center py-16">
      <p className="eyebrow">Page not found</p>
      <h1 className="mt-4 text-4xl">We couldn&rsquo;t find that page.</h1>
      <p className="mt-3 max-w-lg">The page may have moved. Head back home or browse our garage door services.</p>
      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <Link href="/" className="btn-navy px-7">Back to Home</Link>
        <Link href="/services" className="btn-outline px-7">View Services</Link>
      </div>
    </section>
  );
}
