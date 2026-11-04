import type { PageKey } from "./defaults";

export type FieldType = "text" | "textarea" | "image" | "list";
export type Field = { name: string; label: string; type: FieldType; help?: string };
export type FieldGroup = { title: string; fields: Field[] };

const t = (name: string, label: string, help?: string): Field => ({ name, label, type: "text", help });
const ta = (name: string, label: string, help?: string): Field => ({ name, label, type: "textarea", help });
const img = (name: string, label: string): Field => ({ name, label, type: "image" });
const ls = (name: string, label: string, help?: string): Field => ({ name, label, type: "list", help });

/** Defines which page-content keys the admin can edit. Only these keys are accepted on save. */
export const PAGE_FIELDS: Record<PageKey, FieldGroup[]> = {
  home: [
    { title: "Hero", fields: [
      t("heroEyebrow", "Eyebrow"), t("heroTitle", "Headline"), t("heroHighlight", "Highlighted words (gold)"),
      ta("heroDescription", "Description"), t("heroPrimaryLabel", "Primary button label"), t("heroPrimaryHref", "Primary button link"),
      t("heroSecondaryLabel", "Secondary button label"), t("heroSecondaryHref", "Secondary button link"),
      ls("heroChecks", "Check items"), img("heroImage", "Hero image"), t("heroImageAlt", "Hero image alt text"), t("heroBadge", "Image badge text"),
    ] },
    { title: "Trust strip", fields: [ls("trustItems", "Labels (4 items, in order)", "Icons: pin, maple leaf, tag, calendar")] },
    { title: "Services preview", fields: [t("servicesEyebrow", "Eyebrow"), t("servicesTitle", "Heading"), ta("servicesDescription", "Description"), t("servicesAllLabel", "All services link label")] },
    { title: "Common problems", fields: [
      t("problemsEyebrow", "Eyebrow"), t("problemsTitle", "Heading"), ta("problemsDescription", "Description"),
      ls("problems", "Problems (6 recommended)", "Format: Title | Description | /services/link (link optional)"), t("problemsCtaLabel", "Button label"),
    ] },
    { title: "About preview", fields: [
      img("aboutImage", "Image"), t("aboutImageAlt", "Image alt text"), t("aboutCaption", "Image caption"),
      t("aboutEyebrow", "Eyebrow"), t("aboutTitle", "Heading"), ta("aboutBody", "Copy"), ls("aboutChecks", "Check items"), t("aboutButtonLabel", "Button label"),
    ] },
    { title: "New door upgrade", fields: [
      t("upgradeEyebrow", "Eyebrow"), t("upgradeTitle", "Heading"), ta("upgradeBody", "Copy"), ls("upgradeFeatures", "Feature list"),
      t("upgradeButtonLabel", "Button label"), img("upgradeImage", "Image"), t("upgradeImageAlt", "Image alt text"),
    ] },
    { title: "How it works", fields: [t("stepsEyebrow", "Eyebrow"), t("stepsTitle", "Heading"), ls("steps", "Steps", "Format: Title | Description")] },
    { title: "FAQ", fields: [t("faqEyebrow", "Eyebrow"), t("faqTitle", "Heading"), ls("faqs", "Questions", "Format: Question | Answer")] },
    { title: "Service areas & CTA", fields: [t("areasTitle", "Service areas heading"), t("ctaTitle", "Final CTA heading"), t("ctaButtonLabel", "Final CTA button")] },
  ],
  services: [
    { title: "Header", fields: [t("eyebrow", "Eyebrow"), t("title", "Heading"), ta("description", "Description"), img("heroImage", "Header image"), t("heroImageAlt", "Header image alt text")] },
    { title: "Promise & CTA", fields: [t("promiseTitle", "Promise heading"), ls("promiseItems", "Promise items"), t("ctaTitle", "CTA heading"), ta("ctaBody", "CTA text")] },
  ],
  about: [
    { title: "Intro", fields: [t("eyebrow", "Eyebrow"), t("title", "Heading"), ta("intro", "Intro paragraph"), ta("body", "Second paragraph"),
      img("image", "Main image"), t("imageAlt", "Main image alt text"), img("secondaryImage", "Secondary image"), t("secondaryImageAlt", "Secondary image alt text")] },
    { title: "Values", fields: [t("valuesEyebrow", "Eyebrow"), t("valuesTitle", "Heading"), ls("values", "Values", "Format: Title | Description")] },
    { title: "Services, areas & CTA", fields: [t("servicesTitle", "Services heading"), t("areasTitle", "Areas heading"), ta("areasBody", "Areas text"), t("ctaTitle", "CTA heading"), ta("ctaBody", "CTA text")] },
  ],
  testimonials: [
    { title: "Page", fields: [t("eyebrow", "Eyebrow"), t("title", "Heading"), ta("description", "Description"), t("emptyTitle", "Empty state heading"), ta("emptyBody", "Empty state text")] },
  ],
  contact: [
    { title: "Page", fields: [t("eyebrow", "Eyebrow"), t("title", "Heading"), ta("description", "Description"), t("formTitle", "Form heading"), ta("formIntro", "Form intro"), ta("successMessage", "Success message")] },
  ],
  booking: [
    { title: "Page", fields: [t("eyebrow", "Eyebrow"), t("title", "Heading"), ta("description", "Description"), ta("notice", "Booking notice"), ta("successMessage", "Success message"), t("sideTitle", "Side panel heading"), ls("steps", "Steps")] },
  ],
};

export const PAGE_LABELS: Record<PageKey, string> = {
  home: "Home", services: "Services", about: "About Us", testimonials: "Testimonials", contact: "Contact", booking: "Booking",
};

export const PAGE_PATHS: Record<PageKey, string> = {
  home: "/", services: "/services", about: "/about", testimonials: "/testimonials", contact: "/contact", booking: "/booking",
};
