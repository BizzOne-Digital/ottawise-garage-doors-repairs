import { notFound } from "next/navigation";
import { getPageFresh } from "@/lib/adminData";
import { PAGE_KEYS, type PageKey } from "@/lib/defaults";
import PageEditor from "./PageEditor";

export const dynamic = "force-dynamic";

export default async function EditPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (!(PAGE_KEYS as readonly string[]).includes(key)) notFound();
  const page = await getPageFresh(key as PageKey);
  return <PageEditor initial={page} />;
}
