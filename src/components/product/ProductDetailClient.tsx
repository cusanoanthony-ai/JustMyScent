"use client";

import { useMemo, useState, useTransition } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { ProductVisual } from "@/components/product/ProductVisual";
import type { Product } from "@/lib/commerce/types";
import { formatMoney, formatPriceRange } from "@/lib/formatters";

export function ProductDetailClient({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedVariant = useMemo(
    () => product.variants.find((variant) => variant.id === selectedVariantId),
    [product.variants, selectedVariantId],
  );

  const handleAddToCart = () => {
    if (!selectedVariant?.availableForSale) {
      setMessage("This variant is currently sold out.");
      return;
    }

    startTransition(async () => {
      const result = await addItem({
        merchandiseId: selectedVariant.id,
        quantity,
      });
      setMessage(result.error ?? "Added to cart");
    });
  };

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
      <div>
        <div className="aspect-[4/5] overflow-hidden border border-espresso/10">
          <ProductVisual product={product} priority className="h-full w-full" />
        </div>
      </div>

      <div>
        <p className="text-sm tracking-[0.16em] text-espresso/55 uppercase">
          {product.audience} · {product.scentFamily}
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-espresso sm:text-5xl">
          {product.title}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-espresso/70">{product.shortDescription}</p>

        <div className="mt-6">
          <p className="text-lg font-semibold text-espresso">
            {selectedVariant
              ? formatMoney(selectedVariant.price)
              : formatPriceRange(product.priceRange.min, product.priceRange.max)}
          </p>
          {selectedVariant?.compareAtPrice ? (
            <p className="text-sm text-espresso/50 line-through">
              {formatMoney(selectedVariant.compareAtPrice)}
            </p>
          ) : null}
        </div>

        {product.options.map((option) => (
          <div key={option.name} className="mt-6">
            <p className="mb-2 text-sm font-semibold tracking-[0.12em] text-espresso uppercase">
              {option.name}
            </p>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((variant) => (
                <button
                  key={variant.id}
                  type="button"
                  disabled={!variant.availableForSale}
                  onClick={() => setSelectedVariantId(variant.id)}
                  className={`border px-4 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne disabled:opacity-40 ${
                    selectedVariantId === variant.id
                      ? "border-espresso bg-espresso text-ivory"
                      : "border-espresso/15 text-espresso"
                  }`}
                >
                  {variant.title}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="mt-6">
          <label htmlFor="quantity" className="mb-2 block text-sm font-semibold text-espresso">
            Quantity
          </label>
          <input
            id="quantity"
            type="number"
            min={1}
            value={quantity}
            onChange={(event) => setQuantity(Number.parseInt(event.target.value, 10) || 1)}
            className="w-24 border border-espresso/15 bg-transparent px-3 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne"
          />
        </div>

        <button
          type="button"
          disabled={isPending || !selectedVariant?.availableForSale}
          onClick={handleAddToCart}
          className="mt-8 w-full border border-espresso bg-espresso px-6 py-3 text-sm font-semibold tracking-[0.14em] text-ivory uppercase focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {selectedVariant?.availableForSale
            ? isPending
              ? "Adding..."
              : "Add to Cart"
            : "Sold Out"}
        </button>

        {message ? (
          <p className="mt-3 text-sm text-espresso/70" role="status" aria-live="polite">
            {message}
          </p>
        ) : null}

        <div className="mt-10 space-y-6 border-t border-espresso/10 pt-8 text-sm leading-relaxed text-espresso/75">
          <div>
            <h2 className="font-display text-xl text-espresso">Fragrance profile</h2>
            <dl className="mt-3 grid gap-2">
              <div className="flex gap-2">
                <dt className="font-semibold">Top notes:</dt>
                <dd>{product.topNotes.join(", ")}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-semibold">Heart notes:</dt>
                <dd>{product.heartNotes.join(", ")}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-semibold">Base notes:</dt>
                <dd>{product.baseNotes.join(", ")}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-semibold">Mood:</dt>
                <dd>{product.mood}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-semibold">Occasion:</dt>
                <dd>{product.occasion}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-semibold">Strength:</dt>
                <dd>{product.fragranceStrength}</dd>
              </div>
            </dl>
          </div>
          <details className="border border-espresso/10 p-4">
            <summary className="cursor-pointer font-semibold text-espresso">
              Product details
            </summary>
            <div
              className="prose prose-sm mt-4 max-w-none text-espresso/75"
              dangerouslySetInnerHTML={{
                __html: product.descriptionHtml ?? `<p>${product.description}</p>`,
              }}
            />
          </details>
          <details className="border border-espresso/10 p-4">
            <summary className="cursor-pointer font-semibold text-espresso">
              Shipping & returns
            </summary>
            <p className="mt-4">
              Demonstration copy only. Final shipping and return policies must be approved by
              the business owner before launch.
            </p>
          </details>
        </div>
      </div>
    </div>
  );
}
