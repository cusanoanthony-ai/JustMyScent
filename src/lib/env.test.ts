import { describe, expect, it } from "vitest";
import {
  getCommerceMode,
  isShopifyLiveDataRequested,
  isShopifyModeEnabled,
} from "@/lib/env";

describe("environment mode detection", () => {
  it("defaults to snapshot mode without live-data env vars", () => {
    expect(isShopifyLiveDataRequested()).toBe(false);
    expect(isShopifyModeEnabled()).toBe(false);
    expect(getCommerceMode()).toBe("snapshot");
  });
});
