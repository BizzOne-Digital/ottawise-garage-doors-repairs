import { redirect } from "next/navigation";
import AdminProvider from "@/components/admin/AdminProvider";
import AdminShell from "@/components/admin/AdminShell";
import { getAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Server-side session validation for every admin page (the middleware is only a fast redirect). */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdmin().catch(() => null);
  if (!admin) redirect("/admin/login");
  return (
    <AdminProvider csrf={admin.csrf}>
      <AdminShell name={admin.name} email={admin.email}>{children}</AdminShell>
    </AdminProvider>
  );
}
