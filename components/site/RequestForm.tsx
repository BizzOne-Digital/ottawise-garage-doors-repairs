"use client";

import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { TIME_WINDOWS } from "@/lib/constants";
import { bookingSchema, contactSchema, fieldErrors, todayInToronto } from "@/lib/validation";

type Mode = "contact" | "booking";
type Props = { mode: Mode; services: string[]; areas: string[]; successMessage: string; initialService?: string };

const FIELDS: Record<Mode, string[]> = {
  contact: ["name", "email", "phone", "service", "area", "message"],
  booking: ["name", "email", "phone", "service", "area", "preferredDate", "timeWindow", "message"],
};

export default function RequestForm({ mode, services, areas, successMessage, initialService }: Props) {
  const startedAt = useRef(Date.now());
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [formError, setFormError] = useState("");
  const today = useMemo(() => todayInToronto(), []);
  const svcOptions = [...services, "Not sure / Other"];
  const areaOptions = [...areas, "Other (nearby area)"];
  const defaultService = initialService && services.includes(initialService) ? initialService : "";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "sending") return;
    const fd = new FormData(e.currentTarget);
    const values: Record<string, string> = {};
    for (const k of FIELDS[mode]) values[k] = String(fd.get(k) ?? "");
    const schema = mode === "contact" ? contactSchema : bookingSchema;
    const parsed = schema.safeParse(values);
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
      const res = await fetch(`/api/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...parsed.data, website: String(fd.get("website") ?? ""), _t: startedAt.current }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success) {
        setState("done");
        formRef.current?.reset();
        return;
      }
      if (json.fields) setErrors(json.fields);
      setFormError(json.error || "Something went wrong. Please try again or call us.");
      setState("error");
    } catch {
      setFormError("We couldn't reach the server. Check your connection and try again, or call us.");
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div role="status" className="card flex flex-col items-start gap-4 p-8">
        <CheckCircle2 className="h-10 w-10 text-gold" aria-hidden />
        <h2 className="text-2xl">{mode === "booking" ? "Request received" : "Message sent"}</h2>
        <p className="leading-relaxed">{successMessage}</p>
        <button type="button" className="btn-outline" onClick={() => { startedAt.current = Date.now(); setState("idle"); }}>
          Send another {mode === "booking" ? "request" : "message"}
        </button>
      </div>
    );
  }

  const err = (k: string) => errors[k];
  const a11y = (k: string) => ({ "aria-invalid": err(k) ? true : undefined, "aria-describedby": err(k) ? `${k}-error` : undefined });
  const Err = ({ k }: { k: string }) => (err(k) ? <p id={`${k}-error`} className="field-error">{err(k)}</p> : null);
  const sending = state === "sending";

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="card grid gap-5 p-6 sm:grid-cols-2 sm:p-8" aria-busy={sending}>
      {formError && (
        <div role="alert" className="flex items-start gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800 sm:col-span-2">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />{formError}
        </div>
      )}
      <div className="sm:col-span-2">
        <label htmlFor="name" className="label">{mode === "booking" ? "Full name" : "Name"} <span aria-hidden className="text-gold-dark">*</span></label>
        <input id="name" name="name" autoComplete="name" required maxLength={100} className="input" {...a11y("name")} />
        <Err k="name" />
      </div>
      <div>
        <label htmlFor="email" className="label">Email <span aria-hidden className="text-gold-dark">*</span></label>
        <input id="email" name="email" type="email" autoComplete="email" required maxLength={200} className="input" {...a11y("email")} />
        <Err k="email" />
      </div>
      <div>
        <label htmlFor="phone" className="label">Phone <span aria-hidden className="text-gold-dark">*</span></label>
        <input id="phone" name="phone" type="tel" autoComplete="tel" required maxLength={25} className="input" {...a11y("phone")} />
        <Err k="phone" />
      </div>
      <div>
        <label htmlFor="service" className="label">Service {mode === "booking" ? "" : "required"} <span aria-hidden className="text-gold-dark">*</span></label>
        <select id="service" name="service" required defaultValue={defaultService} className="input" {...a11y("service")}>
          <option value="" disabled>Choose a service</option>
          {svcOptions.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <Err k="service" />
      </div>
      <div>
        <label htmlFor="area" className="label">Area <span aria-hidden className="text-gold-dark">*</span></label>
        <select id="area" name="area" required defaultValue="" className="input" {...a11y("area")}>
          <option value="" disabled>Choose your area</option>
          {areaOptions.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <Err k="area" />
      </div>
      {mode === "booking" && (
        <>
          <div>
            <label htmlFor="preferredDate" className="label">Preferred date <span aria-hidden className="text-gold-dark">*</span></label>
            <input id="preferredDate" name="preferredDate" type="date" min={today} required className="input" {...a11y("preferredDate")} />
            <Err k="preferredDate" />
          </div>
          <div>
            <label htmlFor="timeWindow" className="label">Preferred time window <span aria-hidden className="text-gold-dark">*</span></label>
            <select id="timeWindow" name="timeWindow" required defaultValue="" className="input" {...a11y("timeWindow")}>
              <option value="" disabled>Choose a time window</option>
              {TIME_WINDOWS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            <Err k="timeWindow" />
          </div>
          <p className="-mt-2 text-xs sm:col-span-2">Dates and times are in Ottawa time (Eastern).</p>
        </>
      )}
      <div className="sm:col-span-2">
        <label htmlFor="message" className="label">
          Message {mode === "contact" ? <span aria-hidden className="text-gold-dark">*</span> : <span className="font-normal text-body">(optional)</span>}
        </label>
        <textarea id="message" name="message" rows={5} maxLength={3000} className="input resize-y" placeholder="What is your garage door doing? Any details help." {...a11y("message")} />
        <Err k="message" />
      </div>
      {/* Honeypot: hidden from people and assistive tech. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs">Fields marked * are required. We only use your details to respond to your request.</p>
        <button type="submit" className="btn-gold px-8" disabled={sending}>
          {sending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {sending ? "Sending..." : mode === "booking" ? "Send Booking Request" : "Send Message"}
        </button>
      </div>
    </form>
  );
}
