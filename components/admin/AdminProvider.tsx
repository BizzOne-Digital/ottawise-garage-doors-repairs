"use client";

import { AlertTriangle, CheckCircle2, X } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

type Toast = { id: number; kind: "success" | "error"; message: string };
type ConfirmOpts = { title: string; body?: string; confirmLabel?: string; danger?: boolean };
type Ctx = {
  csrf: string;
  toast: (kind: Toast["kind"], message: string) => void;
  confirm: (o: ConfirmOpts) => Promise<boolean>;
  api: <T = Record<string, unknown>>(url: string, init?: RequestInit & { json?: unknown }) => Promise<{ ok: boolean; status: number; data: T & { success?: boolean; error?: string; fields?: Record<string, string> } }>;
};

const AdminCtx = createContext<Ctx | null>(null);
export const useAdmin = () => {
  const c = useContext(AdminCtx);
  if (!c) throw new Error("useAdmin must be used inside AdminProvider");
  return c;
};

export default function AdminProvider({ csrf, children }: { csrf: string; children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [dialog, setDialog] = useState<(ConfirmOpts & { resolve: (v: boolean) => void }) | null>(null);
  const confirmBtn = useRef<HTMLButtonElement>(null);
  const nextId = useRef(1);

  const toast = useCallback((kind: Toast["kind"], message: string) => {
    const id = nextId.current++;
    setToasts((t) => [...t, { id, kind, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), kind === "error" ? 7000 : 4000);
  }, []);

  const confirm = useCallback((o: ConfirmOpts) => new Promise<boolean>((resolve) => setDialog({ ...o, resolve })), []);

  /** fetch wrapper that attaches the CSRF header and parses JSON safely. */
  const api: Ctx["api"] = useCallback(async (url, init = {}) => {
    const headers = new Headers(init.headers);
    headers.set("x-csrf-token", csrf);
    let body = init.body;
    if (init.json !== undefined) {
      headers.set("Content-Type", "application/json");
      body = JSON.stringify(init.json);
    }
    try {
      const res = await fetch(url, { ...init, headers, body, credentials: "same-origin" });
      if (res.status === 401) {
        window.location.href = `/admin/login?next=${encodeURIComponent(window.location.pathname)}`;
      }
      const data = await res.json().catch(() => ({ error: res.status === 413 ? "The file is too large for the server to accept." : `Request failed (${res.status})` }));
      return { ok: res.ok, status: res.status, data };
    } catch {
      return { ok: false, status: 0, data: { error: "Network error. Check your connection and try again." } as never };
    }
  }, [csrf]);

  useEffect(() => {
    if (!dialog) return;
    confirmBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { dialog.resolve(false); setDialog(null); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [dialog]);

  const close = (v: boolean) => { dialog?.resolve(v); setDialog(null); };

  return (
    <AdminCtx.Provider value={{ csrf, toast, confirm, api }}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[min(92vw,380px)] flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id} role={t.kind === "error" ? "alert" : "status"} className={`pointer-events-auto flex items-start gap-3 rounded-lg border bg-white px-4 py-3 text-sm shadow-card ${t.kind === "error" ? "border-red-200" : "border-line"}`}>
            {t.kind === "error" ? <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-hidden /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-700" aria-hidden />}
            <p className="flex-1 font-medium text-navy">{t.message}</p>
            <button type="button" aria-label="Dismiss" onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))}><X className="h-4 w-4" aria-hidden /></button>
          </div>
        ))}
      </div>
      {dialog && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-navy/40 p-4" onClick={() => close(false)}>
          <div role="alertdialog" aria-modal="true" aria-labelledby="dlg-title" aria-describedby="dlg-body" className="w-full max-w-md rounded-xl bg-white p-6 shadow-card" onClick={(e) => e.stopPropagation()}>
            <h2 id="dlg-title" className="text-lg">{dialog.title}</h2>
            {dialog.body && <p id="dlg-body" className="mt-2 text-sm">{dialog.body}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" className="btn-outline min-h-[40px] px-4" onClick={() => close(false)}>Cancel</button>
              <button ref={confirmBtn} type="button" className={`btn min-h-[40px] px-4 text-white ${dialog.danger ? "bg-red-700 hover:bg-red-800" : "bg-navy hover:bg-navy-deep"}`} onClick={() => close(true)}>
                {dialog.confirmLabel || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminCtx.Provider>
  );
}
