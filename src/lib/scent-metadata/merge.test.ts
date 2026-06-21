import { describe, expect, it } from "vitest";
import { mapShopifyProduct } from "@/lib/commerce/shopify/mappers";
import { scentMetadataByHandle } from "@/lib/commerce/snapshot/catalog-data";

describe("shopify metadata precedence", () => {
  it("prefers Shopify metafields over local fallback", () => {
    const localHandle = Object.keys(scentMetadataByHandle)[0];
    const local = scentMetadataByHandle[localHandle];

    const product = mapShopifyProduct({
      id: "gid://shopify/Product/1",
      handle: localHandle,
      title: local?.sourceTitle ?? "Test Product",
      description: "Test",
      tags: [],
      availableForSale: true,
      featuredImage: null,
      images: { nodes: [] },
      priceRange: {
        minVariantPrice: { amount: "10.0", currencyCode: "USD" },
        maxVariantPrice: { amount: "10.0", currencyCode: "USD" },
      },
      options: [{ name: "Size", values: ["10 ml Roll-On"] }],
      variants: {
        nodes: [
          {
            id: "gid://shopify/ProductVariant/1",
            title: "10 ml Roll-On",
            availableForSale: true,
            price: { amount: "10.0", currencyCode: "USD" },
            compareAtPrice: null,
            selectedOptions: [{ name: "Size", value: "10 ml Roll-On" }],
          },
        ],
      },
      metafields: [
        {
          namespace: "custom",
          key: "top_notes",
          value: '["Shopify Top"]',
        },
      ],
    });

    expect(product.topNotes).toEqual(["Shopify Top"]);
    expect(product.topNotes).not.toEqual(local?.topNotes.normalized ?? []);
  });

  it("falls back to local metadata when Shopify metafields are absent", () => {
    const localHandle = Object.keys(scentMetadataByHandle).find(
      (handle) => scentMetadataByHandle[handle]?.topNotes.normalized.length,
    );
    expect(localHandle).toBeTruthy();
    if (!localHandle) return;
    const local = scentMetadataByHandle[localHandle];

    const product = mapShopifyProduct({
      id: "gid://shopify/Product/2",
      handle: localHandle,
      title: local.sourceTitle,
      description: local.sourceTitle,
      tags: [],
      availableForSale: true,
      featuredImage: null,
      images: { nodes: [] },
      priceRange: {
        minVariantPrice: { amount: "10.0", currencyCode: "USD" },
        maxVariantPrice: { amount: "10.0", currencyCode: "USD" },
      },
      options: [{ name: "Size", values: ["10 ml Roll-On"] }],
      variants: {
        nodes: [
          {
            id: "gid://shopify/ProductVariant/2",
            title: "10 ml Roll-On",
            availableForSale: true,
            price: { amount: "10.0", currencyCode: "USD" },
            compareAtPrice: null,
            selectedOptions: [{ name: "Size", value: "10 ml Roll-On" }],
          },
        ],
      },
      metafields: [],
    });

    expect(product.topNotes).toEqual(local.topNotes.normalized);
  });
});
