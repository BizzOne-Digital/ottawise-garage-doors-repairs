import { isValidObjectId } from "mongoose";
import { notFound } from "next/navigation";
import { toService } from "@/lib/content";
import { connectDB } from "@/lib/db";
import { Service } from "@/lib/models";
import ServiceForm from "../ServiceForm";

export const dynamic = "force-dynamic";

export default async function EditService({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isValidObjectId(id)) notFound();
  await connectDB();
  const doc = await Service.findById(id).lean();
  if (!doc) notFound();
  return <ServiceForm initial={toService(doc)} />;
}
