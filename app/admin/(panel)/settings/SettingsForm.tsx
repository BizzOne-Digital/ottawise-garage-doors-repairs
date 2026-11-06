"use client";

import AdminImageField from "@/components/admin/AdminImageField";
import { AdminHeader, LinkListField, Panel, SaveBar, StringListField, TextField } from "@/components/admin/ui";
import { useSave } from "@/components/admin/useSave";
import type { SiteSettingsT } from "@/lib/defaults";

export default function SettingsForm({ initial }: { initial: SiteSettingsT }) {
  const f = useSave(initial);
  const v = f.value;
  const tf = (k: keyof SiteSettingsT, label: string, help?: string, multiline?: boolean) => (
    <TextField label={label} value={String(v[k] ?? "")} onChange={(x) => f.set(k, x as never)} error={f.errors[k]} help={help} multiline={multiline} />
  );

  return (
    <form onSubmit={(e) => { e.preventDefault(); f.save("/api/admin/settings", "PUT", f.value, "Settings saved. The website is updated."); }}>
      <AdminHeader title="Website settings" description="Brand, contact details, hours, navigation, and footer." />
      <div className="grid gap-6">
        <Panel title="Brand">
          <div className="grid gap-6 md:grid-cols-2">
            <AdminImageField label="Logo" value={v.logoUrl} onChange={(u) => f.set("logoUrl", u)} folder="misc" aspect="aspect-[3/1]" onBusyChange={f.setUploading}
              help="Use a PNG or WebP with a transparent background. Removing it restores the default bundled logo." />
            <AdminImageField label="Favicon" value={v.faviconUrl} onChange={(u) => f.set("faviconUrl", u)} folder="misc" aspect="aspect-square max-w-[160px]" onBusyChange={f.setUploading}
              help="Square PNG, at least 64x64. Leave empty to use the default icon." />
          </div>
          {tf("businessName", "Business name")}
        </Panel>
        <Panel title="Contact & hours">
          <div className="grid gap-5 md:grid-cols-2">
            {tf("contactPerson", "Contact person", "Internal reference; not shown publicly.")}
            {tf("email", "Email")}
            {tf("phoneDisplay", "Phone (display)")}
            {tf("phoneLink", "Phone link", "Format: tel:+13432092317")}
            {tf("websiteUrl", "Website URL")}
            {tf("instagramUrl", "Instagram link")}
            {tf("facebookUrl", "Facebook link")}
            {tf("whatsappUrl", "WhatsApp link")}
            {tf("hoursLong", "Business hours (full)")}
            {tf("utilityLeft", "Top bar left text")}
            {tf("utilityRight", "Top bar right text")}
            {tf("hoursShort", "Hours (short)")}
            {tf("headerCtaLabel", "Header button label")}
          </div>
          <StringListField label="Service areas" value={v.serviceAreas} onChange={(x) => f.set("serviceAreas", x)} addLabel="Add area"
            help="'& surrounding areas' is added automatically on the website." />
        </Panel>
        <Panel title="Navigation & footer">
          <LinkListField label="Main navigation" value={v.nav} onChange={(x) => f.set("nav", x)} />
          <LinkListField label="Footer links" value={v.footerLinks} onChange={(x) => f.set("footerLinks", x)} />
          {tf("footerTagline", "Footer tagline", undefined, true)}
        </Panel>
      </div>
      <SaveBar busy={f.busy} disabled={f.uploading} dirty={f.dirty} />
    </form>
  );
}
