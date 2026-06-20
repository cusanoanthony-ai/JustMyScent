import { ProductGrid } from "@/components/product/ProductCard";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getCommerceProvider } from "@/lib/commerce";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const provider = getCommerceProvider();
  const result = q
    ? await provider.searchProducts(q, { first: 24 })
    : { products: [], totalCount: 0, pageInfo: { hasNextPage: false } };

  return (
    <Container className="py-12 sm:py-16">
      <SectionHeading
        eyebrow="Search"
        title={q ? `Results for “${q}”` : "Search the collection"}
        description={
          q
            ? `${result.totalCount} matching product${result.totalCount === 1 ? "" : "s"}`
            : "Use the header search or enter a query to explore scents, notes, and families."
        }
      />
      <div className="mt-10">
        {q ? (
          <ProductGrid products={result.products} />
        ) : (
          <p className="text-sm text-espresso/65">
            Try searching for vanilla, rose, fresh, amber, or unisex.
          </p>
        )}
      </div>
    </Container>
  );
}
