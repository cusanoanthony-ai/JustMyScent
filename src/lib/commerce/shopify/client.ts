import { createStorefrontApiClient } from "@shopify/storefront-api-client";
import {
  getShopifyStoreDomain,
  getShopifyStorefrontAccessToken,
  getShopifyStorefrontApiVersion,
} from "@/lib/env";
import { ShopifyCommerceError, sanitizeShopifyError } from "@/lib/commerce/shopify/errors";

let client: ReturnType<typeof createStorefrontApiClient> | null = null;

export function getShopifyClient() {
  const storeDomain = getShopifyStoreDomain();
  const accessToken = getShopifyStorefrontAccessToken();
  const apiVersion = getShopifyStorefrontApiVersion();

  if (!storeDomain || !accessToken) {
    throw new ShopifyCommerceError(
      "Shopify Storefront API credentials are not configured.",
      "config",
    );
  }

  if (!client) {
    client = createStorefrontApiClient({
      storeDomain,
      apiVersion,
      publicAccessToken: accessToken,
    });
  }

  return client;
}

export async function shopifyFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  try {
    const response = await getShopifyClient().request(query, { variables });

    if (response.errors) {
      const message = response.errors.graphQLErrors?.[0]?.message ?? "Shopify GraphQL request failed.";
      throw new ShopifyCommerceError(message, "graphql");
    }

    return response.data as T;
  } catch (error) {
    if (error instanceof ShopifyCommerceError) {
      throw error;
    }

    throw new ShopifyCommerceError(sanitizeShopifyError(error), "network");
  }
}
