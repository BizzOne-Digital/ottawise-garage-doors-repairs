/**
 * Garage door configurator catalogue (from the Ottawise door brochure).
 * Shared by the public configurator, server validation, the admin view, and email notifications.
 * Illustrations are indicative; availability depends on door model and size.
 */

export type DoorStyleId = "classic-300" | "coach-house-400" | "heritage-500" | "carriage-600" | "modern-flush-800" | "modern-grooved-800";

/** panel: "short" = 4 panels per section on a single door, "long" = 2, "modern" = no raised panels. */
export const DOOR_STYLES: { id: DoorStyleId; name: string; tagline: string; description: string; panel: "short" | "long" | "modern" }[] = [
  { id: "classic-300", name: "Classic 300", tagline: "Familiar detail. Timeless appeal.", description: "A balanced arrangement of short raised panels gives this door a classic, structured look.", panel: "short" },
  { id: "coach-house-400", name: "Coach House 400", tagline: "Traditional character, beautifully framed.", description: "Short carriage-style panels with vertical detailing bring a welcoming, country-inspired character.", panel: "short" },
  { id: "heritage-500", name: "Heritage 500", tagline: "A classic look with a broader profile.", description: "Long raised panels create a clean rhythm across the door with a more expansive appearance.", panel: "long" },
  { id: "carriage-600", name: "Carriage 600", tagline: "Carriage-house charm, in every panel.", description: "Elongated carriage-style panels combine broad proportions with subtle vertical detailing.", panel: "long" },
  { id: "modern-flush-800", name: "Modern Flush 800", tagline: "Clean surfaces. Confident design.", description: "A smooth, understated panel profile that lets the architecture lead.", panel: "modern" },
  { id: "modern-grooved-800", name: "Modern Grooved 800", tagline: "Horizontal lines. Architectural presence.", description: "Fine horizontal grooves add texture and depth to a modern profile.", panel: "modern" },
];

/** Sizes in feet. 8x7 and 16x7 are the most common in Ottawa homes. */
export const DOOR_WIDTHS = [8, 9, 10, 12, 14, 15, 16, 18] as const;
export const DOOR_HEIGHTS = [7, 8, 9] as const;
export const MAX_QUANTITY = 4;
export const sizeLabel = (w: number, h: number) => `${w} ft wide x ${h} ft high`;

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

/** Window frame colours. "match" uses the door colour. */
export const FRAME_COLOURS = [
  { id: "match", name: "Match door colour", hex: "" },
  { id: "white", name: "White", hex: "#F3F3F1" },
  { id: "almond", name: "Almond", hex: "#ECE4D3" },
  { id: "sandstone", name: "Sandstone", hex: "#D4CDC0" },
  { id: "charcoal", name: "Charcoal", hex: "#7C7F84" },
  { id: "dark-brown", name: "Dark Brown", hex: "#4D4237" },
  { id: "brown", name: "Brown", hex: "#5E3B2E" },
  { id: "black", name: "Black", hex: "#26272A" },
] as const;

export const GLASS_TYPES = [
  { id: "clear", name: "Clear", description: "Transparent view; natural light." },
  { id: "frosted", name: "Frosted", description: "Diffused light; obscured view." },
  { id: "tinted", name: "Tinted", description: "Black-tinted finish; shaded look." },
] as const;
export type GlassId = (typeof GLASS_TYPES)[number]["id"];

export type InsertKind = "plain" | "grid" | "arched-grid" | "diamond" | "bars" | "arched-bars" | "wheel" | "trellis" | "victorian";
/** Window inserts the customer places on the door. `fits` lists the panel types each insert is made for. */
export const WINDOW_TYPES: { id: string; code: string; name: string; kind: InsertKind; fits: ("short" | "long" | "modern")[] }[] = [
  { id: "plain", code: "", name: "Plain window", kind: "plain", fits: ["short", "long", "modern"] },
  { id: "stockton", code: "L01 / S01", name: "Stockton", kind: "grid", fits: ["short", "long"] },
  { id: "arched-stockton", code: "L02", name: "Arched Stockton", kind: "arched-grid", fits: ["long"] },
  { id: "waterton", code: "L04 / S04", name: "Waterton", kind: "diamond", fits: ["short", "long"] },
  { id: "stockbridge", code: "L05", name: "Straight Stockbridge", kind: "bars", fits: ["long"] },
  { id: "arched-stockbridge", code: "L06", name: "Arched Stockbridge", kind: "arched-bars", fits: ["long"] },
  { id: "wagon-wheel", code: "S06", name: "Wagon Wheel", kind: "wheel", fits: ["short"] },
  { id: "long-trellis", code: "L08", name: "Long Trellis", kind: "trellis", fits: ["long"] },
  { id: "victorian", code: "L09", name: "Victorian", kind: "victorian", fits: ["long"] },
];

