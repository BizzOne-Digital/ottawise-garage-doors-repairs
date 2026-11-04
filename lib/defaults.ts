/**
 * Initial content. Used by `npm run seed` (insert-only, never overwrites admin edits)
 * and as a safe fallback for any field missing from the database.
 */

export type NavLink = { label: string; href: string };

export type SiteSettingsT = {
  businessName: string;
  contactPerson: string;
  logoUrl: string;
  faviconUrl: string;
  phoneDisplay: string;
  phoneLink: string;
  email: string;
  websiteUrl: string;
  hoursShort: string;
  hoursLong: string;
  utilityLeft: string;
  utilityRight: string;
  serviceAreas: string[];
  nav: NavLink[];
  footerLinks: NavLink[];
  footerTagline: string;
  headerCtaLabel: string;
};

export type ServiceT = {
  id?: string;
  slug: string;
  title: string;
  cardTitle: string;
  summary: string;
  description: string;
  reasons: string[];
  image: string;
  imageAlt: string;
  featured: boolean;
  published: boolean;
  order: number;
  seoTitle: string;
  seoDescription: string;
};

export type PageData = Record<string, string | string[]>;
export type PageT = { key: PageKey; seoTitle: string; seoDescription: string; data: PageData };

export const IMAGES = {
  hero: "/images/home-hero.webp",
  newDoors: "/images/new-door-installation.webp",
  repairs: "/images/garage-door-repair.webp",
  springs: "/images/spring-replacement.webp",
  hardware: "/images/cables-rollers-hardware.webp",
  opener: "/images/opener-installation.webp",
  sensors: "/images/opener-troubleshooting.webp",
  seals: "/images/weather-seal.webp",
  tracks: "/images/track-alignment.webp",
  maintenance: "/images/maintenance.webp",
  workmanship: "/images/home-workmanship.webp",
  services: "/images/services-hero.webp",
  aboutHome: "/images/about-home.webp",
  aboutTools: "/images/about-tools.webp",
};

export const DEFAULT_SETTINGS: SiteSettingsT = {
  businessName: "Ottawise Garage Doors",
  contactPerson: "Mohammad Sakib",
  logoUrl: "/brand/logo.png",
  faviconUrl: "",
  phoneDisplay: "(343) 209-2317",
  phoneLink: "tel:+13432092317",
  email: "ottawisegaragedoors@gmail.com",
  websiteUrl: "https://ottawisegaragedoors.ca",
  hoursShort: "Open 7 days • 7:00 AM – 11:00 PM",
  hoursLong: "Monday – Sunday, 7:00 AM – 11:00 PM",
  utilityLeft: "Serving Ottawa & surrounding areas",
  utilityRight: "Open 7 days • 7:00 AM – 11:00 PM",
  serviceAreas: ["Ottawa", "Orleans", "Kanata", "Barrhaven"],
  nav: [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: "About Us", href: "/about" },
    { label: "Testimonials", href: "/testimonials" },
    { label: "Contact", href: "/contact" },
  ],
  footerLinks: [
    { label: "Services", href: "/services" },
    { label: "About Us", href: "/about" },
    { label: "Testimonials", href: "/testimonials" },
    { label: "Contact", href: "/contact" },
    { label: "Book a Service", href: "/booking" },
  ],
  footerTagline: "Garage door supply, installation, repairs, and opener service across Ottawa.",
  headerCtaLabel: "Get a Free Quote",
};

const svc = (
  order: number,
  slug: string,
  title: string,
  cardTitle: string,
  summary: string,
  description: string,
  reasons: string[],
  image: string,
  imageAlt: string,
  featured = false
): ServiceT => ({
  slug, title, cardTitle, summary, description, reasons, image, imageAlt, featured, order,
  published: true,
  seoTitle: `${title} in Ottawa | Ottawise Garage Doors`,
  seoDescription: summary,
});

