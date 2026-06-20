import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getCommerceProvider } from "@/lib/commerce";

export default async function CollectionsPage() {
  const provider = getCommerceProvider();
  const collections = await provider.getCollections();

  return (
    <Container className="py-12 sm:py-16">
      <SectionHeading
        eyebrow="Collections"
        title="Shop by mood, audience, and scent family"
        description="Editorial groupings designed to make fragrance discovery feel intuitive and personal."
      />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((collection) => (
          <Link
            key={collection.id}
            href={`/collections/${collection.handle}`}
            className="group border border-espresso/10 bg-[#faf6f0] p-6 transition-colors hover:border-champagne focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-champagne motion-reduce:transition-none"
          >
            <p className="text-xs tracking-[0.16em] text-espresso/55 uppercase">
              {collection.productCount} products
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-espresso group-hover:text-espresso/85">
              {collection.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-espresso/70">
              {collection.description}
            </p>
          </Link>
        ))}
      </div>
    </Container>
  );
}
