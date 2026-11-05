import { DECORATIVE_DESIGNS, DOOR_COLOURS, windowsFor, type DecorKind, type DoorConfig } from "@/lib/doorCatalog";

// Door geometry (viewBox units): a 760x480 door inside a light surround, 4 sections of 120.
const DX = 20, DY = 20, DW = 760, DH = 480, ROWS = 4, RH = DH / ROWS;
const WIN_TOP = 24, WIN_H = 72;

type Props = { config: DoorConfig; idPrefix?: string; className?: string; title?: string };

/** Illustrative SVG of a sectional garage door. Pure render, safe on server and client. */
export default function DoorPreview({ config, idPrefix = "door", className = "", title }: Props) {
  const colour = DOOR_COLOURS.find((c) => c.id === config.colour) ?? DOOR_COLOURS[0];
  const decor = DECORATIVE_DESIGNS.find((d) => d.id === config.decor);
  const wins = windowsFor(config);
  const dark = ["charcoal", "dark-brown", "black", "brown"].includes(colour.id);
  const id = (s: string) => `${idPrefix}-${s}`;
  const muntin = dark ? colour.hex : "#FFFFFF";

  return (
    <svg viewBox="0 0 800 520" className={className} role="img" aria-label={title ?? "Garage door preview"}>
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
      <rect x="4" y="4" width="792" height="512" rx="4" fill="#F1F1EE" stroke="#D8D6D0" strokeWidth="2" />
      <rect x={DX} y={DY} width={DW} height={DH} fill={colour.hex} />
      {colour.id === "woodgrain" && <rect x={DX} y={DY} width={DW} height={DH} fill={`url(#${id("grain")})`} />}
      <rect x={DX} y={DY} width={DW} height={DH} fill={`url(#${id("shade")})`} />

      {/* Section joints */}
      {[1, 2, 3].map((r) => (
        <g key={r}>
          <line x1={DX} x2={DX + DW} y1={DY + r * RH} y2={DY + r * RH} stroke={colour.line} strokeWidth="3" />
          <line x1={DX} x2={DX + DW} y1={DY + r * RH + 2.5} y2={DY + r * RH + 2.5} stroke="#FFFFFF" strokeOpacity="0.25" strokeWidth="1.5" />
        </g>
      ))}

      {/* Panel embossing per model */}
      {Array.from({ length: ROWS }).map((_, r) => <Panels key={r} style={config.style} top={DY + r * RH} line={colour.line} skip={wins.filter((w) => w.row === r)} />)}

      {/* Windows */}
      {wins.map((w, i) => {
        const x = DX + w.x * DW, y = DY + w.row * RH + WIN_TOP, ww = w.w * DW;
        const arched = decor?.kind === "arched-grid" || decor?.kind === "arched-bars";
        const glassPath = arched
          ? `M${x} ${y + WIN_H} V${y + 16} Q${x + ww / 2} ${y - 12} ${x + ww} ${y + 16} V${y + WIN_H} Z`
          : `M${x} ${y} H${x + ww} V${y + WIN_H} H${x} Z`;
        return (
          <g key={i}>
            <path d={glassPath} fill={`url(#${id(config.glass)})`} stroke={colour.line} strokeWidth="4" />
            {config.glass === "frosted" && [0.3, 0.55, 0.8].map((f) => (
              <line key={f} x1={x + 6} x2={x + ww - 6} y1={y + WIN_H * f} y2={y + WIN_H * f} stroke="#FFFFFF" strokeOpacity="0.7" strokeWidth="2" />
            ))}
            {config.glass !== "frosted" && (
              <line x1={x + ww * 0.12} y1={y + WIN_H * 0.8} x2={x + ww * 0.3} y2={y + WIN_H * 0.2} stroke="#FFFFFF" strokeOpacity={config.glass === "tinted" ? 0.25 : 0.55} strokeWidth="3" />
            )}
            {decor?.kind && <Decor kind={decor.kind} x={x} y={y} w={ww} h={WIN_H} color={muntin} flip={i % 2 === 1} />}
          </g>
        );
      })}
    </svg>
  );
}