export const DEFAULT_SERVICES: ServiceT[] = [
  svc(1, "new-garage-door-installation", "New Garage Door Supply & Installation", "New Garage Doors",
    "Upgrade your home with a durable, beautiful, Canadian-made garage door.",
    "Upgrade your home with a Canadian-made insulated garage door. Choose from a range of designs, colours, and window options. Installation includes new hardware, weather seals, and removal of your existing door.",
    ["Your current door is old, damaged, or drafty", "You want to improve your home's curb appeal", "You want a better-insulated door for Ottawa winters", "Repairs on your existing door no longer make sense"],
    IMAGES.newDoors, "Modern home with a dark residential garage door", true),
  svc(2, "garage-door-repairs", "Garage Door Repairs", "Garage Door Repairs",
    "Fast, reliable repairs to get your garage door working safely and smoothly again.",
    "We diagnose and repair doors that are noisy, uneven, stuck, or difficult to operate. We identify the problem and explain the recommended repair and pricing before starting.",
    ["The door is noisy, shaky, or grinding", "The door sits uneven or crooked", "The door is stuck or will not fully open or close", "The door feels heavy or hard to lift"],
    IMAGES.repairs, "Technician inspecting the hinge on a sectional garage door", true),
  svc(3, "spring-replacement", "Spring Replacement", "Spring Replacement",
    "Replacement of worn or broken springs to restore proper balance and smooth operation.",
    "Replacement of worn or broken garage door springs to restore proper door balance and smooth operation. Springs are selected to suit your door's size and weight.",
    ["You heard a loud bang from the garage", "The door will only open a few inches", "The opener strains or the door feels very heavy", "You can see a gap in a torsion spring"],
    IMAGES.springs, "Torsion spring assembly mounted above a closed garage door"),
  svc(4, "cable-roller-hardware-replacement", "Cable, Roller & Hardware Replacement", "Cables, Rollers & Hardware",
    "Repair or replacement of damaged cables, worn rollers, hinges, and brackets.",
    "Repair or replacement of damaged cables, worn rollers, hinges, and brackets to help your garage door move smoothly and reliably.",
    ["Frayed or loose lift cables", "Rollers that are cracked, wobbly, or noisy", "Bent hinges or loose brackets", "The door jerks or catches while moving"],
    IMAGES.hardware, "Garage door hinge, nylon roller, track, and lift cable"),
  svc(5, "garage-door-opener-installation", "Garage Door Opener Supply & Installation", "Opener Installation",
    "Professional opener installation for convenience, security, and peace of mind.",
    "Professional installation of garage door openers, including belt-drive and wall-mounted models. Available features include smart controls, battery backup, and built-in cameras, depending on the model.",
    ["Your current opener is loud or unreliable", "You want smartphone control of your garage", "You want battery backup during power outages", "You are installing a new garage door"],
    IMAGES.opener, "Ceiling-mounted belt-drive garage door opener and rail", true),
  svc(6, "garage-door-opener-troubleshooting", "Garage Door Opener Troubleshooting", "Opener Troubleshooting",
    "Diagnosis of remote, sensor, and opener problems, with a clear recommendation.",
    "Diagnosis of opener problems, including unresponsive remotes, safety sensor issues, and doors that won't open or close properly. We explain whether an adjustment, repair, or replacement is needed.",
    ["Remotes or the wall button stopped working", "The door reverses before it closes", "Safety sensor lights are blinking", "The motor runs but the door does not move"],
    IMAGES.sensors, "Garage door safety sensor with a green indicator beside the track"),
  svc(7, "weather-stripping-bottom-seal-replacement", "Weather Stripping & Bottom Seal Replacement", "Weather Stripping & Seals",
    "Replace worn seals to reduce drafts and keep out rain, snow, dirt, and pests.",
    "Replace worn perimeter weather stripping and bottom seals to help reduce drafts and keep out rain, snow, dirt, and pests.",
    ["You can see daylight around or under the door", "Water or snow gets into the garage", "The bottom seal is cracked, flattened, or missing", "The garage is noticeably drafty in winter"],
    IMAGES.seals, "Black rubber bottom seal fitted beneath a white garage door"),
  svc(8, "track-adjustment-alignment", "Track Adjustment & Alignment", "Track Alignment",
    "Adjustment of misaligned tracks to address rubbing and uneven movement.",
    "Adjustment of misaligned tracks and supports to address rubbing, uneven movement, and difficulty opening or closing the garage door.",
    ["Rollers rub or scrape against the track", "There are visible gaps between rollers and the track", "The door moves unevenly or binds", "Tracks or supports look bent or loose"],
    IMAGES.tracks, "Aligned garage door track with rollers and support brackets"),
  svc(9, "garage-door-maintenance-tune-ups", "Garage Door Maintenance & Tune-Ups", "Maintenance & Tune-Ups",
    "Routine inspection, lubrication, and balance checks to support smooth operation.",
    "Routine inspection, lubrication, hardware tightening, and door balance checks to support smooth operation and identify wear.",
    ["Getting the door ready before winter", "The door has become noisier over time", "You want to catch worn parts early", "It has been a while since the door was serviced"],
    IMAGES.maintenance, "Technician lubricating a sectional garage door hinge"),
];

