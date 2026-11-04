import { connectDB } from "@/lib/db";
import { Testimonial } from "@/lib/models";
import TestimonialsManager, { type TItem } from "./TestimonialsManager";

export const dynamic = "force-dynamic";

export default async function TestimonialsAdmin() {
  await connectDB();
  const docs = await Testimonial.find().sort({ order: 1, createdAt: -1 }).lean<
    { _id: unknown; name: string; area?: string; service?: string; quote: string; published: boolean; order?: number }[]
  >();
  const items: TItem[] = docs.map((d) => ({
    id: String(d._id), name: d.name, area: d.area || "", service: d.service || "", quote: d.quote, published: !!d.published, order: d.order ?? 0,
  }));
  return <TestimonialsManager items={items} />;
}
