"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ProductVisual } from "@/components/product/ProductVisual";
import { useCart } from "@/components/cart/CartProvider";
import type { Product } from "@/lib/commerce/types";
import { formatPriceRange } from "@/lib/formatters";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const singleVariant =
    product.variants.length === 1 && product.variants[0]?.availableForSale
      ? product.variants[0]
      : null;

  const prominentNotes = [...product.topNotes, ...product.heartNotes].slice(0, 3);

  const handleQuickAdd = () => {
    if (!singleVariant) return;
    startTransition(async () => {
      const result = await addItem({
        merchandiseId: singleVariant.id,
        quantity: 1,
      });
      setStatusMessage(result.error ?? "Added to cart");
      window.setTimeout(() => setStatusMessage(null), 2500);
    });
  };

  return (
    <article className="group flex h-full flex-col border border-espresso/10 bg-ivory">
      <Link
        href={`/products/${product.handle}`}
        className="relative block aspect-[4/5] overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne"
      >
        <ProductVisual
          product={product}
          className="transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transform-none motion-reduce:transition-none"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.featured ? (
            <span className="bg-espresso px-2 py-1 text-[0.65rem] tracking-[0.14em] text-ivory uppercase">
              Featured
            </span>
          ) : null}
          {product.isNew ? (
            <span className="border border-espresso/15 bg-ivory/90 px-2 py-1 text-[0.65rem] tracking-[0.14em] text-espresso uppercase">
              New
            </span>
          ) : null}
          {!product.availableForSale ? (
            <span className="bg-rose-muted/80 px-2 py-1 text-[0.65rem] tracking-[0.14em] text-espresso uppercase">
              Sold Out
            </span>
          ) : null}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="space-y-1">
          <p className="text-[0.7rem] tracking-[0.16em] text-espresso/55 uppercase">
            {product.audience} · {product.scentFamily}
          </p>
          <h3 className="font-display text-xl font-semibold text-espresso">
            <Link
              href={`/products/${product.handle}`}
              className="hover:text-espresso/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne"
            >
              {product.title}
            </Link>
          </h3>
          {prominentNotes.length ? (
            <p className="text-sm text-espresso/65">{prominentNotes.join(" · ")}</p>
          ) : null}
        </div>

        <div className="mt-auto flex items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-espresso">
              {formatPriceRange(product.priceRange.min, product.priceRange.max)}
            </p>
            {product.compareAtPriceRange ? (
              <p className="text-xs text-espresso/50 line-through">
                {formatPriceRange(
                  product.compareAtPriceRange.min,
                  product.compareAtPriceRange.max,
                )}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col items-end gap-2">
            <Link
              href={`/products/${product.handle}`}
              className="text-xs font-semibold tracking-[0.12em] text-espresso uppercase underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne"
            >
              View
            </Link>
            {singleVariant ? (
              <button
                type="button"
                disabled={isPending}
                onClick={handleQuickAdd}
                className="border border-espresso/15 px-3 py-2 text-[0.65rem] font-semibold tracking-[0.12em] text-espresso uppercase hover:border-champagne focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne disabled:opacity-50"
              >
                {isPending ? "Adding..." : "Quick Add"}
              </button>
            ) : null}
          </div>
        </div>
        {statusMessage ? (
          <p className="text-xs text-espresso/70" role="status" aria-live="polite">
            {statusMessage}
          </p>
        ) : null}
      </div>
    </article>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  if (!products.length) {
    return (
      <div className="border border-dashed border-espresso/15 px-6 py-16 text-center">
        <p className="font-display text-2xl text-espresso">No products found</p>
        <p className="mt-2 text-sm text-espresso/65">
          Try adjusting your filters or search terms.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
