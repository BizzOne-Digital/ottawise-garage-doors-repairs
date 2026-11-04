"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useId } from "react";

export function AdminHeader({ title, description, children }: { title: string; description?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl sm:text-[1.75rem]">{title}</h1>
        {description && <p className="mt-1 text-sm">{description}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

export function Panel({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="card p-5 sm:p-6">
      {title && <h2 className="mb-5 text-lg">{title}</h2>}
      <div className="grid gap-5">{children}</div>
    </section>
  );
}

type TextProps = { label: string; value: string; onChange: (v: string) => void; error?: string; help?: string; multiline?: boolean; type?: string; required?: boolean; maxLength?: number };
export function TextField({ label, value, onChange, error, help, multiline, type = "text", required, maxLength }: TextProps) {
  const id = useId();
  const describedBy = [error ? `${id}-err` : "", help ? `${id}-help` : ""].filter(Boolean).join(" ") || undefined;
  const common = { id, value, required, maxLength, className: "input", "aria-invalid": error ? true : undefined, "aria-describedby": describedBy };
  return (
    <div>
      <label htmlFor={id} className="label">{label}{required && <span className="text-gold-dark"> *</span>}</label>
      {multiline ? (
        <textarea {...common} rows={4} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input {...common} type={type} onChange={(e) => onChange(e.target.value)} />
      )}
      {help && <p id={`${id}-help`} className="mt-1 text-xs">{help}</p>}
      {error && <p id={`${id}-err`} className="field-error">{error}</p>}
    </div>
  );
}

export function Toggle({ label, checked, onChange, help }: { label: string; checked: boolean; onChange: (v: boolean) => void; help?: string }) {
  const id = useId();
  return (
    <div className="flex items-start gap-3">
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 h-4 w-4 accent-[#BF944F]" />
      <div>
        <label htmlFor={id} className="text-sm font-semibold text-navy">{label}</label>
        {help && <p className="text-xs">{help}</p>}
      </div>
    </div>
  );
}

const move = <T,>(arr: T[], i: number, d: number) => {
  const next = [...arr];
  const j = i + d;
  if (j < 0 || j >= next.length) return next;
  [next[i], next[j]] = [next[j], next[i]];
  return next;
};

export function StringListField({ label, value, onChange, help, addLabel = "Add item" }: { label: string; value: string[]; onChange: (v: string[]) => void; help?: string; addLabel?: string }) {
  return (
    <fieldset>
      <legend className="label">{label}</legend>
      {help && <p className="-mt-1 mb-2 text-xs">{help}</p>}
      <div className="space-y-2">
        {value.map((v, i) => (
          <div key={i} className="flex gap-2">
            <input aria-label={`${label} ${i + 1}`} className="input" value={v} onChange={(e) => onChange(value.map((x, j) => (j === i ? e.target.value : x)))} />
            <RowButtons onUp={() => onChange(move(value, i, -1))} onDown={() => onChange(move(value, i, 1))} onRemove={() => onChange(value.filter((_, j) => j !== i))} />
          </div>
        ))}
      </div>
      <button type="button" className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-dark hover:text-navy" onClick={() => onChange([...value, ""])}>
        <Plus className="h-4 w-4" aria-hidden />{addLabel}
      </button>
    </fieldset>
  );
}

type Link = { label: string; href: string };
export function LinkListField({ label, value, onChange }: { label: string; value: Link[]; onChange: (v: Link[]) => void }) {
  return (
    <fieldset>
      <legend className="label">{label}</legend>
      <div className="space-y-2">
        {value.map((l, i) => (
          <div key={i} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <input aria-label={`${label} ${i + 1} label`} placeholder="Label" className="input" value={l.label} onChange={(e) => onChange(value.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
            <input aria-label={`${label} ${i + 1} link`} placeholder="/page" className="input" value={l.href} onChange={(e) => onChange(value.map((x, j) => (j === i ? { ...x, href: e.target.value } : x)))} />
            <RowButtons onUp={() => onChange(move(value, i, -1))} onDown={() => onChange(move(value, i, 1))} onRemove={() => onChange(value.filter((_, j) => j !== i))} />
          </div>
        ))}
      </div>
      <button type="button" className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-dark hover:text-navy" onClick={() => onChange([...value, { label: "", href: "/" }])}>
        <Plus className="h-4 w-4" aria-hidden />Add link
      </button>
    </fieldset>
  );
}

function RowButtons({ onUp, onDown, onRemove }: { onUp: () => void; onDown: () => void; onRemove: () => void }) {
  const cls = "flex h-[42px] w-10 items-center justify-center rounded-md border border-line bg-white hover:bg-sand";
  return (
    <div className="flex gap-1">
      <button type="button" className={cls} aria-label="Move up" onClick={onUp}><ArrowUp className="h-4 w-4" aria-hidden /></button>
      <button type="button" className={cls} aria-label="Move down" onClick={onDown}><ArrowDown className="h-4 w-4" aria-hidden /></button>
      <button type="button" className={`${cls} text-red-700`} aria-label="Remove" onClick={onRemove}><Trash2 className="h-4 w-4" aria-hidden /></button>
    </div>
  );
}

export function SaveBar({ busy, disabled, dirty, onSave, label = "Save changes" }: { busy: boolean; disabled?: boolean; dirty?: boolean; onSave?: () => void; label?: string }) {
  return (
    <div className="sticky bottom-0 z-20 -mx-4 mt-6 flex items-center justify-end gap-4 border-t border-line bg-white/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-lg sm:border">
      {dirty && <span className="text-sm font-medium text-gold-dark">Unsaved changes</span>}
      <button type={onSave ? "button" : "submit"} onClick={onSave} className="btn-navy" disabled={busy || disabled}>
        {busy ? "Saving..." : label}
      </button>
    </div>
  );
}

export const STATUS_STYLES: Record<string, string> = {
  New: "bg-gold/15 text-gold-dark",
  Contacted: "bg-blue-50 text-blue-800",
  Scheduled: "bg-violet-50 text-violet-800",
  Completed: "bg-green-50 text-green-800",
  Archived: "bg-gray-100 text-gray-700",
};
