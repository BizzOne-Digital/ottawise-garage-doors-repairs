import { DOOR_COLOURS, FRAME_COLOURS, ROWS, WINDOW_TYPES, columnsFor, styleOf, type DoorConfig, type InsertKind } from "@/lib/doorCatalog";

// Door geometry (viewBox units): height is fixed at 480 (4 sections of 120); width follows the real proportions.
const DX = 20, DY = 20, DH = 480, RH = DH / ROWS;

type Props = {
  config: DoorConfig;
  idPrefix?: string;
  className?: string;
  title?: string;
  /** When set, each window position becomes clickable (insert or remove a window). */
  onSlotClick?: (key: string) => void;
  showDimensions?: boolean;
};

/** Illustrative SVG of a sectional garage door. Pure render, safe on server and client. */
export default function DoorPreview({ config, idPrefix = "door", className = "", title, onSlotClick, showDimensions }: Props) {
  const colour = DOOR_COLOURS.find((c) => c.id === config.colour) ?? DOOR_COLOURS[0];
  const style = styleOf(config.style);
  const insert = WINDOW_TYPES.find((t) => t.id === config.windowType) ?? WINDOW_TYPES[0];
  const frame = FRAME_COLOURS.find((f) => f.id === config.frame);
  const frameHex = frame && frame.hex ? frame.hex : colour.hex;
  const dark = ["charcoal", "dark-brown", "black", "brown"].includes(colour.id);
  const DW = Math.round((DH * config.width) / config.height);
  const cols = columnsFor(config.style, config.width);
  const cw = DW / cols;
  const set = new Set(config.windows);
  const id = (s: string) => `${idPrefix}-${s}`;
  const W = DW + 40, H = showDimensions ? 560 : 520;

  const slot = (r: number, c: number) => {
    const padX = Math.min(cw * 0.09, 26);
    return { x: DX + c * cw + padX, y: DY + r * RH + 20, w: cw - padX * 2, h: RH - 40 };
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} role="img" aria-label={title ?? "Garage door preview"}>
      <defs>
        <linearGradient id={id("shade")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity={dark ? 0.08 : 0.25} />
          <stop offset="1" stopColor="#000000" stopOpacity={dark ? 0.25 : 0.1} />
        </linearGradient>
        <linearGradient id={id("clear")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E3ECF5" />
          <stop offset="1" stopColor="#8EA4C0" />
        </linearGradient>
        <linearGradient id={id("frosted")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F4F6F7" />
          <stop offset="1" stopColor="#D9DEE2" />
        </linearGradient>
        <linearGradient id={id("tinted")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4A5059" />
          <stop offset="1" stopColor="#23272D" />
        </linearGradient>
        <pattern id={id("grain")} width="120" height="16" patternUnits="userSpaceOnUse">
          <path d="M0 5 Q30 2 60 6 T120 5 M0 12 Q35 9 70 13 T120 11" fill="none" stroke="#000" strokeOpacity="0.16" strokeWidth="1.4" />
        </pattern>
      </defs>

      {/* Surround and door slab */}
      <rect x="4" y="4" width={W - 8} height="512" rx="4" fill="#F1F1EE" stroke="#D8D6D0" strokeWidth="2" />
      <rect x={DX} y={DY} width={DW} height={DH} fill={colour.hex} />
      {colour.id === "woodgrain" && <rect x={DX} y={DY} width={DW} height={DH} fill={`url(#${id("grain")})`} />}
      <rect x={DX} y={DY} width={DW} height={DH} fill={`url(#${id("shade")})`} />

      {/* Section joints */}
      {Array.from({ length: ROWS - 1 }).map((_, i) => {
        const y = DY + (i + 1) * RH;
        return (
          <g key={i}>
            <line x1={DX} x2={DX + DW} y1={y} y2={y} stroke={colour.line} strokeWidth="3" />
            <line x1={DX} x2={DX + DW} y1={y + 2.5} y2={y + 2.5} stroke="#FFFFFF" strokeOpacity="0.25" strokeWidth="1.5" />
          </g>
        );
      })}

      {/* Panels, or windows where the customer inserted them */}
      {Array.from({ length: ROWS }).map((_, r) => (
        <g key={r}>
          {config.style === "modern-grooved-800" && [1, 2, 3, 4, 5, 6, 7].map((k) => (
            <line key={k} x1={DX} x2={DX + DW} y1={DY + r * RH + k * 15} y2={DY + r * RH + k * 15} stroke={colour.line} strokeOpacity="0.45" strokeWidth="1.2" />
          ))}
          {Array.from({ length: cols }).map((__, c) => {
            const s = slot(r, c);
            if (set.has(`${r}-${c}`)) {
              return <Window key={c} {...s} kind={insert.kind} glass={config.glass} frame={frameHex} line={colour.line} fillId={id(config.glass)} flip={c % 2 === 1} />;
            }
            if (style.panel === "modern") return null;
            return <Panel key={c} {...s} line={colour.line} grooves={config.style === "coach-house-400" || config.style === "carriage-600"} />;
          })}
        </g>
      ))}

      {/* Click targets for inserting windows (keyboard users get the matching button grid beside the preview) */}
      {onSlotClick && Array.from({ length: ROWS }).map((_, r) => Array.from({ length: cols }).map((__, c) => {
        const key = `${r}-${c}`;
        return (
          <rect key={key} aria-hidden x={DX + c * cw + 3} y={DY + r * RH + 3} width={cw - 6} height={RH - 6} rx="4" fill="transparent" stroke="transparent"
            className="cursor-pointer fill-transparent stroke-transparent transition-colors hover:fill-[#C9A24B26] hover:stroke-[#C9A24B]" strokeWidth="3" strokeDasharray="10 6"
            onClick={() => onSlotClick(key)} />
        );
      }))}

      {showDimensions && (
        <g fill="#414854" fontSize="20" fontFamily="Arial, sans-serif" fontWeight="700" textAnchor="middle">
          <line x1={DX} x2={DX + DW} y1="540" y2="540" stroke="#9AA0A8" strokeWidth="2" />
          <line x1={DX} x2={DX} y1="530" y2="550" stroke="#9AA0A8" strokeWidth="2" />
          <line x1={DX + DW} x2={DX + DW} y1="530" y2="550" stroke="#9AA0A8" strokeWidth="2" />
          <rect x={DX + DW / 2 - 110} y="526" width="220" height="28" fill="#FFFFFF" />
          <text x={DX + DW / 2} y="547">{`${config.width}' W x ${config.height}' H`}</text>
        </g>
      )}
    </svg>
  );
}

function Panel({ x, y, w, h, line, grooves }: { x: number; y: number; w: number; h: number; line: string; grooves: boolean }) {
  const n = Math.max(3, Math.round(w / 34));
  return (
    <g fill="none">
      <rect x={x} y={y} width={w} height={h} stroke={line} strokeWidth="2.5" />
      <rect x={x + 8} y={y + 8} width={w - 16} height={h - 16} stroke={line} strokeOpacity="0.7" strokeWidth="1.5" />
      <line x1={x} y1={y} x2={x + 8} y2={y + 8} stroke="#FFFFFF" strokeOpacity="0.4" strokeWidth="1.5" />
      {grooves && Array.from({ length: n - 1 }).map((_, g) => {
        const gx = x + 8 + ((w - 16) / n) * (g + 1);
        return <line key={g} x1={gx} x2={gx} y1={y + 8} y2={y + h - 8} stroke={line} strokeOpacity="0.6" strokeWidth="1.5" />;
      })}
    </g>
  );
}

function Window({ x, y, w, h, kind, glass, frame, line, fillId, flip }: { x: number; y: number; w: number; h: number; kind: InsertKind; glass: string; frame: string; line: string; fillId: string; flip: boolean }) {
  const arched = kind === "arched-grid" || kind === "arched-bars";
  const gx = x + 7, gy = y + 7, gw = w - 14, gh = h - 14;
  const glassPath = arched
    ? `M${gx} ${gy + gh} V${gy + 14} Q${gx + gw / 2} ${gy - 8} ${gx + gw} ${gy + 14} V${gy + gh} Z`
    : `M${gx} ${gy} H${gx + gw} V${gy + gh} H${gx} Z`;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={frame} stroke={line} strokeWidth="2.5" />
      <path d={glassPath} fill={`url(#${fillId})`} stroke={line} strokeWidth="1.5" />
      {glass === "frosted" && [0.3, 0.55, 0.8].map((f) => (
        <line key={f} x1={gx + 6} x2={gx + gw - 6} y1={gy + gh * f} y2={gy + gh * f} stroke="#FFFFFF" strokeOpacity="0.7" strokeWidth="2" />
      ))}
      {glass !== "frosted" && (
        <line x1={gx + gw * 0.12} y1={gy + gh * 0.8} x2={gx + gw * 0.3} y2={gy + gh * 0.2} stroke="#FFFFFF" strokeOpacity={glass === "tinted" ? 0.25 : 0.55} strokeWidth="3" />
      )}
      <Insert kind={kind} x={gx} y={gy} w={gw} h={gh} color={frame} flip={flip} />
    </g>
  );
}

function Insert({ kind, x, y, w, h, color, flip }: { kind: InsertKind; x: number; y: number; w: number; h: number; color: string; flip: boolean }) {
  const s = { stroke: color, strokeWidth: 4, fill: "none", strokeLinecap: "round" as const };
  const long = w > 160;
  const vlines = (n: number) => Array.from({ length: n - 1 }).map((_, i) => <line key={`v${i}`} x1={x + (w / n) * (i + 1)} x2={x + (w / n) * (i + 1)} y1={y + 2} y2={y + h - 2} {...s} />);
  switch (kind) {
    case "plain":
      return null;
    case "grid":
    case "arched-grid":
      return <g>{vlines(long ? 5 : 2)}<line x1={x + 2} x2={x + w - 2} y1={y + h / 2} y2={y + h / 2} {...s} /></g>;
    case "bars":
    case "arched-bars":
      return <g>{vlines(4)}</g>;
    case "diamond": {
      const n = long ? 2 : 1;
      return (
        <g>
          <line x1={x + 2} x2={x + w - 2} y1={y + h / 2} y2={y + h / 2} {...s} />
          {Array.from({ length: n }).map((_, i) => {
            const cx = x + (w / n) * (i + 0.5), rx = Math.min(w / n / 2 - 8, 46), ry = h / 2 - 6;
            return <polygon key={i} points={`${cx},${y + h / 2 - ry} ${cx + rx},${y + h / 2} ${cx},${y + h / 2 + ry} ${cx - rx},${y + h / 2}`} {...s} />;
          })}
        </g>
      );
    }
    case "wheel": {
      const ox = flip ? x + w - 4 : x + 4, oy = y + h - 4, r = Math.min(w, h * 1.6) - 10, dir = flip ? -1 : 1;
      return (
        <g>
          {[0.15, 0.4, 0.65, 0.9].map((a) => {
            const ang = (a * Math.PI) / 2;
            return <line key={a} x1={ox} y1={oy} x2={ox + dir * Math.cos(ang) * r} y2={oy - Math.sin(ang) * Math.min(r, h - 8)} {...s} />;
          })}
          <path d={`M${ox + dir * 16} ${oy} A16 16 0 0 ${flip ? 1 : 0} ${ox} ${oy - 16}`} {...s} />
        </g>
      );
    }
    case "trellis": {
      const n = 5, cy = y + h / 2;
      return (
        <g>
          <path d={Array.from({ length: n }).map((_, i) => `${i === 0 ? "M" : ""}${x + 10 + ((w - 20) / n) * i} ${cy} Q${x + 10 + ((w - 20) / n) * (i + 0.5)} ${cy + (i % 2 ? 16 : -16)} ${x + 10 + ((w - 20) / n) * (i + 1)} ${cy}`).join(" ")} {...s} strokeWidth={3} />
          {Array.from({ length: n }).map((_, i) => <circle key={i} cx={x + 10 + ((w - 20) / n) * (i + 0.5)} cy={cy + (i % 2 ? 8 : -8)} r={7} {...s} strokeWidth={3} />)}
        </g>
      );
    }
    case "victorian":
      return (
        <g>
          <rect x={x + 6} y={y + 6} width={w - 12} height={h - 12} {...s} strokeWidth={3} />
          <line x1={x + 6} x2={x + w - 6} y1={y + h / 2} y2={y + h / 2} {...s} strokeWidth={3} />
          <ellipse cx={x + w / 2} cy={y + h / 2} rx={w * 0.14} ry={h * 0.24} {...s} strokeWidth={3} />
        </g>
      );
  }
}
