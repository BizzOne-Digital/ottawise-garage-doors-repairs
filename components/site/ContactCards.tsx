import { BadgeCheck, Clock, Mail, MapPin, Phone } from "lucide-react";
import type { SiteSettingsT } from "@/lib/defaults";

/** Contact details sidebar shared by Contact and Booking pages. */
export default function ContactCards({ s }: { s: SiteSettingsT }) {
  const rows = [
    { Icon: Phone, label: "Call us", value: <a href={s.phoneLink} className="text-lg font-bold text-navy hover:text-gold-dark">{s.phoneDisplay}</a> },
    { Icon: Mail, label: "Email", value: <a href={`mailto:${s.email}`} className="break-all font-semibold text-navy hover:text-gold-dark">{s.email}</a> },
    { Icon: Clock, label: "Business hours", value: <span className="font-semibold text-navy">{s.hoursLong}<br /><span className="font-normal text-body">Open 7 days a week</span></span> },
    { Icon: MapPin, label: "Service areas", value: <span className="font-semibold text-navy">{s.serviceAreas.join(", ")} &amp; surrounding areas</span> },
  ];
  return (
    <div className="space-y-4">
      <ul className="card divide-y divide-line">
        {rows.map(({ Icon, label, value }) => (
          <li key={label} className="flex gap-4 p-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-sand text-gold"><Icon className="h-5 w-5" aria-hidden /></span>
            <div><p className="text-xs font-bold uppercase tracking-[0.12em]">{label}</p><div className="mt-1">{value}</div></div>
          </li>
        ))}
      </ul>
      <div className="rounded-lg bg-navy p-5 text-white">
        <p className="flex items-center gap-2 font-bold"><BadgeCheck className="h-5 w-5 text-gold-champagne" aria-hidden />Get Your Free Quote</p>
        <p className="mt-1 text-sm text-white/80">No call-out fees. Pricing explained before work begins.</p>
      </div>
    </div>
  );
}
