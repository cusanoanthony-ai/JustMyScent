import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/product/ProductCard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { getCommerceProvider } from "@/lib/commerce";
import { buildCollectionMetadata, buildBreadcrumbJsonLd } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const collection = await getCommerceProvider().getCollectionByHandle(handle);
  if (!collection) {
    return { title: "Collection Not Found" };
  }
  return buildCollectionMetadata(collection);
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const provider = getCommerceProvider();
  const collection = await provider.getCollectionByHandle(handle);

  if (!collection) {
    notFound();
  }

  const result = await provider.getProductsByCollection(handle, { first: 24 });

  return (
    <Container className="py-12 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildBreadcrumbJsonLd([
              { name: "Home", item: "/" },
              { name: "Collections", item: "/collections" },
              { name: collection.title, item: `/collections/${collection.handle}` },
            ]),
          ),
        }}
      />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Collections", href: "/collections" },
          { label: collection.title },
        ]}
      />
      <div className="mt-6 max-w-2xl">
        <h1 className="font-display text-4xl font-semibold text-espresso sm:text-5xl">
          {collection.title}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-espresso/70">
          {collection.description}
        </p>
        <p className="mt-3 text-sm text-espresso/55">
          {result.totalCount} product{result.totalCount === 1 ? "" : "s"}
        </p>
      </div>
      <div className="mt-10">
        <ProductGrid products={result.products} />
      </div>
    </Container>
  );
}
