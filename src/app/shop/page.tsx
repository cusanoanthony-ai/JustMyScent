import { ProductGrid } from "@/components/product/ProductCard";
import { ShopFilters, ShopSearchForm } from "@/components/shop/ShopFilters";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getCommerceProvider } from "@/lib/commerce";
import { parseShopSearchParams, type ShopSearchParams } from "@/lib/shop/filters";

export const revalidate = 60;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<ShopSearchParams>;
}) {
  const params = await searchParams;
  const parsed = parseShopSearchParams(params);
  const provider = getCommerceProvider();
  const result = await provider.getProducts({
    first: 24,
    after: parsed.after,
    sort: parsed.sort,
    filters: parsed,
  });

  return (
    <Container className="py-12 sm:py-16">
      <SectionHeading
        eyebrow="Shop"
        title="Explore the collection"
        description="Browse concentrated fragrance oils by audience, scent family, note, and mood."
      />
      <div className="mt-10 grid gap-10 lg:grid-cols-[260px_1fr]">
        <ShopFilters searchParams={params} />
        <div>
          <ShopSearchForm initialQuery={params.q} />
          <p className="mb-6 text-sm text-espresso/65">
            {result.totalCount} product{result.totalCount === 1 ? "" : "s"}
          </p>
          <ProductGrid products={result.products} />
          {result.pageInfo.hasNextPage ? (
            <div className="mt-10 text-center">
              <Button
                href={`/shop?${new URLSearchParams({
                  ...params,
                  after: result.pageInfo.endCursor ?? "",
                } as Record<string, string>).toString()}`}
                variant="secondary"
              >
                Load More
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </Container>
  );
}
