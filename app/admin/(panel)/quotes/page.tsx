import RequestsTable from "@/components/admin/RequestsTable";
import { DoorQuote } from "@/lib/models";

export const dynamic = "force-dynamic";

export default async function QuotesPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; page?: string }> }) {
  return <RequestsTable model={DoorQuote} kind="quotes" basePath="/admin/quotes" title="Door configurator requests" sp={await searchParams} />;
}
