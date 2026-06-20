import type { Collection } from "@/lib/commerce/types";
import { demoProducts } from "@/lib/commerce/demo/products";

function countProductsForCollection(handle: string): number {
  return demoProducts.filter((product) =>
    product.collections.some((collection) => collection.handle === handle),
  ).length;
}

export const demoCollections: Collection[] = [
  {
    id: "demo-collection-women",
    handle: "women",
    title: "Women",
    description:
      "Floral, gourmand, and luminous oils composed for expressive everyday signatures.",
    productCount: countProductsForCollection("women"),
  },
  {
    id: "demo-collection-men",
    handle: "men",
    title: "Men",
    description:
      "Fresh, woody, and refined profiles with polished structure and confident wear.",
    productCount: countProductsForCollection("men"),
  },
  {
    id: "demo-collection-unisex",
    handle: "unisex",
    title: "Unisex",
    description:
      "Balanced compositions designed to feel personal rather than prescriptive.",
    productCount: countProductsForCollection("unisex"),
  },
  {
    id: "demo-collection-sweet-gourmand",
    handle: "sweet-gourmand",
    title: "Sweet & Gourmand",
    description: "Vanilla, tonka, and indulgent notes with a soft polished finish.",
    productCount: countProductsForCollection("sweet-gourmand"),
  },
  {
    id: "demo-collection-fresh-clean",
    handle: "fresh-clean",
    title: "Fresh & Clean",
    description: "Bright citrus, airy musks, and transparent compositions.",
    productCount: countProductsForCollection("fresh-clean"),
  },
  {
    id: "demo-collection-floral",
    handle: "floral",
    title: "Floral",
    description: "Rose, jasmine, and petal-soft profiles with editorial elegance.",
    productCount: countProductsForCollection("floral"),
  },
  {
    id: "demo-collection-warm-sensual",
    handle: "warm-sensual",
    title: "Warm & Sensual",
    description: "Amber, musk, and glowing resins for intimate evening wear.",
    productCount: countProductsForCollection("warm-sensual"),
  },
  {
    id: "demo-collection-woody-earthy",
    handle: "woody-earthy",
    title: "Woody & Earthy",
    description: "Cedar, vetiver, and grounded woods with architectural clarity.",
    productCount: countProductsForCollection("woody-earthy"),
  },
  {
    id: "demo-collection-bold-refined",
    handle: "bold-refined",
    title: "Bold & Refined",
    description: "Statement compositions with spice, smoke, and confident structure.",
    productCount: countProductsForCollection("bold-refined"),
  },
];

export const demoCollectionMap = new Map(
  demoCollections.map((collection) => [collection.handle, collection]),
);

export const scentFamilyCollections = demoCollections.filter((collection) =>
  [
    "sweet-gourmand",
    "fresh-clean",
    "floral",
    "warm-sensual",
    "woody-earthy",
    "bold-refined",
  ].includes(collection.handle),
);

export const audienceCollections = demoCollections.filter((collection) =>
  ["women", "men", "unisex"].includes(collection.handle),
);
