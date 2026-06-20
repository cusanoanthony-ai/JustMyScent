import { describe, expect, it } from "vitest";
import { formatMoney, formatPriceRange } from "@/lib/formatters";

describe("formatters", () => {
  it("formats currency values", () => {
    expect(formatMoney({ amount: "24.00", currencyCode: "USD" })).toBe("$24.00");
  });

  it("formats matching price ranges as a single value", () => {
    expect(
      formatPriceRange(
        { amount: "24.00", currencyCode: "USD" },
        { amount: "24.00", currencyCode: "USD" },
      ),
    ).toBe("$24.00");
  });
});
