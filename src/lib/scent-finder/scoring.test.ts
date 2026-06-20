import { describe, expect, it } from "vitest";
import { demoProducts } from "@/lib/commerce/demo/products";
import { getScentFinderRecommendations } from "@/lib/scent-finder/scoring";
import { DEFAULT_SCENT_FINDER_ANSWERS } from "@/lib/scent-finder/types";

describe("scent finder scoring", () => {
  it("returns ranked recommendations for selected preferences", () => {
    const recommendations = getScentFinderRecommendations(demoProducts, {
      ...DEFAULT_SCENT_FINDER_ANSWERS,
      scentFamilies: ["Sweet & Gourmand"],
      notes: ["Vanilla"],
      audience: "women",
      strength: "moderate",
    });

    expect(recommendations.length).toBeGreaterThanOrEqual(3);
    expect(recommendations[0]?.product.scentFamily).toBe("Sweet & Gourmand");
    expect(recommendations[0]?.reasons.length).toBeGreaterThan(0);
  });
});