export type DoorConfig = {
  style: DoorStyleId;
  colour: DoorColourId;
  width: number;
  height: number;
  quantity: number;
  windowType: string;
  /** Window positions as "row-col" keys (row 0 = top section). Empty = solid door, panels only. */
  windows: string[];
  glass: GlassId;
  frame: string;
};

/** Starts as a solid door with panels only; windows are added by the customer. */
export const DEFAULT_CONFIG: DoorConfig = {
  style: "classic-300", colour: "white", width: 8, height: 7, quantity: 1, windowType: "plain", windows: [], glass: "clear", frame: "match",
};

export const ROWS = 4;
export const styleOf = (id: string) => DOOR_STYLES.find((s) => s.id === id) ?? DOOR_STYLES[0];
/** Window slots per section: panel count across the door; doors 14 ft and wider have twice as many. */
export function columnsFor(style: string, width: number) {
  const base = styleOf(style).panel === "long" ? 2 : 4;
  return width >= 14 ? base * 2 : base;
}
export const windowTypesFor = (style: string) => WINDOW_TYPES.filter((t) => t.fits.includes(styleOf(style).panel));

/** Drops windows and inserts that no longer fit after the style or size changes. */
export function sanitizeConfig(c: DoorConfig): DoorConfig {
  const cols = columnsFor(c.style, c.width);
  const windows = [...new Set(c.windows)].filter((k) => {
    const [r, col] = k.split("-").map(Number);
    return r >= 0 && r < ROWS && col >= 0 && col < cols;
  }).sort();
  const windowType = windowTypesFor(c.style).some((t) => t.id === c.windowType) ? c.windowType : "plain";
  return { ...c, windows, windowType };
}

/** Reads a stored config, including records saved before windows could be placed individually. */
export function toConfig(raw: any): DoorConfig {
  const c: DoorConfig = {
    ...DEFAULT_CONFIG,
    style: DOOR_STYLES.some((s) => s.id === raw?.style) ? raw.style : DEFAULT_CONFIG.style,
    colour: DOOR_COLOURS.some((x) => x.id === raw?.colour) ? raw.colour : DEFAULT_CONFIG.colour,
    width: Number(raw?.width) || DEFAULT_CONFIG.width,
    height: Number(raw?.height) || DEFAULT_CONFIG.height,
    quantity: Number(raw?.quantity) || 1,
    windowType: typeof raw?.windowType === "string" ? raw.windowType : "plain",
    windows: Array.isArray(raw?.windows) ? raw.windows.map(String) : [],
    glass: GLASS_TYPES.some((g) => g.id === raw?.glass) ? raw.glass : "clear",
    frame: typeof raw?.frame === "string" ? raw.frame : "match",
  };
  return sanitizeConfig(c);
}

/** Human-readable summary used in admin, emails, and the confirmation screen. */
export function describeConfig(cfg: DoorConfig) {
  const style = styleOf(cfg.style).name;
  const colour = DOOR_COLOURS.find((c) => c.id === cfg.colour)?.name ?? cfg.colour;
  const size = sizeLabel(cfg.width, cfg.height);
  const n = cfg.windows.length;
  const type = WINDOW_TYPES.find((t) => t.id === cfg.windowType);
  const rows = [...new Set(cfg.windows.map((k) => Number(k.split("-")[0])))].sort();
  const rowNames = ["top", "second", "third", "bottom"];
  const windows = n === 0 ? "No windows (solid panels)"
    : `${n} x ${type?.name ?? "window"} in the ${rows.map((r) => rowNames[r]).join(", ")} section${rows.length > 1 ? "s" : ""}`;
  const glass = n ? GLASS_TYPES.find((g) => g.id === cfg.glass)?.name ?? cfg.glass : "N/A";
  const frame = n ? FRAME_COLOURS.find((f) => f.id === cfg.frame)?.name ?? cfg.frame : "N/A";
  return { style, colour, size, quantity: String(cfg.quantity), windows, glass, frame };
}

export const isValidConfig = (c: DoorConfig) =>
  DOOR_STYLES.some((s) => s.id === c.style) &&
  DOOR_COLOURS.some((x) => x.id === c.colour) &&
  (DOOR_WIDTHS as readonly number[]).includes(c.width) &&
  (DOOR_HEIGHTS as readonly number[]).includes(c.height) &&
  Number.isInteger(c.quantity) && c.quantity >= 1 && c.quantity <= MAX_QUANTITY &&
  windowTypesFor(c.style).some((t) => t.id === c.windowType) &&
  GLASS_TYPES.some((g) => g.id === c.glass) &&
  FRAME_COLOURS.some((f) => f.id === c.frame) &&
  Array.isArray(c.windows) && c.windows.length <= ROWS * columnsFor(c.style, c.width) &&
  sanitizeConfig(c).windows.length === new Set(c.windows).size;
