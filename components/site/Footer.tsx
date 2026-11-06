import Link from "next/link";
import { Clock, Globe, Mail, Phone } from "lucide-react";
import SafeImage from "@/components/SafeImage";
import type { SiteSettingsT } from "@/lib/defaults";

const ICONS = {
  Instagram: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" /></>,
  Facebook: <path d="M14 8.5h2.5V5H14c-2.2 0-4 1.8-4 4v2H7.5v3.5H10V21h3.5v-6.5H16l.5-3.5h-3V9c0-.3.2-.5.5-.5Z" />,
  WhatsApp: <><path d="M3.5 20.5 4.8 16A8.5 8.5 0 1 1 8 19.2l-4.5 1.3Z" /><path d="M9 8.5c-.5 3 3.5 7 6.5 6.5l.8-1.6-2-1-.9.8c-1-.4-1.9-1.3-2.3-2.3l.8-.9-1-2L9 8.5Z" /></>,
};

export default function Footer({ s }: { s: SiteSettingsT }) {
  const socials = ([["Instagram", s.instagramUrl], ["Facebook", s.facebookUrl], ["WhatsApp", s.whatsappUrl]] as const).filter(([, url]) => url);
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
          {socials.length > 0 && (
            <ul className="mt-5 flex gap-3">
              {socials.map(([name, url]) => (
                <li key={name}>
                  <a href={url} target="_blank" rel="noopener noreferrer" aria-label={`${s.businessName} on ${name}`} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-gold-champagne hover:border-white hover:text-white">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden>{ICONS[name]}</svg>
                  </a>
                </li>
              ))}
            </ul>
          )}
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
