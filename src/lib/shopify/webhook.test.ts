import { describe, expect, it } from "vitest";
import { createHmac } from "node:crypto";
import { verifyShopifyWebhookHmac } from "@/lib/shopify/webhook";

describe("shopify webhook HMAC verification", () => {
  it("accepts valid signatures and rejects invalid ones", () => {
    const secret = "test-secret";
    const body = JSON.stringify({ id: 1, topic: "products/update" });
    const digest = createHmac("sha256", secret).update(body, "utf8").digest("base64");

    expect(verifyShopifyWebhookHmac(body, digest, secret)).toBe(true);
    expect(verifyShopifyWebhookHmac(body, "invalid", secret)).toBe(false);
    expect(verifyShopifyWebhookHmac(body, null, secret)).toBe(false);
  });
});