function Panels({ style, top, line, skip }: { style: DoorConfig["style"]; top: number; line: string; skip: { x: number; w: number }[] }) {
  if (style === "modern-flush-800") return null;
  if (style === "modern-grooved-800") {
    return <g>{[1, 2, 3, 4, 5, 6, 7].map((k) => <line key={k} x1={DX} x2={DX + DW} y1={top + k * 15} y2={top + k * 15} stroke={line} strokeOpacity="0.45" strokeWidth="1.2" />)}</g>;
  }
  const cols = style === "classic-300" || style === "coach-house-400" ? 4 : 2;
  const grooves = style === "coach-house-400" || style === "carriage-600";
  const cw = DW / cols;
  return (
    <g>
      {Array.from({ length: cols }).map((_, c) => {
        const x = DX + c * cw + (cols === 4 ? 16 : 26), w = cw - (cols === 4 ? 32 : 52), y = top + 18, h = RH - 36;
        // Hide panels that sit under a window.
        const covered = skip.some((s) => DX + s.x * DW < x + w && DX + (s.x + s.w) * DW > x);
        if (covered) return null;
        return (
          <g key={c} fill="none">
            <rect x={x} y={y} width={w} height={h} stroke={line} strokeWidth="2.5" />
            <rect x={x + 8} y={y + 8} width={w - 16} height={h - 16} stroke={line} strokeOpacity="0.7" strokeWidth="1.5" />
            <line x1={x} y1={y} x2={x + 8} y2={y + 8} stroke="#FFFFFF" strokeOpacity="0.4" strokeWidth="1.5" />
            {grooves && Array.from({ length: cols === 4 ? 3 : 7 }).map((__, g) => {
              const n = cols === 4 ? 4 : 8;
              const gx = x + 8 + ((w - 16) / n) * (g + 1);
              return <line key={g} x1={gx} x2={gx} y1={y + 8} y2={y + h - 8} stroke={line} strokeOpacity="0.6" strokeWidth="1.5" />;
            })}
          </g>
        );
      })}
    </g>
  );
}

function Decor({ kind, x, y, w, h, color, flip }: { kind: DecorKind; x: number; y: number; w: number; h: number; color: string; flip: boolean }) {
  const s = { stroke: color, strokeWidth: 4, fill: "none", strokeLinecap: "round" as const };
  const long = w > 200;
  const vlines = (n: number) => Array.from({ length: n - 1 }).map((_, i) => <line key={`v${i}`} x1={x + (w / n) * (i + 1)} x2={x + (w / n) * (i + 1)} y1={y + 2} y2={y + h - 2} {...s} />);
  switch (kind) {
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
            const cx = x + (w / n) * (i + 0.5), rx = Math.min(w / n / 2 - 8, 46), ry = h / 2 - 8;
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
          <path d={`M${ox + dir * 18} ${oy} A18 18 0 0 ${flip ? 1 : 0} ${ox} ${oy - 18}`} {...s} />
        </g>
      );
    }
    case "trellis": {
      const n = 5, cy = y + h / 2;
      return (
        <g>
          <path d={Array.from({ length: n }).map((_, i) => `${i === 0 ? "M" : ""}${x + 10 + ((w - 20) / n) * i} ${cy} Q${x + 10 + ((w - 20) / n) * (i + 0.5)} ${cy + (i % 2 ? 18 : -18)} ${x + 10 + ((w - 20) / n) * (i + 1)} ${cy}`).join(" ")} {...s} strokeWidth={3} />
          {Array.from({ length: n }).map((_, i) => <circle key={i} cx={x + 10 + ((w - 20) / n) * (i + 0.5)} cy={cy + (i % 2 ? 9 : -9)} r={8} {...s} strokeWidth={3} />)}
        </g>
      );
    }
    case "victorian":
      return (
        <g>
          <rect x={x + 8} y={y + 8} width={w - 16} height={h - 16} {...s} strokeWidth={3} />
          <line x1={x + 8} x2={x + w - 8} y1={y + h / 2} y2={y + h / 2} {...s} strokeWidth={3} />
          <ellipse cx={x + w / 2} cy={y + h / 2} rx={w * 0.14} ry={h * 0.22} {...s} strokeWidth={3} />
        </g>
      );
  }
}
