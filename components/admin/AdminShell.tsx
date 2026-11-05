"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, DoorOpen, ExternalLink, FileText, Image as ImageIcon, Inbox, LayoutDashboard, LogOut, Menu, MessageSquareQuote, Settings, Wrench, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useAdmin } from "./AdminProvider";

const NAV = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/admin/enquiries", label: "Contact enquiries", Icon: Inbox },
  { href: "/admin/bookings", label: "Booking requests", Icon: CalendarCheck },
  { href: "/admin/quotes", label: "Door quotes", Icon: DoorOpen },
  { href: "/admin/services", label: "Services", Icon: Wrench },
  { href: "/admin/pages", label: "Page content", Icon: FileText },
  { href: "/admin/testimonials", label: "Testimonials", Icon: MessageSquareQuote },
  { href: "/admin/media", label: "Media library", Icon: ImageIcon },
  { href: "/admin/settings", label: "Website settings", Icon: Settings },
];

export default function AdminShell({ name, email, children }: { name: string; email: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const { api, toast } = useAdmin();
  const [open, setOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  const active = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  async function logout() {
    setLeaving(true);
    const r = await api("/api/admin/logout", { method: "POST" });
    if (r.ok) window.location.assign("/admin/login");
    else { toast("error", r.data.error || "Could not sign out"); setLeaving(false); }
  }

  const nav = (
    <nav aria-label="Admin" className="flex flex-1 flex-col gap-1 p-3">
      {NAV.map(({ href, label, Icon }) => (
        <Link key={href} href={href} aria-current={active(href) ? "page" : undefined}
          className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition-colors ${active(href) ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"}`}>
          <Icon className={`h-4 w-4 ${active(href) ? "text-gold-champagne" : ""}`} aria-hidden />{label}
        </Link>
      ))}
      <a href="/" target="_blank" rel="noreferrer" className="mt-4 flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-white/70 hover:text-white">
        <ExternalLink className="h-4 w-4" aria-hidden />View website
      </a>
    </nav>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[250px_1fr]">
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[250px] flex-col bg-navy-deep transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <span className="text-sm font-extrabold uppercase tracking-[0.16em] text-white">Ottawise <span className="text-gold-champagne">Admin</span></span>
          <button type="button" className="text-white lg:hidden" aria-label="Close menu" onClick={() => setOpen(false)}><X className="h-5 w-5" aria-hidden /></button>
        </div>
        {nav}
        <div className="border-t border-white/10 p-4 text-xs text-white/70">
          <p className="truncate font-semibold text-white">{name}</p>
          <p className="truncate">{email}</p>
          <button type="button" onClick={logout} disabled={leaving} className="mt-3 flex items-center gap-2 font-semibold text-white/80 hover:text-white disabled:opacity-60">
            <LogOut className="h-4 w-4" aria-hidden />{leaving ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </aside>
      {open && <div className="fixed inset-0 z-40 bg-navy/40 lg:hidden" onClick={() => setOpen(false)} aria-hidden />}
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-white px-4 lg:hidden">
          <button type="button" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)} className="flex h-10 w-10 items-center justify-center rounded-md border border-line"><Menu className="h-5 w-5" aria-hidden /></button>
          <span className="font-bold text-navy">Ottawise Admin</span>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
