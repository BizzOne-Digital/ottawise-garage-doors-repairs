"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import AdminImageField from "@/components/admin/AdminImageField";
import { AdminHeader, Panel, SaveBar, StringListField, TextField, Toggle } from "@/components/admin/ui";
import { useSave } from "@/components/admin/useSave";
import type { ServiceT } from "@/lib/defaults";

const slugify = (s: string) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

export default function ServiceForm({ initial }: { initial: ServiceT }) {
  const router = useRouter();
  const isNew = !initial.id;
  const { id, ...rest } = initial;
  const f = useSave<Omit<ServiceT, "id">>(rest);
  const v = f.value;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = await f.save(isNew ? "/api/admin/services" : `/api/admin/services/${id}`, isNew ? "POST" : "PUT", { ...v, order: Number(v.order) || 0 }, isNew ? "Service created" : "Service saved. The website is updated.");
    if (r && isNew && r.id) router.replace(`/admin/services/${r.id}`);
  }

  return (
    <form onSubmit={onSubmit}>
      <Link href="/admin/services" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-dark"><ArrowLeft className="h-4 w-4" aria-hidden />All services</Link>
      <AdminHeader title={isNew ? "New service" : v.title || "Edit service"}>
        {!isNew && v.published && <a href={`/services/${initial.slug}`} target="_blank" rel="noreferrer" className="btn-outline min-h-[40px] px-4 text-sm"><ExternalLink className="h-4 w-4" aria-hidden />View page</a>}
      </AdminHeader>
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="grid gap-6">
          <Panel title="Details">
            <TextField label="Title" required value={v.title} error={f.errors.title}
              onChange={(x) => f.setValue((p) => ({ ...p, title: x, slug: isNew && (!p.slug || p.slug === slugify(p.title)) ? slugify(x) : p.slug }))} />
            <TextField label="Slug" required value={v.slug} onChange={(x) => f.set("slug", x)} error={f.errors.slug} help={`URL: /services/${v.slug || "your-slug"}`} />
            <TextField label="Card title (short)" value={v.cardTitle} onChange={(x) => f.set("cardTitle", x)} help="Shown on service cards. Leave blank to use the title." />
            <TextField label="Summary" value={v.summary} onChange={(x) => f.set("summary", x)} multiline help="One or two sentences for cards." error={f.errors.summary} />
            <TextField label="Full description" value={v.description} onChange={(x) => f.set("description", x)} multiline error={f.errors.description} />
            <StringListField label="Common reasons to request this service" value={v.reasons} onChange={(x) => f.set("reasons", x)} addLabel="Add reason" />
          </Panel>
          <Panel title="SEO">
            <TextField label="SEO title" value={v.seoTitle} onChange={(x) => f.set("seoTitle", x)} maxLength={120} help={`${v.seoTitle.length}/120`} />
            <TextField label="SEO description" value={v.seoDescription} onChange={(x) => f.set("seoDescription", x)} multiline maxLength={320} help={`${v.seoDescription.length}/320`} />
          </Panel>
        </div>
        <div className="grid content-start gap-6">
          <Panel title="Image">
            <AdminImageField label="Service image" value={v.image} onChange={(u) => f.set("image", u)} folder="products" onBusyChange={f.setUploading} />
            <TextField label="Image alt text" value={v.imageAlt} onChange={(x) => f.set("imageAlt", x)} help="Describe the photo for screen readers." />
          </Panel>
          <Panel title="Publishing">
            <Toggle label="Published" checked={v.published} onChange={(x) => f.set("published", x)} help="Visible on the website." />
            <Toggle label="Featured on homepage" checked={v.featured} onChange={(x) => f.set("featured", x)} help="The first three featured services are shown." />
            <TextField label="Display order" type="number" value={String(v.order)} onChange={(x) => f.set("order", Number(x) as never)} help="Lower numbers appear first." />
          </Panel>
        </div>
      </div>
      <SaveBar busy={f.busy} disabled={f.uploading} dirty={f.dirty} label={isNew ? "Create service" : "Save changes"} />
    </form>
  );
}
