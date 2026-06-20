export class ShopifyCommerceError extends Error {
  constructor(
    message: string,
    readonly code: "network" | "graphql" | "user" | "not_found" | "config" = "graphql",
  ) {
    super(message);
    this.name = "ShopifyCommerceError";
  }
}

export function sanitizeShopifyError(error: unknown): string {
  if (error instanceof ShopifyCommerceError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message.replace(/shpat_[a-zA-Z0-9]+/g, "[redacted-token]");
  }

  return "An unexpected Shopify error occurred.";
}

export function assertShopifyConfigured(): void {
  if (!process.env.SHOPIFY_STORE_DOMAIN || !process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
    throw new ShopifyCommerceError(
      "Shopify live mode is enabled but required environment variables are missing.",
      "config",
    );
  }
}
