import { describe, expect, it } from "vitest";
import { mapShopifyProduct } from "@/lib/commerce/shopify/mappers";

describe("shopify product mapper", () => {
  it("normalizes metafields and fallback tags", () => {
    const product = mapShopifyProduct({
      id: "gid://shopify/Product/1",
      handle: "velvet-ember",
      title: "Velvet Ember",
      description: "Warm amber scent",
      tags: ["audience:unisex", "scent:warm", "note:vanilla", "mood:romantic"],
      availableForSale: true,
      featuredImage: null,
      images: { nodes: [] },
      priceRange: {
        minVariantPrice: { amount: "24.0", currencyCode: "USD" },
        maxVariantPrice: { amount: "42.0", currencyCode: "USD" },
      },
      options: [{ name: "Size", values: ["10 ml Roll-On"] }],
      variants: {
        nodes: [
          {
            id: "gid://shopify/ProductVariant/1",
            title: "10 ml Roll-On",
            availableForSale: true,
            price: { amount: "24.0", currencyCode: "USD" },
            compareAtPrice: null,
            selectedOptions: [{ name: "Size", value: "10 ml Roll-On" }],
          },
        ],
      },
      metafields: [
        {
          namespace: "custom",
          key: "top_notes",
          value: '["Vanilla","Amber"]',
        },
        {
          namespace: "custom",
          key: "heart_notes",
          value: "Orchid",
        },
      ],
    });

    expect(product.audience).toBe("unisex");
    expect(product.scentFamily).toBe("Warm & Sensual");
    expect(product.topNotes).toEqual(["Vanilla", "Amber"]);
    expect(product.heartNotes).toEqual(["Orchid"]);
    expect(product.mood).toBe("romantic");
  });
});
