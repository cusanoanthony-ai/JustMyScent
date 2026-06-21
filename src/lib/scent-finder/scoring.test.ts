import { describe, expect, it } from "vitest";
import { catalogData, snapshotProducts } from "@/lib/commerce/snapshot/catalog-data";
import { getScentFinderRecommendations, scoreProduct } from "@/lib/scent-finder/scoring";
import { DEFAULT_SCENT_FINDER_ANSWERS, isQuizEligible } from "@/lib/scent-finder/types";
import type { Product } from "@/lib/commerce/types";

function findProduct(matcher: (product: Product) => boolean) {
  const product = snapshotProducts.find(matcher);
  if (!product) throw new Error("Expected product not found in snapshot catalog");
  return product;
}

describe("scent finder scoring", () => {
  it("matches preferred scent family and notes", () => {
    const vanillaProduct = findProduct(
      (product) =>
        product.availableForSale &&
        isQuizEligible(product) &&
        [...product.topNotes, ...product.heartNotes, ...product.baseNotes].some((note) =>
          note.toLowerCase().includes("vanilla"),
        ),
    );

    const result = scoreProduct(vanillaProduct, {
      ...DEFAULT_SCENT_FINDER_ANSWERS,
      scentFamilies: [vanillaProduct.scentFamilyRaw ?? vanillaProduct.scentFamily],
      notes: ["vanilla"],
      audience: "any",
      strength: "moderate",
    });

    expect(result.normalizedScore).toBeGreaterThan(0);
    expect(result.reasons.length).toBeGreaterThan(0);
  });

  it("applies avoided-note penalty for musk", () => {
    const muskProduct = findProduct((product) =>
      product.availableForSale &&
      [...product.topNotes, ...product.heartNotes, ...product.baseNotes].some((note) =>
        /\bmusk\b/i.test(note),
      ),
    );

    const result = scoreProduct(muskProduct, {
      ...DEFAULT_SCENT_FINDER_ANSWERS,
      avoidNotes: ["musk"],
    });

    expect(result.mismatches.join(" ").toLowerCase()).toContain("musk");
  });

  it("supports no audience preference", () => {
    const womenProduct = findProduct((product) => product.audience === "women" && isQuizEligible(product));
    const result = scoreProduct(womenProduct, {
      ...DEFAULT_SCENT_FINDER_ANSWERS,
      audience: "any",
    });
    expect(result.reasons.some((reason) => reason.toLowerCase().includes("compatible"))).toBe(false);
  });

  it("excludes ineligible products from primary pool when enough eligible products exist", () => {
    const eligibleCount = snapshotProducts.filter(isQuizEligible).length;
    expect(eligibleCount).toBeGreaterThanOrEqual(3);

    const recommendations = getScentFinderRecommendations(snapshotProducts, {
      ...DEFAULT_SCENT_FINDER_ANSWERS,
      notes: ["vanilla"],
    });

    expect(recommendations.every((item) => isQuizEligible(item.product) || eligibleCount < 3)).toBe(
      true,
    );
  });

  it("normalizes scores for limited metadata coverage", () => {
    const limited = findProduct((product) => product.metadataCoverage === "limited");
    const recommendations = getScentFinderRecommendations(snapshotProducts, {
      ...DEFAULT_SCENT_FINDER_ANSWERS,
      notes: limited.topNotes.slice(0, 1),
    });
    const match = recommendations.find((item) => item.product.handle === limited.handle);
    if (match) {
      expect(match.matchPercent).toBeLessThanOrEqual(75);
      expect(match.confidenceLabel).toBe("Worth exploring");
    }
  });

  it("handles sold-out products with zero score", () => {
    const soldOut = findProduct((product) => !product.availableForSale);
    const result = scoreProduct(soldOut, DEFAULT_SCENT_FINDER_ANSWERS);
    expect(result.score).toBe(0);
    expect(result.mismatches).toContain("Sold out");
  });

  it("breaks ties alphabetically by title", () => {
    const recommendations = getScentFinderRecommendations(snapshotProducts, DEFAULT_SCENT_FINDER_ANSWERS, 10);
    const sorted = [...recommendations].sort((a, b) => {
      if (b.normalizedScore !== a.normalizedScore) return b.normalizedScore - a.normalizedScore;
      return a.product.title.localeCompare(b.product.title);
    });
    expect(recommendations.map((item) => item.product.handle)).toEqual(
      sorted.map((item) => item.product.handle),
    );
  });
});

describe("catalog snapshot integrity", () => {
  it("has unique handles", () => {
    const handles = catalogData.products.map((product) => product.handle);
    expect(new Set(handles).size).toBe(handles.length);
  });

  it("maps every product to a local image", () => {
    expect(catalogData.products.every((product) => Boolean(product.localImage))).toBe(true);
  });
});
