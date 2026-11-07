"use client";

import { AlertCircle, Check, CheckCircle2, Eraser, Loader2, MousePointerClick } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import DoorPreview from "./DoorPreview";
import {
  DEFAULT_CONFIG, DOOR_COLOURS, DOOR_HEIGHTS, DOOR_STYLES, DOOR_WIDTHS, FRAME_COLOURS, GLASS_TYPES, MAX_QUANTITY, ROWS,
  columnsFor, describeConfig, sanitizeConfig, windowTypesFor, type DoorConfig,
} from "@/lib/doorCatalog";
import { doorQuoteSchema, fieldErrors } from "@/lib/validation";

/** Small selectable tile used for every option group. */
function Option({ selected, onClick, children, label, className = "" }: { selected: boolean; onClick: () => void; children: React.ReactNode; label: string; className?: string }) {
  return (
    <button type="button" role="radio" aria-checked={selected} aria-label={label} onClick={onClick}
      className={`relative rounded-lg border-2 bg-white p-2 text-left transition-colors hover:border-gold/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${selected ? "border-gold" : "border-line"} ${className}`}>
      {selected && <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-white"><Check className="h-3 w-3" strokeWidth={3} aria-hidden /></span>}
      {children}
    </button>
  );
}

function Heading({ n, id, title, note }: { n: string; id: string; title: string; note?: string }) {
  return (
    <div className="mb-4">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold-dark">{n}</p>
      <h2 id={id} className="text-xl">{title}</h2>
      {note && <p className="mt-1 text-sm">{note}</p>}
    </div>
  );
}

const Swatch = ({ hex, wood, selected }: { hex: string; wood?: string; selected: boolean }) => (
  <span className={`relative h-12 w-12 rounded-full border-2 shadow-inner sm:h-14 sm:w-14 ${selected ? "border-gold ring-2 ring-gold ring-offset-2" : "border-line group-hover:border-gold/60"}`}
    style={{ background: wood ? `repeating-linear-gradient(170deg, ${hex} 0 6px, ${wood} 6px 8px)` : hex }}>
    {selected && <Check className={`absolute inset-0 m-auto h-5 w-5 ${["#F3F3F1", "#ECE4D3", "#D4CDC0"].includes(hex) ? "text-navy" : "text-white"}`} strokeWidth={3} aria-hidden />}
  </span>
);

export default function Configurator({ areas, initialStyle }: { areas: string[]; initialStyle?: string }) {
  const [cfg, setCfg] = useState<DoorConfig>(() => ({
    ...DEFAULT_CONFIG,
    ...(DOOR_STYLES.some((s) => s.id === initialStyle) ? { style: initialStyle as DoorConfig["style"] } : {}),
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [formError, setFormError] = useState("");
  const startedAt = useRef(Date.now());
  const formRef = useRef<HTMLFormElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const summary = useMemo(() => describeConfig(cfg), [cfg]);
  const update = (patch: Partial<DoorConfig>) => setCfg((c) => sanitizeConfig({ ...c, ...patch }));
  const style = DOOR_STYLES.find((s) => s.id === cfg.style)!;
  const cols = columnsFor(cfg.style, cfg.width);
  const types = windowTypesFor(cfg.style);
  const hasWindows = cfg.windows.length > 0;
  const toggle = (key: string) => setCfg((c) => sanitizeConfig({ ...c, windows: c.windows.includes(key) ? c.windows.filter((k) => k !== key) : [...c.windows, key] }));
  const fillRow = (r: number) => update({ windows: [...cfg.windows.filter((k) => !k.startsWith(`${r}-`)), ...Array.from({ length: cols }, (_, c) => `${r}-${c}`)] });

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "sending") return;
    const fd = new FormData(e.currentTarget);
    const values = {
      name: String(fd.get("name") || ""), email: String(fd.get("email") || ""), phone: String(fd.get("phone") || ""),
      area: String(fd.get("area") || ""), message: String(fd.get("message") || ""), config: cfg,
    };
    const parsed = doorQuoteSchema.safeParse(values);
    if (!parsed.success) {
      const fe = fieldErrors(parsed.error);
      setErrors(fe);
      setFormError("Please check the highlighted fields.");
      setState("error");
      formRef.current?.querySelector<HTMLElement>(`[name="${Object.keys(fe)[0]}"]`)?.focus();
      return;
    }
    setErrors({});
    setFormError("");
    setState("sending");
    try {
      const res = await fetch("/api/door-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...parsed.data, website: String(fd.get("website") || ""), _t: startedAt.current }),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok && j.success) {
        setState("done");
        topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      if (j.fields) setErrors(j.fields);
      setFormError(j.error || "Something went wrong. Please try again or call us.");
      setState("error");
    } catch {
      setFormError("We couldn't reach the server. Check your connection and try again, or call us.");
      setState("error");
    }
  }

  const err = (k: string) => errors[k];
  const a11y = (k: string) => ({ "aria-invalid": err(k) ? true : undefined, "aria-describedby": err(k) ? `${k}-error` : undefined });
  const Err = ({ k }: { k: string }) => (err(k) ? <p id={`${k}-error`} className="field-error">{err(k)}</p> : null);

  if (state === "done") {
    return (
      <div ref={topRef} role="status" className="card mx-auto flex max-w-2xl scroll-mt-40 flex-col items-start gap-4 p-8">
        <CheckCircle2 className="h-10 w-10 text-gold" aria-hidden />
        <h2 className="text-2xl">Thanks, your door request has been sent</h2>
        <p className="leading-relaxed">We&rsquo;ve received your design and will contact you with a free quote. Your choice: <strong className="text-navy">{summary.style}</strong>, {summary.size}, in <strong className="text-navy">{summary.colour}</strong>, {summary.windows.toLowerCase()}.</p>
        <button type="button" className="btn-outline" onClick={() => { startedAt.current = Date.now(); setState("idle"); }}>Design another door</button>
      </div>
    );
  }

  return (
    <div ref={topRef} className="grid scroll-mt-40 gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-10">
      {/* Live preview */}
      <div className="lg:sticky lg:top-[150px] lg:self-start">
        <div className="card overflow-hidden">
          <div className="bg-white p-3 sm:p-5">
            <DoorPreview config={cfg} idPrefix="main" className="mx-auto h-auto max-h-[440px] w-full" showDimensions
              onSlotClick={toggle} title={`${summary.style}, ${summary.size}, ${summary.colour}, ${summary.windows}`} />
            <p className="mt-2 flex items-center justify-center gap-2 text-xs font-semibold text-gold-dark">
              <MousePointerClick className="h-4 w-4" aria-hidden />Click any section of the door to insert or remove a window
            </p>
          </div>
          <div className="border-t border-line p-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-gold-dark">Your door</p>
            <h2 className="mt-1 text-2xl">{style.name}</h2>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3" aria-live="polite">
              {([["Size", summary.size], ["Quantity", summary.quantity], ["Colour", summary.colour], ["Windows", hasWindows ? `${cfg.windows.length} inserted` : "None"], ["Glass", summary.glass], ["Frame", summary.frame]] as const).map(([k, v]) => (
                <div key={k} className="rounded-md bg-sand px-3 py-2"><dt className="text-xs">{k}</dt><dd className="font-semibold text-navy">{v}</dd></div>
              ))}
            </dl>
            <p className="mt-3 text-xs">Illustrations are indicative. Window inserts, glass, and colours depend on the door model and size. Colours should be confirmed with a physical sample. We&rsquo;ll confirm everything with your quote.</p>
          </div>
        </div>
      </div>

      {/* All options on one page */}
      <div className="space-y-10">
        <section aria-labelledby="c-style">
          <Heading n="01 / Door design" id="c-style" title="Choose your door style" />
          <div role="radiogroup" aria-labelledby="c-style" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {DOOR_STYLES.map((s) => (
              <Option key={s.id} label={s.name} selected={cfg.style === s.id} onClick={() => update({ style: s.id })}>
                <DoorPreview config={{ ...cfg, style: s.id, width: 8, height: 7, windows: [] }} idPrefix={`st-${s.id}`} className="h-auto w-full rounded" />
                <span className="mt-2 block text-sm font-bold text-navy">{s.name}</span>
                <span className="block text-xs leading-snug">{s.tagline}</span>
              </Option>
            ))}
          </div>
          <p className="mt-3 text-sm">{style.description}</p>
        </section>

        <section aria-labelledby="c-size">
          <Heading n="02 / Dimensions" id="c-size" title="Door size" note="Most homes have an 8 x 7 ft single door or a 16 x 7 ft double door. Not sure? Choose the closest size and we'll measure on site." />
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="width" className="label">Width</label>
              <select id="width" className="input" value={cfg.width} onChange={(e) => update({ width: Number(e.target.value) })}>
                {DOOR_WIDTHS.map((w) => <option key={w} value={w}>{w} ft</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="height" className="label">Height</label>
              <select id="height" className="input" value={cfg.height} onChange={(e) => update({ height: Number(e.target.value) })}>
                {DOOR_HEIGHTS.map((h) => <option key={h} value={h}>{h} ft</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="quantity" className="label">Quantity</label>
              <select id="quantity" className="input" value={cfg.quantity} onChange={(e) => update({ quantity: Number(e.target.value) })}>
                {Array.from({ length: MAX_QUANTITY }, (_, i) => i + 1).map((q) => <option key={q} value={q}>{q}</option>)}
              </select>
            </div>
          </div>
        </section>

        <section aria-labelledby="c-colour">
          <Heading n="03 / Exterior colour" id="c-colour" title="Door colour" />
          <div role="radiogroup" aria-labelledby="c-colour" className="grid grid-cols-4 gap-x-2 gap-y-4">
            {DOOR_COLOURS.map((c) => (
              <button key={c.id} type="button" role="radio" aria-checked={cfg.colour === c.id} onClick={() => update({ colour: c.id })}
                className="group flex flex-col items-center gap-2 rounded-lg p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
                <Swatch hex={c.hex} wood={c.id === "woodgrain" ? c.line : undefined} selected={cfg.colour === c.id} />
                <span className="text-center text-xs font-semibold uppercase tracking-wide text-navy">{c.name}</span>
              </button>
            ))}
          </div>
        </section>

        <section aria-labelledby="c-win" className="space-y-6">
          <div>
            <Heading n="04 / Windows" id="c-win" title="Insert windows" note="Your door starts solid, with panels only. Pick a window style, then click the sections on the door where you want windows. Click again to remove one." />
            <div role="radiogroup" aria-label="Window style" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {types.map((t) => (
                <Option key={t.id} label={t.name} selected={cfg.windowType === t.id} onClick={() => update({ windowType: t.id, windows: cfg.windows.length ? cfg.windows : Array.from({ length: cols }, (_, c) => `0-${c}`) })}>
                  <DoorPreview config={{ ...cfg, width: 8, height: 7, windowType: t.id, windows: Array.from({ length: columnsFor(cfg.style, 8) }, (_, c) => `0-${c}`) }} idPrefix={`wt-${t.id}`} className="h-auto w-full rounded" />
                  <span className="mt-1.5 block text-xs font-bold text-navy">{t.code && <span className="text-gold-dark">{t.code} </span>}{t.name}</span>
                </Option>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-base">Window positions</h3>
            <p className="text-sm">Same as clicking the door: each square is one panel. Top row is the most popular.</p>
            <div className="mt-3 grid gap-1.5 rounded-lg border border-line bg-white p-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
              {Array.from({ length: ROWS }).map((_, r) => Array.from({ length: cols }).map((__, c) => {
                const key = `${r}-${c}`, on = cfg.windows.includes(key);
                return (
                  <button key={key} type="button" aria-pressed={on} aria-label={`Window in section ${r + 1}, panel ${c + 1}`} onClick={() => toggle(key)}
                    className={`h-8 rounded border-2 text-[0.65rem] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${on ? "border-gold bg-[#DCE6F0] text-navy" : "border-line bg-sand/60 text-transparent hover:border-gold/60"}`}>
                    {on ? "WIN" : "."}
                  </button>
                );
              }))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {["Top row", "Second row", "Third row"].map((label, r) => (
                <button key={label} type="button" className="btn-outline px-3 py-1.5 text-sm" onClick={() => fillRow(r)}>Fill {label.toLowerCase()}</button>
              ))}
              {hasWindows && <button type="button" className="btn-outline px-3 py-1.5 text-sm" onClick={() => update({ windows: [] })}><Eraser className="h-4 w-4" aria-hidden />Remove all windows</button>}
            </div>
          </div>

          <div className={hasWindows ? "" : "opacity-60"}>
            <h3 id="c-glass" className="text-base">Glass type</h3>
            {!hasWindows && <p className="text-sm">Insert a window to choose glass.</p>}
            <div role="radiogroup" aria-labelledby="c-glass" className="mt-3 grid gap-3 sm:grid-cols-3">
              {GLASS_TYPES.map((g) => (
                <Option key={g.id} label={g.name} selected={cfg.glass === g.id} onClick={() => update({ glass: g.id })} className="flex items-center gap-3 p-3">
                  <span className="h-10 w-12 shrink-0 rounded border-2 border-gold" style={{ background: g.id === "clear" ? "linear-gradient(#E3ECF5,#8EA4C0)" : g.id === "frosted" ? "repeating-linear-gradient(#F4F6F7 0 6px,#DDE2E5 6px 8px)" : "linear-gradient(135deg,#4A5059,#23272D)" }} />
                  <span><span className="block text-sm font-bold text-navy">{g.name}</span><span className="block text-xs">{g.description}</span></span>
                </Option>
              ))}
            </div>
            <p className="mt-2 text-xs">Tinted glass is not a privacy guarantee.</p>
          </div>

          <div className={hasWindows ? "" : "opacity-60"}>
            <h3 id="c-frame" className="text-base">Window frame colour</h3>
            <div role="radiogroup" aria-labelledby="c-frame" className="mt-3 grid grid-cols-4 gap-x-2 gap-y-4">
              {FRAME_COLOURS.map((f) => {
                const hex = f.hex || (DOOR_COLOURS.find((c) => c.id === cfg.colour)?.hex ?? "#FFFFFF");
                return (
                  <button key={f.id} type="button" role="radio" aria-checked={cfg.frame === f.id} onClick={() => update({ frame: f.id })}
                    className="group flex flex-col items-center gap-2 rounded-lg p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
                    <Swatch hex={hex} selected={cfg.frame === f.id} />
                    <span className="text-center text-xs font-semibold uppercase tracking-wide text-navy">{f.id === "match" ? "Match door" : f.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <form ref={formRef} onSubmit={submit} noValidate aria-labelledby="c-details" className="card grid gap-5 p-6 sm:grid-cols-2" aria-busy={state === "sending"}>
          <div className="sm:col-span-2">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold-dark">05 / Get your quote</p>
            <h2 id="c-details" className="text-xl">Send us your design</h2>
            <p className="mt-1 text-sm">We&rsquo;ll reply with a free quote. No call-out fees.</p>
          </div>
          {formError && (
            <div role="alert" className="flex items-start gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800 sm:col-span-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />{formError}
            </div>
          )}
          <div className="sm:col-span-2">
            <label htmlFor="name" className="label">Full name <span aria-hidden className="text-gold-dark">*</span></label>
            <input id="name" name="name" autoComplete="name" maxLength={100} className="input" {...a11y("name")} /><Err k="name" />
          </div>
          <div>
            <label htmlFor="email" className="label">Email <span aria-hidden className="text-gold-dark">*</span></label>
            <input id="email" name="email" type="email" autoComplete="email" maxLength={200} className="input" {...a11y("email")} /><Err k="email" />
          </div>
          <div>
            <label htmlFor="phone" className="label">Phone <span aria-hidden className="text-gold-dark">*</span></label>
            <input id="phone" name="phone" type="tel" autoComplete="tel" maxLength={25} className="input" {...a11y("phone")} /><Err k="phone" />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="area" className="label">Area <span aria-hidden className="text-gold-dark">*</span></label>
            <select id="area" name="area" defaultValue="" className="input" {...a11y("area")}>
              <option value="" disabled>Choose your area</option>
              {[...areas, "Other (nearby area)"].map((a) => <option key={a} value={a}>{a}</option>)}
            </select><Err k="area" />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="message" className="label">Anything else? <span className="font-normal text-body">(optional)</span></label>
            <textarea id="message" name="message" rows={3} maxLength={3000} className="input resize-y" placeholder="Opener needs, timing, or questions." />
          </div>
          <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
            <label htmlFor="website">Website</label><input id="website" name="website" tabIndex={-1} autoComplete="off" />
          </div>
          {err("config") && <p className="field-error sm:col-span-2">{err("config")}</p>}
          <div className="rounded-md bg-sand p-4 text-sm sm:col-span-2">
            <p className="font-bold text-navy">Sending: {cfg.quantity} x {summary.style} &middot; {summary.size} &middot; {summary.colour}</p>
            <p className="mt-1">{summary.windows}{hasWindows ? ` · ${summary.glass} glass · ${summary.frame} frame` : ""}</p>
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="btn-gold w-full px-8" disabled={state === "sending"}>
              {state === "sending" && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              {state === "sending" ? "Sending..." : "Save Door & Request My Free Quote"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
