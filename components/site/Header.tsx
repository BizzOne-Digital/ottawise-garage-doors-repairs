"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Phone, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import SafeImage from "@/components/SafeImage";
import type { SiteSettingsT } from "@/lib/defaults";

export default function Header({ s }: { s: SiteSettingsT }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-sand text-[0.8rem] font-medium text-navy">
        <div className="container-site flex h-9 items-center justify-between gap-4">
          <span className="truncate">{s.utilityLeft}</span>
          <span className="hidden truncate sm:block">{s.utilityRight}</span>
        </div>
      </div>
      <div className="border-b border-line bg-white">
        <div className="container-site flex h-[76px] items-center justify-between gap-6 lg:h-[88px]">
          <Link href="/" className="relative block h-[64px] w-[64px] shrink-0 lg:h-[78px] lg:w-[78px]" aria-label={`${s.businessName} home`}>
            <SafeImage src={s.logoUrl} alt={s.businessName} fill priority sizes="(min-width: 1024px) 78px, 64px" className="object-contain object-left" />
          </Link>

          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-8">
              {s.nav.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={isActive(l.href) ? "page" : undefined}
                    className={`relative py-2 text-[0.92rem] font-medium text-navy transition-colors hover:text-gold-dark after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:rounded after:bg-gold after:transition-transform after:duration-200 ${isActive(l.href) ? "after:scale-x-100" : "after:scale-x-0 hover:after:scale-x-100"}`}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="hidden items-center gap-6 lg:flex">
            <span className="h-9 w-px bg-line" aria-hidden />
            <a href={s.phoneLink} className="flex items-center gap-2 text-[0.98rem] font-semibold text-navy hover:text-gold-dark">
              <Phone className="h-[18px] w-[18px] text-gold" aria-hidden />
              {s.phoneDisplay}
            </a>
            <Link href="/booking" className="btn-navy min-h-[44px] px-5 text-[0.9rem]">{s.headerCtaLabel}</Link>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <a href={s.phoneLink} className="flex h-11 w-11 items-center justify-center rounded-md border border-line text-navy" aria-label={`Call ${s.phoneDisplay}`}>
              <Phone className="h-5 w-5 text-gold" aria-hidden />
            </a>
            <button
              ref={btnRef}
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-md border border-line text-navy"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
            </button>
          </div>
        </div>

        <div id="mobile-menu" hidden={!open} className="border-t border-line bg-white lg:hidden">
          <nav aria-label="Mobile" className="container-site py-4">
            <ul className="flex flex-col">
              {s.nav.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={isActive(l.href) ? "page" : undefined}
                    className={`flex min-h-[48px] items-center border-l-2 pl-3 text-base font-semibold ${isActive(l.href) ? "border-gold text-navy" : "border-transparent text-body hover:text-navy"}`}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <a href={s.phoneLink} className="btn-outline"><Phone className="h-4 w-4" aria-hidden />{s.phoneDisplay}</a>
              <Link href="/booking" className="btn-navy">{s.headerCtaLabel}</Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
