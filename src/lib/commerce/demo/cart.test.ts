import { describe, expect, it } from "vitest";
import {
  addDemoCartLines,
  createDemoCart,
  updateDemoCartLines,
} from "@/lib/commerce/demo/cart";
import { demoProducts } from "@/lib/commerce/demo/products";

describe("demo cart", () => {
  it("calculates subtotals when adding lines", () => {
    const variantId = demoProducts[0]?.variants[0]?.id;
    expect(variantId).toBeTruthy();

    const cart = createDemoCart();
    const result = addDemoCartLines(cart, [{ merchandiseId: variantId!, quantity: 2 }]);

    expect(result.data?.lines).toHaveLength(1);
    expect(result.data?.totalQuantity).toBe(2);
    expect(Number.parseFloat(result.data?.subtotal.amount ?? "0")).toBeGreaterThan(0);
  });

  it("removes lines when quantity reaches zero", () => {
    const variantId = demoProducts[0]?.variants[0]?.id;
    const created = addDemoCartLines(createDemoCart(), [
      { merchandiseId: variantId!, quantity: 1 },
    ]);
    const lineId = created.data?.lines[0]?.id;
    const updated = updateDemoCartLines(created.data!, [{ id: lineId!, quantity: 0 }]);
    expect(updated.data?.lines).toHaveLength(0);
  });
});
