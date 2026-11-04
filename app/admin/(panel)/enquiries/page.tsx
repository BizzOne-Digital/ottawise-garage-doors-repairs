import RequestsTable from "@/components/admin/RequestsTable";
import { ContactEnquiry } from "@/lib/models";

export const dynamic = "force-dynamic";

export default async function EnquiriesPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; page?: string }> }) {
  return <RequestsTable model={ContactEnquiry} kind="enquiries" basePath="/admin/enquiries" title="Contact enquiries" sp={await searchParams} />;
}
