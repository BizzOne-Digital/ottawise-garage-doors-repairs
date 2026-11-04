"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";

export default function LoginForm({ next }: { next: string }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "").trim();
    const password = String(fd.get("password") || "");
    if (!email || !password) return setError("Enter your email and password.");
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok && j.success) {
        window.location.assign(next);
        return;
      }
      setError(j.error || "Sign in failed");
    } catch {
      setError("Network error. Please try again.");
    }
    setBusy(false);
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
      {error && <p role="alert" className="flex items-start gap-2 rounded-md bg-red-50 px-3 py-2.5 text-sm font-medium text-red-800"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />{error}</p>}
      <div>
        <label htmlFor="email" className="label">Email</label>
        <input id="email" name="email" type="email" autoComplete="username" required className="input" />
      </div>
      <div>
        <label htmlFor="password" className="label">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="input" />
      </div>
      <button type="submit" className="btn-navy w-full" disabled={busy}>
        {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}{busy ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
