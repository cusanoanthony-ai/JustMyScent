import { notFound } from "next/navigation";
import { ProductDetailClient } from "@/components/product/ProductDetailClient";
import { ProductGrid } from "@/components/product/ProductCard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { getCommerceProvider } from "@/lib/commerce";
import {
  buildBreadcrumbJsonLd,
  buildProductJsonLd,
  buildProductMetadata,
} from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const product = await getCommerceProvider().getProductByHandle(handle);
  if (!product) {
    return { title: "Product Not Found" };
  }
  return buildProductMetadata(product);
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const provider = getCommerceProvider();
  const product = await provider.getProductByHandle(handle);

  if (!product) {
    notFound();
  }

  const related = await provider.getRelatedProducts(product, 4);

  return (
    <Container className="py-12 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildProductJsonLd(product)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildBreadcrumbJsonLd([
              { name: "Home", item: "/" },
              { name: "Shop", item: "/shop" },
              { name: product.title, item: `/products/${product.handle}` },
            ]),
          ),
        }}
      />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          { label: product.title },
        ]}
      />
      <div className="mt-6">
        <ProductDetailClient product={product} />
      </div>
      {related.length ? (
        <section className="mt-16 border-t border-espresso/10 pt-12">
          <h2 className="font-display text-3xl font-semibold text-espresso">Related scents</h2>
          <div className="mt-8">
            <ProductGrid products={related} />
          </div>
        </section>
      ) : null}
    </Container>
  );
}
