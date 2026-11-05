/**
 * Garage door configurator catalogue (from the Ottawise door brochure).
 * Shared by the public configurator, server validation, the admin view, and email notifications.
 * Illustrations are indicative; availability depends on door model and size.
 */

export type DoorStyleId = "classic-300" | "coach-house-400" | "heritage-500" | "carriage-600" | "modern-flush-800" | "modern-grooved-800";

export const DOOR_STYLES: { id: DoorStyleId; name: string; tagline: string; description: string }[] = [
  { id: "classic-300", name: "Classic 300", tagline: "Familiar detail. Timeless appeal.", description: "A balanced arrangement of short raised panels gives this door a classic, structured look." },
  { id: "coach-house-400", name: "Coach House 400", tagline: "Traditional character, beautifully framed.", description: "Short carriage-style panels with vertical detailing bring a welcoming, country-inspired character." },
  { id: "heritage-500", name: "Heritage 500", tagline: "A classic look with a broader profile.", description: "Long raised panels create a clean rhythm across the door with a more expansive appearance." },
  { id: "carriage-600", name: "Carriage 600", tagline: "Carriage-house charm, in every panel.", description: "Elongated carriage-style panels combine broad proportions with subtle vertical detailing." },
  { id: "modern-flush-800", name: "Modern Flush 800", tagline: "Clean surfaces. Confident design.", description: "A smooth, understated panel profile that lets the architecture lead." },
  { id: "modern-grooved-800", name: "Modern Grooved 800", tagline: "Horizontal lines. Architectural presence.", description: "Fine horizontal grooves add texture and depth to a modern profile." },
];

export const DOOR_COLOURS = [
  { id: "white", name: "White", hex: "#F3F3F1", line: "#C9C9C4" },
  { id: "almond", name: "Almond", hex: "#ECE4D3", line: "#C9BEA6" },
  { id: "sandstone", name: "Sandstone", hex: "#D4CDC0", line: "#ADA594" },
  { id: "charcoal", name: "Charcoal", hex: "#7C7F84", line: "#5C5F63" },
  { id: "dark-brown", name: "Dark Brown", hex: "#4D4237", line: "#2F2821" },
  { id: "black", name: "Black", hex: "#26272A", line: "#0F1012" },
  { id: "brown", name: "Brown", hex: "#5E3B2E", line: "#3D241B" },
  { id: "woodgrain", name: "Woodgrain", hex: "#A06E40", line: "#73492A" },
] as const;
export type DoorColourId = (typeof DOOR_COLOURS)[number]["id"];

export const GLASS_TYPES = [
  { id: "clear", name: "Clear", description: "Transparent view; natural light." },
  { id: "frosted", name: "Frosted", description: "Diffused light; obscured view." },
  { id: "tinted", name: "Tinted", description: "Black-tinted finish; shaded look." },
] as const;
export type GlassId = (typeof GLASS_TYPES)[number]["id"];

/** A window rectangle in door-relative units: row 0-3 (top to bottom), x and w as fractions of door width. */
export type Win = { row: number; x: number; w: number };
const four = (row: number): Win[] => [0, 1, 2, 3].map((i) => ({ row, x: 0.045 + i * 0.235, w: 0.205 }));

export const WINDOW_PATTERNS: { id: string; code: string; name: string; windows: Win[] }[] = [
  { id: "none", code: "", name: "No windows", windows: [] },
  { id: "top-row", code: "01", name: "Top row", windows: four(0) },
  { id: "centre-stack", code: "02", name: "Centre stack", windows: [0, 1, 2, 3].map((row) => ({ row, x: 0.39, w: 0.22 })) },
  { id: "alternating-lengths", code: "03", name: "Alternating lengths", windows: [0, 1, 2, 3].map((row) => ({ row, x: 0.06, w: row % 2 ? 0.34 : 0.6 })) },
  { id: "diagonal", code: "04", name: "Diagonal", windows: [0, 1, 2, 3].map((row) => ({ row, x: 0.045 + row * 0.235, w: 0.205 })) },
  { id: "left-stack", code: "05", name: "Left stack", windows: [0, 1, 2, 3].map((row) => ({ row, x: 0.05, w: 0.38 })) },
  { id: "stepped-lengths", code: "06", name: "Stepped lengths", windows: [{ row: 0, x: 0.05, w: 0.82 }, { row: 1, x: 0.05, w: 0.62 }, { row: 2, x: 0.05, w: 0.42 }] },
  { id: "offset-stack", code: "07", name: "Offset stack", windows: [0, 1, 2, 3].map((row) => ({ row, x: 0.05, w: 0.22 })) },
  { id: "right-stack", code: "08", name: "Right stack", windows: [0, 1, 2, 3].map((row) => ({ row, x: 0.73, w: 0.22 })) },
  { id: "mixed", code: "09", name: "Mixed arrangement", windows: [...four(0), { row: 1, x: 0.05, w: 0.43 }, { row: 1, x: 0.52, w: 0.43 }, { row: 2, x: 0.2, w: 0.6 }] },
];

