import { redirect } from "next/navigation";
import SafeImage from "@/components/SafeImage";
import { getAdmin } from "@/lib/auth";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const safeNext = typeof next === "string" && next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin";
  const admin = await getAdmin().catch(() => null);
  if (admin) redirect(safeNext);
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="relative mx-auto mb-6 h-28 w-28">
          <SafeImage src="/brand/logo.png" alt="Ottawise Garage Doors" fill sizes="112px" className="object-contain" priority />
        </div>
        <div className="card p-7">
          <h1 className="text-2xl">Admin sign in</h1>
          <p className="mt-1 text-sm">Authorised staff only.</p>
          <LoginForm next={safeNext} />
        </div>
      </div>
    </main>
  );
}
