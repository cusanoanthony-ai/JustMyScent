import { demoProvider } from "@/lib/commerce/demo/provider";
import { shopifyProvider } from "@/lib/commerce/shopify/provider";
import type { CommerceProvider } from "@/lib/commerce/types";
import { getCommerceMode, isShopifyModeEnabled } from "@/lib/env";

export function getCommerceProvider(): CommerceProvider {
  return isShopifyModeEnabled() ? shopifyProvider : demoProvider;
}

export { getCommerceMode, isShopifyModeEnabled };

export type {
  Audience,
  Cart,
  CartLine,
  Collection,
  CommerceProvider,
  Product,
  ProductFilters,
  ProductListOptions,
  ProductListResult,
  ProductVariant,
  ScentFamily,
  SortOption,
} from "@/lib/commerce/types";
