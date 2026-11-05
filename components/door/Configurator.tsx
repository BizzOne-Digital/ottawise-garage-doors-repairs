"use client";

import { AlertCircle, ArrowLeft, ArrowRight, Check, CheckCircle2, Loader2 } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import DoorPreview from "./DoorPreview";
import {
  DECORATIVE_DESIGNS, DEFAULT_CONFIG, DOOR_COLOURS, DOOR_SIZES, DOOR_STYLES, GLASS_TYPES, WINDOW_PATTERNS,
  describeConfig, type DoorConfig,
} from "@/lib/doorCatalog";
import { doorQuoteSchema, fieldErrors } from "@/lib/validation";

const STEPS = ["Door style", "Colour", "Windows", "Your details"] as const;

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

export default function Configurator({ areas, initialStyle }: { areas: string[]; initialStyle?: string }) {
  const [cfg, setCfg] = useState<DoorConfig>(() => ({
    ...DEFAULT_CONFIG,
    ...(DOOR_STYLES.some((s) => s.id === initialStyle) ? { style: initialStyle as DoorConfig["style"] } : {}),
  }));
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [formError, setFormError] = useState("");
  const startedAt = useRef(Date.now());
  const formRef = useRef<HTMLFormElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const summary = useMemo(() => describeConfig(cfg), [cfg]);
  const set = <K extends keyof DoorConfig>(k: K, v: DoorConfig[K]) => setCfg((c) => ({ ...c, [k]: v }));
  const style = DOOR_STYLES.find((s) => s.id === cfg.style)!;
  const hasWindows = cfg.pattern !== "none" || cfg.decor !== "none";

  const go = (n: number) => {
    setStep(n);
    panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "sending") return;
    const fd = new FormData(e.currentTarget);
    const values = {
      name: String(fd.get("name") || ""), email: String(fd.get("email") || ""), phone: String(fd.get("phone") || ""),
      area: String(fd.get("area") || ""), doorSize: String(fd.get("doorSize") || ""), message: String(fd.get("message") || ""),
      config: cfg,
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
      if (res.ok && j.success) { setState("done"); return; }
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

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-10">
      {/* Live preview */}
      <div className="lg:sticky lg:top-[150px] lg:self-start">
        <div className="card overflow-hidden">
          <div className="bg-navy-deep p-4 sm:p-6">
            <DoorPreview config={cfg} idPrefix="main" className="h-auto w-full" title={`${summary.style} in ${summary.colour}, ${summary.windows}`} />
          </div>
          <div className="p-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-gold-dark">Your door</p>
            <h2 className="mt-1 text-2xl">{style.name}</h2>
            <p className="mt-1 text-sm font-semibold text-gold-dark">{style.tagline}</p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4" aria-live="polite">
              {([["Style", summary.style], ["Colour", summary.colour], ["Windows", summary.windows], ["Glass", summary.glass]] as const).map(([k, v]) => (
                <div key={k} className="rounded-md bg-sand px-3 py-2"><dt className="text-xs">{k}</dt><dd className="font-semibold text-navy">{v}</dd></div>
              ))}
            </dl>
            <p className="mt-4 text-xs">Illustrations are indicative. Patterns, decorative designs, glass, and colours depend on the door model and size. Colours should be confirmed with a physical sample. We&rsquo;ll confirm your selection with your quote.</p>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div ref={panelRef} className="scroll-mt-40">
        <ol className="mb-6 grid grid-cols-4 gap-2" aria-label="Configurator steps">
          {STEPS.map((label, i) => (
            <li key={label}>
              <button type="button" onClick={() => state !== "done" && go(i)} aria-current={step === i ? "step" : undefined}
                className={`w-full border-t-[3px] pt-2 text-left text-xs font-bold uppercase tracking-wide sm:text-[0.8rem] ${step === i ? "border-gold text-navy" : i < step ? "border-navy/40 text-navy/70" : "border-line text-body/70"}`}>
                <span className="block text-gold-dark">0{i + 1}</span>{label}
              </button>
            </li>
          ))}
        </ol>

        {state === "done" ? (
          <div role="status" className="card flex flex-col items-start gap-4 p-8">
            <CheckCircle2 className="h-10 w-10 text-gold" aria-hidden />
            <h2 className="text-2xl">Thanks, your door request has been sent</h2>
            <p className="leading-relaxed">We&rsquo;ve received your selections and will contact you with a free quote. Your choice: <strong className="text-navy">{summary.style}</strong> in <strong className="text-navy">{summary.colour}</strong>, {summary.windows.toLowerCase()}.</p>
            <button type="button" className="btn-outline" onClick={() => { startedAt.current = Date.now(); setState("idle"); setStep(0); }}>Design another door</button>
          </div>
        ) : (
          <>
            {step === 0 && (
              <section aria-labelledby="s1">
                <h2 id="s1" className="text-xl">Choose a door style</h2>
                <div role="radiogroup" aria-labelledby="s1" className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {DOOR_STYLES.map((s) => (
                    <Option key={s.id} label={s.name} selected={cfg.style === s.id} onClick={() => set("style", s.id)}>
                      <DoorPreview config={{ ...cfg, style: s.id, pattern: "none", decor: "none" }} idPrefix={`st-${s.id}`} className="h-auto w-full rounded" />
                      <span className="mt-2 block text-sm font-bold text-navy">{s.name}</span>
                      <span className="block text-xs leading-snug">{s.tagline}</span>
                    </Option>
                  ))}
                </div>
                <p className="mt-4 text-sm">{style.description} R20 polyurethane insulation options.</p>
              </section>
            )}

            {step === 1 && (
              <section aria-labelledby="s2">
                <h2 id="s2" className="text-xl">Choose a colour</h2>
                <p className="mt-1 text-sm">Eight colour options. We&rsquo;ll confirm availability for your model.</p>
                <div role="radiogroup" aria-labelledby="s2" className="mt-5 grid grid-cols-4 gap-x-3 gap-y-5">
                  {DOOR_COLOURS.map((c) => (
                    <button key={c.id} type="button" role="radio" aria-checked={cfg.colour === c.id} onClick={() => set("colour", c.id)}
                      className="group flex flex-col items-center gap-2 rounded-lg p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
                      <span className={`relative h-14 w-14 rounded-full border-2 shadow-inner sm:h-16 sm:w-16 ${cfg.colour === c.id ? "border-gold ring-2 ring-gold ring-offset-2" : "border-line group-hover:border-gold/60"}`}
                        style={{ background: c.id === "woodgrain" ? `repeating-linear-gradient(170deg, ${c.hex} 0 6px, ${c.line} 6px 8px)` : c.hex }}>
                        {cfg.colour === c.id && <Check className={`absolute inset-0 m-auto h-5 w-5 ${["white", "almond", "sandstone"].includes(c.id) ? "text-navy" : "text-white"}`} strokeWidth={3} aria-hidden />}
                      </span>
                      <span className="text-sm font-semibold text-navy">{c.name}</span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {step === 2 && (
              <section aria-labelledby="s3" className="space-y-7">
                <div>
                  <h2 id="s3" className="text-xl">Window pattern</h2>
                  <div role="radiogroup" aria-labelledby="s3" className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {WINDOW_PATTERNS.map((p) => (
                      <Option key={p.id} label={p.name} selected={cfg.decor === "none" && cfg.pattern === p.id} onClick={() => setCfg((c) => ({ ...c, pattern: p.id, decor: "none" }))}>
                        <DoorPreview config={{ ...cfg, pattern: p.id, decor: "none" }} idPrefix={`wp-${p.id}`} className="h-auto w-full rounded" />
                        <span className="mt-1.5 block text-xs font-bold text-navy">{p.code && <span className="text-gold-dark">{p.code} </span>}{p.name}</span>
                      </Option>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 id="dec" className="text-lg">Decorative window design <span className="text-sm font-normal text-body">(optional, top row)</span></h3>
                  <div role="radiogroup" aria-labelledby="dec" className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {DECORATIVE_DESIGNS.filter((d) => d.id !== "none").map((d) => (
                      <Option key={d.id} label={`${d.code} ${d.name}`} selected={cfg.decor === d.id} onClick={() => set("decor", cfg.decor === d.id ? "none" : d.id)}>
                        <DoorPreview config={{ ...cfg, decor: d.id }} idPrefix={`dd-${d.id}`} className="h-auto w-full rounded" />
                        <span className="mt-1.5 block text-xs font-bold text-navy"><span className="text-gold-dark">{d.code}</span> {d.name}</span>
                      </Option>
                    ))}
                  </div>
                  {cfg.decor !== "none" && <button type="button" className="mt-3 text-sm font-semibold text-gold-dark hover:text-navy" onClick={() => set("decor", "none")}>Remove decorative design</button>}
                </div>

                <div className={hasWindows ? "" : "opacity-50"}>
                  <h3 id="gl" className="text-lg">Glass</h3>
                  {!hasWindows && <p className="text-sm">Choose a window pattern to select glass.</p>}
                  <div role="radiogroup" aria-labelledby="gl" className="mt-3 grid gap-3 sm:grid-cols-3">
                    {GLASS_TYPES.map((g) => (
                      <Option key={g.id} label={g.name} selected={cfg.glass === g.id} onClick={() => hasWindows && set("glass", g.id)} className="flex items-center gap-3 p-3">
                        <span className="h-10 w-12 shrink-0 rounded border-2 border-gold" style={{ background: g.id === "clear" ? "linear-gradient(#E3ECF5,#8EA4C0)" : g.id === "frosted" ? "repeating-linear-gradient(#F4F6F7 0 6px,#DDE2E5 6px 8px)" : "linear-gradient(135deg,#4A5059,#23272D)" }} />
                        <span><span className="block text-sm font-bold text-navy">{g.name}</span><span className="block text-xs">{g.description}</span></span>
                      </Option>
                    ))}
                  </div>
                  <p className="mt-2 text-xs">Tinted glass is not a privacy guarantee.</p>
                </div>
              </section>
            )}

            {step === 3 && (
              <form ref={formRef} onSubmit={submit} noValidate aria-labelledby="s4" className="card grid gap-5 p-6 sm:grid-cols-2" aria-busy={state === "sending"}>
                <div className="sm:col-span-2">
                  <h2 id="s4" className="text-xl">Your details</h2>
                  <p className="mt-1 text-sm">Send us your selections for a free quote. No call-out fees.</p>
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
                <div>
                  <label htmlFor="area" className="label">Area <span aria-hidden className="text-gold-dark">*</span></label>
                  <select id="area" name="area" defaultValue="" className="input" {...a11y("area")}>
                    <option value="" disabled>Choose your area</option>
                    {[...areas, "Other (nearby area)"].map((a) => <option key={a} value={a}>{a}</option>)}
                  </select><Err k="area" />
                </div>
                <div>
                  <label htmlFor="doorSize" className="label">Door size <span aria-hidden className="text-gold-dark">*</span></label>
                  <select id="doorSize" name="doorSize" defaultValue="" className="input" {...a11y("doorSize")}>
                    <option value="" disabled>Choose a size</option>
                    {DOOR_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select><Err k="doorSize" />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="message" className="label">Anything else? <span className="font-normal text-body">(optional)</span></label>
                  <textarea id="message" name="message" rows={4} maxLength={3000} className="input resize-y" placeholder="Number of doors, opener needs, timing, or questions." />
                </div>
                <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                  <label htmlFor="website">Website</label><input id="website" name="website" tabIndex={-1} autoComplete="off" />
                </div>
                <div className="rounded-md bg-sand p-4 text-sm sm:col-span-2">
                  <p className="font-bold text-navy">Sending: {summary.style} &middot; {summary.colour} &middot; {summary.windows}{hasWindows ? ` · ${summary.glass} glass` : ""}</p>
                </div>
                <div className="flex flex-col-reverse gap-3 sm:col-span-2 sm:flex-row sm:justify-between">
                  <button type="button" className="btn-outline" onClick={() => go(2)}><ArrowLeft className="h-4 w-4" aria-hidden />Back</button>
                  <button type="submit" className="btn-gold px-8" disabled={state === "sending"}>
                    {state === "sending" && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                    {state === "sending" ? "Sending..." : "Request My Free Quote"}
                  </button>
                </div>
              </form>
            )}

            {step < 3 && (
              <div className="mt-7 flex justify-between gap-3">
                {step > 0 ? <button type="button" className="btn-outline" onClick={() => go(step - 1)}><ArrowLeft className="h-4 w-4" aria-hidden />Back</button> : <span />}
                <button type="button" className="btn-navy px-7" onClick={() => go(step + 1)}>Next: {STEPS[step + 1]}<ArrowRight className="h-4 w-4" aria-hidden /></button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
