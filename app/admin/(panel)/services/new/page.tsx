import ServiceForm from "../ServiceForm";

export default function NewService() {
  return (
    <ServiceForm initial={{
      slug: "", title: "", cardTitle: "", summary: "", description: "", reasons: [], image: "", imageAlt: "",
      featured: false, published: false, order: 100, seoTitle: "", seoDescription: "",
    }} />
  );
}