export type DecorKind = "grid" | "arched-grid" | "diamond" | "bars" | "arched-bars" | "wheel" | "trellis" | "victorian";
/** Decorative inserts fill the top row: "L" designs use 2 long windows, "S" designs use 4 short windows. */
export const DECORATIVE_DESIGNS: { id: string; code: string; name: string; size: "L" | "S" | ""; kind: DecorKind | "" }[] = [
  { id: "none", code: "", name: "No decorative design", size: "", kind: "" },
  { id: "l01-stockton", code: "L01", name: "Stockton", size: "L", kind: "grid" },
  { id: "l02-arched-stockton", code: "L02", name: "Arched Stockton", size: "L", kind: "arched-grid" },
  { id: "l04-waterton", code: "L04", name: "Waterton", size: "L", kind: "diamond" },
  { id: "l05-straight-stockbridge", code: "L05", name: "Straight Stockbridge", size: "L", kind: "bars" },
  { id: "l06-arched-stockbridge", code: "L06", name: "Arched Stockbridge", size: "L", kind: "arched-bars" },
  { id: "s01-stockton", code: "S01", name: "Stockton", size: "S", kind: "grid" },
  { id: "s04-waterton", code: "S04", name: "Waterton", size: "S", kind: "diamond" },
  { id: "s06-wagon-wheel", code: "S06", name: "Wagon Wheel", size: "S", kind: "wheel" },
  { id: "l08-long-trellis", code: "L08", name: "Long Trellis", size: "L", kind: "trellis" },
  { id: "l09-victorian", code: "L09", name: "Victorian", size: "L", kind: "victorian" },
];

export const DOOR_SIZES = ["Single car (approx. 8-9 ft wide)", "Double car (approx. 16 ft wide)", "Not sure / need measuring"] as const;

export type DoorConfig = { style: DoorStyleId; colour: DoorColourId; pattern: string; glass: GlassId; decor: string };
export const DEFAULT_CONFIG: DoorConfig = { style: "modern-flush-800", colour: "charcoal", pattern: "left-stack", glass: "clear", decor: "none" };

/** Windows that will actually be drawn, accounting for decorative inserts (which replace the pattern with a top row). */
export function windowsFor(cfg: Pick<DoorConfig, "pattern" | "decor">): Win[] {
  const decor = DECORATIVE_DESIGNS.find((d) => d.id === cfg.decor);
  if (decor && decor.size === "L") return [{ row: 0, x: 0.045, w: 0.44 }, { row: 0, x: 0.515, w: 0.44 }];
  if (decor && decor.size === "S") return four(0);
  return WINDOW_PATTERNS.find((p) => p.id === cfg.pattern)?.windows ?? [];
}

/** Human-readable summary used in admin, emails, and the confirmation screen. */
export function describeConfig(cfg: DoorConfig) {
  const style = DOOR_STYLES.find((s) => s.id === cfg.style)?.name ?? cfg.style;
  const colour = DOOR_COLOURS.find((c) => c.id === cfg.colour)?.name ?? cfg.colour;
  const decor = DECORATIVE_DESIGNS.find((d) => d.id === cfg.decor);
  const pattern = WINDOW_PATTERNS.find((p) => p.id === cfg.pattern);
  const hasWindows = (decor && decor.id !== "none") || (pattern && pattern.id !== "none");
  const windows = decor && decor.id !== "none"
    ? `Decorative top row: ${decor.code} ${decor.name}`
    : pattern && pattern.id !== "none" ? `${pattern.code} ${pattern.name}` : "No windows";
  const glass = hasWindows ? GLASS_TYPES.find((g) => g.id === cfg.glass)?.name ?? cfg.glass : "N/A";
  return { style, colour, windows, glass };
}

export const isValidConfig = (c: DoorConfig) =>
  DOOR_STYLES.some((s) => s.id === c.style) &&
  DOOR_COLOURS.some((x) => x.id === c.colour) &&
  WINDOW_PATTERNS.some((p) => p.id === c.pattern) &&
  GLASS_TYPES.some((g) => g.id === c.glass) &&
  DECORATIVE_DESIGNS.some((d) => d.id === c.decor);