export const PAGE_KEYS = ["home", "services", "about", "testimonials", "contact", "booking"] as const;
export type PageKey = (typeof PAGE_KEYS)[number];

export const DEFAULT_PAGES: Record<PageKey, PageT> = {
  home: {
    key: "home",
    seoTitle: "Ottawise Garage Doors | Garage Door Installation & Repair in Ottawa",
    seoDescription: "Canadian-made garage doors, dependable repairs, and professional opener installation in Ottawa, Orleans, Kanata, and Barrhaven. Free quotes. No call-out fees.",
    data: {
      heroEyebrow: "Local expertise. Dependable service.",
      heroTitle: "Your First Call for Garage Doors",
      heroHighlight: "in Ottawa",
      heroDescription: "Canadian-made garage doors, dependable repairs, and professional opener installation.",
      heroPrimaryLabel: "Get Your Free Quote",
      heroPrimaryHref: "/booking",
      heroSecondaryLabel: "Explore Our Services",
      heroSecondaryHref: "/services",
      heroChecks: ["Free quotes", "No call-out fees"],
      heroImage: IMAGES.hero,
      heroImageAlt: "Two-storey home with a modern dark garage door",
      heroBadge: "Canadian-made quality",
      trustItems: ["Locally Owned", "Canadian-Made Doors", "Clear, Honest Pricing", "Open 7 Days"],
      servicesEyebrow: "What we do",
      servicesTitle: "A better door. A smoother day.",
      servicesDescription: "From new installations to dependable repairs, we make garage doors simple for Ottawa homeowners.",
      aboutImage: IMAGES.workmanship,
      aboutImageAlt: "Garage door technician organizing tools and replacement rollers",
      aboutCaption: "Your local garage door team",
      aboutEyebrow: "Why Ottawise",
      aboutTitle: "Good neighbours. Great workmanship.",
      aboutBody: "Ottawise Garage Doors is a local business serving Ottawa, Orleans, Kanata, Barrhaven, and surrounding areas. We focus on quality workmanship, clear pricing, and friendly, dependable service.",
      aboutChecks: ["Quality installation & repairs", "Friendly, straightforward advice", "Solutions for your home & budget"],
      aboutButtonLabel: "More About Us",
      servicesAllLabel: "View all services",
      problemsEyebrow: "Common problems",
      problemsTitle: "Signs your garage door needs attention",
      problemsDescription: "Small issues are easier to fix before they turn into a stuck door. If you notice any of these, give us a call.",
      problems: [
        "Loud, grinding, or shaky movement | Worn rollers, dry hinges, or loose hardware are common causes. | /services/cable-roller-hardware-replacement",
        "Door only opens a few inches | Often a sign of a broken or worn spring. Avoid forcing the door. | /services/spring-replacement",
        "Door sits uneven or crooked | Cables, springs, or tracks may need adjustment or replacement. | /services/track-adjustment-alignment",
        "Remote or wall button stopped working | Remotes, safety sensors, and opener settings can all cause this. | /services/garage-door-opener-troubleshooting",
        "Door reverses before closing | Misaligned or blocked safety sensors are a frequent cause. | /services/garage-door-opener-troubleshooting",
        "Drafts, water, or snow getting in | Worn weather stripping or a damaged bottom seal lets the weather inside. | /services/weather-stripping-bottom-seal-replacement",
      ],
      problemsCtaLabel: "Book a Repair",
      upgradeEyebrow: "New garage doors",
      upgradeTitle: "Upgrade to a Canadian-made insulated door",
      upgradeBody: "A new garage door can refresh the look of your home and help keep the cold out. Choose from a range of designs, colours, and window options, and we’ll handle the full installation.",
      upgradeFeatures: [
        "Canadian-made insulated garage doors",
        "Range of designs, colours, and window options",
        "New hardware and weather seals included",
        "Removal of your existing door",
      ],
      upgradeButtonLabel: "Get a Free Door Quote",
      upgradeImage: IMAGES.services,
      upgradeImageAlt: "Modern insulated garage door on a residential home",
      stepsEyebrow: "How it works",
      stepsTitle: "Simple from first call to finished job",
      steps: [
        "Call or request a quote | Tell us what your door is doing or what you’d like to install. Quotes are free.",
        "We assess the door | We look at the problem and recommend the right repair or replacement.",
        "Clear pricing first | We explain the work and the price before anything begins.",
        "Work done properly | We complete the job and make sure your door runs smoothly.",
      ],
      faqEyebrow: "FAQ",
      faqTitle: "Questions homeowners ask",
      faqs: [
        "Are quotes really free? | Yes. Quotes are free, and there are no call-out fees.",
        "Will I know the price before you start? | Yes. We explain the recommended work and the pricing before any work begins.",
        "Which areas do you serve? | We serve Ottawa, Orleans, Kanata, Barrhaven, and surrounding areas.",
        "What are your hours? | We’re open 7 days a week, from 7:00 AM to 11:00 PM.",
        "Do you supply the garage doors? | Yes. We supply and install Canadian-made insulated garage doors in a range of designs, colours, and window options.",
        "Can you install a smart garage door opener? | Yes. We install belt-drive and wall-mounted openers. Smart controls, battery backup, and built-in cameras are available depending on the model.",
        "Does a booking request confirm my appointment? | Not yet. A booking request tells us your preferred date and time. We’ll contact you to confirm availability.",
      ],
      areasTitle: "Proudly serving your neighbourhood",
      ctaTitle: "Let’s get your garage door working beautifully.",
      ctaButtonLabel: "Get a Free Quote",
    },
  },
  services: {
    key: "services",
    seoTitle: "Garage Door Services in Ottawa | Ottawise Garage Doors",
    seoDescription: "Garage door installation, repairs, spring replacement, opener installation, and maintenance across Ottawa, Orleans, Kanata, and Barrhaven.",
    data: {
      eyebrow: "Our services",
      title: "Garage door services for Ottawa homes",
      description: "Installation, repairs, openers, and maintenance. Every job starts with a clear explanation of the work and the price before we begin.",
      heroImage: IMAGES.services,
      heroImageAlt: "Ivory insulated garage door on a modern stone and wood home",
      promiseTitle: "Straightforward from the first call",
      promiseItems: ["Free quotes", "No call-out fees", "Pricing explained before work begins", "Open 7 days, 7:00 AM – 11:00 PM"],
      ctaTitle: "Not sure which service you need?",
      ctaBody: "Tell us what your door is doing and we’ll help you figure out the right next step.",
    },
  },
  about: {
    key: "about",
    seoTitle: "About Ottawise Garage Doors | Local Ottawa Garage Door Company",
    seoDescription: "A local Ottawa garage door business focused on quality workmanship, clear pricing, and friendly, dependable service.",
    data: {
      eyebrow: "About us",
      title: "A local garage door company you can count on",
      intro: "Ottawise Garage Doors is a local business serving Ottawa, Orleans, Kanata, Barrhaven, and surrounding areas. We specialize in garage door supply and installation, repairs, and garage door opener installation.",
      body: "From replacing broken springs and cables to upgrading your home with a Canadian-made insulated garage door, we focus on quality workmanship, clear pricing, and friendly, dependable service. Whether you need a repair or a complete replacement, we’ll help you find the right solution for your home and budget.",
      image: IMAGES.aboutHome,
      imageAlt: "Ottawa-style brick home with a grey single garage door",
      secondaryImage: IMAGES.aboutTools,
      secondaryImageAlt: "Garage door rollers, hinges, cable, and drill on a workbench",
      valuesEyebrow: "What we stand for",
      valuesTitle: "How we work",
      values: [
        "Quality workmanship | Careful installation and repairs done properly the first time.",
        "Clear pricing | We explain the work and the price before anything begins.",
        "Friendly advice | Straightforward recommendations with no pressure.",
        "Right-fit solutions | Options that suit your home and your budget.",
      ],
      servicesTitle: "What we can help with",
      areasTitle: "Where we work",
      areasBody: "We serve homeowners across Ottawa and nearby communities.",
      ctaTitle: "Ready for a free quote?",
      ctaBody: "Call us or send a request and we’ll get back to you to talk through your garage door.",
    },
  },
  testimonials: {
    key: "testimonials",
    seoTitle: "Customer Testimonials | Ottawise Garage Doors",
    seoDescription: "What Ottawa homeowners say about working with Ottawise Garage Doors.",
    data: {
      eyebrow: "Testimonials",
      title: "What our customers say",
      description: "Feedback from homeowners we’ve worked with across Ottawa.",
      emptyTitle: "Customer stories are on the way",
      emptyBody: "We’re a growing local business and will share verified customer feedback here as it comes in. In the meantime, we’re happy to answer any questions about our work.",
    },
  },
  contact: {
    key: "contact",
    seoTitle: "Contact Ottawise Garage Doors | Free Garage Door Quotes in Ottawa",
    seoDescription: "Call (343) 209-2317 or send a message for a free garage door quote. Open 7 days, 7:00 AM to 11:00 PM. No call-out fees.",
    data: {
      eyebrow: "Contact",
      title: "Get your free quote",
      description: "Call, email, or send us a message. No call-out fees.",
      formTitle: "Send us a message",
      formIntro: "Tell us a little about your garage door and we’ll get back to you.",
      successMessage: "Thanks, your message has been received. We’ll be in touch soon.",
    },
  },
  booking: {
    key: "booking",
    seoTitle: "Request a Garage Door Service | Ottawise Garage Doors",
    seoDescription: "Request a garage door installation, repair, or opener service visit in Ottawa. We’ll contact you to confirm availability.",
    data: {
      eyebrow: "Book a service",
      title: "Request a service visit",
      description: "Choose a service and a preferred time. Free quotes and no call-out fees.",
      notice: "This is a booking request. We’ll contact you to confirm availability.",
      successMessage: "Your booking request has been received. We’ll contact you to confirm availability. Your appointment is not confirmed until we do.",
      sideTitle: "What happens next",
      steps: [
        "We review your request and preferred time.",
        "We contact you by phone or email to confirm availability.",
        "We explain the work and pricing before anything begins.",
      ],
    },
  },
};
