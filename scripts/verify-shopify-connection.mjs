#!/usr/bin/env node
import { createStorefrontApiClient } from "@shopify/storefront-api-client";

const storeDomain = process.env.SHOPIFY_STORE_DOMAIN?.trim();
const accessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN?.trim();
const apiVersion = process.env.SHOPIFY_STOREFRONT_API_VERSION?.trim() || "2026-04";
const useLive = ["true", "1", "yes"].includes(
  (process.env.SHOPIFY_USE_LIVE_DATA ?? "").trim().toLowerCase(),
);

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
}

function ok(message) {
  console.log(`OK: ${message}`);
}

function mask(value) {
  if (!value) return "(missing)";
  if (value.length <= 8) return "********";
  return `${value.slice(0, 4)}…${value.slice(-4)}`;
}

async function main() {
  console.log("Just My Scent — Shopify connection verification\n");

  console.log("Environment");
  console.log(`- SHOPIFY_USE_LIVE_DATA: ${useLive}`);
  console.log(`- SHOPIFY_STORE_DOMAIN: ${storeDomain ? mask(storeDomain) : "(missing)"}`);
  console.log(
    `- SHOPIFY_STOREFRONT_ACCESS_TOKEN: ${accessToken ? "(present, masked)" : "(missing)"}`,
  );
  console.log(`- SHOPIFY_STOREFRONT_API_VERSION: ${apiVersion}`);

  if (!useLive) {
    fail("SHOPIFY_USE_LIVE_DATA is not enabled.");
  }
  if (!storeDomain) {
    fail("SHOPIFY_STORE_DOMAIN is missing.");
  }
  if (!accessToken) {
    fail("SHOPIFY_STOREFRONT_ACCESS_TOKEN is missing.");
  }
  if (process.exitCode) {
    process.exit(process.exitCode);
  }

  const client = createStorefrontApiClient({
    storeDomain: storeDomain,
    apiVersion,
    publicAccessToken: accessToken,
  });

  const shopQuery = `#graphql
    query VerifyShop {
      shop {
        name
        primaryDomain { url host }
      }
      products(first: 5) {
        nodes {
          handle
          title
          availableForSale
          featuredImage { url }
          priceRange {
            minVariantPrice { amount currencyCode }
          }
          variants(first: 3) {
            nodes {
              id
              title
              availableForSale
              price { amount currencyCode }
            }
          }
        }
      }
      collections(first: 20) {
        nodes { handle title }
      }
    }
  `;

  const response = await client.request(shopQuery);
  if (response.errors) {
    fail(response.errors.graphQLErrors?.[0]?.message ?? "GraphQL request failed.");
    process.exit(1);
  }

  const shop = response.data?.shop;
  const products = response.data?.products?.nodes ?? [];
  const collections = response.data?.collections?.nodes ?? [];

  ok(`Connected to shop: ${shop?.name ?? "Unknown"}`);
  ok(`Primary domain: ${shop?.primaryDomain?.host ?? "unknown"}`);
  ok(`Published product sample count: ${products.length}`);
  ok(`Collection count (sample): ${collections.length}`);

  if (products.length === 0) {
    fail("No products returned. Confirm products are published to the Headless sales channel.");
  }

  const sample = products[0];
  if (sample) {
    ok(`Sample product: ${sample.title} (${sample.handle})`);
    ok(`Sample price: ${sample.priceRange?.minVariantPrice?.amount ?? "n/a"}`);
    ok(`Sample image: ${sample.featuredImage?.url ? "present" : "missing"}`);
  }

  const cartMutation = `#graphql
    mutation VerifyCart {
      cartCreate(input: { lines: [] }) {
        cart { id totalQuantity checkoutUrl }
        userErrors { field message }
      }
    }
  `;

  const cartResponse = await client.request(cartMutation);
  const cartErrors = cartResponse.data?.cartCreate?.userErrors ?? [];
  if (cartErrors.length) {
    fail(cartErrors[0]?.message ?? "Cart creation failed.");
  } else {
    ok("Non-destructive cart creation succeeded.");
  }

  const expectedCollections = ["womens-fragrance", "mens-fragrance", "frontpage", "best-sellers"];
  for (const handle of expectedCollections) {
    const found = collections.some((collection) => collection.handle === handle);
    if (found) {
      ok(`Expected collection present: ${handle}`);
    } else {
      console.warn(`WARN: Expected collection not found in sample: ${handle}`);
    }
  }

  console.log("\nVerification complete.");
}

main().catch((error) => {
  fail(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
