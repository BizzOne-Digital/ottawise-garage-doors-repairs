"use client";

import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import AdminImageField from "@/components/admin/AdminImageField";
import { AdminHeader, Panel, SaveBar, StringListField, TextField } from "@/components/admin/ui";
import { useSave } from "@/components/admin/useSave";
import type { PageT } from "@/lib/defaults";
import { PAGE_FIELDS, PAGE_LABELS, PAGE_PATHS } from "@/lib/pageFields";

export default function PageEditor({ initial }: { initial: PageT }) {
  const f = useSave(initial);
  const groups = PAGE_FIELDS[initial.key];
  const setData = (k: string, v: string | string[]) => f.setValue((p) => ({ ...p, data: { ...p.data, [k]: v } }));
  const str = (k: string) => (typeof f.value.data[k] === "string" ? (f.value.data[k] as string) : "");
  const arr = (k: string) => (Array.isArray(f.value.data[k]) ? (f.value.data[k] as string[]) : []);

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      f.save(`/api/admin/pages/${initial.key}`, "PUT", { seoTitle: f.value.seoTitle, seoDescription: f.value.seoDescription, data: f.value.data }, "Page saved. The website is updated.");
    }}>
      <Link href="/admin/pages" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-dark"><ArrowLeft className="h-4 w-4" aria-hidden />All pages</Link>
      <AdminHeader title={`${PAGE_LABELS[initial.key]} page`} description={PAGE_PATHS[initial.key]}>
        <a href={PAGE_PATHS[initial.key]} target="_blank" rel="noreferrer" className="btn-outline min-h-[40px] px-4 text-sm"><ExternalLink className="h-4 w-4" aria-hidden />View page</a>
      </AdminHeader>
      <div className="grid gap-6">
        {groups.map((g) => (
          <Panel key={g.title} title={g.title}>
            {g.fields.map((fd) => {
              if (fd.type === "image") return <AdminImageField key={fd.name} label={fd.label} value={str(fd.name)} onChange={(u) => setData(fd.name, u)} folder="pages" onBusyChange={f.setUploading} />;
              if (fd.type === "list") return <StringListField key={fd.name} label={fd.label} value={arr(fd.name)} onChange={(v) => setData(fd.name, v)} help={fd.help} />;
              return <TextField key={fd.name} label={fd.label} value={str(fd.name)} onChange={(v) => setData(fd.name, v)} multiline={fd.type === "textarea"} help={fd.help} />;
            })}
          </Panel>
        ))}
        <Panel title="SEO">
          <TextField label="SEO title" value={f.value.seoTitle} onChange={(v) => f.set("seoTitle", v)} maxLength={120} help={`${f.value.seoTitle.length}/120. Aim for 50-60 characters.`} error={f.errors.seoTitle} />
          <TextField label="SEO description" value={f.value.seoDescription} onChange={(v) => f.set("seoDescription", v)} multiline maxLength={320} help={`${f.value.seoDescription.length}/320. Aim for 140-160 characters.`} error={f.errors.seoDescription} />
        </Panel>
      </div>
      <SaveBar busy={f.busy} disabled={f.uploading} dirty={f.dirty} />
    </form>
  );
}
