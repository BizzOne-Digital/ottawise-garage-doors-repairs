import Link from "next/link";
import { Clock, Globe, Mail, Phone } from "lucide-react";
import SafeImage from "@/components/SafeImage";
import type { SiteSettingsT } from "@/lib/defaults";

export default function Footer({ s }: { s: SiteSettingsT }) {
  const site = s.websiteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return (
    <footer className="bg-navy-deep text-white/80">
      <div className="container-site grid gap-10 py-12 md:grid-cols-[1.3fr_1fr_1fr] md:py-14">
        <div>
          {/* The logo has navy lettering, so it sits on a white tile to stay readable on the navy footer. */}
          <Link href="/" aria-label={`${s.businessName} home`} className="relative block h-[104px] w-[104px] rounded-xl bg-white">
            <SafeImage src={s.logoUrl} alt={s.businessName} fill sizes="104px" className="object-contain p-2" />
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-relaxed">{s.footerTagline}</p>
        </div>
        <nav aria-label="Footer">
          <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-gold-champagne">Explore</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {s.footerLinks.map((l) => (
              <li key={l.href}><Link href={l.href} className="hover:text-white">{l.label}</Link></li>
            ))}
          </ul>
        </nav>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-gold-champagne">Contact</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li><a href={s.phoneLink} className="flex items-center gap-3 hover:text-white"><Phone className="h-4 w-4 text-gold-champagne" aria-hidden />{s.phoneDisplay}</a></li>
            <li><a href={`mailto:${s.email}`} className="flex items-center gap-3 break-all hover:text-white"><Mail className="h-4 w-4 shrink-0 text-gold-champagne" aria-hidden />{s.email}</a></li>
            <li><a href={s.websiteUrl} className="flex items-center gap-3 hover:text-white"><Globe className="h-4 w-4 text-gold-champagne" aria-hidden />{site}</a></li>
            <li className="flex items-center gap-3"><Clock className="h-4 w-4 text-gold-champagne" aria-hidden />{s.hoursLong}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-site flex flex-col gap-2 py-5 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} {s.businessName}. All rights reserved.</p>
          <p>Serving {s.serviceAreas.join(", ")} &amp; surrounding areas</p>
        </div>
      </div>
    </footer>
  );
}
