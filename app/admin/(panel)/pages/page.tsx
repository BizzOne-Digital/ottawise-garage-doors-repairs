import Link from "next/link";
import { ChevronRight, FileText } from "lucide-react";
import { PAGE_KEYS } from "@/lib/defaults";
import { PAGE_LABELS, PAGE_PATHS } from "@/lib/pageFields";

export default function PagesIndex() {
  return (
    <>
      <h1 className="text-2xl sm:text-[1.75rem]">Page content</h1>
      <p className="mt-1 text-sm">Edit headings, text, images, and SEO for each public page.</p>
      <ul className="mt-7 grid gap-3 sm:grid-cols-2">
        {PAGE_KEYS.map((k) => (
          <li key={k}>
            <Link href={`/admin/pages/${k}`} className="card flex items-center gap-4 p-5 hover:border-gold">
              <FileText className="h-5 w-5 text-gold" aria-hidden />
              <span className="flex-1"><span className="block font-bold text-navy">{PAGE_LABELS[k]}</span><span className="text-xs">{PAGE_PATHS[k]}</span></span>
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-sm">Individual service pages are edited under <Link href="/admin/services" className="font-semibold text-gold-dark">Services</Link>.</p>
    </>
  );
}
