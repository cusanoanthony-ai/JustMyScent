"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useTransition } from "react";
import { ProductVisual } from "@/components/product/ProductVisual";
import { useCart } from "@/components/cart/CartProvider";
import { CloseIcon } from "@/components/icons";
import { formatMoney } from "@/lib/formatters";

export function CartDrawer() {
  const {
    cart,
    isOpen,
    closeCart,
    updateLine,
    removeLine,
    checkout,
    mode,
    isLoading,
  } = useCart();
  const [isPending, startTransition] = useTransition();
  const drawerId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    closeButtonRef.current?.focus();

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeCart();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [closeCart, isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70]">
      <button
        type="button"
        aria-label="Close cart overlay"
        className="absolute inset-0 bg-espresso/25"
        onClick={closeCart}
      />
      <aside
        id={drawerId}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className="absolute top-0 right-0 flex h-full w-full max-w-md flex-col border-l border-espresso/10 bg-ivory shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-espresso/10 px-5 py-4">
          <h2 className="font-display text-2xl font-semibold text-espresso">Your Cart</h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            className="rounded-sm p-2 text-espresso focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {isLoading ? (
            <p className="text-sm text-espresso/65">Loading cart...</p>
          ) : cart.lines.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-display text-2xl text-espresso">Your cart is empty</p>
              <p className="mt-2 text-sm text-espresso/65">
                Explore the collection to find a scent that feels like you.
              </p>
              <Link
                href="/shop"
                onClick={closeCart}
                className="mt-6 inline-flex border border-espresso px-5 py-3 text-xs font-semibold tracking-[0.14em] text-espresso uppercase focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <ul className="space-y-5">
              {cart.lines.map((line) => (
                <li key={line.id} className="flex gap-4 border-b border-espresso/10 pb-5">
                  <div className="h-24 w-20 shrink-0 overflow-hidden border border-espresso/10">
                    <ProductVisual
                      product={{
                        title: line.productTitle,
                        featuredImage: line.image,
                      }}
                      className="h-full w-full"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/products/${line.productHandle}`}
                      onClick={closeCart}
                      className="font-display text-lg text-espresso hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne"
                    >
                      {line.productTitle}
                    </Link>
                    <p className="text-sm text-espresso/65">{line.variantTitle}</p>
                    <p className="mt-1 text-sm font-semibold text-espresso">
                      {formatMoney(line.price)}
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <label className="sr-only" htmlFor={`qty-${line.id}`}>
                        Quantity for {line.productTitle}
                      </label>
                      <input
                        id={`qty-${line.id}`}
                        type="number"
                        min={1}
                        value={line.quantity}
                        onChange={(event) => {
                          const quantity = Number.parseInt(event.target.value, 10);
                          if (Number.isNaN(quantity)) return;
                          startTransition(async () => {
                            await updateLine({ id: line.id, quantity });
                          });
                        }}
                        className="w-16 border border-espresso/15 bg-transparent px-2 py-1 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          startTransition(async () => {
                            await removeLine(line.id);
                          })
                        }
                        className="text-xs tracking-[0.12em] text-espresso/65 uppercase underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-espresso/10 px-5 py-5">
          <div className="mb-4 flex items-center justify-between text-sm">
            <span className="text-espresso/70">Subtotal</span>
            <span className="font-semibold text-espresso">{formatMoney(cart.subtotal)}</span>
          </div>
          {mode === "snapshot" ? (
            <p className="mb-4 text-xs leading-relaxed text-espresso/60">
              Snapshot mode: checkout is disabled until Shopify credentials are connected.
            </p>
          ) : null}
          <button
            type="button"
            disabled={isPending || cart.lines.length === 0}
            onClick={() =>
              startTransition(async () => {
                await checkout();
              })
            }
            className="w-full border border-espresso bg-espresso px-5 py-3 text-sm font-semibold tracking-[0.14em] text-ivory uppercase focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne disabled:cursor-not-allowed disabled:opacity-50"
          >
            {mode === "snapshot" ? "Checkout Unavailable in Snapshot Mode" : "Checkout"}
          </button>
        </div>
      </aside>
    </div>
  );
}
