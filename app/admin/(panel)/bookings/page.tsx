import RequestsTable from "@/components/admin/RequestsTable";
import { BookingRequest } from "@/lib/models";

export const dynamic = "force-dynamic";

export default async function BookingsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; page?: string }> }) {
  return <RequestsTable model={BookingRequest} kind="bookings" basePath="/admin/bookings" title="Booking requests" sp={await searchParams} />;
}
