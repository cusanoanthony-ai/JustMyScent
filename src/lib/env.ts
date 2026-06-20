export function getShopifyStoreDomain(): string | undefined {
  return process.env.SHOPIFY_STORE_DOMAIN?.trim() || undefined;
}

export function getShopifyStorefrontAccessToken(): string | undefined {
  return process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN?.trim() || undefined;
}

export function getShopifyStorefrontApiVersion(): string {
  return process.env.SHOPIFY_STOREFRONT_API_VERSION?.trim() || "2026-04";
}

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
}

export function isShopifyLiveDataRequested(): boolean {
  const value = process.env.SHOPIFY_USE_LIVE_DATA?.trim().toLowerCase();
  return value === "true" || value === "1" || value === "yes";
}

export function isShopifyModeEnabled(): boolean {
  return (
    isShopifyLiveDataRequested() &&
    Boolean(getShopifyStoreDomain()) &&
    Boolean(getShopifyStorefrontAccessToken())
  );
}

export function getCommerceMode(): "shopify" | "demo" {
  return isShopifyModeEnabled() ? "shopify" : "demo";
}
